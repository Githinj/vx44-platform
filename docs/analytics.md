# Analytics (SEC-268): ready, switched off

Whether the site measures visitors at all is Morris's decision (SEC-268). This page says what is
built, what it collects, and what to do before switching it on. Nothing here is live until then.

## What is built

- **Vercel Web Analytics:** page views on the public pages.
- **Vercel Speed Insights:** Core Web Vitals (LCP, INP, CLS) from real visitors. Real-visitor
  INP is the measurement SEC-277 still lacks.
- **Off by default.** Both run only when `NEXT_PUBLIC_ANALYTICS_ENABLED=1` is set at build time
  (`src/lib/analytics.ts`). With it off, the component that loads them is never rendered, and a
  browser test (`e2e/analytics-off.spec.ts`) checks that no analytics script loads and nothing is
  sent.
- **Public pages only.** The sign-in, back-office and portal pages never load them.
- **No query strings.** Each report carries the page address without its query string or
  fragment (`withoutQuery` in `src/lib/analytics.ts`), so a link carrying an email address or a
  campaign tag isn't recorded.
- **CSP:** no change in production. On Vercel both scripts load from this site
  (`/_vercel/insights/script.js`, `/_vercel/speed-insights/script.js`) and report back to it, which
  `script-src 'self'` and `connect-src 'self'` already allow. Only `next dev` with the flag on loads
  Vercel's debug scripts from `https://va.vercel-scripts.com`, which `next.config.ts` then allows.

## What they collect

From Vercel's privacy pages for
[Web Analytics](https://vercel.com/docs/analytics/privacy-policy) (updated 2026-06-26) and
[Speed Insights](https://vercel.com/docs/speed-insights/privacy-policy) (updated 2026-03-18), read
2026-11-16:

- **Web Analytics** records the time, the page address and its route (`/[lang]/demo`), the referrer,
  query parameters (filtered; we also strip them, above), location down to the city, the
  operating system, browser and device type, and the script version. Vercel says it works
  "without using any third-party cookies". Visitors are told apart by "a hash created from the
  incoming request", and a visitor session "is automatically discarded after 24 hours". The data
  isn't "tied to or associated with any individual, customer, or IP address".
- **Speed Insights** records the route and page address, network speed, browser, device type,
  operating system, country, and the Web Vitals with the page element each one points to. Vercel
  calls it anonymous and says it isn't tied to a visitor or IP address.

**Not stated by Vercel:** whether the scripts store anything on the visitor's device (only
"third-party cookies" is ruled out), whether IP addresses reach its logs, and whether a consent
banner is needed. After enabling, check the browser's storage panel on the live site. Ask the
legal review (SEC-256) whether a banner is needed, especially for visitors in the EU and California.

Vercel already hosts the site and processes every request, so this adds no new company. It does
add a new purpose, which the privacy policy has to name.

Vercel already hosts the site and processes every request, so this adds no new company. It does
add a new purpose, which the privacy policy has to name.

## Before switching it on

1. **Morris decides** (SEC-268): Web Analytics, Speed Insights, both, or neither.
2. **Check the Vercel plan** (action pack §3). Analytics events and Speed Insights data points
   have monthly limits that depend on the plan.
3. **Enable them in Vercel:** the project's **Analytics** tab, then the **Speed Insights** tab.
4. **Add a privacy-policy paragraph** in all 8 languages (`src/i18n/legal/*.tsx`, with the legal
   review in SEC-256). Suggested English:

   > **Site analytics.** We measure how our public website is used and how fast it loads, using
   > Vercel Web Analytics and Vercel Speed Insights, provided by Vercel Inc., which also hosts the
   > site. They record the page you visit (without its query string), the referring site, your
   > approximate location, your browser, operating system and device type, your network speed,
   > and page-load timings. Vercel tells visits apart without third-party cookies, and does not tie
   > this data to you or your IP address. We use it only to improve the site. It is not used for
   > advertising and is not combined with other data about you.

   Have the legal review confirm this wording against what you see after enabling (step 6).

5. **Set `NEXT_PUBLIC_ANALYTICS_ENABLED=1`** in Vercel (Production), then redeploy.
6. **Check:** on the live site, the browser's network panel shows `/_vercel/insights/script.js`
   loading on `/`, and nothing analytics-related on `/login`. The storage panel shows whether the
   scripts keep anything on the device. Data appears in the Vercel dashboard within a few minutes.

To switch it off again, remove the variable and redeploy.
