-- Which video platform serves each site (SEC-264, VXP-6.1).
--
-- Sites move from the current white-label video service to VX44's own video platform one at a
-- time. Recording which one serves each site lets reconciliation and billing treat the two
-- correctly, and lets the video platform (milestone M6) find the sites it serves.
--
--   * Every existing site, and every new one unless an admin changes it, stays on the current
--     service: 'white_label'. Adding the column with a default fills it in for existing rows.
--   * Only admins read or write it. public.sites is admin-only ("admins manage sites", which
--     needs an MFA session), and public.client_sites lists its columns, so clients never see it.
--   * Changes are logged by the existing sites_audit trigger, like any other site field.

alter table public.sites
  add column video_platform text not null default 'white_label'
    constraint sites_video_platform_check check (video_platform in ('white_label', 'vx44'));

comment on column public.sites.video_platform is
  'Which video platform serves the site: white_label (the current service) or vx44 (VX44''s own platform). Admin-only; changes are audited.';
