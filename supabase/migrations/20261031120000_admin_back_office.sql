-- Phase 1B admin back office.
--
--   * Renames the provider reference column, so the provider's name stays out of app code.
--   * Adds the lead notes the spec's admin inbox needs.
--   * Audits every admin create/update with a trigger, so no code path can skip it.
--   * Converts a lead in one transaction.
--   * Adds private file storage for client documents.

alter table public.sites rename column videoloft_customer_ref to provider_customer_ref;

alter table public.leads add column notes text;

-- ---------------------------------------------------------------------------
-- Audit log
-- ---------------------------------------------------------------------------

-- Writes made with the service role have no auth.uid() and are not admin actions, so the public
-- lead form does not fill the log. Only admins can write to the audited tables, so every row
-- this adds has an admin as its actor.
create function private.log_admin_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor uuid := auth.uid();
  new_row jsonb := to_jsonb(new);
  old_row jsonb := case when tg_op = 'UPDATE' then to_jsonb(old) else '{}'::jsonb end;
  changes jsonb;
  target_org uuid;
begin
  if actor is null then
    return null;
  end if;

  select coalesce(
    jsonb_object_agg(key, jsonb_build_object('from', old_row -> key, 'to', value)),
    '{}'::jsonb
  )
  into changes
  from jsonb_each(new_row)
  where key not in ('created_at', 'updated_at')
    and value is distinct from old_row -> key;

  if tg_op = 'UPDATE' and changes = '{}'::jsonb then
    return null;
  end if;

  target_org := case tg_table_name
    when 'organizations' then (new_row ->> 'id')::uuid
    when 'leads' then (new_row ->> 'converted_org_id')::uuid
    when 'plans' then null
    when 'reconciliations' then (
      select s.org_id from public.sites s where s.id = (new_row ->> 'site_id')::uuid
    )
    else (new_row ->> 'org_id')::uuid
  end;

  insert into public.activity_log (org_id, actor_id, action, details)
  values (
    target_org,
    actor,
    tg_table_name || '.' || lower(tg_op),
    jsonb_build_object('record_id', new_row ->> 'id', 'changes', changes)
  );

  return null;
end;
$$;

revoke all on function private.log_admin_change() from public;

create trigger organizations_audit after insert or update on public.organizations
  for each row execute function private.log_admin_change();
create trigger memberships_audit after insert or update on public.memberships
  for each row execute function private.log_admin_change();
create trigger sites_audit after insert or update on public.sites
  for each row execute function private.log_admin_change();
create trigger plans_audit after insert or update on public.plans
  for each row execute function private.log_admin_change();
create trigger subscriptions_audit after insert or update on public.subscriptions
  for each row execute function private.log_admin_change();
create trigger leads_audit after insert or update on public.leads
  for each row execute function private.log_admin_change();
create trigger documents_audit after insert or update on public.documents
  for each row execute function private.log_admin_change();
create trigger reconciliations_audit after insert or update on public.reconciliations
  for each row execute function private.log_admin_change();

-- ---------------------------------------------------------------------------
-- Lead conversion
-- ---------------------------------------------------------------------------

-- SECURITY INVOKER: the caller's RLS applies, so only an admin with an MFA session can see the
-- lead or create the organization. The row lock stops two admins converting the same lead.
create function public.convert_lead(p_lead_id uuid)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  lead public.leads;
  new_org_id uuid;
begin
  select * into lead from public.leads where id = p_lead_id for update;

  if not found then
    raise exception 'Lead not found' using errcode = 'P0002';
  end if;
  if lead.converted_org_id is not null then
    raise exception 'Lead already converted' using errcode = 'P0001';
  end if;

  insert into public.organizations
    (name, primary_contact_name, email, phone, city, state, status, notes)
  values (
    lead.business_name,
    lead.full_name,
    lead.email,
    lead.phone,
    lead.city,
    lead.state,
    'compatibility_check',
    concat_ws(
      E'\n',
      format(
        'From lead: about %s cameras, %s DVR, knows DVR password: %s.',
        lead.camera_count_estimate, lead.dvr_brand, lead.knows_dvr_password
      ),
      lead.message,
      lead.notes
    )
  )
  returning id into new_org_id;

  update public.leads
  set status = 'converted', converted_org_id = new_org_id
  where id = p_lead_id;

  return new_org_id;
end;
$$;

revoke all on function public.convert_lead(uuid) from public, anon;
grant execute on function public.convert_lead(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- Document storage
-- ---------------------------------------------------------------------------
-- Files sit under <org id>/ in a private bucket and are served through short-lived signed URLs.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'documents',
  'documents',
  false,
  4194304,
  array['application/pdf', 'image/png', 'image/jpeg']
)
on conflict (id) do nothing;

create policy "admins manage document files" on storage.objects
  for all to authenticated
  using (bucket_id = 'documents' and private.is_admin())
  with check (bucket_id = 'documents' and private.is_admin());
