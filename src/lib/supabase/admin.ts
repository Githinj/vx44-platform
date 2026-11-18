import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { ServiceRoleEnv } from "@/lib/env";

// Service-role client: bypasses RLS. Server code only; `server-only` fails the build if a
// client component ever imports this file. Used by the public lead route, by admin invites
// (auth.admin calls only, after requireAdmin()) and by the sign-in limits (src/lib/auth-rate-limit.ts).
export function createAdminClient(env: ServiceRoleEnv) {
  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
