import "server-only";

/**
 * This app's own address, for links in emails (magic links, invites). SITE_URL wins, so tests and
 * local runs can point links at the right port; on Vercel the production domain is used.
 */
export function appUrl(): string {
  if (process.env.SITE_URL) return process.env.SITE_URL.replace(/\/+$/, "");
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  return "http://localhost:3000";
}
