import { afterEach, describe, expect, it, vi } from "vitest";
import { CHECKS, FORCED_FAILURE, failureText, judge, recoveryText, runChecks } from "../scripts/uptime-check.mjs";

// The uptime check of the live site (.github/workflows/uptime.yml). No network: fetch is stubbed.

const PAGES: Record<string, { status: number; body?: string; location?: string }> = {
  "/": { status: 200, body: '<title>VX44 AI Monitoring | AI monitoring for your cameras</title><h1 class="x"><span>See it</span></h1>' },
  "/demo": { status: 200, body: "<title>Book a demo | VX44 AI Monitoring</title>" },
  "/login": { status: 200, body: '<h1 class="mt-8">Sign in</h1>' },
  "/sitemap.xml": { status: 200, body: `<urlset>${"<loc>x</loc>".repeat(12)}</urlset>` },
  "/en": { status: 308, location: "https://www.vx44ai.com/" },
};

function check(path: string) {
  return CHECKS.find((c) => c.path === path)!;
}

const run = { url: "https://github.com/o/r/actions/runs/7", ref: "main", sha: "abcdef1234567", now: new Date("2026-11-18T03:11:00Z") };

afterEach(() => vi.unstubAllGlobals());

describe("uptime check", () => {
  it("passes every page of a working site", () => {
    for (const c of CHECKS) expect(judge(c, { ...PAGES[c.path], ms: 120 }), c.path).toMatchObject({ ok: true, problems: [] });
  });

  it("doesn't count a string that is only in the page's script data", () => {
    // The dictionary text is embedded in the page's scripts even when the heading never rendered.
    const body = '<script>self.__next_f.push([1,"Sign in"])</script><main>Something went wrong</main>';
    expect(judge(check("/login"), { status: 200, body, ms: 90 })).toMatchObject({ ok: false, problems: ['no the <h1> "Sign in"'] });
  });

  it("names a wrong status, a timeout and a missing redirect", () => {
    expect(judge(check("/demo"), { status: 500, body: "", ms: 300 }).problems).toEqual(["answered 500, expected 200"]);
    expect(judge(check("/"), { error: "no answer within 20 s", ms: 20_000 }).problems).toEqual(["no answer within 20 s"]);
    expect(judge(check("/en"), { status: 308, location: "/en/somewhere", ms: 50 }).problems).toEqual(["no a redirect to /"]);
    expect(judge(check("/en"), { status: 308, location: "/", ms: 50 }).ok).toBe(true);
  });

  it("retries a failed page once, and never retries the forced failure", async () => {
    let demoCalls = 0;
    vi.stubGlobal("fetch", async (url: URL) => {
      const path = new URL(url).pathname;
      if (path === "/demo" && ++demoCalls === 1) throw new TypeError("fetch failed", { cause: { code: "ECONNRESET" } });
      const page = PAGES[path] ?? { status: 404, body: "Not found" };
      return new Response(page.body ?? "", { status: page.status, headers: page.location ? { location: page.location } : {} });
    });
    const waits: number[] = [];
    const report = await runChecks("https://site.test", [...CHECKS, FORCED_FAILURE], async (ms: number) => void waits.push(ms));
    expect(report.results.find((r: { path: string }) => r.path === "/demo")).toMatchObject({ ok: true, retried: true });
    expect(report.results.at(-1)).toMatchObject({ path: "/uptime-check-forced-failure", ok: false, forced: true, problems: ["answered 404, expected 200"] });
    expect(waits).toEqual([10_000]);
    expect(report.ok).toBe(false);
  });

  it("writes the issue text: a table of pages, or a note when there's no report", () => {
    const report = {
      base: "https://www.vx44ai.com",
      ok: false,
      results: [
        { path: "/", ok: true, status: 200, ms: 800, problems: [] },
        { path: "/demo", ok: false, status: 500, ms: 1200, problems: ["answered 500, expected 200"], retried: true },
      ],
    };
    const text = failureText(report, run);
    expect(text).toContain("**The live site failed its uptime check** at 2026-11-18 03:11 UTC ([the run](https://github.com/o/r/actions/runs/7)).");
    expect(text).toContain("| `/demo` | 500 | 1.2 s | answered 500, expected 200 (after one retry) |");
    expect(text).toContain("the first check that passes closes it");
    expect(failureText(null, run)).toContain("There's no report, so the check didn't run.");
  });

  it("marks a test of the alert, and writes a closing note when the site is back", () => {
    const forced = { base: "https://www.vx44ai.com", ok: false, results: [{ path: "/uptime-check-forced-failure", ok: false, status: 404, ms: 100, problems: ["answered 404, expected 200"], forced: true }] };
    expect(failureText(forced, { ...run, ref: "feat/uptime-check" })).toMatch(/^\*\*A test of this alert,\*\* run by hand from `feat\/uptime-check`/);
    const back = { base: "https://www.vx44ai.com", ok: true, results: [{ path: "/", ok: true, status: 200, ms: 500, problems: [] }] };
    expect(recoveryText(back, run)).toBe("**The live site passes its uptime check again** at 2026-11-18 03:11 UTC ([the run](https://github.com/o/r/actions/runs/7)): `/`. Closing.\n");
  });
});
