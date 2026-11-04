-- Admin provisions Auth accounts server-side; domain rows are committed atomically.
create function public.create_member_record(
  new_user_id uuid, new_email text, new_name text, new_unit_id uuid,
  new_plan_id uuid, desired_status text, expiry timestamptz
) returns uuid language plpgsql security invoker set search_path = '' as $$
begin
  if not private.is_admin() then raise exception 'Admin obrigatório' using errcode = '42501'; end if;
  if desired_status not in ('active', 'inactive') or (expiry is not null and expiry <= now()) then
    raise exception 'Assinatura inválida' using errcode = '23514';
  end if;
  if not exists (select 1 from public.units where id = new_unit_id and active)
    or not exists (select 1 from public.plans where id = new_plan_id and active) then
    raise exception 'Unidade ou plano inválido' using errcode = '23514';
  end if;
  insert into public.profiles (id, email, full_name, role, unit_id)
    values (new_user_id, lower(new_email), new_name, 'member', new_unit_id);
  insert into public.memberships (user_id, plan_id, status, expires_at, changed_by)
    values (new_user_id, new_plan_id, desired_status, expiry, auth.uid());
  insert into public.audit_logs (actor_user_id, action, target_table, target_id)
    values (auth.uid(), 'member_created', 'profiles', new_user_id);
  return new_user_id;
end;
$$;
revoke all on function public.create_member_record(uuid,text,text,uuid,uuid,text,timestamptz) from public, anon;
grant execute on function public.create_member_record(uuid,text,text,uuid,uuid,text,timestamptz) to authenticated;
