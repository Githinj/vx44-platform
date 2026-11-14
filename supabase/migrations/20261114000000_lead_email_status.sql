-- SEC-258: record whether the new-lead email reached the admins.
--
-- The lead form saves the lead first and emails the admins second, so a SendGrid failure leaves
-- a saved lead that nobody was told about. The lead route sets notified_at once SendGrid accepts
-- the email; the back office flags new leads where it is still empty.
--
-- Existing leads are backfilled with their created_at: whether their email went out is unknown,
-- and flagging every old lead at once would bury a real failure.

alter table public.leads add column notified_at timestamptz;

update public.leads set notified_at = created_at where notified_at is null;

comment on column public.leads.notified_at is
  'When the new-lead email was accepted by SendGrid. Null means the admins were not emailed.';
