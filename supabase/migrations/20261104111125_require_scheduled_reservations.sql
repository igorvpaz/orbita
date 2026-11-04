-- Applied after the new application revision receives traffic.
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
    raise exception 'Escolha um horário válido' using errcode='23514'; end if;
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
