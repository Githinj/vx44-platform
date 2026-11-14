# Frontend engineering standards

This is a checklist for building the VX44 website and back office. It covers nine areas: rendering, performance, state, networking, caching, architecture, security, accessibility and internationalisation, and observability and testing.

For each area it lists the practices that matter for this app and the current status. It also names the ones we skip and says why.

**Status key**
- ✅ **In place.** The file is cited.
- ⚠️ **Gap.** Work is needed, and the Linear issue is named where there is one.
- 🔍 **Not checked.** Nobody has measured it yet, so it doesn't count as passing.
- ➖ **Not relevant now.** The reason is given.

Last audited: 2026-11-13, by reading the code only. Nothing was measured in a browser.

**How to use this:** before a change ships, check it against the relevant section. When a gap closes, update its row in the same change.

---

## 1. Rendering

| Practice | Status | Where / note |
|---|---|---|
| Static generation for public pages | ✅ | `src/app/[lang]/`: `generateStaticParams` for all 8 locales |
| Per-request rendering only where needed | ✅ | `src/app/(app)/` (`instant = false`): sign-in and back office |
| Streaming and Suspense boundaries | ✅ | `<Suspense>` is used in 8 files |
| Server Components by default, client only for interaction | ✅ | 13 `"use client"` files, all interactive (forms, video, menus) |
| Error boundaries (`error.tsx`, `global-error.tsx`) | ✅ | `src/app/[lang]/error.tsx`, `src/app/(app)/error.tsx`, `src/app/global-error.tsx`: translated, with "try again" and the server-log reference (SEC-265) |
| Loading states (`loading.tsx` or Suspense fallbacks) | 🔍 | No `loading.tsx`. Check that back-office pages show a fallback |
| SEO metadata per page | ✅ | `generateMetadata`/`metadata` in 19 files, plus `sitemap.ts`, `robots.ts` and `opengraph-image.tsx` |
| Hydration safety (no layout shift or flash) | 🔍 | Not measured |
| Islands, partial hydration, edge rendering | ➖ | Not needed: App Router plus static pages already covers it |

## 2. Performance

| Practice | Status | Where / note |
|---|---|---|
| Fonts self-hosted, no layout shift | ✅ | `src/app/fonts.ts` uses `next/font` |
| Video loaded lazily, respects reduced motion | ✅ | `src/components/marketing/lazy-video.tsx`: `preload="none"`, `matchMedia` check |
| Code splitting with dynamic imports | ✅ | 3 places |
| Core Web Vitals (LCP, INP, CLS) | 🔍 | Never measured. Run Lighthouse on `/` and `/demo` at mobile width after deploy |
| Performance budget | ⚠️ | None set. Suggested: LCP < 2.5 s, CLS < 0.1, JS on `/` < 150 KB |
| Images through `next/image` | ➖ | No raster `<img>` tags yet. Use `next/image` when photos are added |
| Public assets size | ✅ | `public/` is 2 MB, with no file over 1 MB |
| Virtualised lists, web workers | ➖ | Back-office lists are small. Revisit if a table passes ~500 rows |

## 3. State management

| Practice | Status | Where / note |
|---|---|---|
| Server state lives on the server | ✅ | Back-office reads happen in Server Components; changes go through server actions in `src/app/(app)/admin/actions.ts` |
| Form state and validation | ✅ | zod schemas in `src/lib/admin/schemas.ts` and `src/lib/leads/schema.ts`, shared by client and server |
| URL as state for filters | 🔍 | Check that back-office filters live in the query string, so links are shareable |
| Cache invalidation after a change | ✅ | `revalidatePath("/admin", "layout")` after every action |
| Redux, Zustand, TanStack Query, signals | ➖ | Not needed: there's no complex client state. Don't add a store library without a real need |

## 4. Networking

| Practice | Status | Where / note |
|---|---|---|
| Errors handled without losing data | ✅ | `src/app/api/leads/route.ts` saves the lead first. A failed email is logged, not shown to the visitor |
| Rate limiting | ✅ | Hashed-IP limit through the `check_lead_rate_limit` RPC |
| Timeouts and cancellation | ✅ | `AbortController`/`signal` is used in 7 files |
| Alert when the lead email fails | ⚠️ | SEC-258 |
| Retries with backoff | ➖ | Only one outbound call matters, the email (SEC-258) |
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
| Content Security Policy | ✅ partial | `next.config.ts`: scripts only from this site, Turnstile and Calendly; frames only from those two; no plugins, framing, foreign form posts or `<base>` changes. **Inline scripts are still allowed**, because Next streams page data in inline scripts and the public pages are static (a strict policy with the experimental `sri` option was tested and blocked them). Next step: per-request nonces for the sign-in and back-office pages, which needs a signed-in check (SEC-266) |
| Input validation | ✅ | zod on every form and action |
| Secure session cookies | ✅ | Handled by `@supabase/ssr`. MFA is required for admins (`src/lib/auth.ts`) |
| No secrets in the browser | ✅ | `getServerEnv()` and `server-only`. Only public keys are exposed |
| Defence in depth on data | ✅ | RLS plus `requireAdmin()` |
| Dependency audit | ✅ | `npm audit --omit=dev`: 0 vulnerabilities on 2026-11-13. Also runs in CI (`.github/workflows/ci.yml`, high and critical fail the build) |
| Third-party scripts | ✅ | Only Cloudflare Turnstile, on the form page |
| Subresource integrity | ➖ | Turnstile's script can't be pinned with SRI. A CSP allowlist covers it instead |

## 8. Accessibility and internationalisation

| Practice | Status | Where / note |
|---|---|---|
| Semantic HTML and landmarks | ✅ | `<main>` in each layout |
| Skip link | ✅ | `src/components/marketing/skip-link.tsx` in both layouts. Sign-in and back office jump to `<main id="main">` (SEC-265) |
| Visible keyboard focus | ✅ | Global `:focus-visible` rule in `src/app/globals.css` |
| Reduced motion | ✅ | `globals.css` media query, `lazy-video.tsx`, `reveal-root.tsx` |
| Live regions for form results | ✅ | `aria-live`/`role="status"` in 5 files |
| Colour contrast | ✅ | axe checks WCAG AA contrast on 10 pages in CI (`e2e/accessibility.spec.ts`), with motion reduced so fade-ins don't skew it |
| Keyboard-only and screen reader use | 🔍 | The sign-in skip link is tested by keyboard (`e2e/sign-in.spec.ts`). The rest still needs a manual pass |
| Automated accessibility tests (axe) | ✅ | `e2e/accessibility.spec.ts`: WCAG 2.1 A and AA on `/`, `/demo`, `/check`, `/talk-to-sales`, `/privacy`, `/terms`, `/ar`, `/ar/demo`, `/login` and a 404. Serious or critical findings fail CI (SEC-267) |
| 8 locales, locale routing | ✅ | `src/i18n/config.ts`, `src/proxy.ts` |
| Right-to-left support | ✅ | `dir` set on `<html>` in both layouts (Arabic) |
| Date and number formats | ✅ | `Intl` through `getAppText().format` |
| Translation workflow | ⚠️ | Non-English text is machine-drafted and needs native review (SEC-259) |

## 9. Observability and testing

| Practice | Status | Where / note |
|---|---|---|
| Unit tests | ✅ | `tests/admin-logic.test.ts` |
| Database and security tests | ✅ | `tests/rls.test.ts`, `tests/admin-migration.test.ts` (real migrations in PGlite) |
| API route tests | ✅ | `tests/leads-route.test.ts` |
| CI checks: test, typecheck, lint, white-label, build | ✅ | `.github/workflows/ci.yml` runs on every push and pull request. First green run 2026-11-13 (SEC-252) |
| End-to-end tests (Playwright) | ✅ partial | `e2e/`: lead form submits in English and Arabic (API stubbed, Turnstile test key), required fields block an empty form, and `/admin` sends signed-out visitors to sign-in. Not covered: signing in as an MFA admin and reaching the leads list, which needs a test Supabase stack (SEC-267) |
| Visual regression | ➖ | Later, once the design is final (SEC-249) |
| Preview deploys and rollbacks | 🔍 | Vercel gives both once deployed (SEC-253) |
| Error tracking (e.g. Sentry) | ⚠️ **decision** | Adds a sub-processor, so the privacy policy changes in 8 languages (SEC-268) |
| Product analytics, real-user monitoring, session replay, A/B tests | ⚠️ **decision** | Same privacy impact, plus cookie consent. Choose deliberately, not by default (SEC-268) |
| Alerting | ⚠️ | The lead-email failure alert is SEC-258. Nothing else alerts yet |

---

## Gaps to fix, in priority order

1. ~~**CI** (SEC-252)~~: done 2026-11-13.
2. ~~**Error boundaries** and the admin skip link (SEC-265)~~: done 2026-11-13.
3. ~~**Content Security Policy** (SEC-266)~~: done 2026-11-14 as a partial policy. Stricter nonces for sign-in and back office are a follow-up.
4. ~~**End-to-end and accessibility tests** (SEC-267)~~: done 2026-11-14, except the signed-in admin flow.
5. **Decide on error tracking and analytics**, including which provider, if any, and the privacy policy wording (SEC-268).
6. **Lead email failure alert** (SEC-258).
