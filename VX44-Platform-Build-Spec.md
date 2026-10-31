# VX44 AI Monitoring — Website & Management Platform: Build Spec (Phase 1)

**For:** Claude Code
**Owner:** Morris Githinji (build) · Amar (business owner)
**Status:** Ready to build
**Domain:** vx44ai.com

---

## 1. What we're building

One web app with three parts:

1. **Marketing site** (public): the VX44 landing page plus a "Book a demo / check my cameras" lead form.
2. **Admin back office** (Morris and Amar only): a record of every lead, client, site and camera count, and where each client is in onboarding. Includes simple business metrics.
3. **Client portal** (invite-only): a client logs in and sees their own account. That means their sites, camera count, plan, status, documents, and a link to view their cameras.

### What this app does NOT do in Phase 1
- **No video.** Cameras, recording, live view and motion alerts are all handled by Videoloft (CCTV Connect), white-labelled as VX44. This app only links out to it.
- **No integration with Videoloft.** There's no API in use. Clients are created by hand in the Videoloft Partner Portal, and the reference numbers are typed into this app.
- **No card handling.** Phase 1 records billing status only. Payment is a Stripe Payment Link or invoice, sent manually. Stripe Checkout comes in Phase 4.
- **No open sign-up.** Clients are invited by an admin.

### White-label rules (apply everywhere)
- Never show the word "Videoloft" in the UI, emails or marketing copy.
- The camera link is labelled **"View my cameras"** and opens the CCTV Connect viewer (already branded VX44).
- The privacy policy must say footage is stored by a "trusted cloud video storage provider (sub-processor)". Don't name them, but don't hide that one exists.
- Don't imply VX44 runs its own data centres.

---

## 2. Tech stack

| Concern | Choice |
|---|---|
| Framework | Next.js (App Router) + TypeScript |
| Styling | Tailwind CSS |
| Auth + DB | Supabase (Auth, Postgres, Row Level Security, Storage for documents) |
| Email | SendGrid (transactional) |
| Bot protection | Cloudflare Turnstile on the lead form |
| Hosting | Vercel, custom domain vx44ai.com |
| Payments (Phase 4) | Stripe Checkout + Customer Portal + webhooks |

Secrets go in environment variables only. Never commit `.env*`.

---

## 3. Roles & access

| Role | Who | Can see |
|---|---|---|
| `admin` | Morris, Amar | Everything |
| `client` | Invited client users | Only their own organization's records |

- Enforce access with **Supabase RLS on every table**, not just in the UI.
- Admins must have **MFA enabled** (Supabase TOTP).
- Every create/update by an admin writes an `activity_log` row.

---

## 4. Data model (Postgres)

```
profiles        id (= auth.users.id), role ('admin'|'client'), full_name, email, phone, created_at

organizations   id, name, primary_contact_name, email, phone,
                billing_address, city, state, country,
                status ('lead'|'compatibility_check'|'approved'|'adapter_shipped'|
                        'installed'|'active'|'paused'|'cancelled'),
                notes, created_at, updated_at

memberships     user_id -> profiles, org_id -> organizations, role ('owner'|'viewer')

sites           id, org_id, name, address, city, state, country,
                dvr_brand, dvr_model, dvr_password_known (bool),
                camera_count (int), monitoring_hours (text),
                videoloft_customer_ref (text), cloud_adapter_id (text),
                camera_access_url (text, nullable),   -- shown as "View my cameras"
                installed_at, status ('pending'|'online'|'offline'|'removed'),
                created_at, updated_at

plans           id, name ('Essentials'|'Monitored'|'Multi-site'),
                price_per_camera_month (numeric),
                provider_cost_per_camera_month (numeric),   -- our Videoloft cost; admin-only
                active (bool)

subscriptions   id, org_id, plan_id, cameras_billed (int),
                status ('trial'|'active'|'past_due'|'paused'|'cancelled'),
                billing_method ('payment_link'|'invoice'|'stripe'),
                payment_ref (text), started_at, renews_at, created_at

leads           id, full_name, business_name, email, phone, city, state,
                camera_count_estimate, dvr_brand, knows_dvr_password ('yes'|'no'|'unsure'),
                message, source, status ('new'|'contacted'|'qualified'|'converted'|'lost'),
                converted_org_id (nullable), created_at

documents       id, org_id, title, storage_path, uploaded_by, created_at   -- e.g. signed agreement

activity_log    id, org_id (nullable), actor_id, action, details (jsonb), created_at

reconciliations id, month (date), site_id, our_camera_count, provider_camera_count,
                matched (bool), checked_by, checked_at, note
```

**Never store:** DVR passwords, Videoloft passwords, or card details. Credentials live in a password manager.

`provider_cost_per_camera_month` and every margin figure are **admin-only**. Exclude them from client queries via RLS/views.

---

## 5. Pages

### Public (marketing)
- `/`: landing page (see §7 design)
- `/demo`: lead form (could also be a section on `/`). Fields: name, business, email, phone, city, state, approx. cameras, DVR brand (Hikvision / Dahua / Other / Not sure), "Do you know your DVR admin password?" (Yes / No / Not sure), message. Protected by Turnstile.
  On submit: insert into `leads`, email both admins, show a confirmation screen.
- `/privacy`, `/terms`: real pages, with placeholders for the legal entity name until the LLC is registered.
- `/login`: email + password, plus magic link.

### Client portal (`/portal`, invite-only)
- **Overview:** organization name, an onboarding status timeline (`lead → compatibility check → approved → adapter shipped → installed → active`), plan name, cameras billed, subscription status.
- **Sites:** each site with its address, camera count, status (online/offline as last recorded by admin), monitoring hours, and a **"View my cameras"** button. The button only shows if `camera_access_url` is set.
- **Billing:** plan, cameras billed, status, next renewal date, and a "Pay now" link when one exists (`payment_ref`).
- **Documents:** download their signed agreement and other files.
- **Support:** contact details, and a simple message form that emails the admins.
- **Account:** name, phone, password, MFA (optional for clients).

### Admin (`/admin`, admins only)
- **Dashboard**, showing only real numbers from the DB:
  - New leads (7 / 30 days), and leads by status
  - Clients by status (funnel)
  - Active sites, total cameras under management
  - MRR = Σ(active subscriptions × cameras_billed × plan price)
  - Provider cost = Σ(cameras × provider_cost_per_camera_month)
  - Gross margin (MRR − provider cost)
  - Clients by city/state
- **Leads:** inbox table, status updates, notes, and a "Convert to client" button. That button creates the organization, copies the details, and sets status `compatibility_check`.
- **Clients:** table with filters (status, city, state, plan), search, CSV export.
- **Client detail:** contact info, status changer (logged), sites (add/edit including Videoloft customer ref, Cloud ID, camera count, camera access URL), subscription, documents upload, notes, activity log, and an **"Invite user"** button (sends a Supabase invite email; the user is created with role `client` and membership of this org).
- **Reconciliation:** a monthly list of all active sites. For each one the admin enters the camera count shown in Videoloft and ticks "matched". Mismatches are highlighted, and the dashboard shows "X sites unreconciled this month".
- **Plans:** edit prices and provider cost.
- **Activity log:** a global feed.

---

## 6. Emails (SendGrid)
- New lead → both admins (all form fields).
- Client invite → set-password link.
- Client status changed to `approved`, `installed` or `active` → short email to the client owner.
- Support message → both admins.

All emails come from `@vx44ai.com`, use VX44 branding, and never mention Videoloft.

---

## 7. Design (marketing site)

Match the approved landing-page mockup, which has a futuristic but simple style:

- **Colors:** background `#05080F`; panels `rgba(255,255,255,0.025)` with border `rgba(255,255,255,0.08)`; text `#EEF2F8`; body text `#A9B4C8`; muted `#7C8AA5`; **gold accent `#CFA23A`** (brand, buttons); **cyan `#5CE1E6`** (only for AI/detection overlays); red `#FF5A5F` (LIVE/REC dots); green `#3DD68C` (resolved/online).
- **Fonts:** Sora (headings), Inter (body), JetBrains Mono (HUD labels like `// HOW IT WORKS`, `CAM 01 · ENTRANCE`).
- **Background:** a faint 64px grid plus a soft gold radial glow in the hero and final CTA.
- **Sections:**
  1. Sticky nav
  2. Centered hero ("Your cameras see everything. Now someone's watching.") with a large 16:9 footage slot, HUD overlays and a floating alert card
  3. Compatibility line
  4. 4-step timeline: Detect / Verify / Respond / Report
  5. "Live AI" row of 3 footage slots: Person / Vehicle / After-hours
  6. 6-cell feature grid
  7. 3 pricing plans
  8. 4-item FAQ
  9. Final CTA
  10. Footer
- **Footage slots:** short muted, looping, `playsinline` MP4 clips with a poster image. HUD overlays sit absolutely positioned on top. Faces and number plates must be blurred, or the footage staged or used with written consent.
- **Placeholders** until confirmed: `[PRICE]` per plan, `[CONTACT EMAIL]`, `[PHONE]`, legal entity name.
- Must work at phone width; keep Lighthouse performance high (lazy-load the videos).
- Logo: text wordmark "VX**44**" + "AI MONITORING" until the logo is chosen.

---

## 8. Security & trust checklist
- HTTPS only (Vercel), with HSTS.
- RLS on every table, plus tests proving a client can't read another org's rows.
- Admin MFA required.
- Rate-limited lead form, plus Turnstile.
- No secrets in the client bundle; use the service-role key only in server code.
- Audit log for admin actions.
- Privacy policy covering what's collected, the sub-processor disclosure, retention, and contact details.
- Company details in the footer once the LLC is registered.

---

## 9. Build order (ship each phase before starting the next)

1. **Phase 1A: marketing site + lead form → live on vx44ai.com.** (Goal: shareable with prospects ASAP.)
2. **Phase 1B: admin back office.** Leads, clients, sites, subscriptions, dashboard, reconciliation.
3. **Phase 1C: client portal.** Invites, overview, sites + "View my cameras", billing status, documents, support.
4. **Phase 4 (later):** Stripe Checkout + webhooks to update `subscriptions` automatically. This needs the US LLC registered and a verified Stripe account in its name.
5. **Later:** a Videoloft API integration if one becomes available (auto-provisioning, camera status sync).

---

## 10. Acceptance criteria (Phase 1)
- [ ] Visitor submits the lead form → row in `leads` + email to both admins within a minute.
- [ ] Admin converts a lead → organization created, status `compatibility_check`, activity logged.
- [ ] Admin adds a site with camera count + Videoloft refs; dashboard totals update.
- [ ] Admin invites a client → client sets a password, logs in, and sees only their org.
- [ ] Client sees "View my cameras" only when `camera_access_url` is set.
- [ ] A client user cannot access `/admin` or any other org's data (tested).
- [ ] Dashboard MRR, cameras and margin match a hand calculation on seed data.
- [ ] Reconciliation page flags a deliberate camera-count mismatch.
- [ ] No occurrence of "Videoloft" in any user-facing string (grep check in CI).
- [ ] Site passes a mobile-width check; no console errors.

---

## 11. Kickoff prompt for Claude Code

> Read `VX44-Platform-Build-Spec.md`. Build **Phase 1A only** first: a Next.js + TypeScript + Tailwind app with the marketing landing page per §7 and the lead form per §5, saving to Supabase `leads` and emailing admins via SendGrid, with Turnstile. Use placeholders for prices, contact details and footage (styled footage slots with HUD overlays). Set up the Supabase schema from §4 with RLS now, even though only `leads` is used in 1A. Explain the project structure and any migration before applying it, keep secrets in env vars, and stop for review when 1A is deployable.
