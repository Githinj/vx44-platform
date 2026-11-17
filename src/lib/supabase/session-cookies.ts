import type { CookieOptionsWithName } from "@supabase/ssr";

/**
 * How the Supabase session cookies are written, by every server client (src/lib/supabase/server.ts
 * and the proxy's session refresh).
 *
 * Only the server reads the session: sign-in, two-step verification and sign-out are all server
 * actions, and there's no browser Supabase client. So the cookies are httpOnly, and a script on the
 * page can't read them, even one that got past the Content Security Policy (SEC-241 review). The
 * rest matches @supabase/ssr's defaults.
 */
export const sessionCookieOptions: CookieOptionsWithName = {
  path: "/",
  sameSite: "lax",
  httpOnly: true,
};
