alter table public.profiles drop constraint profiles_id_fkey;
alter table public.profiles add constraint profiles_id_fkey foreign key(id) references auth.users(id) on delete cascade;
alter table public.invitations alter column invited_user_id drop not null;
alter table public.invitations drop constraint invitations_invited_user_id_fkey;
alter table public.invitations add constraint invitations_invited_user_id_fkey foreign key(invited_user_id) references auth.users(id) on delete set null;
alter table public.profiles drop constraint profiles_preferred_locale_check;
alter table public.profiles add constraint profiles_preferred_locale_check check(preferred_locale in ('pt-BR','en','es','fr','de','it'));
create or replace function private.booking_slots(service_uuid uuid, booking_day date)
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
        from public.orders o where o.service_id=s.id and o.scheduled_start<c.end_at and o.scheduled_end>c.start_at
        and o.status in ('requested','confirmed')))
    from candidates c where c.start_at>now() and c.start_at>=m.starts_at
      and (m.expires_at is null or c.end_at<=m.expires_at)
    order by c.start_at;
end; $$;

create function private.guard_service_booking_changes() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if new.slot_duration_minutes<>old.slot_duration_minutes and exists(select 1 from public.orders where service_id=old.id and scheduled_end>now() and status in ('requested','confirmed')) then
   raise exception 'Existem reservas futuras. Mantenha a duração dos horários.' using errcode='23514';
 end if;
 if new.capacity_per_slot<old.capacity_per_slot and exists(select 1 from public.orders where service_id=old.id and scheduled_end>now() and status in ('requested','confirmed') group by scheduled_start having sum(quantity)>new.capacity_per_slot) then
   raise exception 'Capacidade menor que as reservas existentes' using errcode='23514';
 end if;
 return new;
end; $$;
revoke all on function private.guard_service_booking_changes() from public,anon,authenticated;
create trigger guard_service_booking_changes before update of capacity_per_slot,slot_duration_minutes on public.services for each row execute function private.guard_service_booking_changes();
