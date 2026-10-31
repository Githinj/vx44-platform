# VX44 AI Monitoring platform

Marketing site and lead form (Phase 1A of `VX44-Platform-Build-Spec.md`). Next.js App Router,
TypeScript, Tailwind, Supabase, SendGrid and Cloudflare Turnstile, hosted on Vercel.

## Project structure

```
src/app/                 Routes: / /demo /privacy /terms, and POST /api/leads
src/components/marketing Nav, footer, footage slots with HUD, lead form, Turnstile widget
src/content/site.ts      All marketing copy and every [PLACEHOLDER] value
src/lib/                 Server helpers: env, Turnstile, SendGrid, service-role Supabase client
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

## Adding footage

Pass `src` and `poster` to `FootageSlot` in `src/app/page.tsx`. Clips must be short, muted MP4s, with
faces and number plates blurred, or staged or used with written consent.
