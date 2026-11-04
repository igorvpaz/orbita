-- Amplia a base para operações do membro, mantendo a autoridade no banco.
alter table public.service_events add column event_day date;
update public.service_events set event_day = (occurred_at at time zone 'UTC')::date;
alter table public.service_events alter column event_day set not null;
create unique index service_events_member_service_day on public.service_events(member_id, service_id, type, event_day);

create or replace function private.prepare_service_event() returns trigger language plpgsql security definer set search_path = '' as $$
declare
  current_unit uuid;
  unit_timezone text;
begin
  if auth.uid() is null or new.member_id is distinct from auth.uid() then
    raise exception 'Autor do evento inválido' using errcode = '42501';
  end if;
  select p.unit_id, u.timezone into current_unit, unit_timezone
  from public.profiles p join public.units u on u.id = p.unit_id
  where p.id = auth.uid() and p.role = 'member';
  if current_unit is null or not exists (
    select 1 from public.memberships m where m.user_id = auth.uid() and m.status = 'active'
      and m.starts_at <= now() and (m.expires_at is null or m.expires_at > now())
  ) or not exists (
    select 1 from public.services s where s.id = new.service_id
      and s.unit_id = current_unit and s.status = 'published'
  ) then raise exception 'Evento indisponível' using errcode = '42501'; end if;
  new.unit_id := current_unit;
  new.occurred_at := now();
  new.event_day := (now() at time zone unit_timezone)::date;
  return new;
end;
$$;

grant select on public.recommendation_rules, public.service_events to authenticated;
revoke insert on public.service_events, public.orders from authenticated;
grant insert (member_id, service_id, type, idempotency_key) on public.service_events to authenticated;
grant insert (member_id, service_id, idempotency_key) on public.orders to authenticated;
grant update (status) on public.orders to authenticated;

create function private.has_published_service_for_partner(partner_uuid uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.services s where s.partner_id = partner_uuid and s.status = 'published');
$$;
revoke all on function private.has_published_service_for_partner(uuid) from public, anon, authenticated;
grant execute on function private.has_published_service_for_partner(uuid) to authenticated;

create or replace function private.is_service_visible(service_uuid uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select private.has_active_membership() and exists (
    select 1 from public.services s
    join public.profiles p on p.unit_id = s.unit_id and p.id = (select auth.uid())
    join public.memberships m on m.user_id = p.id
    join public.units u on u.id = s.unit_id
    join public.partners partner on partner.id = s.partner_id
    where s.id = service_uuid and s.status = 'published' and partner.status = 'active'
      and (
        not exists (select 1 from public.recommendation_rules r where r.service_id = s.id and r.enabled)
        or exists (
          select 1 from public.recommendation_rules r
          where r.service_id = s.id and r.enabled and (r.plan_id is null or r.plan_id = m.plan_id)
            and extract(dow from now() at time zone u.timezone)::smallint = any(r.weekdays)
            and (now() at time zone u.timezone)::time >= r.start_time
            and (now() at time zone u.timezone)::time < r.end_time
        )
      )
  );
$$;

create policy partners_member_read on public.partners for select to authenticated using (
  status = 'active' and (select private.has_active_membership())
  and unit_id = (select p.unit_id from public.profiles p where p.id = (select auth.uid()))
  and (select private.has_published_service_for_partner(id))
);
create policy services_member_read on public.services for select to authenticated using (
  (select private.is_service_visible(id))
);
create policy media_member_read on public.service_media for select to authenticated using (
  (select private.is_service_visible(service_id))
  and exists (select 1 from public.services s join public.partners p on p.id = s.partner_id
    where s.id = service_id and p.status = 'active')
);
create policy rules_member_read on public.recommendation_rules for select to authenticated using (
  enabled and (select private.is_service_visible(service_id))
);
create policy events_member_read on public.service_events for select to authenticated using (
  member_id = (select auth.uid()) and (select private.has_active_membership())
);
create policy events_member_insert on public.service_events for insert to authenticated with check (
  member_id = (select auth.uid()) and (select private.has_active_membership())
  and (select private.is_service_visible(service_id))
  and (select private.is_same_unit(member_id, service_id))
);
create policy orders_member_read on public.orders for select to authenticated using (
  member_id = (select auth.uid()) and (select private.has_active_membership())
);
create policy orders_member_insert on public.orders for insert to authenticated with check (
  member_id = (select auth.uid()) and status = 'requested' and (select private.has_active_membership())
  and (select private.is_service_visible(service_id))
  and (select private.is_same_unit(member_id, service_id))
);
create policy orders_admin_update on public.orders for update to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));

create function private.prepare_order_transition() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if not private.is_admin() then raise exception 'Admin obrigatório' using errcode = '42501'; end if;
  if old.status <> 'requested' or new.status not in ('confirmed', 'cancelled') then
    raise exception 'Transição de pedido inválida' using errcode = '23514';
  end if;
  if new.status = 'confirmed' then
    new.confirmed_at := now();
    new.confirmed_by := auth.uid();
    new.cancelled_at := null;
  else
    new.cancelled_at := now();
    new.confirmed_at := null;
    new.confirmed_by := null;
  end if;
  return new;
end;
$$;
revoke all on function private.prepare_order_transition() from public, anon, authenticated;
create trigger prepare_order_transition before update on public.orders
  for each row execute function private.prepare_order_transition();

create function private.audit_membership_change() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.audit_logs (actor_user_id, action, target_table, target_id, safe_metadata)
  values (auth.uid(), 'subscription_updated', 'memberships', new.id,
    jsonb_build_object('old_status', old.status, 'new_status', new.status));
  return new;
end;
$$;
revoke all on function private.audit_membership_change() from public, anon, authenticated;
create trigger audit_membership_change after update on public.memberships
  for each row execute function private.audit_membership_change();

create function private.audit_invitation() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.audit_logs (actor_user_id, action, target_table, target_id)
  values (new.invited_by, 'invite_created', 'invitations', new.id);
  return new;
end;
$$;
revoke all on function private.audit_invitation() from public, anon, authenticated;
create trigger audit_invitation after insert on public.invitations
  for each row execute function private.audit_invitation();

create function private.audit_invitation_change() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.status is distinct from old.status then
    insert into public.audit_logs (actor_user_id, action, target_table, target_id)
    values (auth.uid(), 'invite_' || new.status, 'invitations', new.id);
  end if;
  return new;
end;
$$;
revoke all on function private.audit_invitation_change() from public, anon, authenticated;
create trigger audit_invitation_change after update on public.invitations
  for each row execute function private.audit_invitation_change();

create function public.create_invitation_record(
  new_user_id uuid, new_email text, new_name text, new_unit_id uuid,
  new_plan_id uuid, desired_status text, expiry timestamptz
) returns uuid language plpgsql security invoker set search_path = '' as $$
declare invitation_id uuid;
begin
  if not private.is_admin() then raise exception 'Admin obrigatório' using errcode = '42501'; end if;
  if desired_status not in ('active', 'inactive') then raise exception 'Status inválido' using errcode = '23514'; end if;
  if not exists (select 1 from public.units u where u.id = new_unit_id and u.active)
    or not exists (select 1 from public.plans p where p.id = new_plan_id and p.active) then
    raise exception 'Unidade ou plano inválido' using errcode = '23514';
  end if;
  insert into public.profiles (id, email, full_name, role, unit_id)
    values (new_user_id, lower(new_email), new_name, 'member', new_unit_id);
  insert into public.memberships (user_id, plan_id, status, expires_at, changed_by)
    values (new_user_id, new_plan_id, 'inactive', expiry, auth.uid());
  insert into public.invitations (email, invited_user_id, invited_by, unit_id, plan_id, initial_status)
    values (lower(new_email), new_user_id, auth.uid(), new_unit_id, new_plan_id, desired_status)
    returning id into invitation_id;
  return invitation_id;
end;
$$;
revoke all on function public.create_invitation_record(uuid,text,text,uuid,uuid,text,timestamptz) from public, anon;
grant execute on function public.create_invitation_record(uuid,text,text,uuid,uuid,text,timestamptz) to authenticated;

-- O convite só torna a assinatura ativa após aceite. Link revogado pode até
-- estabelecer sessão Auth, mas não libera catálogo ou pedidos.
create function public.accept_invitation() returns boolean
language plpgsql security definer set search_path = '' as $$
declare invitation public.invitations%rowtype;
begin
  if auth.uid() is null then raise exception 'Login obrigatório' using errcode = '42501'; end if;
  select * into invitation from public.invitations i
    where i.invited_user_id = auth.uid() and i.status in ('pending', 'delivery_failed')
    order by i.created_at desc limit 1 for update;
  if not found then
    return exists (select 1 from public.invitations i
      where i.invited_user_id = auth.uid() and i.status = 'accepted');
  end if;
  if not exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'member') then
    raise exception 'Perfil de membro obrigatório' using errcode = '42501';
  end if;
  update public.memberships m set status = invitation.initial_status,
    changed_by = invitation.invited_by, updated_at = now()
    where m.user_id = auth.uid();
  if not found then raise exception 'Assinatura ausente' using errcode = '23503'; end if;
  update public.invitations i set status = 'accepted', accepted_at = now(), updated_at = now()
    where i.id = invitation.id;
  return true;
end;
$$;
revoke all on function public.accept_invitation() from public, anon;
grant execute on function public.accept_invitation() to authenticated;

create function private.audit_order_transition() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.audit_logs (actor_user_id, action, target_table, target_id)
  values (auth.uid(), 'order_' || new.status, 'orders', new.id);
  return new;
end;
$$;
revoke all on function private.audit_order_transition() from public, anon, authenticated;
create trigger audit_order_transition after update on public.orders
  for each row execute function private.audit_order_transition();

-- O path é gerado no backend como <service-uuid>/<uuid>.<ext>.
create policy service_images_admin_read on storage.objects for select to authenticated using (
  bucket_id = 'service-images' and (select private.is_admin())
);
create policy service_images_admin_insert on storage.objects for insert to authenticated with check (
  bucket_id = 'service-images' and (select private.is_admin())
);
create policy service_images_admin_update on storage.objects for update to authenticated
  using (bucket_id = 'service-images' and (select private.is_admin()))
  with check (bucket_id = 'service-images' and (select private.is_admin()));
create policy service_images_admin_delete on storage.objects for delete to authenticated using (
  bucket_id = 'service-images' and (select private.is_admin())
);
create policy service_images_member_read on storage.objects for select to authenticated using (
  bucket_id = 'service-images' and (select private.has_active_membership())
  and exists (
    select 1 from public.service_media sm
    join public.services s on s.id = sm.service_id
    join public.partners p on p.id = s.partner_id
    where sm.storage_path = storage.objects.name and s.status = 'published' and p.status = 'active'
      and (select private.is_service_visible(s.id))
  )
);

create function public.admin_confirmed_value(since_time timestamptz)
returns bigint language plpgsql stable security invoker set search_path = '' as $$
declare result bigint;
begin
  if not private.is_admin() then raise exception 'Admin obrigatório' using errcode = '42501'; end if;
  select coalesce(sum(o.total_cents), 0)::bigint into result
  from public.orders o where o.status = 'confirmed' and o.created_at >= since_time;
  return result;
end;
$$;
revoke all on function public.admin_confirmed_value(timestamptz) from public, anon;
grant execute on function public.admin_confirmed_value(timestamptz) to authenticated;
