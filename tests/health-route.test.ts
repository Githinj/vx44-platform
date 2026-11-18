import { createClient } from "@supabase/supabase-js";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// GET /api/health: does Supabase answer for sign-in and for the database? No network: fetch is
// stubbed with the answers Supabase gives. e2e-admin/health.spec.ts checks the same route against a
// real local Supabase stack.
vi.mock("next/server", () => ({ connection: async () => {} }));

import { GET } from "@/app/api/health/route";

type Answer = { status: number; body?: unknown } | Error;

const url = "https://example-ref.supabase.co";
const anonKey = "anon-key-value";

let authAnswer: Answer;
let databaseAnswer: Answer;
let fetchMock: ReturnType<typeof vi.fn>;
let logged: ReturnType<typeof vi.spyOn>;

function answer(a: Answer) {
  if (a instanceof Error) return Promise.reject(a);
  return Promise.resolve(new Response(a.body === undefined ? null : JSON.stringify(a.body), { status: a.status }));
}

// What Supabase's database API says when the anon role asks for a table it may not read.
const permissionDenied = { status: 401, body: { code: "42501", details: null, hint: null, message: "permission denied for table plans" } };

beforeEach(() => {
  vi.stubEnv("SUPABASE_URL", url);
  vi.stubEnv("SUPABASE_ANON_KEY", anonKey);
  authAnswer = { status: 200, body: { version: "v2", name: "GoTrue", description: "GoTrue is a user registration and authentication API" } };
  databaseAnswer = permissionDenied;
  fetchMock = vi.fn((input: string | URL) => {
    const path = new URL(String(input)).pathname;
    if (path === "/auth/v1/health") return answer(authAnswer);
    if (path === "/rest/v1/plans") return answer(databaseAnswer);
    return Promise.resolve(new Response(null, { status: 404 }));
  });
  vi.stubGlobal("fetch", fetchMock);
  logged = vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

async function check() {
  const response = await GET();
  const text = await response.text();
  return { status: response.status, headers: response.headers, body: JSON.parse(text), text };
}

describe("GET /api/health", () => {
  it("answers 200 when the sign-in service and the database both answer", async () => {
    const { status, body } = await check();
    expect(status).toBe(200);
    expect(body).toEqual({ ok: true, auth: "ok", database: "ok" });
    expect(logged).not.toHaveBeenCalled();
  });

  it("is never cached or indexed", async () => {
    const { headers } = await check();
    expect(headers.get("cache-control")).toBe("no-store");
    expect(headers.get("x-robots-tag")).toBe("noindex");
  });

  it("asks the project's own Supabase with the public anon key, GET only, each with a time limit", async () => {
    await check();
    expect(fetchMock).toHaveBeenCalledTimes(2);
    for (const [input, init] of fetchMock.mock.calls) {
      expect(new URL(String(input)).origin).toBe(url);
      expect(init?.method ?? "GET").toBe("GET");
      expect(new Headers(init?.headers).get("apikey")).toBe(anonKey);
      expect(init?.signal).toBeInstanceOf(AbortSignal);
    }
  });

  // If sign-in reaches Supabase, the health check's requests must too: so they carry the key exactly
  // as the app's own Supabase client sends it, checked against the installed client for both kinds
  // of key (a legacy anon JWT and a newer publishable key). Any change in how supabase-js sends keys
  // fails this test instead of showing up on production.
  it.each([
    ["a legacy anon key (JWT)", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiJ9.signature"],
    ["a publishable key", "sb_publishable_example0123456789"],
  ])("sends %s the way the app's Supabase client does", async (_kind, key) => {
    vi.stubEnv("SUPABASE_ANON_KEY", key);
    await check();
    const sent = (path: string) => {
      const call = fetchMock.mock.calls.find(([input]) => new URL(String(input)).pathname === path);
      return new Headers(call?.[1]?.headers);
    };
    const probeAuth = sent("/auth/v1/health");
    const probeDatabase = sent("/rest/v1/plans");
    fetchMock.mockClear();

    const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
    // The sign-in client's headers for every auth request (supabase-js passes them to auth-js).
    const clientAuth = new Headers((client.auth as unknown as { headers: Record<string, string> }).headers);
    // A real database query through the client, as the app's pages make them.
    await client.from("plans").select("id").limit(1);
    const clientDatabase = sent("/rest/v1/plans");

    for (const name of ["apikey", "authorization"]) {
      expect(probeAuth.get(name), `auth ${name}`).toBe(clientAuth.get(name));
      expect(probeDatabase.get(name), `database ${name}`).toBe(clientDatabase.get(name));
    }
    expect(probeDatabase.get("apikey")).toBe(key);
  });

  it("counts the database as answering when anon may read the table", async () => {
    databaseAnswer = { status: 200, body: [] };
    expect((await check()).body).toEqual({ ok: true, auth: "ok", database: "ok" });
  });

  it("is down when Supabase refuses the key, before the database is asked", async () => {
    // The answer hosted Supabase's gateway gives a wrong key. The local stack checks no keys (on
    // 2026-11-18 a made-up key got 200 and 42501 there), so this one isn't confirmed locally.
    authAnswer = { status: 401, body: { message: "Invalid API key" } };
    databaseAnswer = { status: 401, body: { message: "Invalid API key" } };
    const { status, body } = await check();
    expect(status).toBe(503);
    expect(body).toEqual({ ok: false, auth: "down", database: "down" });
  });

  it("is down when the database doesn't answer, even though the API does", async () => {
    // PostgREST's answer when it can't reach Postgres.
    databaseAnswer = { status: 503, body: { code: "PGRST001", message: "Database client error. Retrying the connection." } };
    const { status, body } = await check();
    expect(status).toBe(503);
    expect(body).toEqual({ ok: false, auth: "ok", database: "down" });
  });

  it("doesn't count any other refusal as the database answering", async () => {
    for (const refusal of [
      { status: 404, body: { code: "PGRST205", message: "Could not find the table" } },
      { status: 429, body: { message: "Too many requests" } },
      { status: 401, body: { code: "PGRST301", message: "JWT expired" } },
      { status: 540, body: undefined },
    ]) {
      databaseAnswer = refusal;
      expect((await check()).body.database, `${refusal.status}`).toBe("down");
    }
  });

  it("is down when the sign-in service fails, times out or can't be reached", async () => {
    for (const failure of [
      { status: 503, body: { message: "upstream" } },
      Object.assign(new Error("The operation was aborted due to timeout"), { name: "TimeoutError" }),
      new TypeError("fetch failed", { cause: { code: "ENOTFOUND" } }),
    ]) {
      authAnswer = failure;
      const { status, body } = await check();
      expect(status).toBe(503);
      expect(body).toEqual({ ok: false, auth: "down", database: "ok" });
    }
  });

  it("says not configured, and asks nothing, without the Supabase settings", async () => {
    vi.stubEnv("SUPABASE_ANON_KEY", "");
    const { status, body } = await check();
    expect(status).toBe(503);
    expect(body).toEqual({ ok: false, auth: "not configured", database: "not configured" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("never puts Supabase's own words, its address or the key in the reply", async () => {
    // The uptime check copies the reply into a public GitHub issue, and the address names the project.
    authAnswer = { status: 500, body: { message: "secret upstream detail" } };
    databaseAnswer = { status: 503, body: { code: "PGRST001", message: "Database client error" } };
    const { text } = await check();
    for (const leak of ["example-ref", "supabase.co", anonKey, "secret upstream detail", "PGRST001", "Database client error"]) {
      expect(text).not.toContain(leak);
    }
  });

  it("writes why it failed to the server log, without the address or the key", async () => {
    authAnswer = new TypeError("fetch failed", { cause: { code: "ECONNREFUSED" } });
    databaseAnswer = { status: 503, body: { code: "PGRST001", message: "Database client error" } };
    await check();
    expect(logged).toHaveBeenCalledTimes(1);
    const line = logged.mock.calls[0].join(" ");
    expect(line).toContain("Backend health check failed");
    expect(line).toContain("auth: request failed (ECONNREFUSED)");
    expect(line).toContain("database: answered 503 (PGRST001)");
    expect(line).not.toContain("example-ref");
    expect(line).not.toContain(anonKey);
  });

  it("lets requests that arrive together share one check", async () => {
    // Anyone can call this, so a burst of requests shouldn't become a burst of calls to Supabase.
    const answers = await Promise.all([GET(), GET(), GET()]);
    expect(answers.map((r) => r.status)).toEqual([200, 200, 200]);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    // A later request checks again.
    await GET();
    expect(fetchMock).toHaveBeenCalledTimes(4);
  });
});
