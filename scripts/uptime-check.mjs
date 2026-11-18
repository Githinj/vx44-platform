// A plain HTTP check of the live site, for .github/workflows/uptime.yml (every 30 minutes, between
// the daily smoke tests). For each page: the status code, a timeout, and one thing only a working
// server render produces. Then /api/health, which asks whether Supabase's sign-in service and
// database answer, since none of the pages touch Supabase. No browser and no dependencies. GET
// requests only.
//
//   node scripts/uptime-check.mjs check <report.json>        runs the checks, exits 1 on a failure
//   node scripts/uptime-check.mjs text <report.json> <out.md> writes the issue text (failure or recovery)
//
// The environment can set UPTIME_URL (default https://www.vx44ai.com) and FORCE_FAIL=true (adds a
// check that is meant to fail, to test the alert). The text also reads RUN_URL, REF_NAME and SHA.
// Expected strings are matched inside real tags (<title>, <h1>), not anywhere in the HTML: a page
// embeds every dictionary string in its script data, so a bare text search would pass on a page
// that never rendered.
import { readFileSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

const TIMEOUT_MS = 20_000;
const RETRY_AFTER_MS = 10_000;

function json(body) {
  try {
    return JSON.parse(body);
  } catch {
    return null;
  }
}

// /api/health's reply names each part of the backend (src/lib/health.ts). Only its known words go
// into the issue, which is public.
const BACKEND_PARTS = { auth: "the sign-in service", database: "the database" };
const PART_STATES = { down: "is down", "not configured": "is not configured" };

function backendProblems(response) {
  const reply = json(response.body);
  if (!reply || typeof reply !== "object") return [];
  return Object.entries(BACKEND_PARTS)
    .filter(([key]) => key in reply && reply[key] !== "ok")
    .map(([key, name]) => `${name} ${Object.hasOwn(PART_STATES, reply[key]) ? PART_STATES[reply[key]] : "gave an unexpected answer"}`);
}

/** Each check: the path, the status it must answer with, and what else must be true. */
export const CHECKS = [
  {
    path: "/",
    status: 200,
    expect: [
      { what: "a <title> naming VX44 AI Monitoring", test: (r) => /<title>[^<]*VX44 AI Monitoring[^<]*<\/title>/.test(r.body) },
      { what: "a rendered <h1>", test: (r) => /<h1[\s>]/.test(r.body) },
    ],
  },
  {
    path: "/demo",
    status: 200,
    expect: [{ what: "a <title> about the demo", test: (r) => /<title>[^<]*demo[^<]*<\/title>/i.test(r.body) }],
  },
  {
    path: "/login",
    status: 200,
    expect: [{ what: "the <h1> \"Sign in\"", test: (r) => /<h1[^>]*>Sign in</.test(r.body) }],
  },
  {
    path: "/sitemap.xml",
    status: 200,
    expect: [
      { what: "a <urlset>", test: (r) => r.body.includes("<urlset") },
      { what: "at least 10 <loc> entries", test: (r) => (r.body.match(/<loc>/g) ?? []).length >= 10 },
    ],
  },
  {
    // English has no prefix: /en must send visitors to /.
    path: "/en",
    status: 308,
    expect: [{ what: "a redirect to /", test: (r) => /^(https?:\/\/[^/]+)?\/$/.test(r.location ?? "") }],
  },
  {
    // Whether Supabase's sign-in service and database answer: 200, or 503 naming the part that's down.
    path: "/api/health",
    status: 200,
    expect: [{ what: 'a JSON reply with "ok": true', test: (r) => json(r.body)?.ok === true }],
    explain: backendProblems,
  },
];

/** A check that always fails (a page that doesn't exist must answer 200), for testing the alert. */
export const FORCED_FAILURE = {
  path: "/uptime-check-forced-failure",
  status: 200,
  forced: true,
  expect: [],
};

/** Judges one response against its check. `response` is { status, location, body, ms } or { error, ms }. */
export function judge(check, response) {
  const problems = [];
  if (response.error) {
    problems.push(response.error);
  } else {
    if (response.status !== check.status) problems.push(`answered ${response.status}, expected ${check.status}`);
    else for (const item of check.expect) if (!item.test(response)) problems.push(`no ${item.what}`);
    if (problems.length && check.explain) problems.push(...check.explain(response));
  }
  return {
    path: check.path,
    ok: problems.length === 0,
    status: response.status ?? null,
    ms: response.ms,
    problems,
    ...(check.forced ? { forced: true } : {}),
  };
}

async function fetchOnce(base, path) {
  const started = Date.now();
  try {
    const res = await fetch(new URL(path, base), {
      redirect: "manual",
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: { "user-agent": "vx44-uptime-check (GitHub Actions)" },
    });
    const body = await res.text();
    return { status: res.status, location: res.headers.get("location"), body, ms: Date.now() - started };
  } catch (error) {
    const timedOut = error?.name === "TimeoutError" || error?.name === "AbortError";
    const reason = timedOut ? `no answer within ${TIMEOUT_MS / 1000} s` : `request failed: ${error?.cause?.code ?? error?.message ?? error}`;
    return { error: reason, ms: Date.now() - started };
  }
}

/** Runs every check, retrying a failed one once after 10 s, so a single dropped request doesn't alert. */
export async function runChecks(base, checks, wait = (ms) => new Promise((r) => setTimeout(r, ms))) {
  const results = [];
  for (const check of checks) {
    let result = judge(check, await fetchOnce(base, check.path));
    if (!result.ok && !check.forced) {
      await wait(RETRY_AFTER_MS);
      result = judge(check, await fetchOnce(base, check.path));
      result.retried = true;
    }
    results.push(result);
  }
  return { base, checkedAt: new Date().toISOString(), ok: results.every((r) => r.ok), results };
}

function plain(text) {
  return String(text ?? "").replaceAll("`", "'").slice(0, 200);
}

/** The issue text for a failed run. `report` is null when the run wrote none. */
export function failureText(report, run) {
  const lines = [];
  const date = run.now.toISOString().slice(0, 16).replace("T", " ");
  const forced = report?.results.some((r) => r.forced);
  lines.push(
    forced
      ? `**A test of this alert,** run by hand from \`${plain(run.ref)}\` at ${date} UTC ([the run](${run.url})). It failed on purpose. Anything else listed below really failed.`
      : `**The live site failed its uptime check** at ${date} UTC ([the run](${run.url})).`,
    "",
  );
  if (!report) {
    lines.push("There's no report, so the check didn't run. The run's log says why.");
  } else {
    lines.push("| Page | Status | Time | Problem |", "| -- | -- | -- | -- |");
    for (const r of report.results) {
      const problem = r.ok ? "fine" : r.problems.map(plain).join("; ");
      lines.push(`| \`${plain(r.path)}\` | ${r.status ?? "none"} | ${(r.ms / 1000).toFixed(1)} s | ${problem}${r.retried ? " (after one retry)" : ""} |`);
    }
  }
  if (report?.results.some((r) => r.path === "/api/health" && !r.ok)) {
    lines.push(
      "",
      "**`/api/health` failed,** so sign-in may not work: the site couldn't confirm that Supabase answers. Check Supabase's status page and the project's dashboard (is the project paused?). The Vercel logs give the reason, under \"Backend health check failed\".",
    );
  }
  lines.push(
    "",
    "**Next:** open the site, and check Vercel's deployments and status page. While this issue is open, each failed check (every 30 minutes) adds a comment here, and the first check that passes closes it.",
    "",
    `Checked \`${plain(report?.base ?? "the live site")}\` from branch \`${plain(run.ref)}\`, commit \`${plain(run.sha).slice(0, 7)}\`.`,
  );
  return `${lines.join("\n")}\n`;
}

/** The closing comment for a run that passed. */
export function recoveryText(report, run) {
  const date = run.now.toISOString().slice(0, 16).replace("T", " ");
  const pages = report.results.map((r) => `\`${plain(r.path)}\``).join(", ");
  return `**The live site passes its uptime check again** at ${date} UTC ([the run](${run.url})): ${pages}. Closing.\n`;
}

function readReport(path) {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return null;
  }
}

async function main() {
  const [command, reportPath, outPath] = process.argv.slice(2);
  if (command === "check" && reportPath) {
    const checks = process.env.FORCE_FAIL === "true" ? [...CHECKS, FORCED_FAILURE] : CHECKS;
    const report = await runChecks(process.env.UPTIME_URL || "https://www.vx44ai.com", checks);
    writeFileSync(reportPath, JSON.stringify(report, null, 2));
    for (const r of report.results) {
      console.log(`${r.ok ? "ok  " : "FAIL"} ${r.path} ${r.status ?? "-"} ${r.ms} ms ${r.problems.join("; ")}`);
    }
    process.exit(report.ok ? 0 : 1);
  }
  if (command === "text" && reportPath && outPath) {
    const report = readReport(reportPath);
    const run = {
      url: process.env.RUN_URL ?? "",
      ref: process.env.REF_NAME ?? "",
      sha: process.env.SHA ?? "",
      now: new Date(),
    };
    const text = report?.ok ? recoveryText(report, run) : failureText(report, run);
    writeFileSync(outPath, text);
    console.log(text);
    return;
  }
  console.error("usage: node scripts/uptime-check.mjs check <report.json> | text <report.json> <out.md>");
  process.exit(2);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main();
