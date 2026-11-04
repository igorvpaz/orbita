-- Scheduled reservations: capacity is authoritative in Postgres, including direct API inserts.
alter table public.services add column capacity_per_slot integer not null default 10
  check (capacity_per_slot between 1 and 500);
alter table public.services add column slot_duration_minutes integer not null default 60
  check (slot_duration_minutes between 15 and 240 and slot_duration_minutes % 15 = 0);
update public.services set capacity_per_slot = case
  when name ilike '%podcast%' then 1 when name ilike '%executiva%' then 10
  when name ilike '%impress%' then 20 when name ilike '%manhã%' then 30 else 50 end;
alter table public.orders add column scheduled_start timestamptz;
alter table public.orders add column scheduled_end timestamptz;
alter table public.orders add constraint orders_schedule_pair check (
  (scheduled_start is null and scheduled_end is null) or
  (scheduled_start is not null and scheduled_end > scheduled_start));
create index orders_slot_occupancy on public.orders(service_id,scheduled_start)
  include(quantity) where status in ('requested','confirmed');
-- Removing an administrator retains commercial history and audit entries.
alter table public.orders drop constraint orders_confirmed_by_fkey;
alter table public.orders add constraint orders_confirmed_by_fkey foreign key(confirmed_by) references public.profiles(id) on delete set null;
alter table public.audit_logs drop constraint audit_logs_actor_user_id_fkey;
alter table public.audit_logs add constraint audit_logs_actor_user_id_fkey foreign key(actor_user_id) references public.profiles(id) on delete set null;
alter table public.memberships drop constraint memberships_changed_by_fkey;
alter table public.memberships add constraint memberships_changed_by_fkey foreign key(changed_by) references public.profiles(id) on delete set null;
alter table public.upgrade_requests drop constraint upgrade_requests_reviewed_by_fkey;
alter table public.upgrade_requests add constraint upgrade_requests_reviewed_by_fkey foreign key(reviewed_by) references public.profiles(id) on delete set null;
alter table public.invitations alter column invited_by drop not null;
alter table public.invitations drop constraint invitations_invited_by_fkey;
alter table public.invitations add constraint invitations_invited_by_fkey foreign key(invited_by) references public.profiles(id) on delete set null;
grant insert(scheduled_start) on public.orders to authenticated;

create function private.booking_slots(service_uuid uuid, booking_day date)
returns table(starts_at timestamptz, ends_at timestamptz, capacity integer, remaining integer)
language plpgsql volatile security definer set search_path='' as $$
declare s public.services%rowtype; tz text; m public.memberships%rowtype; plan_code text;
begin
  if auth.uid() is null or not private.is_service_visible(service_uuid) then
    raise exception 'Serviço não disponível' using errcode='42501'; end if;
  select * into strict s from public.services where id=service_uuid;
  select timezone into tz from public.units where id=s.unit_id;
  select * into strict m from public.memberships where user_id=auth.uid();
  select code into plan_code from public.plans where id=m.plan_id;
  if s.access_plan='premium' and plan_code<>'premium' then
    raise exception 'Serviço exclusivo Premium' using errcode='42501'; end if;
  if booking_day is null or booking_day<(now() at time zone tz)::date
    or booking_day>(now() at time zone tz)::date+30 then
    raise exception 'Escolha uma data nos próximos 30 dias' using errcode='23514'; end if;
  return query
    with windows as (
      select booking_day+r.start_time a, booking_day+r.end_time b
      from public.recommendation_rules r where r.service_id=s.id and r.enabled
        and (r.plan_id is null or r.plan_id=m.plan_id)
        and extract(dow from booking_day)::smallint=any(r.weekdays)
      union all
      select booking_day::timestamp, booking_day::timestamp+interval '1 day'
      where not exists(select 1 from public.recommendation_rules r where r.service_id=s.id and r.enabled)
    ), candidates as (
      select distinct series at time zone tz start_at,
        (series+make_interval(mins=>s.slot_duration_minutes)) at time zone tz end_at
      from windows w cross join lateral generate_series(w.a,
        w.b-make_interval(mins=>s.slot_duration_minutes),make_interval(mins=>s.slot_duration_minutes)) series
    )
    select c.start_at,c.end_at,s.capacity_per_slot,
      greatest(0,s.capacity_per_slot-(select coalesce(sum(o.quantity),0)::integer
        from public.orders o where o.service_id=s.id and o.scheduled_start=c.start_at
        and o.status in ('requested','confirmed')))
    from candidates c where c.start_at>now() and c.start_at>=m.starts_at
      and (m.expires_at is null or c.end_at<=m.expires_at)
    order by c.start_at;
end; $$;
revoke all on function private.booking_slots(uuid,date) from public,anon;
grant execute on function private.booking_slots(uuid,date) to authenticated;
create function public.service_booking_slots(service_uuid uuid,booking_day date)
returns table(starts_at timestamptz,ends_at timestamptz,capacity integer,remaining integer)
language sql volatile security invoker set search_path='' as $$
  select * from private.booking_slots(service_uuid,booking_day);
$$;
revoke all on function public.service_booking_slots(uuid,date) from public,anon;
grant execute on function public.service_booking_slots(uuid,date) to authenticated;

create or replace function private.prepare_member_order() returns trigger
language plpgsql volatile security definer set search_path='' as $$
declare s public.services%rowtype; tz text; chosen record;
begin
  if auth.uid() is null or new.member_id is distinct from auth.uid() then
    raise exception 'Autor inválido' using errcode='42501'; end if;
  if exists(select 1 from public.orders where member_id=auth.uid() and idempotency_key=new.idempotency_key) then
    raise exception 'Pedido já registrado' using errcode='23505'; end if;
  -- Every insert for this service serializes before reading occupancy. The volatile
  -- statements take a fresh snapshot after waiting, so simultaneous bookings cannot overfill.
  select * into strict s from public.services where id=new.service_id for update;
  select timezone into tz from public.units where id=s.unit_id;
  if new.scheduled_start is null then
    -- Compatibility for the previous deployed app, removed by the contract migration.
    if not private.is_service_available(new.service_id) then raise exception 'Serviço não disponível' using errcode='42501'; end if;
    new.unit_id:=s.unit_id; new.status:='requested'; new.quantity:=1;
    new.unit_price_cents:=s.price_cents; new.total_cents:=s.price_cents;
    new.scheduled_end:=null;new.confirmed_at:=null;new.confirmed_by:=null;new.cancelled_at:=null;new.created_at:=now();
    return new;
  end if;
  select * into chosen from private.booking_slots(s.id,(new.scheduled_start at time zone tz)::date)
    where starts_at=new.scheduled_start;
  if chosen is null then raise exception 'Horário inválido ou indisponível' using errcode='23514'; end if;
  if chosen.remaining<1 then raise exception 'Horário esgotado' using errcode='P0003'; end if;
  if (select count(*) from public.orders where member_id=auth.uid() and created_at>now()-interval '1 hour')>=10 then
    raise exception 'Limite de pedidos por hora' using errcode='P0001'; end if;
  new.unit_id:=s.unit_id; new.status:='requested'; new.quantity:=1;
  new.unit_price_cents:=s.price_cents; new.total_cents:=s.price_cents;
  new.scheduled_end:=chosen.ends_at; new.confirmed_at:=null; new.confirmed_by:=null;
  new.cancelled_at:=null; new.created_at:=now();
  return new;
end; $$;
drop policy orders_member_insert on public.orders;
create policy orders_member_insert on public.orders for insert to authenticated with check (
  member_id=(select auth.uid()) and status='requested' and (select private.is_service_visible(service_id)));

-- Keep at least one administrator even when deletion comes through Auth cascade.
create function private.guard_last_admin() returns trigger
language plpgsql volatile security definer set search_path='' as $$
begin
  if old.role='admin' and (tg_op='DELETE' or new.role<>'admin') then
    perform pg_advisory_xact_lock(8675309);
    if old.id=auth.uid() then raise exception 'Não é permitido excluir o próprio administrador' using errcode='23514'; end if;
    if (select count(*) from public.profiles where role='admin' and id<>old.id)=0 then
      raise exception 'Mantenha pelo menos um administrador' using errcode='23514'; end if;
  end if;
  if tg_op='DELETE' then return old; end if; return new;
end; $$;
revoke all on function private.guard_last_admin() from public,anon,authenticated;
create trigger guard_last_admin before delete or update of role on public.profiles
  for each row execute function private.guard_last_admin();
