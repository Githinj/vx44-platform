-- A limit on the portal's support form (pre-go-live portal review, SEC-241).
--
-- Each support message is emailed to the admins, so a client, or someone holding a client's
-- session, could send without limit. This allows 5 messages an hour per person.
--
-- The key is always the caller's own id, read from the session, so a client can't spend or reset
-- anyone else's allowance. That's why this is its own function rather than a grant on
-- check_lead_rate_limit, which takes any key and stays service-role only. It counts in the same
-- table, under "support:<user id>".

create function public.check_support_rate_limit()
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller uuid := auth.uid();
  current_hits integer;
begin
  if caller is null then
    return false;
  end if;

  delete from private.lead_rate_limits where window_start < now() - interval '1 day';

  insert into private.lead_rate_limits as l (key, window_start)
  values ('support:' || caller::text, date_bin(interval '1 hour', now(), timestamptz 'epoch'))
  on conflict (key, window_start) do update set hits = l.hits + 1
  returning l.hits into current_hits;

  return current_hits <= 5;
end;
$$;

revoke all on function public.check_support_rate_limit() from public, anon;
grant execute on function public.check_support_rate_limit() to authenticated, service_role;
