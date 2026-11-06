# VX44 AI Monitoring platform

Marketing site and lead form (Phase 1A of `VX44-Platform-Build-Spec.md`). Next.js App Router,
TypeScript, Tailwind, Supabase, SendGrid and Cloudflare Turnstile, hosted on Vercel.

## Project structure

```
src/app/(marketing)/     Public routes: / /demo /privacy /terms
src/app/admin/           Back office: MFA, dashboard, leads, clients, reconciliation, plans, activity
src/app/login/           Email and password or magic link sign-in
src/app/api/leads/       POST /api/leads
src/components/marketing Nav, footer, footage slots with HUD, lead form, Turnstile widget
src/components/admin     Shared back office form and layout pieces
src/content/site.ts      All marketing copy and every [PLACEHOLDER] value
src/lib/admin/           Back office logic: metrics, filters, CSV, validation
src/lib/auth.ts          requireAdmin(): every admin page, action and route calls it
src/lib/                 Server helpers: env, Turnstile, SendGrid, Supabase clients
src/proxy.ts             Refreshes the session cookie
supabase/migrations/     Database schema with row level security
tests/                   RLS tests (in-process Postgres) and lead API tests
scripts/                 White-label check
```

## Local development

```
npm install
cp .env.example .env.local   # then fill it in
npm run dev
```

## Checks

```
npm test                  # RLS and lead API tests
npm run typecheck
npm run lint
npm run check:whitelabel  # fails if the provider's name appears in src/ or public/
npm run build
```

## Applying the database migration

```
npx supabase link --project-ref YOUR-PROJECT-REF
npx supabase db push
```

`supabase start` runs a local copy on port 55321, so it can sit beside other local projects.

## Back office access

Admins are created with `npm run create-admin -- person@example.com`, which prints a one-time
password for a new account. The first sign-in sets up an authenticator app, and the database
returns no admin data without that second step. Every admin create and update reaches
`activity_log` through a database trigger.

## Footage

Clips live in `public/footage/` and are set in `src/content/site.ts`, along with the detection box
track for each one. Clips must be short, muted MP4s, with faces and number plates blurred, or staged
or used with written consent. Record the source and licence in `docs/footage-sources.md`.
