import { connection } from "next/server";
import { checkBackendShared, healthResponse } from "@/lib/health";
import { getAuthEnv } from "@/lib/supabase/server";

// GET /api/health: whether Supabase's sign-in service and database answer (src/lib/health.ts).
// 200 with { ok: true, auth: "ok", database: "ok" }, or 503 naming the part that's down.
export async function GET() {
  // Always at request time: never prerendered at build, where there are no secrets, and never cached.
  await connection();
  return healthResponse(await checkBackendShared(getAuthEnv()));
}
