# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## What this is

VX44 AI Monitoring: one Next.js app (App Router, TypeScript, Tailwind v4, Supabase, SendGrid, Cloudflare Turnstile, hosted on Vercel) with a public marketing site and lead form, an admin back office, and, later, an invite-only client portal (Phase 1C, not built yet). `VX44-Platform-Build-Spec.md` is the source of truth for scope, data model, roles and acceptance criteria. `PRODUCT.md` covers users and positioning, and `DESIGN.md` covers the design system (tokens, components, do's and don'ts). Read `DESIGN.md` before UI work. `docs/frontend-standards.md` is the engineering checklist: rendering, performance, state, networking, caching, architecture, security, accessibility and i18n, and observability and testing. Check changes against it, and update its status rows when a gap closes.

This app handles no video. Cameras, recording and alerts run on a white-labelled third-party provider, and admins type its reference numbers in by hand. Nothing in this app integrates with it.

## Commands

```
npm run dev               # next dev
npm test                  # vitest run (all tests in tests/**/*.test.ts)
npx vitest run tests/rls.test.ts          # one file
npx vitest run tests/rls.test.ts -t "name" # one test by name
npm run typecheck         # next typegen + tsc --noEmit (CI runs this too)
npm run lint              # eslint
npm run check:whitelabel  # fails if the provider's name appears in src/ or public/
npm run build
npm run create-admin -- person@example.com   # needs .env.local; prints a one-time password
```

Copy `.env.example` to `.env.local` for local development. `getServerEnv()` (`src/lib/env.ts`) validates server secrets per request rather than at import, so `next build` runs without them. Migrations are applied with `npx supabase db push`. The local Supabase API runs on port 55321.

## White-label rule (hard requirement)

Never write the video provider's name (the one `scripts/check-whitelabel.mjs` greps for) in anything under `src/` or `public/`: UI, emails, copy, comments or file names. The camera link is labelled "View my cameras". The privacy policy refers to a "trusted cloud video storage provider (sub-processor)". Column names in `supabase/` are internal and allowed.

## Architecture

### Two route trees, two root layouts

- `src/app/[lang]/`: the public marketing site, statically rendered for every locale (`generateStaticParams`). It has its own `<html>`, plus the nav and footer.
- `src/app/(app)/`: `/login`, `/admin/**`, `/no-access`. This tree is per-visitor (`export const instant = false`), and it reads the language cookie and the session.
- `src/app/api/leads/route.ts` (lead form POST) and `src/app/auth/callback/route.ts` sit outside both trees.

### Routing and i18n via `src/proxy.ts`

Next 16 uses `proxy.ts` in place of `middleware.ts`. It does two jobs:

- **App paths** (`/admin`, `/login`, `/auth`, `/no-access`): it refreshes the Supabase session cookie and redirects signed-out visitors away from `/admin`.
- **Public paths**: English is unprefixed (`/demo`). The proxy rewrites it internally to `/en/demo`, and an incoming `/en/...` request gets a 308 redirect to the unprefixed path. Other locales use a prefix (`/es/demo`). The homepage redirects to the language saved in the `NEXT_LOCALE` cookie or, on a first visit, to the one in `Accept-Language`. Unknown paths are rewritten to `/{locale}/not-found-page` with a real 404 status.
- **A new public page must be added to `publicPages` in `src/content/seo.ts`.** The proxy only serves paths listed there, and the sitemap reads the same list. Without the entry, the page returns a 404.

Locales (`en es fr pt zh hi ar ru`, with Arabic in RTL) are defined in `src/i18n/config.ts`. Use `localePath()` for internal links.

There are three separate string sets, each with one file per locale:
- `src/i18n/dictionaries/*.ts`: marketing site copy, loaded with `getDictionary(locale)`.
- `src/i18n/app/*.ts`: sign-in and back office copy, loaded with `getAppText()`, which picks the language from the `NEXT_LOCALE` cookie and returns `{ locale, t, format }`.
- `src/i18n/legal/*.tsx`: the privacy and terms pages.

`en.ts` defines the type (`Dictionary` / `AppDictionary`), and every other locale is typed against it. That means a new key has to go into all eight files, or typecheck fails. The non-English files are AI-drafted and still need review by a native speaker.

`src/content/site.ts` holds values that don't vary by language (contact details, address, footage clips with their detection-box tracks, and `[PLACEHOLDER]` values that are still waiting for confirmation). `src/content/seo.ts` holds `siteUrl` and `publicPages`.

### Auth and data access (defence in depth)

- `src/lib/supabase/server.ts` → `createSessionClient()`: a client bound to the user's cookies, so RLS applies. The back office uses it for everything.
- `src/lib/supabase/admin.ts` → `createAdminClient(env)`: a service-role client that bypasses RLS. Only the public lead route uses it, and `server-only` keeps it out of client bundles.
- `src/lib/auth.ts` → `requireAdmin()`: every admin page, server action and route handler calls it. It checks for the admin role in `profiles` and MFA at the `aal2` level, and redirects to `/admin/mfa` otherwise. `requireAdminRole()` (role only, no MFA check) is used only by the MFA page.
- The database applies the same rules a second time through RLS, using `private.is_admin()` (which requires `aal2`) and `private.is_org_member()`. A missed `requireAdmin()` call still returns no data.
- Database triggers (`private.log_admin_change`) write to `activity_log`, so server actions don't log changes themselves. Converting a lead is one RPC, `public.convert_lead`.

### Back office pattern

The pages are in `src/app/(app)/admin/(console)/` and the mutations in `src/app/(app)/admin/actions.ts`. Server actions validate input with the zod schemas in `src/lib/admin/schemas.ts` and return `ActionState` (`{ error?, saved? }`), with messages already translated through `getAppText()`. After a change they call `revalidatePath("/admin", "layout")`. Pure logic (metrics, filters, CSV) lives in `src/lib/admin/` so tests can reach it.

### Lead form flow

`POST /api/leads` runs these steps in order: zod (`src/lib/leads/schema.ts`) → Turnstile check → HMAC-hashed IP rate limit through the `check_lead_rate_limit` RPC → insert into `leads` with the service-role client → SendGrid email to `ADMIN_EMAILS`.

### Next.js config notes

`next.config.ts` enables `cacheComponents` and `partialPrefetching`, sets the server action body limit to 4.2 MB (client documents are capped at 4 MB) and adds security headers. Tailwind v4 runs through the `@tailwindcss/turbopack` loader.

## Tests

- `tests/rls.test.ts` and `tests/admin-migration.test.ts` run the real migrations in in-process Postgres (PGlite), with `tests/helpers/supabase-stub.sql` standing in for Supabase's `auth` schema and roles. They switch roles and JWT claims inside a transaction and then roll it back. **Both files list the migration files explicitly, so add any new migration in `supabase/migrations/` to both lists.**
- `tests/leads-route.test.ts` calls the route handler directly, with `@supabase/supabase-js` mocked.
- Vitest aliases `@` to `src/` and `server-only` to an empty stub.
