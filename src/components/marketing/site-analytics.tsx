"use client";

import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { withoutQuery } from "@/lib/analytics";

// Page views (Web Analytics) and real-visitor Core Web Vitals (Speed Insights). Vercel says neither
// uses third-party cookies (docs/analytics.md). On Vercel both load their script from this site
// (/_vercel/insights and /_vercel/speed-insights) and report back to it, so the public pages' CSP
// needs no new origin in production. Rendered only when analytics is switched on (see
// src/lib/analytics.ts), so with it off this component's code never loads.
export function SiteAnalytics() {
  return (
    <>
      <Analytics beforeSend={withoutQuery} />
      <SpeedInsights beforeSend={withoutQuery} />
    </>
  );
}
