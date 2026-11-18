import { describe, expect, it } from "vitest";
import { alertText, failedTests, oneLine, recoveryText } from "../scripts/smoke-alert.mjs";

// The text of the GitHub issue a failed daily smoke run opens, and of the note that closes it when
// the live site passes again (.github/workflows/prod-smoke.yml).

const run = {
  url: "https://github.com/owner/repo/actions/runs/42",
  ref: "main",
  sha: "0123456789abcdef",
  testAlert: false,
  now: new Date("2026-11-18T05:20:00Z"),
};

function test(status: string, message?: string) {
  return { projectName: "chromium", status, results: [{ status: "failed", error: message ? { message } : undefined, errors: [] }] };
}

const report = {
  errors: [],
  suites: [
    {
      title: "production.spec.ts",
      file: "production.spec.ts",
      line: 0,
      specs: [
        { title: "the home page loads", file: "production.spec.ts", line: 10, tests: [test("expected")] },
        {
          title: "the demo page shows the lead form @launch",
          file: "production.spec.ts",
          line: 92,
          tests: [test("unexpected", "\u001b[31mexpect(locator).toBeVisible() failed\u001b[39m\n\nLocator: getByRole('form')")],
        },
        { title: "the privacy page loads", file: "production.spec.ts", line: 20, tests: [test("flaky", "timeout")] },
      ],
      suites: [
        {
          title: "every language",
          file: "production.spec.ts",
          line: 40,
          specs: [{ title: "/ar has dir=rtl", file: "production.spec.ts", line: 44, tests: [test("unexpected", "Expected `rtl`")] }],
        },
      ],
    },
  ],
};

describe("smoke-failure alert", () => {
  it("lists only the tests that failed on every try, with nested titles", () => {
    expect(failedTests(report)).toEqual([
      { title: "the demo page shows the lead form @launch", where: "production.spec.ts:92", error: "expect(locator).toBeVisible() failed" },
      { title: "every language › /ar has dir=rtl", where: "production.spec.ts:44", error: "Expected 'rtl'" },
    ]);
  });

  it("keeps one plain line of an error", () => {
    expect(oneLine("\n  \u001b[2mfirst\u001b[22m `line`\nsecond")).toBe("first 'line'");
    expect(oneLine("x".repeat(300))).toHaveLength(200);
    expect(oneLine(undefined)).toBe("");
  });

  it("names the failed tests, the run and what to do", () => {
    const text = alertText(report, run);
    expect(text).toContain("**The daily read-only check of the live site failed** on 2026-11-18 ([the run](https://github.com/owner/repo/actions/runs/42)).");
    expect(text).toContain("**2 tests failed**, each on its retry too:");
    expect(text).toContain("- `production.spec.ts:92` the demo page shows the lead form @launch\n  - expect(locator).toBeVisible() failed");
    expect(text).toContain("- `production.spec.ts:44` every language › /ar has dir=rtl");
    expect(text).not.toContain("privacy");
    expect(text).toContain("While this issue is open, each failed daily run adds a comment here, and the next run that passes closes it.");
    expect(text).toContain("Branch `main`, commit `0123456`.");
  });

  it("says so when there's no report, or no test failed", () => {
    expect(alertText(null, run)).toContain("There's no test report, so the run broke before the tests finished.");
    const passed = { errors: [], suites: [{ ...report.suites[0], specs: [report.suites[0].specs[0]], suites: [] }] };
    expect(alertText(passed, run)).toContain("No test failed, so the run broke after the tests.");
  });

  it("lists errors outside any test", () => {
    const text = alertText({ errors: [{ message: "Error: browserType.launch failed\nmore" }], suites: [] }, run);
    expect(text).toContain("**Errors outside any test:**\n- Error: browserType.launch failed");
  });

  it("marks a hand-run test of the alert", () => {
    const text = alertText(null, { ...run, ref: "feat/smoke-failure-issue", testAlert: true });
    expect(text).toMatch(/^\*\*A test of this alert,\*\* run by hand from `feat\/smoke-failure-issue` on 2026-11-18/);
    expect(text).toContain("It failed on purpose.");
  });

  it("writes a closing note when the live site passes again", () => {
    expect(recoveryText(run)).toBe(
      "**The live site passes its smoke test again** on 2026-11-18 ([the run](https://github.com/owner/repo/actions/runs/42)). Closing.\n",
    );
  });
});
