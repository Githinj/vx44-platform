-- SEC-276: optional two-step verification (MFA) for clients.
--
-- Clients may turn on an authenticator app from the portal's Account page. For that to protect
-- anything, the database has to insist on it too: once a client has a verified factor, their
-- organization's data needs an MFA session (aal2). Otherwise a stolen password would still read
-- it straight through the API. Clients who haven't turned MFA on are unaffected.
--
-- Every client read goes through private.is_org_member (the client_* views, the subscriptions and
-- documents policies, and the document files policy), so this one function covers them all.
-- It runs as its owner (security definer), which can read auth.mfa_factors.

create or replace function private.is_org_member(target_org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
      select 1 from public.memberships m
      where m.org_id = target_org_id and m.user_id = auth.uid()
    )
    and (
      coalesce(auth.jwt() ->> 'aal', '') = 'aal2'
      or not exists (
        select 1 from auth.mfa_factors f
        where f.user_id = auth.uid() and f.status = 'verified'
      )
    );
$$;
