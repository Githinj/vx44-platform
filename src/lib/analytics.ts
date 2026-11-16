// Vercel Web Analytics and Speed Insights (SEC-268). Off unless NEXT_PUBLIC_ANALYTICS_ENABLED is
// "1" when the site is built: it's a build-time switch, so turning it on or off needs a redeploy.
// Whether to switch it on is Morris's decision, and the privacy policy has to name it first
// (docs/analytics.md).
export const analyticsEnabled = process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === "1";

// Report the page, not the visitor's query string or fragment: a shared link can carry an email
// address or a campaign tag tied to one person.
export function withoutQuery<T extends { url: string }>(event: T): T {
  try {
    const url = new URL(event.url);
    url.search = "";
    url.hash = "";
    return { ...event, url: url.toString() };
  } catch {
    return event;
  }
}
