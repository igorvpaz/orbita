-- Training app: accounts are created directly by an administrator.
revoke execute on function public.accept_invitation() from authenticated;
revoke execute on function public.create_invitation_record(uuid,text,text,uuid,uuid,text,timestamptz) from authenticated;
