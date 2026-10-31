-- VX44 Phase 1 schema (build spec section 4) with row level security.
--
-- Access model:
--   * Admins (role = 'admin' AND an MFA session, aal2) get full access to base tables.
--   * Clients read their own org's data. Tables holding internal columns (organizations,
--     sites, plans) are admin-only; clients read them through the client_* views.
--   * The anon role gets nothing. The public lead form writes through the server using
--     the service role, so Turnstile and rate limiting cannot be bypassed.
--
-- Never store DVR passwords, provider passwords or card details in this database.

create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  role        text not null default 'client' check (role in ('admin', 'client')),
  full_name   text,
  email       text not null,
  phone       text,
  created_at  timestamptz not null default now()
);

create table public.organizations (
  id                    uuid primary key default gen_random_uuid(),
  name                  text not null,
  primary_contact_name  text,
  email                 text,
  phone                 text,
  billing_address       text,
  city                  text,
  state                 text,
  country               text,
  status                text not null default 'lead' check (status in (
                          'lead', 'compatibility_check', 'approved', 'adapter_shipped',
                          'installed', 'active', 'paused', 'cancelled')),
  notes                 text,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create table public.memberships (
  user_id  uuid not null references public.profiles (id) on delete cascade,
  org_id   uuid not null references public.organizations (id) on delete cascade,
  role     text not null default 'viewer' check (role in ('owner', 'viewer')),
  primary key (user_id, org_id)
);

create table public.sites (
  id                      uuid primary key default gen_random_uuid(),
  org_id                  uuid not null references public.organizations (id) on delete restrict,
  name                    text not null,
  address                 text,
  city                    text,
  state                   text,
  country                 text,
  dvr_brand               text,
  dvr_model               text,
  dvr_password_known      boolean,
  camera_count            integer not null default 0 check (camera_count >= 0),
  monitoring_hours        text,
  videoloft_customer_ref  text,
  cloud_adapter_id        text,
  camera_access_url       text,
  installed_at            timestamptz,
  status                  text not null default 'pending'
                            check (status in ('pending', 'online', 'offline', 'removed')),
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

create table public.plans (
  id                              uuid primary key default gen_random_uuid(),
  name                            text not null unique
                                    check (name in ('Essentials', 'Monitored', 'Multi-site')),
  price_per_camera_month          numeric(10, 2) not null check (price_per_camera_month >= 0),
  provider_cost_per_camera_month  numeric(10, 2) not null
                                    check (provider_cost_per_camera_month >= 0),
  active                          boolean not null default true
);

create table public.subscriptions (
  id              uuid primary key default gen_random_uuid(),
  org_id          uuid not null references public.organizations (id) on delete restrict,
  plan_id         uuid not null references public.plans (id) on delete restrict,
  cameras_billed  integer not null default 0 check (cameras_billed >= 0),
  status          text not null default 'trial'
                    check (status in ('trial', 'active', 'past_due', 'paused', 'cancelled')),
  billing_method  text not null default 'payment_link'
                    check (billing_method in ('payment_link', 'invoice', 'stripe')),
  payment_ref     text,
  started_at      timestamptz,
  renews_at       timestamptz,
  created_at      timestamptz not null default now()
);

create table public.leads (
  id                     uuid primary key default gen_random_uuid(),
  full_name              text not null,
  business_name          text not null,
  email                  text not null,
  phone                  text not null,
  city                   text not null,
  state                  text not null,
  camera_count_estimate  integer not null check (camera_count_estimate > 0),
  dvr_brand              text not null
                           check (dvr_brand in ('Hikvision', 'Dahua', 'Other', 'Not sure')),
  knows_dvr_password     text not null check (knows_dvr_password in ('yes', 'no', 'unsure')),
  message                text,
  source                 text not null default 'website',
  status                 text not null default 'new'
                           check (status in ('new', 'contacted', 'qualified', 'converted', 'lost')),
  converted_org_id       uuid references public.organizations (id) on delete set null,
  created_at             timestamptz not null default now()
);

create table public.documents (
  id            uuid primary key default gen_random_uuid(),
  org_id        uuid not null references public.organizations (id) on delete restrict,
  title         text not null,
  storage_path  text not null unique,
  uploaded_by   uuid references public.profiles (id) on delete set null,
  created_at    timestamptz not null default now()
);

create table public.activity_log (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid references public.organizations (id) on delete set null,
  actor_id    uuid references public.profiles (id) on delete set null,
  action      text not null,
  details     jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);

create table public.reconciliations (
  id                     uuid primary key default gen_random_uuid(),
  month                  date not null check (extract(day from month) = 1),
  site_id                uuid not null references public.sites (id) on delete restrict,
  our_camera_count       integer not null check (our_camera_count >= 0),
  provider_camera_count  integer check (provider_camera_count >= 0),
  matched                boolean not null default false,
  checked_by             uuid references public.profiles (id) on delete set null,
  checked_at             timestamptz,
  note                   text,
  unique (month, site_id)
);

-- Lead form rate limiting (build spec section 8). Not part of the section 4 model:
-- it holds only salted IP hashes and is pruned on every call.
create table private.lead_rate_limits (
  key           text not null,
  window_start  timestamptz not null,
  hits          integer not null default 1,
  primary key (key, window_start)
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

create index memberships_org_id_idx on public.memberships (org_id);
create index organizations_status_idx on public.organizations (status);
create index sites_org_id_idx on public.sites (org_id);
create index subscriptions_org_id_idx on public.subscriptions (org_id);
create index subscriptions_plan_id_idx on public.subscriptions (plan_id);
create index leads_created_at_idx on public.leads (created_at desc);
create index leads_status_idx on public.leads (status);
create index documents_org_id_idx on public.documents (org_id);
create index activity_log_created_at_idx on public.activity_log (created_at desc);
create index activity_log_org_id_idx on public.activity_log (org_id, created_at desc);
create index reconciliations_site_id_idx on public.reconciliations (site_id);

-- ---------------------------------------------------------------------------
-- Helper functions and triggers
-- ---------------------------------------------------------------------------

-- SECURITY DEFINER so policies can read profiles/memberships without recursing into their
-- own RLS. They live in the private schema, which the API does not expose.
create function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(auth.jwt() ->> 'aal', '') = 'aal2'
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    );
$$;

create function private.is_org_member(target_org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.memberships m
    where m.org_id = target_org_id and m.user_id = auth.uid()
  );
$$;

revoke all on function private.is_admin() from public;
revoke all on function private.is_org_member(uuid) from public;
grant execute on function private.is_admin() to authenticated, service_role;
grant execute on function private.is_org_member(uuid) to authenticated, service_role;

create function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger organizations_set_updated_at
  before update on public.organizations
  for each row execute function private.set_updated_at();

create trigger sites_set_updated_at
  before update on public.sites
  for each row execute function private.set_updated_at();

-- Every new auth user gets a 'client' profile. The role is never taken from user metadata,
-- because users can set that themselves. Admins are promoted by hand with the service role.
create function private.handle_auth_user_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;

revoke all on function private.handle_auth_user_change() from public;

create trigger on_auth_user_change
  after insert or update of email on auth.users
  for each row execute function private.handle_auth_user_change();

-- Returns true while the key is under p_limit hits in the current fixed window.
create function public.check_lead_rate_limit(
  p_key text,
  p_limit integer,
  p_window_seconds integer
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_hits integer;
begin
  delete from private.lead_rate_limits where window_start < now() - interval '1 day';

  insert into private.lead_rate_limits as l (key, window_start)
  values (
    p_key,
    date_bin(make_interval(secs => p_window_seconds), now(), timestamptz 'epoch')
  )
  on conflict (key, window_start) do update set hits = l.hits + 1
  returning l.hits into current_hits;

  return current_hits <= p_limit;
end;
$$;

revoke all on function public.check_lead_rate_limit(text, integer, integer)
  from public, anon, authenticated;
grant execute on function public.check_lead_rate_limit(text, integer, integer) to service_role;

-- ---------------------------------------------------------------------------
-- Client-facing views
-- ---------------------------------------------------------------------------
-- These run with the owner's rights on purpose (Supabase's linter flags that as
-- "security definer view"). It lets the base tables stay admin-only while each view
-- filters to the caller's orgs and leaves out internal columns: admin notes, provider
-- references and provider cost. RLS filters rows, not columns, so it cannot do this alone.

create view public.client_organizations with (security_barrier = true) as
  select id, name, primary_contact_name, email, phone, billing_address, city, state, country,
         status, created_at, updated_at
  from public.organizations
  where private.is_org_member(id);

create view public.client_sites with (security_barrier = true) as
  select id, org_id, name, address, city, state, country, camera_count, monitoring_hours,
         camera_access_url, installed_at, status, created_at, updated_at
  from public.sites
  where status <> 'removed' and private.is_org_member(org_id);

create view public.client_plans with (security_barrier = true) as
  select p.id, p.name, p.price_per_camera_month, p.active
  from public.plans p
  where exists (
    select 1 from public.subscriptions s
    where s.plan_id = p.id and private.is_org_member(s.org_id)
  );

-- ---------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.memberships enable row level security;
alter table public.sites enable row level security;
alter table public.plans enable row level security;
alter table public.subscriptions enable row level security;
alter table public.leads enable row level security;
alter table public.documents enable row level security;
alter table public.activity_log enable row level security;
alter table public.reconciliations enable row level security;
alter table private.lead_rate_limits enable row level security;

create policy "own or admin can read profiles" on public.profiles
  for select to authenticated
  using (id = auth.uid() or private.is_admin());

create policy "own or admin can update profiles" on public.profiles
  for update to authenticated
  using (id = auth.uid() or private.is_admin())
  with check (id = auth.uid() or private.is_admin());

create policy "admins manage organizations" on public.organizations
  for all to authenticated
  using (private.is_admin()) with check (private.is_admin());

create policy "admins manage memberships" on public.memberships
  for all to authenticated
  using (private.is_admin()) with check (private.is_admin());

create policy "users read own memberships" on public.memberships
  for select to authenticated
  using (user_id = auth.uid());

create policy "admins manage sites" on public.sites
  for all to authenticated
  using (private.is_admin()) with check (private.is_admin());

create policy "admins manage plans" on public.plans
  for all to authenticated
  using (private.is_admin()) with check (private.is_admin());

create policy "admins manage subscriptions" on public.subscriptions
  for all to authenticated
  using (private.is_admin()) with check (private.is_admin());

create policy "members read own subscriptions" on public.subscriptions
  for select to authenticated
  using (private.is_org_member(org_id));

create policy "admins manage leads" on public.leads
  for all to authenticated
  using (private.is_admin()) with check (private.is_admin());

create policy "admins manage documents" on public.documents
  for all to authenticated
  using (private.is_admin()) with check (private.is_admin());

create policy "members read own documents" on public.documents
  for select to authenticated
  using (private.is_org_member(org_id));

create policy "admins read activity log" on public.activity_log
  for select to authenticated
  using (private.is_admin());

create policy "admins append to activity log" on public.activity_log
  for insert to authenticated
  with check (private.is_admin() and actor_id = auth.uid());

create policy "admins manage reconciliations" on public.reconciliations
  for all to authenticated
  using (private.is_admin()) with check (private.is_admin());

-- ---------------------------------------------------------------------------
-- Grants
-- ---------------------------------------------------------------------------
-- Supabase grants broad table rights to anon and authenticated by default. Replace those
-- with the minimum, so a missing policy is not the only thing protecting a table.

revoke all on all tables in schema public from anon, authenticated;

grant select, insert, update, delete on
  public.organizations, public.memberships, public.sites, public.plans,
  public.subscriptions, public.leads, public.documents, public.reconciliations
  to authenticated;

-- The activity log is append-only, and roles change only through the service role.
grant select, insert on public.activity_log to authenticated;
grant select on public.profiles to authenticated;
grant update (full_name, phone) on public.profiles to authenticated;

grant select on public.client_organizations, public.client_sites, public.client_plans
  to authenticated;

grant all on all tables in schema public to service_role;
