import { expect, test } from "@playwright/test";

// GET /api/health against a real Supabase stack (the local one, with this repo's migrations), so the
// answers tests/health-route.test.ts stubs are the ones Supabase really gives: its sign-in service's
// health endpoint, and "permission denied" when the anon role asks for public.plans.
test("the backend health check finds the sign-in service and the database answering", async ({ request }) => {
  const response = await request.get("/api/health");
  expect(response.status()).toBe(200);
  expect(response.headers()["cache-control"]).toBe("no-store");
  expect(await response.json()).toEqual({ ok: true, auth: "ok", database: "ok" });
});
