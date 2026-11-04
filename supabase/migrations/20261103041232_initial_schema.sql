-- Base do domínio. Dados e arquivos ficam no Supabase externo ao container.
create schema if not exists private;
revoke all on schema private from public, anon;

create table public.units (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) between 1 and 120),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  timezone text not null default 'America/Sao_Paulo',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.plans (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code in ('basic', 'premium')),
  name text not null check (length(trim(name)) between 1 and 80),
  active boolean not null default true
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete restrict,
  email text not null,
  full_name text not null check (length(trim(full_name)) between 1 and 120),
  role text not null check (role in ('admin', 'member')),
  unit_id uuid references public.units(id) on delete restrict,
  preferred_locale text not null default 'pt-BR' check (preferred_locale in ('pt-BR', 'en')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint member_requires_unit check (role = 'admin' or unit_id is not null)
);

create table public.memberships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete restrict,
  plan_id uuid not null references public.plans(id) on delete restrict,
  status text not null check (status in ('active', 'inactive')),
  starts_at timestamptz not null default now(),
  expires_at timestamptz,
  changed_by uuid references public.profiles(id) on delete restrict,
  updated_at timestamptz not null default now(),
  constraint membership_dates check (expires_at is null or expires_at > starts_at)
);

create table public.invitations (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  invited_user_id uuid references auth.users(id) on delete restrict,
  invited_by uuid not null references public.profiles(id) on delete restrict,
  unit_id uuid not null references public.units(id) on delete restrict,
  plan_id uuid not null references public.plans(id) on delete restrict,
  initial_status text not null check (initial_status in ('active', 'inactive')),
  status text not null default 'pending' check (status in ('pending', 'accepted', 'delivery_failed', 'revoked')),
  attempt_count integer not null default 0 check (attempt_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  accepted_at timestamptz
);

create table public.partners (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid not null references public.units(id) on delete restrict,
  name text not null check (length(trim(name)) between 1 and 120),
  description text not null default '',
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, unit_id)
);

create table public.partner_terms (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partners(id) on delete restrict,
  contact_email text,
  commission_percent numeric(5,2) check (commission_percent between 0 and 100),
  fixed_fee_cents integer check (fixed_fee_cents >= 0),
  notes text not null default '',
  valid_from date not null,
  valid_until date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint terms_dates check (valid_until is null or valid_until >= valid_from)
);

create table public.services (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid not null references public.units(id) on delete restrict,
  partner_id uuid not null,
  name text not null check (length(trim(name)) between 1 and 120),
  description_pt text not null,
  description_en text,
  price_cents integer not null check (price_cents >= 0),
  currency text not null default 'BRL' check (currency = 'BRL'),
  category text not null,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (partner_id, unit_id) references public.partners(id, unit_id) on delete restrict,
  unique (id, unit_id)
);

create table public.service_media (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references public.services(id) on delete restrict,
  storage_path text not null unique check (length(storage_path) > 0),
  sort_order integer not null default 0 check (sort_order >= 0),
  alt_pt text not null,
  alt_en text
);

create table public.recommendation_rules (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references public.services(id) on delete restrict,
  plan_id uuid references public.plans(id) on delete restrict,
  weekdays smallint[] not null check (weekdays <@ array[0,1,2,3,4,5,6]::smallint[] and cardinality(weekdays) > 0),
  start_time time not null,
  end_time time not null,
  priority integer not null default 0,
  enabled boolean not null default true,
  constraint rule_hours check (start_time < end_time)
);

create table public.service_events (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.profiles(id) on delete restrict,
  service_id uuid not null,
  unit_id uuid not null references public.units(id) on delete restrict,
  type text not null check (type in ('view', 'interest')),
  occurred_at timestamptz not null default now(),
  idempotency_key uuid,
  foreign key (service_id, unit_id) references public.services(id, unit_id) on delete restrict
);
create unique index service_events_idempotency on public.service_events(member_id, idempotency_key) where idempotency_key is not null;

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.profiles(id) on delete restrict,
  service_id uuid not null,
  unit_id uuid not null references public.units(id) on delete restrict,
  status text not null default 'requested' check (status in ('requested', 'confirmed', 'cancelled')),
  quantity smallint not null default 1 check (quantity = 1),
  unit_price_cents integer not null check (unit_price_cents >= 0),
  total_cents integer not null check (total_cents >= 0),
  idempotency_key uuid not null,
  created_at timestamptz not null default now(),
  confirmed_at timestamptz,
  confirmed_by uuid references public.profiles(id) on delete restrict,
  cancelled_at timestamptz,
  foreign key (service_id, unit_id) references public.services(id, unit_id) on delete restrict,
  unique (member_id, idempotency_key)
);

create table public.email_deliveries (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('invite', 'interest_alert', 'order_alert')),
  recipient text not null,
  related_id uuid not null,
  status text not null check (status in ('sent', 'failed')),
  provider_message_id text,
  error_code text,
  created_at timestamptz not null default now()
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references public.profiles(id) on delete restrict,
  action text not null,
  target_table text not null,
  target_id uuid not null,
  occurred_at timestamptz not null default now(),
  safe_metadata jsonb not null default '{}'::jsonb
);

-- Valores de pedidos e identidade dos eventos são derivados no banco.
-- Estas funções já existem na base; as políticas de INSERT do membro entram no DIA 4.
create function private.prepare_member_order() returns trigger language plpgsql security definer set search_path = '' as $$
declare
  current_member public.profiles%rowtype;
  current_service public.services%rowtype;
begin
  if auth.uid() is null or new.member_id is distinct from auth.uid() then
    raise exception 'Autor do pedido inválido' using errcode = '42501';
  end if;
  select * into current_member from public.profiles where id = auth.uid() and role = 'member';
  if not found then raise exception 'Membro inválido' using errcode = '42501'; end if;
  select * into current_service from public.services where id = new.service_id and status = 'published';
  if not found or current_service.unit_id is distinct from current_member.unit_id then
    raise exception 'Serviço indisponível' using errcode = '42501';
  end if;
  if not exists (
    select 1 from public.memberships m where m.user_id = auth.uid() and m.status = 'active'
      and m.starts_at <= now() and (m.expires_at is null or m.expires_at > now())
  ) then raise exception 'Assinatura inválida' using errcode = '42501'; end if;
  if (select count(*) from public.orders o where o.member_id = auth.uid()
      and o.created_at > now() - interval '1 hour') >= 10 then
    raise exception 'Limite de pedidos por hora' using errcode = 'P0001';
  end if;
  new.unit_id := current_service.unit_id;
  new.status := 'requested';
  new.quantity := 1;
  new.unit_price_cents := current_service.price_cents;
  new.total_cents := current_service.price_cents;
  new.confirmed_at := null;
  new.confirmed_by := null;
  new.cancelled_at := null;
  new.created_at := now();
  return new;
end;
$$;
create trigger prepare_member_order before insert on public.orders
  for each row execute function private.prepare_member_order();

create function private.prepare_service_event() returns trigger language plpgsql security definer set search_path = '' as $$
declare
  current_unit uuid;
begin
  if auth.uid() is null or new.member_id is distinct from auth.uid() then
    raise exception 'Autor do evento inválido' using errcode = '42501';
  end if;
  select p.unit_id into current_unit from public.profiles p where p.id = auth.uid() and p.role = 'member';
  if current_unit is null or not exists (
    select 1 from public.memberships m where m.user_id = auth.uid() and m.status = 'active'
      and m.starts_at <= now() and (m.expires_at is null or m.expires_at > now())
  ) or not exists (
    select 1 from public.services s where s.id = new.service_id
      and s.unit_id = current_unit and s.status = 'published'
  ) then raise exception 'Evento indisponível' using errcode = '42501'; end if;
  new.unit_id := current_unit;
  new.occurred_at := now();
  return new;
end;
$$;
create trigger prepare_service_event before insert on public.service_events
  for each row execute function private.prepare_service_event();

create index profiles_role_unit on public.profiles(role, unit_id);
create index memberships_user_status on public.memberships(user_id, status);
create index services_unit_status_partner on public.services(unit_id, status, partner_id);
create index rules_service_enabled on public.recommendation_rules(service_id, enabled);
create index events_service_type_time on public.service_events(service_id, type, occurred_at);
create index orders_member_status_time on public.orders(member_id, status, created_at);
create index orders_member_time on public.orders(member_id, created_at);
create index orders_service_status_time on public.orders(service_id, status, created_at);
create index invitations_email_status on public.invitations(email, status);

-- A role vem da tabela protegida, nunca de user_metadata ou de um JWT antigo.
create function private.is_admin() returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'admin');
$$;
create function private.has_active_membership() returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.profiles p join public.memberships m on m.user_id = p.id
    where p.id = (select auth.uid()) and p.role = 'member' and m.status = 'active'
      and m.starts_at <= now() and (m.expires_at is null or m.expires_at > now())
  );
$$;
create function private.is_service_visible(service_uuid uuid) returns boolean language sql stable security definer set search_path = '' as $$
  select private.has_active_membership() and exists (
    select 1 from public.services s join public.profiles p on p.unit_id = s.unit_id
    where s.id = service_uuid and s.status = 'published' and p.id = (select auth.uid())
  );
$$;
create function private.is_same_unit(member_uuid uuid, service_uuid uuid) returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.profiles p join public.services s on s.unit_id = p.unit_id
    where p.id = member_uuid and s.id = service_uuid);
$$;
revoke all on all functions in schema private from public, anon, authenticated;
grant usage on schema private to authenticated;
grant execute on function private.is_admin(), private.has_active_membership(), private.is_service_visible(uuid), private.is_same_unit(uuid, uuid) to authenticated;

-- Toda tabela exposta tem RLS. Sem política, a operação permanece negada.
alter table public.units enable row level security;
alter table public.plans enable row level security;
alter table public.profiles enable row level security;
alter table public.memberships enable row level security;
alter table public.invitations enable row level security;
alter table public.partners enable row level security;
alter table public.partner_terms enable row level security;
alter table public.services enable row level security;
alter table public.service_media enable row level security;
alter table public.recommendation_rules enable row level security;
alter table public.service_events enable row level security;
alter table public.orders enable row level security;
alter table public.email_deliveries enable row level security;
alter table public.audit_logs enable row level security;

revoke all on public.units, public.plans, public.profiles, public.memberships,
  public.invitations, public.partners, public.partner_terms, public.services,
  public.service_media, public.recommendation_rules, public.service_events,
  public.orders, public.email_deliveries, public.audit_logs from anon, authenticated;
grant select on public.units, public.plans, public.profiles, public.memberships,
  public.partners, public.services, public.service_media to authenticated;
grant select, insert, update on public.invitations, public.partner_terms,
  public.recommendation_rules, public.email_deliveries, public.audit_logs to authenticated;
grant insert, update on public.units, public.plans, public.profiles, public.memberships,
  public.partners, public.services, public.service_media to authenticated;
grant select, insert on public.service_events, public.orders to authenticated;

create policy units_read on public.units for select to authenticated using (
  (select private.is_admin()) or id = (select p.unit_id from public.profiles p where p.id = (select auth.uid()))
);
create policy units_admin_insert on public.units for insert to authenticated with check ((select private.is_admin()));
create policy units_admin_update on public.units for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy plans_read on public.plans for select to authenticated using (
  (select private.is_admin()) or id = (select m.plan_id from public.memberships m where m.user_id = (select auth.uid()))
);
create policy plans_admin_insert on public.plans for insert to authenticated with check ((select private.is_admin()));
create policy plans_admin_update on public.plans for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy profiles_read on public.profiles for select to authenticated using (id = (select auth.uid()) or (select private.is_admin()));
create policy profiles_admin_insert on public.profiles for insert to authenticated with check ((select private.is_admin()));
create policy profiles_admin_update on public.profiles for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy memberships_read on public.memberships for select to authenticated using (user_id = (select auth.uid()) or (select private.is_admin()));
create policy memberships_admin_insert on public.memberships for insert to authenticated with check ((select private.is_admin()));
create policy memberships_admin_update on public.memberships for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));

-- Tabelas comerciais e operacionais recebem políticas específicas nas etapas 2–4.
-- Até lá, grants sem políticas de escrita/leitura não expõem linhas.
create policy partners_admin_all on public.partners for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy terms_admin_all on public.partner_terms for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy services_admin_all on public.services for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy media_admin_all on public.service_media for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy rules_admin_all on public.recommendation_rules for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy invitations_admin_all on public.invitations for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy events_admin_read on public.service_events for select to authenticated using ((select private.is_admin()));
create policy orders_admin_read on public.orders for select to authenticated using ((select private.is_admin()));
create policy deliveries_admin_all on public.email_deliveries for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy audit_admin_read on public.audit_logs for select to authenticated using ((select private.is_admin()));
create policy audit_admin_insert on public.audit_logs for insert to authenticated with check ((select private.is_admin()));

-- Storage privado; acesso a objetos será definido com o CRUD de fotos (DIA 3).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('service-images', 'service-images', false, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
