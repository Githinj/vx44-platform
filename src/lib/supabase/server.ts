import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { connection } from "next/server";

export function getAuthEnv() {
  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;
  return url && anonKey ? { url, anonKey } : null;
}

// Client bound to the signed-in user's cookies, so row level security applies to every query.
export async function createSessionClient() {
  // Wait for the real request first (SEC-278). With partial prefetching, cookies() resolves while
  // Next.js prerenders a page's shell, so without this Supabase's session check ran during that
  // prerender, read the clock, and logged "unstable value Date.now()" on every signed-in page.
  // It also keeps a build without secrets from ever reaching the check below.
  await connection();
  const cookieStore = await cookies();

  const env = getAuthEnv();
  if (!env) throw new Error("Missing or invalid environment variables: SUPABASE_ANON_KEY");

  return createServerClient(env.url, env.anonKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet) => {
        // Server Components can't set cookies. The proxy has already refreshed the session
        // by then, so ignoring this is safe; Server Actions and Route Handlers can set them.
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {}
      },
    },
  });
}
