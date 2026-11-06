import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export function getAuthEnv() {
  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;
  return url && anonKey ? { url, anonKey } : null;
}

// Client bound to the signed-in user's cookies, so row level security applies to every query.
export async function createSessionClient() {
  // Read cookies first: it pauses prerendering, so a build without secrets never reaches the check.
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
