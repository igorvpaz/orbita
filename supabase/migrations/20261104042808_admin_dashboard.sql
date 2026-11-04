create index events_reporting_date on public.service_events(occurred_at,service_id) include(type,member_id,unit_id);
create index orders_reporting_confirmation on public.orders(confirmed_at,service_id) include(total_cents,unit_id) where status='confirmed';
create function public.admin_dashboard(period_start date,period_end date) returns jsonb
language plpgsql stable security invoker set search_path='' as $$
declare result jsonb; first_instant timestamptz; last_instant timestamptz;
begin
  if not private.is_admin() then raise exception 'Admin obrigatório' using errcode='42501'; end if;
  if period_start is null or period_end is null or period_end<period_start or period_end-period_start>365 then
    raise exception 'Período inválido' using errcode='23514'; end if;
  first_instant:=period_start::timestamp at time zone 'America/Sao_Paulo';
  last_instant:=(period_end+1)::timestamp at time zone 'America/Sao_Paulo';
  with ev as materialized (
    select * from public.service_events where occurred_at>=first_instant and occurred_at<last_instant
  ), ord as materialized (
    select * from public.orders where created_at>=first_instant and created_at<last_instant
  ), confirmed as materialized (
    select * from public.orders where status='confirmed' and confirmed_at>=first_instant and confirmed_at<last_instant
  ), service_stats as (
    select s.id,s.name,u.name unit_name,s.unit_id,
      (select count(*) from ev where service_id=s.id and type='view') views,
      (select count(*) from ev where service_id=s.id and type='interest') interests,
      (select count(*) from ord where service_id=s.id) orders,
      (select count(*) from confirmed where service_id=s.id) confirmed,
      (select coalesce(sum(total_cents),0) from confirmed where service_id=s.id) value_cents
    from public.services s join public.units u on u.id=s.unit_id
  ), unit_stats as (
    select u.id,u.name,u.city,
      coalesce(sum(s.views),0) views,coalesce(sum(s.interests),0) interests,
      coalesce(sum(s.orders),0) orders,coalesce(sum(s.value_cents),0) value_cents,
      (select count(distinct member_id) from (
        select member_id from ev where unit_id=u.id union all select member_id from ord where unit_id=u.id
      ) visitors) visitors
    from public.units u left join service_stats s on s.unit_id=u.id group by u.id
  ), timeline as (
    select calendar.tick::date as "day",
      (select count(*) from ev where (occurred_at at time zone 'America/Sao_Paulo')::date=calendar.tick::date and type='view') views,
      (select count(*) from ev where (occurred_at at time zone 'America/Sao_Paulo')::date=calendar.tick::date and type='interest') interests,
      (select count(*) from ord where (created_at at time zone 'America/Sao_Paulo')::date=calendar.tick::date) orders,
      (select coalesce(sum(total_cents),0) from confirmed where (confirmed_at at time zone 'America/Sao_Paulo')::date=calendar.tick::date) value_cents
    from generate_series(period_start::timestamp,period_end::timestamp,interval '1 day') as calendar(tick)
  ) select jsonb_build_object(
    'from',period_start,'to',period_end,
    'views',(select count(*) from ev where type='view'),
    'interests',(select count(*) from ev where type='interest'),
    'orders_requested',(select count(*) from ord),
    'orders_confirmed',(select count(*) from confirmed),
    'nominal_confirmed_cents',(select coalesce(sum(total_cents),0) from confirmed),
    'services',coalesce((select jsonb_agg(to_jsonb(s) order by s.views+s.interests+s.orders desc,s.name) from service_stats s),'[]'::jsonb),
    'units',coalesce((select jsonb_agg(to_jsonb(u) order by u.views+u.interests+u.orders desc,u.name) from unit_stats u),'[]'::jsonb),
    'timeline',coalesce((select jsonb_agg(to_jsonb(t) order by t."day") from timeline t),'[]'::jsonb),
    'latest_orders',coalesce((select jsonb_agg(to_jsonb(o)) from (
      select ord.id,ord.service_id,ord.member_id,ord.total_cents,ord.status,ord.created_at,ord.scheduled_start,
        s.name service_name,p.full_name member_name from ord join public.services s on s.id=ord.service_id
        join public.profiles p on p.id=ord.member_id order by ord.created_at desc limit 10
    )o),'[]'::jsonb)
  ) into result;
  return result;
end; $$;
revoke all on function public.admin_dashboard(date,date) from public,anon;
grant execute on function public.admin_dashboard(date,date) to authenticated;
