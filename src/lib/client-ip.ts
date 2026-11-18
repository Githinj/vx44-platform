/**
 * The visitor's IP address, for the lead form's and sign-in's rate limits and for Turnstile.
 *
 * It's read only from headers Vercel sets: x-vercel-forwarded-for first (Vercel says it stays right
 * even with a proxy in front), then x-real-ip. Never x-forwarded-for: a client can send its own,
 * and a new value on each try would make every attempt a new "visitor" and skip the limits
 * (SEC-241 review). Null when neither header is there, as on a local server.
 */
export function clientIp(headers: Headers): string | null {
  for (const name of ["x-vercel-forwarded-for", "x-real-ip"]) {
    const value = headers.get(name)?.split(",")[0]?.trim();
    if (value) return value;
  }
  return null;
}
