// Stands in for site-analytics.tsx when analytics is switched off (next.config.ts aliases it). A
// "use client" component imported by a layout ships to every page whether or not it renders, so
// with analytics off this empty server component takes its place and the analytics packages stay
// out of the build (SEC-268).
export function SiteAnalytics() {
  return null;
}
