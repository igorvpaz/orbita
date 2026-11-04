-- Published catalog previews are distinct from permission to contract.
alter table public.units add column city text not null default 'Porto Alegre';
alter table public.units add column neighborhood text not null default 'Moinhos de Vento';
alter table public.units add column state text not null default 'RS' check (state = 'RS');
alter table public.services add column access_plan text not null default 'basic' check (access_plan in ('basic','premium'));

create or replace function private.is_service_visible(service_uuid uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select private.has_active_membership() and exists (
    select 1 from public.services s join public.partners p on p.id=s.partner_id
    join public.units u on u.id=s.unit_id
    where s.id=service_uuid and s.status='published' and p.status='active' and u.active
  );
$$;
create function private.is_service_available(service_uuid uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select private.is_service_visible(service_uuid) and exists (
    select 1 from public.services s join public.units u on u.id=s.unit_id
    join public.memberships m on m.user_id=(select auth.uid()) join public.plans p on p.id=m.plan_id
    where s.id=service_uuid and (s.access_plan='basic' or p.code='premium')
      and (not exists (select 1 from public.recommendation_rules r where r.service_id=s.id and r.enabled)
      or exists (select 1 from public.recommendation_rules r where r.service_id=s.id and r.enabled
        and (r.plan_id is null or r.plan_id=m.plan_id)
        and extract(dow from now() at time zone u.timezone)::smallint=any(r.weekdays)
        and (now() at time zone u.timezone)::time>=r.start_time
        and (now() at time zone u.timezone)::time<r.end_time))
  );
$$;
revoke all on function private.is_service_available(uuid) from public, anon;
grant execute on function private.is_service_available(uuid) to authenticated;

drop policy units_read on public.units;
create policy units_read on public.units for select to authenticated using (
  (select private.is_admin()) or (active and (select private.has_active_membership()))
);
drop policy plans_read on public.plans;
create policy plans_read on public.plans for select to authenticated using (
  (select private.is_admin()) or (active and (select private.has_active_membership()))
);
drop policy partners_member_read on public.partners;
create policy partners_member_read on public.partners for select to authenticated using (
  status='active' and (select private.has_active_membership())
  and exists (select 1 from public.units u where u.id=unit_id and u.active)
  and (select private.has_published_service_for_partner(id))
);
drop policy orders_member_insert on public.orders;
create policy orders_member_insert on public.orders for insert to authenticated with check (
  member_id=(select auth.uid()) and status='requested' and (select private.is_service_available(service_id))
);
drop policy events_member_insert on public.service_events;
create policy events_member_insert on public.service_events for insert to authenticated with check (
  member_id=(select auth.uid()) and (select private.is_service_visible(service_id))
  and (type='view' or (select private.is_service_available(service_id)))
);

create or replace function private.prepare_member_order() returns trigger
language plpgsql security definer set search_path = '' as $$
declare s public.services%rowtype;
begin
  if auth.uid() is null or new.member_id is distinct from auth.uid() or not private.is_service_available(new.service_id) then
    raise exception 'Serviço bloqueado pelo plano ou horário' using errcode='42501';
  end if;
  if (select count(*) from public.orders where member_id=auth.uid() and created_at>now()-interval '1 hour')>=10 then
    raise exception 'Limite de pedidos por hora' using errcode='P0001';
  end if;
  select * into strict s from public.services where id=new.service_id;
  new.unit_id:=s.unit_id; new.status:='requested'; new.quantity:=1;
  new.unit_price_cents:=s.price_cents; new.total_cents:=s.price_cents;
  new.confirmed_at:=null; new.confirmed_by:=null; new.cancelled_at:=null; new.created_at:=now();
  return new;
end;
$$;
create or replace function private.prepare_service_event() returns trigger
language plpgsql security definer set search_path = '' as $$
declare current_unit uuid; unit_timezone text;
begin
  if auth.uid() is null or new.member_id is distinct from auth.uid()
    or not private.is_service_visible(new.service_id)
    or (new.type='interest' and not private.is_service_available(new.service_id)) then
    raise exception 'Serviço indisponível para esta ação' using errcode='42501';
  end if;
  select s.unit_id,u.timezone into strict current_unit,unit_timezone from public.services s
    join public.units u on u.id=s.unit_id where s.id=new.service_id;
  new.unit_id:=current_unit; new.occurred_at:=now(); new.event_day:=(now() at time zone unit_timezone)::date;
  return new;
end;
$$;

create table public.upgrade_requests (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.profiles(id) on delete restrict,
  requested_plan text not null default 'premium' check (requested_plan='premium'),
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles(id) on delete restrict,
  check ((status='pending' and reviewed_at is null and reviewed_by is null)
    or (status<>'pending' and reviewed_at is not null and reviewed_by is not null))
);
create unique index upgrade_requests_one_pending on public.upgrade_requests(member_id) where status='pending';
create index upgrade_requests_status_created on public.upgrade_requests(status,created_at desc);
alter table public.upgrade_requests enable row level security;
revoke all on public.upgrade_requests from anon, authenticated;
grant select on public.upgrade_requests to authenticated;
grant insert(member_id) on public.upgrade_requests to authenticated;
grant update(status,reviewed_at,reviewed_by) on public.upgrade_requests to authenticated;
create policy upgrade_read on public.upgrade_requests for select to authenticated using (
  member_id=(select auth.uid()) or (select private.is_admin())
);
create policy upgrade_insert on public.upgrade_requests for insert to authenticated with check (
  member_id=(select auth.uid()) and status='pending' and requested_plan='premium'
  and (select private.has_active_membership()) and exists (
    select 1 from public.memberships m join public.plans p on p.id=m.plan_id where m.user_id=(select auth.uid()) and p.code='basic'
  )
);
create policy upgrade_admin_update on public.upgrade_requests for update to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));

create function public.request_premium_upgrade() returns uuid language plpgsql security invoker set search_path='' as $$
declare result uuid;
begin
  if not private.has_active_membership() or not exists (
    select 1 from public.memberships m join public.plans p on p.id=m.plan_id where m.user_id=auth.uid() and p.code='basic'
  ) then raise exception 'Assinatura Básica ativa necessária' using errcode='42501'; end if;
  select id into result from public.upgrade_requests where member_id=auth.uid() and status='pending';
  if result is not null then return result; end if;
  if (select count(*) from public.upgrade_requests where member_id=auth.uid() and created_at>now()-interval '1 day')>=3 then
    raise exception 'Limite diário de solicitações' using errcode='P0001';
  end if;
  insert into public.upgrade_requests(member_id) values(auth.uid()) on conflict do nothing returning id into result;
  if result is null then select id into result from public.upgrade_requests where member_id=auth.uid() and status='pending'; end if;
  return result;
end;
$$;
create function public.review_premium_upgrade(request_id uuid, decision text) returns text
language plpgsql security invoker set search_path='' as $$
declare r public.upgrade_requests%rowtype; m public.memberships%rowtype; premium_id uuid;
begin
  if not private.is_admin() then raise exception 'Admin obrigatório' using errcode='42501'; end if;
  if decision not in ('approved','rejected') then raise exception 'Decisão inválida' using errcode='23514'; end if;
  select * into r from public.upgrade_requests where id=request_id for update;
  if not found then raise exception 'Solicitação inexistente' using errcode='23514'; end if;
  if r.status=decision then return r.status; end if;
  if r.status<>'pending' then raise exception 'Solicitação já analisada' using errcode='23514'; end if;
  if decision='approved' then
    select * into m from public.memberships where user_id=r.member_id for update;
    if not found or m.status<>'active' or m.starts_at>now() or (m.expires_at is not null and m.expires_at<=now()) then
      raise exception 'Assinatura inativa ou expirada' using errcode='23514';
    end if;
    select id into premium_id from public.plans where code='premium' and active;
    if premium_id is null then raise exception 'Plano Premium indisponível' using errcode='23514'; end if;
    update public.memberships set plan_id=premium_id,changed_by=auth.uid(),updated_at=now() where id=m.id;
  end if;
  update public.upgrade_requests set status=decision,reviewed_by=auth.uid(),reviewed_at=now() where id=r.id;
  insert into public.audit_logs(actor_user_id,action,target_table,target_id)
    values(auth.uid(),'upgrade_'||decision,'upgrade_requests',r.id);
  return decision;
end;
$$;
revoke all on function public.request_premium_upgrade(),public.review_premium_upgrade(uuid,text) from public,anon;
grant execute on function public.request_premium_upgrade(),public.review_premium_upgrade(uuid,text) to authenticated;

-- Unidades, parceiros e serviços inteiramente fictícios para demonstração no RS.
update public.units set name='Órbita Moinhos de Vento',slug='moinhos-de-vento',city='Porto Alegre',neighborhood='Moinhos de Vento',state='RS' where slug='paulista';
insert into public.plans(code,name) values ('basic','Básico'),('premium','Premium') on conflict(code) do nothing;
insert into public.units(name,slug,city,neighborhood,state,timezone) values('Órbita Moinhos de Vento','moinhos-de-vento','Porto Alegre','Moinhos de Vento','RS','America/Sao_Paulo') on conflict(slug) do update set name=excluded.name,city=excluded.city,neighborhood=excluded.neighborhood,state='RS';
insert into public.partners(unit_id,name,description) select id,'Órbita Experiências · Moinhos de Vento','Parceiro fictício de serviços e experiências da unidade.' from public.units u where slug='moinhos-de-vento' and not exists(select 1 from public.partners p where p.unit_id=u.id and p.name='Órbita Experiências · Moinhos de Vento');
insert into public.services(unit_id,partner_id,name,description_pt,description_en,price_cents,category,status,access_plan) select u.id,p.id,'Café da manhã','Café, pão de queijo e frutas para começar o dia no seu coworking.','Breakfast with coffee, cheese bread and fruit.',2200,'Gastronomia','published','basic' from public.units u join public.partners p on p.unit_id=u.id and p.name='Órbita Experiências · Moinhos de Vento' where u.slug='moinhos-de-vento' and not exists(select 1 from public.services s where s.unit_id=u.id and s.name='Café da manhã');
insert into public.recommendation_rules(service_id,plan_id,weekdays,start_time,end_time,priority) select s.id,null,array[0,1,2,3,4,5,6]::smallint[],'07:00','11:00',10 from public.services s join public.units u on u.id=s.unit_id where u.slug='moinhos-de-vento' and s.name='Café da manhã' and not exists(select 1 from public.recommendation_rules r where r.service_id=s.id and r.enabled);
insert into public.services(unit_id,partner_id,name,description_pt,description_en,price_cents,category,status,access_plan) select u.id,p.id,'Almoço da casa','Um almoço completo com opção vegetariana para sua pausa de trabalho.','A complete lunch with a vegetarian option.',3900,'Gastronomia','published','basic' from public.units u join public.partners p on p.unit_id=u.id and p.name='Órbita Experiências · Moinhos de Vento' where u.slug='moinhos-de-vento' and not exists(select 1 from public.services s where s.unit_id=u.id and s.name='Almoço da casa');
insert into public.recommendation_rules(service_id,plan_id,weekdays,start_time,end_time,priority) select s.id,null,array[0,1,2,3,4,5,6]::smallint[],'11:00','15:00',10 from public.services s join public.units u on u.id=s.unit_id where u.slug='moinhos-de-vento' and s.name='Almoço da casa' and not exists(select 1 from public.recommendation_rules r where r.service_id=s.id and r.enabled);
insert into public.services(unit_id,partner_id,name,description_pt,description_en,price_cents,category,status,access_plan) select u.id,p.id,'Bicicletário seguro','Guarde sua bicicleta em uma área coberta enquanto aproveita a unidade.','Covered bicycle parking while you enjoy the workspace.',800,'Mobilidade','published','basic' from public.units u join public.partners p on p.unit_id=u.id and p.name='Órbita Experiências · Moinhos de Vento' where u.slug='moinhos-de-vento' and not exists(select 1 from public.services s where s.unit_id=u.id and s.name='Bicicletário seguro');
insert into public.services(unit_id,partner_id,name,description_pt,description_en,price_cents,category,status,access_plan) select u.id,p.id,'Impressão express','Impressão de até vinte páginas e digitalização dos seus documentos.','Print up to twenty pages and scan your documents.',1500,'Produtividade','published','basic' from public.units u join public.partners p on p.unit_id=u.id and p.name='Órbita Experiências · Moinhos de Vento' where u.slug='moinhos-de-vento' and not exists(select 1 from public.services s where s.unit_id=u.id and s.name='Impressão express');
insert into public.recommendation_rules(service_id,plan_id,weekdays,start_time,end_time,priority) select s.id,null,array[0,1,2,3,4,5,6]::smallint[],'08:00','20:00',10 from public.services s join public.units u on u.id=s.unit_id where u.slug='moinhos-de-vento' and s.name='Impressão express' and not exists(select 1 from public.recommendation_rules r where r.service_id=s.id and r.enabled);
insert into public.services(unit_id,partner_id,name,description_pt,description_en,price_cents,category,status,access_plan) select u.id,p.id,'Sala executiva Premium','Uma hora em sala privativa com tela, café e estrutura para reuniões importantes.','One hour in a private meeting room with display and coffee.',8900,'Reuniões','published','premium' from public.units u join public.partners p on p.unit_id=u.id and p.name='Órbita Experiências · Moinhos de Vento' where u.slug='moinhos-de-vento' and not exists(select 1 from public.services s where s.unit_id=u.id and s.name='Sala executiva Premium');
insert into public.recommendation_rules(service_id,plan_id,weekdays,start_time,end_time,priority) select s.id,null,array[0,1,2,3,4,5,6]::smallint[],'08:00','22:00',20 from public.services s join public.units u on u.id=s.unit_id where u.slug='moinhos-de-vento' and s.name='Sala executiva Premium' and not exists(select 1 from public.recommendation_rules r where r.service_id=s.id and r.enabled);
insert into public.services(unit_id,partner_id,name,description_pt,description_en,price_cents,category,status,access_plan) select u.id,p.id,'Estúdio de podcast Premium','Uma hora no estúdio com microfones profissionais e ambiente acústico.','One hour in an acoustically treated studio with professional microphones.',11900,'Estúdio','published','premium' from public.units u join public.partners p on p.unit_id=u.id and p.name='Órbita Experiências · Moinhos de Vento' where u.slug='moinhos-de-vento' and not exists(select 1 from public.services s where s.unit_id=u.id and s.name='Estúdio de podcast Premium');
insert into public.recommendation_rules(service_id,plan_id,weekdays,start_time,end_time,priority) select s.id,null,array[0,1,2,3,4,5,6]::smallint[],'09:00','21:00',20 from public.services s join public.units u on u.id=s.unit_id where u.slug='moinhos-de-vento' and s.name='Estúdio de podcast Premium' and not exists(select 1 from public.recommendation_rules r where r.service_id=s.id and r.enabled);
insert into public.units(name,slug,city,neighborhood,state,timezone) values('Órbita Menino Deus','menino-deus','Porto Alegre','Menino Deus','RS','America/Sao_Paulo') on conflict(slug) do update set name=excluded.name,city=excluded.city,neighborhood=excluded.neighborhood,state='RS';
insert into public.partners(unit_id,name,description) select id,'Órbita Experiências · Menino Deus','Parceiro fictício de serviços e experiências da unidade.' from public.units u where slug='menino-deus' and not exists(select 1 from public.partners p where p.unit_id=u.id and p.name='Órbita Experiências · Menino Deus');
insert into public.services(unit_id,partner_id,name,description_pt,description_en,price_cents,category,status,access_plan) select u.id,p.id,'Café da manhã','Café, pão de queijo e frutas para começar o dia no seu coworking.','Breakfast with coffee, cheese bread and fruit.',2200,'Gastronomia','published','basic' from public.units u join public.partners p on p.unit_id=u.id and p.name='Órbita Experiências · Menino Deus' where u.slug='menino-deus' and not exists(select 1 from public.services s where s.unit_id=u.id and s.name='Café da manhã');
insert into public.recommendation_rules(service_id,plan_id,weekdays,start_time,end_time,priority) select s.id,null,array[0,1,2,3,4,5,6]::smallint[],'07:00','11:00',10 from public.services s join public.units u on u.id=s.unit_id where u.slug='menino-deus' and s.name='Café da manhã' and not exists(select 1 from public.recommendation_rules r where r.service_id=s.id and r.enabled);
insert into public.services(unit_id,partner_id,name,description_pt,description_en,price_cents,category,status,access_plan) select u.id,p.id,'Almoço da casa','Um almoço completo com opção vegetariana para sua pausa de trabalho.','A complete lunch with a vegetarian option.',3900,'Gastronomia','published','basic' from public.units u join public.partners p on p.unit_id=u.id and p.name='Órbita Experiências · Menino Deus' where u.slug='menino-deus' and not exists(select 1 from public.services s where s.unit_id=u.id and s.name='Almoço da casa');
insert into public.recommendation_rules(service_id,plan_id,weekdays,start_time,end_time,priority) select s.id,null,array[0,1,2,3,4,5,6]::smallint[],'11:00','15:00',10 from public.services s join public.units u on u.id=s.unit_id where u.slug='menino-deus' and s.name='Almoço da casa' and not exists(select 1 from public.recommendation_rules r where r.service_id=s.id and r.enabled);
insert into public.services(unit_id,partner_id,name,description_pt,description_en,price_cents,category,status,access_plan) select u.id,p.id,'Bicicletário seguro','Guarde sua bicicleta em uma área coberta enquanto aproveita a unidade.','Covered bicycle parking while you enjoy the workspace.',800,'Mobilidade','published','basic' from public.units u join public.partners p on p.unit_id=u.id and p.name='Órbita Experiências · Menino Deus' where u.slug='menino-deus' and not exists(select 1 from public.services s where s.unit_id=u.id and s.name='Bicicletário seguro');
insert into public.services(unit_id,partner_id,name,description_pt,description_en,price_cents,category,status,access_plan) select u.id,p.id,'Impressão express','Impressão de até vinte páginas e digitalização dos seus documentos.','Print up to twenty pages and scan your documents.',1500,'Produtividade','published','basic' from public.units u join public.partners p on p.unit_id=u.id and p.name='Órbita Experiências · Menino Deus' where u.slug='menino-deus' and not exists(select 1 from public.services s where s.unit_id=u.id and s.name='Impressão express');
insert into public.recommendation_rules(service_id,plan_id,weekdays,start_time,end_time,priority) select s.id,null,array[0,1,2,3,4,5,6]::smallint[],'08:00','20:00',10 from public.services s join public.units u on u.id=s.unit_id where u.slug='menino-deus' and s.name='Impressão express' and not exists(select 1 from public.recommendation_rules r where r.service_id=s.id and r.enabled);
insert into public.services(unit_id,partner_id,name,description_pt,description_en,price_cents,category,status,access_plan) select u.id,p.id,'Sala executiva Premium','Uma hora em sala privativa com tela, café e estrutura para reuniões importantes.','One hour in a private meeting room with display and coffee.',8900,'Reuniões','published','premium' from public.units u join public.partners p on p.unit_id=u.id and p.name='Órbita Experiências · Menino Deus' where u.slug='menino-deus' and not exists(select 1 from public.services s where s.unit_id=u.id and s.name='Sala executiva Premium');
insert into public.recommendation_rules(service_id,plan_id,weekdays,start_time,end_time,priority) select s.id,null,array[0,1,2,3,4,5,6]::smallint[],'08:00','22:00',20 from public.services s join public.units u on u.id=s.unit_id where u.slug='menino-deus' and s.name='Sala executiva Premium' and not exists(select 1 from public.recommendation_rules r where r.service_id=s.id and r.enabled);
insert into public.services(unit_id,partner_id,name,description_pt,description_en,price_cents,category,status,access_plan) select u.id,p.id,'Estúdio de podcast Premium','Uma hora no estúdio com microfones profissionais e ambiente acústico.','One hour in an acoustically treated studio with professional microphones.',11900,'Estúdio','published','premium' from public.units u join public.partners p on p.unit_id=u.id and p.name='Órbita Experiências · Menino Deus' where u.slug='menino-deus' and not exists(select 1 from public.services s where s.unit_id=u.id and s.name='Estúdio de podcast Premium');
insert into public.recommendation_rules(service_id,plan_id,weekdays,start_time,end_time,priority) select s.id,null,array[0,1,2,3,4,5,6]::smallint[],'09:00','21:00',20 from public.services s join public.units u on u.id=s.unit_id where u.slug='menino-deus' and s.name='Estúdio de podcast Premium' and not exists(select 1 from public.recommendation_rules r where r.service_id=s.id and r.enabled);
insert into public.units(name,slug,city,neighborhood,state,timezone) values('Órbita Cidade Baixa','cidade-baixa','Porto Alegre','Cidade Baixa','RS','America/Sao_Paulo') on conflict(slug) do update set name=excluded.name,city=excluded.city,neighborhood=excluded.neighborhood,state='RS';
insert into public.partners(unit_id,name,description) select id,'Órbita Experiências · Cidade Baixa','Parceiro fictício de serviços e experiências da unidade.' from public.units u where slug='cidade-baixa' and not exists(select 1 from public.partners p where p.unit_id=u.id and p.name='Órbita Experiências · Cidade Baixa');
insert into public.services(unit_id,partner_id,name,description_pt,description_en,price_cents,category,status,access_plan) select u.id,p.id,'Café da manhã','Café, pão de queijo e frutas para começar o dia no seu coworking.','Breakfast with coffee, cheese bread and fruit.',2200,'Gastronomia','published','basic' from public.units u join public.partners p on p.unit_id=u.id and p.name='Órbita Experiências · Cidade Baixa' where u.slug='cidade-baixa' and not exists(select 1 from public.services s where s.unit_id=u.id and s.name='Café da manhã');
insert into public.recommendation_rules(service_id,plan_id,weekdays,start_time,end_time,priority) select s.id,null,array[0,1,2,3,4,5,6]::smallint[],'07:00','11:00',10 from public.services s join public.units u on u.id=s.unit_id where u.slug='cidade-baixa' and s.name='Café da manhã' and not exists(select 1 from public.recommendation_rules r where r.service_id=s.id and r.enabled);
insert into public.services(unit_id,partner_id,name,description_pt,description_en,price_cents,category,status,access_plan) select u.id,p.id,'Almoço da casa','Um almoço completo com opção vegetariana para sua pausa de trabalho.','A complete lunch with a vegetarian option.',3900,'Gastronomia','published','basic' from public.units u join public.partners p on p.unit_id=u.id and p.name='Órbita Experiências · Cidade Baixa' where u.slug='cidade-baixa' and not exists(select 1 from public.services s where s.unit_id=u.id and s.name='Almoço da casa');
insert into public.recommendation_rules(service_id,plan_id,weekdays,start_time,end_time,priority) select s.id,null,array[0,1,2,3,4,5,6]::smallint[],'11:00','15:00',10 from public.services s join public.units u on u.id=s.unit_id where u.slug='cidade-baixa' and s.name='Almoço da casa' and not exists(select 1 from public.recommendation_rules r where r.service_id=s.id and r.enabled);
insert into public.services(unit_id,partner_id,name,description_pt,description_en,price_cents,category,status,access_plan) select u.id,p.id,'Bicicletário seguro','Guarde sua bicicleta em uma área coberta enquanto aproveita a unidade.','Covered bicycle parking while you enjoy the workspace.',800,'Mobilidade','published','basic' from public.units u join public.partners p on p.unit_id=u.id and p.name='Órbita Experiências · Cidade Baixa' where u.slug='cidade-baixa' and not exists(select 1 from public.services s where s.unit_id=u.id and s.name='Bicicletário seguro');
insert into public.services(unit_id,partner_id,name,description_pt,description_en,price_cents,category,status,access_plan) select u.id,p.id,'Impressão express','Impressão de até vinte páginas e digitalização dos seus documentos.','Print up to twenty pages and scan your documents.',1500,'Produtividade','published','basic' from public.units u join public.partners p on p.unit_id=u.id and p.name='Órbita Experiências · Cidade Baixa' where u.slug='cidade-baixa' and not exists(select 1 from public.services s where s.unit_id=u.id and s.name='Impressão express');
insert into public.recommendation_rules(service_id,plan_id,weekdays,start_time,end_time,priority) select s.id,null,array[0,1,2,3,4,5,6]::smallint[],'08:00','20:00',10 from public.services s join public.units u on u.id=s.unit_id where u.slug='cidade-baixa' and s.name='Impressão express' and not exists(select 1 from public.recommendation_rules r where r.service_id=s.id and r.enabled);
insert into public.services(unit_id,partner_id,name,description_pt,description_en,price_cents,category,status,access_plan) select u.id,p.id,'Sala executiva Premium','Uma hora em sala privativa com tela, café e estrutura para reuniões importantes.','One hour in a private meeting room with display and coffee.',8900,'Reuniões','published','premium' from public.units u join public.partners p on p.unit_id=u.id and p.name='Órbita Experiências · Cidade Baixa' where u.slug='cidade-baixa' and not exists(select 1 from public.services s where s.unit_id=u.id and s.name='Sala executiva Premium');
insert into public.recommendation_rules(service_id,plan_id,weekdays,start_time,end_time,priority) select s.id,null,array[0,1,2,3,4,5,6]::smallint[],'08:00','22:00',20 from public.services s join public.units u on u.id=s.unit_id where u.slug='cidade-baixa' and s.name='Sala executiva Premium' and not exists(select 1 from public.recommendation_rules r where r.service_id=s.id and r.enabled);
insert into public.services(unit_id,partner_id,name,description_pt,description_en,price_cents,category,status,access_plan) select u.id,p.id,'Estúdio de podcast Premium','Uma hora no estúdio com microfones profissionais e ambiente acústico.','One hour in an acoustically treated studio with professional microphones.',11900,'Estúdio','published','premium' from public.units u join public.partners p on p.unit_id=u.id and p.name='Órbita Experiências · Cidade Baixa' where u.slug='cidade-baixa' and not exists(select 1 from public.services s where s.unit_id=u.id and s.name='Estúdio de podcast Premium');
insert into public.recommendation_rules(service_id,plan_id,weekdays,start_time,end_time,priority) select s.id,null,array[0,1,2,3,4,5,6]::smallint[],'09:00','21:00',20 from public.services s join public.units u on u.id=s.unit_id where u.slug='cidade-baixa' and s.name='Estúdio de podcast Premium' and not exists(select 1 from public.recommendation_rules r where r.service_id=s.id and r.enabled);
insert into public.units(name,slug,city,neighborhood,state,timezone) values('Órbita Bom Fim','bom-fim','Porto Alegre','Bom Fim','RS','America/Sao_Paulo') on conflict(slug) do update set name=excluded.name,city=excluded.city,neighborhood=excluded.neighborhood,state='RS';
insert into public.partners(unit_id,name,description) select id,'Órbita Experiências · Bom Fim','Parceiro fictício de serviços e experiências da unidade.' from public.units u where slug='bom-fim' and not exists(select 1 from public.partners p where p.unit_id=u.id and p.name='Órbita Experiências · Bom Fim');
insert into public.services(unit_id,partner_id,name,description_pt,description_en,price_cents,category,status,access_plan) select u.id,p.id,'Café da manhã','Café, pão de queijo e frutas para começar o dia no seu coworking.','Breakfast with coffee, cheese bread and fruit.',2200,'Gastronomia','published','basic' from public.units u join public.partners p on p.unit_id=u.id and p.name='Órbita Experiências · Bom Fim' where u.slug='bom-fim' and not exists(select 1 from public.services s where s.unit_id=u.id and s.name='Café da manhã');
insert into public.recommendation_rules(service_id,plan_id,weekdays,start_time,end_time,priority) select s.id,null,array[0,1,2,3,4,5,6]::smallint[],'07:00','11:00',10 from public.services s join public.units u on u.id=s.unit_id where u.slug='bom-fim' and s.name='Café da manhã' and not exists(select 1 from public.recommendation_rules r where r.service_id=s.id and r.enabled);
insert into public.services(unit_id,partner_id,name,description_pt,description_en,price_cents,category,status,access_plan) select u.id,p.id,'Almoço da casa','Um almoço completo com opção vegetariana para sua pausa de trabalho.','A complete lunch with a vegetarian option.',3900,'Gastronomia','published','basic' from public.units u join public.partners p on p.unit_id=u.id and p.name='Órbita Experiências · Bom Fim' where u.slug='bom-fim' and not exists(select 1 from public.services s where s.unit_id=u.id and s.name='Almoço da casa');
insert into public.recommendation_rules(service_id,plan_id,weekdays,start_time,end_time,priority) select s.id,null,array[0,1,2,3,4,5,6]::smallint[],'11:00','15:00',10 from public.services s join public.units u on u.id=s.unit_id where u.slug='bom-fim' and s.name='Almoço da casa' and not exists(select 1 from public.recommendation_rules r where r.service_id=s.id and r.enabled);
insert into public.services(unit_id,partner_id,name,description_pt,description_en,price_cents,category,status,access_plan) select u.id,p.id,'Bicicletário seguro','Guarde sua bicicleta em uma área coberta enquanto aproveita a unidade.','Covered bicycle parking while you enjoy the workspace.',800,'Mobilidade','published','basic' from public.units u join public.partners p on p.unit_id=u.id and p.name='Órbita Experiências · Bom Fim' where u.slug='bom-fim' and not exists(select 1 from public.services s where s.unit_id=u.id and s.name='Bicicletário seguro');
insert into public.services(unit_id,partner_id,name,description_pt,description_en,price_cents,category,status,access_plan) select u.id,p.id,'Impressão express','Impressão de até vinte páginas e digitalização dos seus documentos.','Print up to twenty pages and scan your documents.',1500,'Produtividade','published','basic' from public.units u join public.partners p on p.unit_id=u.id and p.name='Órbita Experiências · Bom Fim' where u.slug='bom-fim' and not exists(select 1 from public.services s where s.unit_id=u.id and s.name='Impressão express');
insert into public.recommendation_rules(service_id,plan_id,weekdays,start_time,end_time,priority) select s.id,null,array[0,1,2,3,4,5,6]::smallint[],'08:00','20:00',10 from public.services s join public.units u on u.id=s.unit_id where u.slug='bom-fim' and s.name='Impressão express' and not exists(select 1 from public.recommendation_rules r where r.service_id=s.id and r.enabled);
insert into public.services(unit_id,partner_id,name,description_pt,description_en,price_cents,category,status,access_plan) select u.id,p.id,'Sala executiva Premium','Uma hora em sala privativa com tela, café e estrutura para reuniões importantes.','One hour in a private meeting room with display and coffee.',8900,'Reuniões','published','premium' from public.units u join public.partners p on p.unit_id=u.id and p.name='Órbita Experiências · Bom Fim' where u.slug='bom-fim' and not exists(select 1 from public.services s where s.unit_id=u.id and s.name='Sala executiva Premium');
insert into public.recommendation_rules(service_id,plan_id,weekdays,start_time,end_time,priority) select s.id,null,array[0,1,2,3,4,5,6]::smallint[],'08:00','22:00',20 from public.services s join public.units u on u.id=s.unit_id where u.slug='bom-fim' and s.name='Sala executiva Premium' and not exists(select 1 from public.recommendation_rules r where r.service_id=s.id and r.enabled);
insert into public.services(unit_id,partner_id,name,description_pt,description_en,price_cents,category,status,access_plan) select u.id,p.id,'Estúdio de podcast Premium','Uma hora no estúdio com microfones profissionais e ambiente acústico.','One hour in an acoustically treated studio with professional microphones.',11900,'Estúdio','published','premium' from public.units u join public.partners p on p.unit_id=u.id and p.name='Órbita Experiências · Bom Fim' where u.slug='bom-fim' and not exists(select 1 from public.services s where s.unit_id=u.id and s.name='Estúdio de podcast Premium');
insert into public.recommendation_rules(service_id,plan_id,weekdays,start_time,end_time,priority) select s.id,null,array[0,1,2,3,4,5,6]::smallint[],'09:00','21:00',20 from public.services s join public.units u on u.id=s.unit_id where u.slug='bom-fim' and s.name='Estúdio de podcast Premium' and not exists(select 1 from public.recommendation_rules r where r.service_id=s.id and r.enabled);
insert into public.units(name,slug,city,neighborhood,state,timezone) values('Órbita Canoas Centro','canoas-centro','Canoas','Centro','RS','America/Sao_Paulo') on conflict(slug) do update set name=excluded.name,city=excluded.city,neighborhood=excluded.neighborhood,state='RS';
insert into public.partners(unit_id,name,description) select id,'Órbita Experiências · Canoas','Parceiro fictício de serviços e experiências da unidade.' from public.units u where slug='canoas-centro' and not exists(select 1 from public.partners p where p.unit_id=u.id and p.name='Órbita Experiências · Canoas');
insert into public.services(unit_id,partner_id,name,description_pt,description_en,price_cents,category,status,access_plan) select u.id,p.id,'Café da manhã','Café, pão de queijo e frutas para começar o dia no seu coworking.','Breakfast with coffee, cheese bread and fruit.',2200,'Gastronomia','published','basic' from public.units u join public.partners p on p.unit_id=u.id and p.name='Órbita Experiências · Canoas' where u.slug='canoas-centro' and not exists(select 1 from public.services s where s.unit_id=u.id and s.name='Café da manhã');
insert into public.recommendation_rules(service_id,plan_id,weekdays,start_time,end_time,priority) select s.id,null,array[0,1,2,3,4,5,6]::smallint[],'07:00','11:00',10 from public.services s join public.units u on u.id=s.unit_id where u.slug='canoas-centro' and s.name='Café da manhã' and not exists(select 1 from public.recommendation_rules r where r.service_id=s.id and r.enabled);
insert into public.services(unit_id,partner_id,name,description_pt,description_en,price_cents,category,status,access_plan) select u.id,p.id,'Almoço da casa','Um almoço completo com opção vegetariana para sua pausa de trabalho.','A complete lunch with a vegetarian option.',3900,'Gastronomia','published','basic' from public.units u join public.partners p on p.unit_id=u.id and p.name='Órbita Experiências · Canoas' where u.slug='canoas-centro' and not exists(select 1 from public.services s where s.unit_id=u.id and s.name='Almoço da casa');
insert into public.recommendation_rules(service_id,plan_id,weekdays,start_time,end_time,priority) select s.id,null,array[0,1,2,3,4,5,6]::smallint[],'11:00','15:00',10 from public.services s join public.units u on u.id=s.unit_id where u.slug='canoas-centro' and s.name='Almoço da casa' and not exists(select 1 from public.recommendation_rules r where r.service_id=s.id and r.enabled);
insert into public.services(unit_id,partner_id,name,description_pt,description_en,price_cents,category,status,access_plan) select u.id,p.id,'Bicicletário seguro','Guarde sua bicicleta em uma área coberta enquanto aproveita a unidade.','Covered bicycle parking while you enjoy the workspace.',800,'Mobilidade','published','basic' from public.units u join public.partners p on p.unit_id=u.id and p.name='Órbita Experiências · Canoas' where u.slug='canoas-centro' and not exists(select 1 from public.services s where s.unit_id=u.id and s.name='Bicicletário seguro');
insert into public.services(unit_id,partner_id,name,description_pt,description_en,price_cents,category,status,access_plan) select u.id,p.id,'Impressão express','Impressão de até vinte páginas e digitalização dos seus documentos.','Print up to twenty pages and scan your documents.',1500,'Produtividade','published','basic' from public.units u join public.partners p on p.unit_id=u.id and p.name='Órbita Experiências · Canoas' where u.slug='canoas-centro' and not exists(select 1 from public.services s where s.unit_id=u.id and s.name='Impressão express');
insert into public.recommendation_rules(service_id,plan_id,weekdays,start_time,end_time,priority) select s.id,null,array[0,1,2,3,4,5,6]::smallint[],'08:00','20:00',10 from public.services s join public.units u on u.id=s.unit_id where u.slug='canoas-centro' and s.name='Impressão express' and not exists(select 1 from public.recommendation_rules r where r.service_id=s.id and r.enabled);
insert into public.services(unit_id,partner_id,name,description_pt,description_en,price_cents,category,status,access_plan) select u.id,p.id,'Sala executiva Premium','Uma hora em sala privativa com tela, café e estrutura para reuniões importantes.','One hour in a private meeting room with display and coffee.',8900,'Reuniões','published','premium' from public.units u join public.partners p on p.unit_id=u.id and p.name='Órbita Experiências · Canoas' where u.slug='canoas-centro' and not exists(select 1 from public.services s where s.unit_id=u.id and s.name='Sala executiva Premium');
insert into public.recommendation_rules(service_id,plan_id,weekdays,start_time,end_time,priority) select s.id,null,array[0,1,2,3,4,5,6]::smallint[],'08:00','22:00',20 from public.services s join public.units u on u.id=s.unit_id where u.slug='canoas-centro' and s.name='Sala executiva Premium' and not exists(select 1 from public.recommendation_rules r where r.service_id=s.id and r.enabled);
insert into public.services(unit_id,partner_id,name,description_pt,description_en,price_cents,category,status,access_plan) select u.id,p.id,'Estúdio de podcast Premium','Uma hora no estúdio com microfones profissionais e ambiente acústico.','One hour in an acoustically treated studio with professional microphones.',11900,'Estúdio','published','premium' from public.units u join public.partners p on p.unit_id=u.id and p.name='Órbita Experiências · Canoas' where u.slug='canoas-centro' and not exists(select 1 from public.services s where s.unit_id=u.id and s.name='Estúdio de podcast Premium');
insert into public.recommendation_rules(service_id,plan_id,weekdays,start_time,end_time,priority) select s.id,null,array[0,1,2,3,4,5,6]::smallint[],'09:00','21:00',20 from public.services s join public.units u on u.id=s.unit_id where u.slug='canoas-centro' and s.name='Estúdio de podcast Premium' and not exists(select 1 from public.recommendation_rules r where r.service_id=s.id and r.enabled);
insert into public.units(name,slug,city,neighborhood,state,timezone) values('Órbita Pelotas Centro','pelotas-centro','Pelotas','Centro','RS','America/Sao_Paulo') on conflict(slug) do update set name=excluded.name,city=excluded.city,neighborhood=excluded.neighborhood,state='RS';
insert into public.partners(unit_id,name,description) select id,'Órbita Experiências · Pelotas','Parceiro fictício de serviços e experiências da unidade.' from public.units u where slug='pelotas-centro' and not exists(select 1 from public.partners p where p.unit_id=u.id and p.name='Órbita Experiências · Pelotas');
insert into public.services(unit_id,partner_id,name,description_pt,description_en,price_cents,category,status,access_plan) select u.id,p.id,'Café da manhã','Café, pão de queijo e frutas para começar o dia no seu coworking.','Breakfast with coffee, cheese bread and fruit.',2200,'Gastronomia','published','basic' from public.units u join public.partners p on p.unit_id=u.id and p.name='Órbita Experiências · Pelotas' where u.slug='pelotas-centro' and not exists(select 1 from public.services s where s.unit_id=u.id and s.name='Café da manhã');
insert into public.recommendation_rules(service_id,plan_id,weekdays,start_time,end_time,priority) select s.id,null,array[0,1,2,3,4,5,6]::smallint[],'07:00','11:00',10 from public.services s join public.units u on u.id=s.unit_id where u.slug='pelotas-centro' and s.name='Café da manhã' and not exists(select 1 from public.recommendation_rules r where r.service_id=s.id and r.enabled);
insert into public.services(unit_id,partner_id,name,description_pt,description_en,price_cents,category,status,access_plan) select u.id,p.id,'Almoço da casa','Um almoço completo com opção vegetariana para sua pausa de trabalho.','A complete lunch with a vegetarian option.',3900,'Gastronomia','published','basic' from public.units u join public.partners p on p.unit_id=u.id and p.name='Órbita Experiências · Pelotas' where u.slug='pelotas-centro' and not exists(select 1 from public.services s where s.unit_id=u.id and s.name='Almoço da casa');
insert into public.recommendation_rules(service_id,plan_id,weekdays,start_time,end_time,priority) select s.id,null,array[0,1,2,3,4,5,6]::smallint[],'11:00','15:00',10 from public.services s join public.units u on u.id=s.unit_id where u.slug='pelotas-centro' and s.name='Almoço da casa' and not exists(select 1 from public.recommendation_rules r where r.service_id=s.id and r.enabled);
insert into public.services(unit_id,partner_id,name,description_pt,description_en,price_cents,category,status,access_plan) select u.id,p.id,'Bicicletário seguro','Guarde sua bicicleta em uma área coberta enquanto aproveita a unidade.','Covered bicycle parking while you enjoy the workspace.',800,'Mobilidade','published','basic' from public.units u join public.partners p on p.unit_id=u.id and p.name='Órbita Experiências · Pelotas' where u.slug='pelotas-centro' and not exists(select 1 from public.services s where s.unit_id=u.id and s.name='Bicicletário seguro');
insert into public.services(unit_id,partner_id,name,description_pt,description_en,price_cents,category,status,access_plan) select u.id,p.id,'Impressão express','Impressão de até vinte páginas e digitalização dos seus documentos.','Print up to twenty pages and scan your documents.',1500,'Produtividade','published','basic' from public.units u join public.partners p on p.unit_id=u.id and p.name='Órbita Experiências · Pelotas' where u.slug='pelotas-centro' and not exists(select 1 from public.services s where s.unit_id=u.id and s.name='Impressão express');
insert into public.recommendation_rules(service_id,plan_id,weekdays,start_time,end_time,priority) select s.id,null,array[0,1,2,3,4,5,6]::smallint[],'08:00','20:00',10 from public.services s join public.units u on u.id=s.unit_id where u.slug='pelotas-centro' and s.name='Impressão express' and not exists(select 1 from public.recommendation_rules r where r.service_id=s.id and r.enabled);
insert into public.services(unit_id,partner_id,name,description_pt,description_en,price_cents,category,status,access_plan) select u.id,p.id,'Sala executiva Premium','Uma hora em sala privativa com tela, café e estrutura para reuniões importantes.','One hour in a private meeting room with display and coffee.',8900,'Reuniões','published','premium' from public.units u join public.partners p on p.unit_id=u.id and p.name='Órbita Experiências · Pelotas' where u.slug='pelotas-centro' and not exists(select 1 from public.services s where s.unit_id=u.id and s.name='Sala executiva Premium');
insert into public.recommendation_rules(service_id,plan_id,weekdays,start_time,end_time,priority) select s.id,null,array[0,1,2,3,4,5,6]::smallint[],'08:00','22:00',20 from public.services s join public.units u on u.id=s.unit_id where u.slug='pelotas-centro' and s.name='Sala executiva Premium' and not exists(select 1 from public.recommendation_rules r where r.service_id=s.id and r.enabled);
insert into public.services(unit_id,partner_id,name,description_pt,description_en,price_cents,category,status,access_plan) select u.id,p.id,'Estúdio de podcast Premium','Uma hora no estúdio com microfones profissionais e ambiente acústico.','One hour in an acoustically treated studio with professional microphones.',11900,'Estúdio','published','premium' from public.units u join public.partners p on p.unit_id=u.id and p.name='Órbita Experiências · Pelotas' where u.slug='pelotas-centro' and not exists(select 1 from public.services s where s.unit_id=u.id and s.name='Estúdio de podcast Premium');
insert into public.recommendation_rules(service_id,plan_id,weekdays,start_time,end_time,priority) select s.id,null,array[0,1,2,3,4,5,6]::smallint[],'09:00','21:00',20 from public.services s join public.units u on u.id=s.unit_id where u.slug='pelotas-centro' and s.name='Estúdio de podcast Premium' and not exists(select 1 from public.recommendation_rules r where r.service_id=s.id and r.enabled);
