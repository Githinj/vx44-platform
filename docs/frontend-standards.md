# Frontend engineering standards

This is a checklist for building the VX44 website and back office. It covers nine areas: rendering, performance, state, networking, caching, architecture, security, accessibility and internationalisation, and observability and testing.

For each area it lists the practices that matter for this app and the current status. It also names the ones we skip and says why.

**Status key**
- ✅ **In place.** The file is cited.
- ⚠️ **Gap.** Work is needed, and the Linear issue is named where there is one.
- 🔍 **Not checked.** Nobody has measured it yet, so it doesn't count as passing.
- ➖ **Not relevant now.** The reason is given.
- ⏳ **Pending merge.** Done in an open pull request, named in the row. It counts as done, and turns ✅, only once that PR merges.

Last audited: 2026-11-13 by reading the code. On 2026-11-14 the live site was also measured: PageSpeed Insights (mobile) on four pages and a 375 px check of eight pages (SEC-277). On 2026-11-15 the SEC-277 fixes were measured with local Lighthouse runs, and on 2026-11-16 on production with PageSpeed Insights. On 2026-11-17 the rows covered by that night's open PRs were marked ⏳; they turned ✅ as #45 to #56 merged the same night.

**How to use this:** before a change ships, check it against the relevant section. When a gap closes, update its row in the same change.

---

## 1. Rendering

| Practice | Status | Where / note |
|---|---|---|
| Static generation for public pages | ✅ | `src/app/[lang]/`: `generateStaticParams` for all 8 locales |
| Per-request rendering only where needed | ✅ | `src/app/(app)/` (`instant = false`): sign-in and back office |
| Streaming and Suspense boundaries | ✅ | `<Suspense>` is used in 8 files |
| Server Components by default, client only for interaction | ✅ | 20 `"use client"` files, all interactive (forms, video, menus, the clients list's phone filters) |
| Error boundaries (`error.tsx`, `global-error.tsx`) | ✅ | `src/app/[lang]/error.tsx`, `src/app/(app)/error.tsx`, `src/app/global-error.tsx`: translated, with "try again" and the server-log reference (SEC-265) |
| Loading states (`loading.tsx` or Suspense fallbacks) | 🔍 | No `loading.tsx`. Check that back-office pages show a fallback |
| SEO metadata per page | ✅ | `generateMetadata`/`metadata` in 19 files, plus `sitemap.ts`, `robots.ts` and `opengraph-image.tsx`. **Icons and the name in Google results:**<br>• `src/app/icon.svg` is the logo, the D3 shield and lens Morris chose on 2026-11-18. It draws the mark with paths and circles, because Google may not render `<text>`.<br>• `npm run icons` (`scripts/make-icons.mjs`) makes the PNG icons at 48, 96, 192 and 512 px, the Apple icon and `favicon.ico` from it, and `src/app/manifest.ts` lists them.<br>• `favicon.ico`'s 16 and 32 px images come from `scripts/icon-small.svg`: the same shapes with heavier strokes, because the thin outline blurs at that size (`docs/icons/d3-small-sizes.png` compares them).<br>• To change the logo, replace `icon.svg`, update or delete `icon-small.svg`, and run the script.<br>• The home page's structured data names the site ("VX44") in WebSite data, and gives the Organization a 512 px PNG logo. Its `sameAs` comes from `socialProfiles` in `src/content/site.ts`.<br>• `e2e/search-icons.spec.ts` checks all of it |
| Hydration safety (no layout shift or flash) | 🔍 | Not measured |
| Islands, partial hydration, edge rendering | ➖ | Not needed: App Router plus static pages already covers it |

## 2. Performance

| Practice | Status | Where / note |
|---|---|---|
| Fonts self-hosted, no layout shift | ✅ | `src/app/fonts.ts` uses `next/font`, one call per family, so the preloaded Latin files are the ones the page uses. The homepage loads 3 font files, down from 7 (SEC-277) |
| Video loaded lazily, respects reduced motion | ✅ | `src/components/marketing/lazy-video.tsx`: `preload="none"`, `matchMedia` check |
| Code splitting with dynamic imports | ✅ | 4 places, including the page motion in `src/components/marketing/reveal-root.tsx`, which loads after the first paint |
| Core Web Vitals (LCP, INP, CLS) | ⚠️ | **Production, 2026-11-16, after the SEC-277 fixes shipped** (PageSpeed Insights, Lighthouse 13.6.0, mobile): `/talk-to-sales` and `/demo` score 100, with LCP 0.9 s, CLS 0, and total blocking time 10 and 30 ms. Calendly now loads only on a tap. `/` scores 97, with CLS 0 and total blocking time 10 to 20 ms. Its LCP is 2.6 s in both of today's runs, just over the 2.5 s budget; one run earlier the same day gave 2.3 s. The LCP element is the hero video's poster. It's preloaded at high priority and fetched once. PageSpeed's LCP breakdown, from the unthrottled trace, adds up to about 0.65 s (first byte 220 ms, load delay 240 ms, load 50 ms, render delay 140 ms). The 2.6 s is Lighthouse's simulated slow-4G estimate. The next lever is cheaper first-screen effects, such as the backdrop blur on the hero alert card. That changes the design, so it needs sign-off (SEC-277). `/check` wasn't re-measured (0.9 s on 2026-11-14). **Before, on production, 2026-11-14** (one run per page): CLS passes (0 on `/`, `/demo` and `/check`; 0.004 on `/talk-to-sales`). LCP failed on `/` at 3.8 s (budget 2.5 s) and passed on the other three (0.9 to 1.7 s). Total blocking time stands in for INP in a lab: 50 ms on `/` and 40 ms on `/check`, but 2.5 s on `/demo` and 1.1 s on `/talk-to-sales` while Calendly loads. **After the SEC-277 fixes, 2026-11-15** (local Lighthouse mobile, median of 3 runs alternated with the previous build): LCP on `/` 4.67 s → 3.56 s, score 64 → 86. The fixes: fonts loaded once, the closed menu sheet no longer laid out, the film grain drawn from an image instead of an SVG filter, and a 28 KB WebP hero poster. Lighthouse adds every script that runs before the first paint to LCP. **Where the rest comes from (2026-11-15):** the laptop's Lighthouse benchmark swung from 238 to 1,341 during these runs, so most variants have one usable run. With every script stripped, `/` measured 2.0 to 2.2 s, under budget, in all five runs. With scripts, the base page measured 3.82 s, a version with every shadow, blur and animation turned off 3.65 s (2.51 and 4.14 s in its other two, heavily loaded runs), and headless Chrome with GPU flags 3.67 s. After the JS trims, three runs alternated with the build before them gave 3.63 s against 3.73 s, within the spread. Lighthouse counts every script that starts before the first paint as part of LCP, and here the first paint comes after the scripts start. Even with no scripts, the page took about 0.85 s to paint, so the delay is painting, not JavaScript. Which part of painting wasn't isolated: GPU flags and a headed Chrome run didn't change it. Turning the effects off halved the paint time (870 → 450 ms), but the scripts still started first. PageSpeed Insights measured 1.7 s of render delay on its own servers before the fixes. So no contained change got `/` under 2.5 s on the laptop, and its Lighthouse runs swing too much to judge LCP: use PageSpeed Insights. INP still needs real-user data |
| Performance budget | ⚠️ | LCP < 2.5 s, CLS < 0.1, and JS on `/` ≤ 152 KiB compressed, framework included (155 KiB until 2026-11-18). CI enforces it in `e2e/js-budget.spec.ts`, so raising it is a decision rather than drift. JS and CLS pass; LCP doesn't yet (see Core Web Vitals). **Why 155 KiB:** 150 KB was only a suggestion, and React and Next alone come to 135.9 KiB (all the 404 page loads). Below that line, the one remaining cut is plain links instead of `next/link` on the marketing pages, which saves 3.1 KiB but loses soft navigation and prefetching, so every next page loads slower. Kept `next/link` and set the budget to 155 KiB on 2026-11-15 (SEC-277). **How it's measured:** compressed bytes sent over the network (Lighthouse's transfer size, in KiB) for the script tags in `/`'s HTML. Route prefetches and code loaded after the page is up don't count. Production serves scripts as Brotli at quality 3 (matched byte for byte on a live file), with about 224 B of headers each (production's 10 files: 155,906 B of bodies against Lighthouse's 154.4 KiB). So a build's figure is Brotli quality 3 of those files plus 224 B each. The core-js polyfill tag is `noModule`, which modern browsers and Lighthouse don't download, so it doesn't count; counting it gives about 189 KiB. Lighthouse's own script total also counts what loads after the page is up (the motion code and the route prefetches), so sum the script tags only. **Figures:** `/` is 150.9 KiB on production on 2026-11-18, about 137 KiB of it React and Next. The app's own code is about 13.5 KiB, and under 1 KiB of it could move without a visible change (inventory on SEC-277). It was 150.5 KiB on 2026-11-15 ( 150.3 KiB with an earlier, uncalibrated header estimate of 210 B), down from 154.4 KiB on production on 2026-11-14 and 151.5 KiB before the SEC-277 trims. The trims: `src/app/global-error.tsx` imports no shared modules, which the bundler had been shipping twice, and the reveal, ambient-loop and spotlight code (`reveal-effects.ts`) loads after the first paint. That split counts only by this definition: Lighthouse's all-scripts total doesn't change |
| Images through `next/image` | ✅ | The footage posters go through the image optimiser with `getImageProps` (`src/components/marketing/footage-slot.tsx`): a 1080 px WebP, 28 KB for the hero instead of the 60 KB JPEG. A poster can't take a `srcset`, so it is one size (SEC-277) |
| Public assets size | ✅ | `public/` is 2 MB, with no file over 1 MB |
| Virtualised lists, web workers | ➖ | Back-office lists are small. Revisit if a table passes ~500 rows |

## 3. State management

| Practice | Status | Where / note |
|---|---|---|
| Server state lives on the server | ✅ | Back-office reads happen in Server Components; changes go through server actions in `src/app/(app)/admin/actions.ts` |
| Form state and validation | ✅ | zod schemas in `src/lib/admin/schemas.ts` and `src/lib/leads/schema.ts`, shared by client and server |
| URL as state for filters | ✅ | Clients list: search, status, city, state and plan are a plain GET form (`src/app/(app)/admin/(console)/clients/page.tsx:66-83`) read from the query string (`:37-47`), so a filtered view is a shareable link. On a phone, status, city, state and plan fold behind "More filters" and still send their values (`src/components/admin/more-filters.tsx`). The CSV export link carries the same query (`:49-51`, `:90`; `clients/export/route.ts:6-13`). Reconciliation keeps its month in `?month=` (`reconciliation/page.tsx:54-59`). The leads inbox has no filters (`leads/page.tsx:28`) |
| Cache invalidation after a change | ✅ | `revalidatePath("/admin", "layout")` after every action |
| Forms keep what was typed | ✅ | React 19 resets a `<form action>` after every action, so after a save the back office's dropdowns went back to their first value (and the next save sent it back), and a refused save wiped what was typed. `ActionForm` (`src/components/admin/action-form.tsx`) now sends the form itself; forms that should clear keep `resetOnSuccess`. Tested in `e2e-admin/saved-values.spec.ts`. #47, merged as `cfcade4` (SEC-280) |
| Redux, Zustand, TanStack Query, signals | ➖ | Not needed: there's no complex client state. Don't add a store library without a real need |

## 4. Networking

| Practice | Status | Where / note |
|---|---|---|
| Errors handled without losing data | ✅ | `src/app/api/leads/route.ts` saves the lead first. A failed email is logged, not shown to the visitor |
| Rate limiting | ✅ | Hashed-IP limit through the `check_lead_rate_limit` RPC, on the lead form and, since the SEC-241 review, on sign-in (10 attempts per visitor and email address in 15 minutes) and the emailed sign-in link (3 an hour), each with a looser cap per visitor (`src/lib/auth-rate-limit.ts`, `tests/auth-rate-limit.test.ts`, `e2e-admin/sign-in-limit.spec.ts`; pending merge) |
| Timeouts and cancellation | ✅ | `AbortController`/`signal` is used in 7 files |
| Alert when the lead email fails | ✅ partial | `notified_at` on `leads` (migration `20261114000000_lead_email_status.sql`). The dashboard and leads inbox flag new leads the admins weren't emailed about. Nobody is notified outside the back office: a scheduled resend would need a Vercel cron and a secret (SEC-258) |
| Retries with backoff | ✅ | `src/lib/email.ts`: the lead email is retried once after a network error, 429 or 5xx, never after other 4xx (SEC-258) |
| GraphQL, WebSockets, SSE, BFF | ➖ | No need. Live video belongs to the separate video platform |

## 5. Caching

| Practice | Status | Where / note |
|---|---|---|
| Static assets versioned and cached long-term | ✅ | Next's hashed `_next/static` files |
| Static pages served from the CDN | ✅ | Public pages are pre-rendered (Vercel CDN once deployed) |
| No private data in shared caches | ✅ | Back office is per-visitor (`instant = false`) |
| Service workers, PWA, offline, IndexedDB | ➖ | Not needed for a marketing site and admin tool |

## 6. Architecture

| Practice | Status | Where / note |
|---|---|---|
| Design system with tokens | ✅ | `DESIGN.md`, `src/app/globals.css` |
| Folder structure and separation of concerns | ✅ | Route trees `[lang]` and `(app)`; pure logic in `src/lib/admin/` so it can be tested |
| Content separate from code | ✅ | `src/content/site.ts`, `src/content/seo.ts`, `src/i18n/` |
| Dependency boundaries | ✅ | `server-only` keeps the service-role client out of the browser |
| Documentation | ✅ | `CLAUDE.md`, `README.md`, the build spec, and this file |
| Micro frontends, module federation, monorepo, feature flags | ➖ | One small app, so not needed |

## 7. Security

| Practice | Status | Where / note |
|---|---|---|
| HTTPS everywhere, HSTS | ✅ | `next.config.ts` headers |
| Clickjacking protection | ✅ | `X-Frame-Options: DENY` |
| Permissions policy | ✅ | Camera, microphone and location are off |
| Security headers (nosniff, referrer) | ✅ | `next.config.ts` |
| Content Security Policy | ✅ | **Sign-in and back office:** strict per-request nonce policy, `'strict-dynamic'` and no `'unsafe-inline'` for scripts (`src/lib/csp.ts`, set in `src/proxy.ts`), checked on every console page by `e2e-admin/` (SEC-269). **Public pages:** `next.config.ts` limits scripts to this site, Turnstile and Calendly and frames to those two, and blocks plugins, framing, foreign form posts and `<base>` changes, but still allows inline scripts: Next streams page data in inline scripts and these pages are static, so nonces aren't available (a strict policy with the experimental `sri` option was tested and blocked them) (SEC-266). It does block inline event-handler attributes (`script-src-attr 'none'`). `e2e/csp-public.spec.ts` checks every public page in every language for them, and that Turnstile and the booking calendar run with no violation (#71, pending merge). The options for a fully strict public policy, and why they wait, are on SEC-266 |
| Input validation | ✅ | zod on every form and action |
| Uploaded files checked by content | ✅ | Documents were allowed by the type the browser declares, which comes from the file's name. `uploadDocument` also checks the first bytes match PDF, PNG or JPEG (`src/lib/admin/document-type.ts`, `tests/document-type.test.ts`). #46, merged as `673cbc0` (SEC-240) |
| Secure session cookies | ✅ | Handled by `@supabase/ssr`, written httpOnly so page scripts can't read them: only the server reads the session (`src/lib/supabase/session-cookies.ts`, checked in `e2e-admin/sign-out.spec.ts`; pending merge, SEC-241). MFA is required for admins (`src/lib/auth.ts`) |
| No secrets in the browser | ✅ | `getServerEnv()` and `server-only`. Only public keys are exposed |
| Defence in depth on data | ✅ | RLS plus `requireAdmin()` |
| Dependency audit | ✅ | `npm audit --omit=dev`: 0 vulnerabilities on 2026-11-13. Also runs in CI (`.github/workflows/ci.yml`, high and critical fail the build) |
| Third-party scripts | ✅ | Cloudflare Turnstile on the form page. Calendly's booking widget pulls about 3.5 MB from about 20 outside hosts (Stripe, Google, Facebook, Segment, OneTrust and others), so since SEC-277 nothing from Calendly loads until the visitor asks for it. On `/talk-to-sales` and the `/demo` fallback a "Pick a time" button fills the calendar's box, and one tap opens the calendar in the same place. After the lead form is sent, the visitor has just asked to book, so the calendar loads at once (`src/components/marketing/calendly-booking.tsx`, tested in `e2e/calendly.spec.ts` and `e2e/lead-form.spec.ts`; decided by Morris on 2026-11-15) |
| Subresource integrity | ➖ | Turnstile's script can't be pinned with SRI. A CSP allowlist covers it instead |

## 8. Accessibility and internationalisation

| Practice | Status | Where / note |
|---|---|---|
| Semantic HTML and landmarks | ✅ | `<main>` in each layout |
| Skip link | ✅ | `src/components/marketing/skip-link.tsx` in both layouts. Sign-in and back office jump to `<main id="main">` (SEC-265). The target takes focus with no ring round the whole page; tested on `/`, `/ar` and `/login` in `e2e/screen-reader.spec.ts` (SEC-280) |
| Visible keyboard focus | ✅ | Global `:focus-visible` rule in `src/app/globals.css`. It sits outside Tailwind's layers, so it beats `outline-none`. A rule beside it removes the ring from `[tabindex="-1"]` targets, which take focus only from a script (the skip link's target, the `/check` verdict, the demo confirmation, the calendar region); `e2e/screen-reader.spec.ts` checks three of them |
| Reduced motion | ✅ | `globals.css` media query, `lazy-video.tsx`, `reveal-root.tsx` |
| Live regions for form results | ✅ | `aria-live`/`role="status"` in 5 files |
| Colour contrast | ✅ | axe checks WCAG AA contrast on 10 pages in CI (`e2e/accessibility.spec.ts`), with motion reduced so fade-ins don't skew it |
| Keyboard-only and screen reader use | 🔍 | Keyboard use is tested in `e2e/keyboard.spec.ts` and `e2e/sign-in.spec.ts`. `e2e/screen-reader.spec.ts` checks the attributes screen readers rely on: the open phone menu makes the page behind it inert, the demo form is named, and the English alert header is marked `lang="en"` (SEC-280). No real screen reader has been run yet, so this still needs a manual NVDA or VoiceOver pass |
| Automated accessibility tests (axe) | ✅ | `e2e/accessibility.spec.ts`: WCAG 2.1 A and AA on `/`, `/demo`, `/check`, `/talk-to-sales`, `/privacy`, `/terms`, `/ar`, `/ar/demo`, `/ar/talk-to-sales`, `/login` and a 404, plus `/` and `/ar` with every FAQ answer open and with the phone menu open. Serious or critical findings fail CI (SEC-267, SEC-280). The signed-in side gets the same check in `e2e-admin/accessibility.spec.ts` (#56, merged as `8878b1f`): sign-in, both two-step screens and every console page, at 390 px and at desktop width, in English and in Arabic. The portal's equivalent is on #16 |
| 8 locales, locale routing | ✅ | `src/i18n/config.ts`, `src/proxy.ts` |
| Right-to-left support | ✅ | `dir` set on `<html>` in both layouts (Arabic) |
| Date and number formats | ✅ | `Intl` through `getAppText().format` |
| Translation workflow | ⚠️ | Non-English text is machine-drafted and needs native review (SEC-259) |
| Signed-in side on a phone | ✅ | From the SEC-280 round-2 walkthrough at 390 px, each tested at that width. Fields are 16 px on phones, so iPhones don't zoom in (#48, `e2e/phone-fields.spec.ts`). The back-office menu wraps instead of hiding Plans and Activity off-screen (#49, `e2e-admin/phone-menu.spec.ts`). The clients list shows cards and folds its filters (#51, `e2e-admin/clients-phone.spec.ts`). Two-step setup works on the phone that shows the code (#53, `e2e-admin/mfa-same-phone.spec.ts`). Buttons are 44 px tap targets (#54, `e2e-admin/phone-tap-targets.spec.ts`). All five are merged (`a7d71c6`, `21b520b`, `06162ef`, `263eb46`, `e79ca8c`). The portal's equivalents are on #16 |

## 9. Observability and testing

| Practice | Status | Where / note |
|---|---|---|
| Unit tests | ✅ | `tests/admin-logic.test.ts` |
| Database and security tests | ✅ | `tests/rls.test.ts`, `tests/admin-migration.test.ts` (real migrations in PGlite) |
| API route tests | ✅ | `tests/leads-route.test.ts` |
| CI checks: test, typecheck, lint, white-label, build | ✅ | `.github/workflows/ci.yml` runs on every push and pull request. First green run 2026-11-13 (SEC-252) |
| End-to-end tests (Playwright) | ✅ | `e2e/`: lead form submits in English and Arabic (API stubbed, Turnstile test key), required fields block an empty form, `/admin` sends signed-out visitors to sign-in (SEC-267). `e2e-admin/`: a fresh admin signs in, sets up the authenticator (TOTP) and works through the console (dashboard, leads, converting a lead, client page, every console page, the 404) against a throwaway local Supabase stack, with zero CSP violations and a check that the strict policy is present. Runs on every push in its own CI job (`admin-e2e`, about a minute), first green 2026-11-14 (SEC-269). Signed-in pages stream their content in behind a "Loading…" line, so a test that reads a page in one go (counting, axe, sizes) or walks it with Tab right after a navigation or redirect first calls `contentShown()` or `openLoaded()` from `e2e-admin/page-ready.ts`. Locator actions and `expect()` wait by themselves. Skipping it made three tests flaky on 2026-11-17 |
| Visual regression | ➖ | Later, once the design is final (SEC-249) |
| Preview deploys and rollbacks | ✅ previews, 🔍 rollback | **Previews:** Vercel builds a preview deployment for every pull request and reports it as a PR check ("Vercel", "Deployment has completed"). Seen on every PR from #12 to #23. Merging to `main` deploys production to www.vx44ai.com (checked after #17–#21 were merged on 2026-11-16). **Rollback:** Vercel keeps earlier production deployments, and its Instant Rollback switches production back to one of them from the dashboard. It hasn't been tried on this project yet, so try it once on a harmless deploy before relying on it (SEC-253) |
| Error tracking (e.g. Sentry) | ⚠️ **decision** | Adds a sub-processor, so the privacy policy changes in 8 languages (SEC-268) |
| Product analytics, real-user monitoring, session replay, A/B tests | ⚠️ **decision** | Same privacy impact, plus cookie consent. Choose deliberately, not by default (SEC-268) |
| Production smoke test | ✅ | `e2e-prod/production.spec.ts`, read-only (any request other than GET or HEAD fails the test; nothing is typed, submitted or booked). Every public page in all 8 languages with no console errors, the security headers, and the sign-in page. A GitHub Action runs it daily at 05:17 UTC and on demand, with a one-click check that `/demo` shows the lead form once the production keys are set (`.github/workflows/prod-smoke.yml`, `npm run test:prod`). #45, merged as `0acaa8b` (SEC-239, SEC-251) |
| Alerting | ⚠️ | A failed daily smoke test of the live site opens a GitHub issue labelled `smoke-failure`, or comments on the open one, with the failing tests and a link to the run, so GitHub emails the repository's watchers. It uses the workflow's own token, so it adds no vendor (`.github/workflows/prod-smoke.yml`, `scripts/smoke-alert.mjs`, `tests/smoke-alert.test.ts`; #58, merged as `59c1029`). Between those daily runs, an uptime check every 30 minutes asks for `/`, `/demo`, `/login`, `/sitemap.xml` and `/en` over plain HTTP. It checks each status, a 20-second timeout and one thing only a working server render produces. A failure opens or comments on an `uptime-failure` issue, and the next passing check closes it (`.github/workflows/uptime.yml`, `scripts/uptime-check.mjs`, `scripts/alert-issue.sh`, `tests/uptime-check.test.ts`; #62, pending merge). Unsent lead emails show in the back office (SEC-258). Server errors that don't take a page down still alert nobody: see SEC-268 |

---

## Gaps to fix, in priority order

1. ~~**CI** (SEC-252)~~: done 2026-11-13.
2. ~~**Error boundaries** and the admin skip link (SEC-265)~~: done 2026-11-13.
3. ~~**Content Security Policy** (SEC-266, SEC-269)~~: done 2026-11-14. Strict nonce policy for sign-in and back office; the public pages keep the partial policy.
4. ~~**End-to-end and accessibility tests** (SEC-267, SEC-269)~~: done 2026-11-14, including the signed-in admin flow.
5. **Decide on error tracking and analytics**, including which provider, if any, and the privacy policy wording (SEC-268).
6. ~~**Lead email failure alert** (SEC-258)~~: done 2026-11-14 inside the back office. Migration applied to the Supabase project the same day.
