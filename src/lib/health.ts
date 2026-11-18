import "server-only";

// The backend health check behind GET /api/health, for the uptime check of the live site. The
// pages it fetches never touch Supabase, so on their own they can't tell that sign-in is broken.
// This asks the two parts of Supabase that sign-in needs, with the public anon key sign-in already
// uses (no service-role key on a route anyone can call):
// - auth: the sign-in service's own health endpoint.
// - database: a one-row read of public.plans as the anon role. Anon may read no table (the schema
//   migration revokes everything), so a working database answers "permission denied", SQLSTATE
//   42501. Only Postgres produces that code, so it shows the database answered. A wrong key, a
//   paused project or a database that's down answers differently. Each check leaves one
//   "permission denied for table plans" line in the database log.
// Both requests carry the key exactly as the app's own Supabase client sends it, so if sign-in
// reaches Supabase, these do too. The client isn't used for them: its database queries retry a 503
// with backoff, which would stretch the time limit below.
// The reply says only ok, down or not configured for each part: the uptime check copies it into a
// public GitHub issue, and the Supabase address names the project. The reasons go to the server log.

export type PartStatus = "ok" | "down" | "not configured";
export type Health = { ok: boolean; auth: PartStatus; database: PartStatus };
export type BackendEnv = { url: string; anonKey: string };

const TIMEOUT_MS = 5_000;
const PERMISSION_DENIED = "42501";

type Probe = { ok: true } | { ok: false; reason: string };

// How supabase-js (2.119) sends the key to the sign-in service and the database without a session:
// as `apikey`, and as a Bearer token, for a legacy anon JWT and a publishable key alike.
// tests/health-route.test.ts compares these with the installed client's.
function keyHeaders(anonKey: string) {
  return { apikey: anonKey, authorization: `Bearer ${anonKey}` };
}

async function ask(env: BackendEnv, path: string) {
  return fetch(new URL(path, env.url), {
    method: "GET",
    headers: keyHeaders(env.anonKey),
    cache: "no-store",
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
}

function failed(error: unknown): Probe {
  const e = error as { name?: string; cause?: { code?: string } };
  if (e?.name === "TimeoutError" || e?.name === "AbortError") return { ok: false, reason: `no answer within ${TIMEOUT_MS / 1000} s` };
  return { ok: false, reason: `request failed (${e?.cause?.code ?? e?.name ?? "unknown"})` };
}

async function probeAuth(env: BackendEnv): Promise<Probe> {
  try {
    const response = await ask(env, "/auth/v1/health");
    await response.body?.cancel();
    return response.ok ? { ok: true } : { ok: false, reason: `answered ${response.status}` };
  } catch (error) {
    return failed(error);
  }
}

async function probeDatabase(env: BackendEnv): Promise<Probe> {
  try {
    const response = await ask(env, "/rest/v1/plans?select=id&limit=1");
    const body = (await response.json().catch(() => null)) as { code?: unknown } | null;
    if (response.ok || body?.code === PERMISSION_DENIED) return { ok: true };
    const code = typeof body?.code === "string" ? ` (${body.code.slice(0, 20)})` : "";
    return { ok: false, reason: `answered ${response.status}${code}` };
  } catch (error) {
    return failed(error);
  }
}

/** Asks both parts at once. `env` is null when SUPABASE_URL or SUPABASE_ANON_KEY isn't set. */
export async function checkBackend(env: BackendEnv | null): Promise<Health> {
  if (!env) {
    console.error("Backend health check failed: SUPABASE_URL or SUPABASE_ANON_KEY is not set");
    return { ok: false, auth: "not configured", database: "not configured" };
  }
  const [auth, database] = await Promise.all([probeAuth(env), probeDatabase(env)]);
  const reasons = [auth.ok ? null : `auth: ${auth.reason}`, database.ok ? null : `database: ${database.reason}`].filter(Boolean);
  if (reasons.length) console.error(`Backend health check failed: ${reasons.join("; ")}`);
  return { ok: auth.ok && database.ok, auth: auth.ok ? "ok" : "down", database: database.ok ? "ok" : "down" };
}

let running: Promise<Health> | null = null;

/** Like checkBackend, but requests that arrive while a check is running share it. */
export function checkBackendShared(env: BackendEnv | null): Promise<Health> {
  running ??= checkBackend(env).finally(() => {
    running = null;
  });
  return running;
}

export function healthResponse(health: Health) {
  return Response.json(health, {
    status: health.ok ? 200 : 503,
    headers: { "cache-control": "no-store", "x-robots-tag": "noindex" },
  });
}
