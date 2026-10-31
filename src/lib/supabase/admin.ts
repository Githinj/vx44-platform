import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { ServerEnv } from "@/lib/env";

// Service-role client: bypasses RLS. Server code only; `server-only` fails the build if a
// client component ever imports this file.
export function createAdminClient(env: ServerEnv) {
  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
