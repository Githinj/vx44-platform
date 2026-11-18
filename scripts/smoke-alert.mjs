// Writes the text of the GitHub issue (or comment) for a failed run of the production smoke test,
// .github/workflows/prod-smoke.yml, from Playwright's JSON report, or the note that closes it when
// a run passes. scripts/alert-issue.sh opens, updates or closes the issue. No dependencies.
//
//   node scripts/smoke-alert.mjs <report.json> <out.md>
//   node scripts/smoke-alert.mjs --passed <out.md>
//
// The run's details come from the environment: RUN_URL, REF_NAME, SHA, and TEST_ALERT ("true"
// for a hand run that fails on purpose to test this alert). A missing or unreadable report means
// the run broke before the tests finished; the text says so.
import { readFileSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

const ANSI = /\u001b\[[0-9;]*[A-Za-z]/g;
const MAX = 200;

/** The first non-empty line, without colour codes or backticks, at most 200 characters. */
export function oneLine(text) {
  const line =
    String(text ?? "")
      .replace(ANSI, "")
      .split("\n")
      .map((part) => part.trim())
      .find(Boolean) ?? "";
  const plain = line.replaceAll("`", "'");
  return plain.length > MAX ? `${plain.slice(0, MAX - 1)}…` : plain;
}

/**
 * The tests that failed on every try (Playwright's "unexpected"), in report order. A flaky test
 * passed on its retry, so it doesn't count.
 */
export function failedTests(report) {
  const failed = [];
  const walk = (suite, titles) => {
    for (const spec of suite.specs ?? []) {
      for (const test of spec.tests ?? []) {
        if (test.status !== "unexpected") continue;
        const last = test.results?.at(-1);
        failed.push({
          title: [...titles, spec.title].join(" › "),
          where: `${spec.file}:${spec.line}`,
          error: oneLine(last?.error?.message ?? last?.errors?.[0]?.message),
        });
      }
    }
    for (const child of suite.suites ?? []) walk(child, [...titles, child.title]);
  };
  // The top level is one suite per file, titled with the file name, which `where` already gives.
  for (const file of report?.suites ?? []) walk(file, []);
  return failed;
}

/** The issue or comment text. `report` is null when the run wrote none. */
export function alertText(report, run) {
  const date = run.now.toISOString().slice(0, 10);
  const lines = [];
  if (run.testAlert) {
    lines.push(
      `**A test of this alert,** run by hand from \`${oneLine(run.ref)}\` on ${date} ([the run](${run.url})). It failed on purpose. Any tests listed below really failed.`,
    );
  } else {
    lines.push(`**The daily read-only check of the live site failed** on ${date} ([the run](${run.url})).`);
  }
  lines.push("");

  if (!report) {
    lines.push("There's no test report, so the run broke before the tests finished. The run's log says where.");
  } else {
    const failed = failedTests(report);
    const outside = (report.errors ?? []).map((error) => oneLine(error.message)).filter(Boolean);
    if (failed.length > 0) {
      lines.push(`**${failed.length === 1 ? "1 test" : `${failed.length} tests`} failed**, each on its retry too:`);
      for (const test of failed) {
        lines.push(`- \`${oneLine(test.where)}\` ${oneLine(test.title)}`);
        if (test.error) lines.push(`  - ${test.error}`);
      }
    }
    if (outside.length > 0) {
      if (failed.length > 0) lines.push("");
      lines.push("**Errors outside any test:**");
      for (const error of outside) lines.push(`- ${error}`);
    }
    if (failed.length === 0 && outside.length === 0) {
      lines.push("No test failed, so the run broke after the tests. The run's log says where.");
    }
  }

  lines.push(
    "",
    "**Next:**",
    "- Open the run for its log. Its `production-smoke-results` artifact has the screenshots and traces, kept 7 days.",
    "- While this issue is open, each failed daily run adds a comment here, and the next run that passes closes it.",
    "",
    `Branch \`${oneLine(run.ref)}\`, commit \`${oneLine(run.sha).slice(0, 7)}\`.`,
  );
  return `${lines.join("\n")}\n`;
}

/** The closing comment for a run that passed. */
export function recoveryText(run) {
  const date = run.now.toISOString().slice(0, 10);
  return `**The live site passes its smoke test again** on ${date} ([the run](${run.url})). Closing.\n`;
}

function readReport(path) {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return null;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [reportPath, outPath] = process.argv.slice(2);
  if (!reportPath || !outPath) {
    console.error("usage: node scripts/smoke-alert.mjs <report.json> <out.md> | --passed <out.md>");
    process.exit(2);
  }
  const run = {
    url: process.env.RUN_URL ?? "",
    ref: process.env.REF_NAME ?? "",
    sha: process.env.SHA ?? "",
    testAlert: process.env.TEST_ALERT === "true",
    now: new Date(),
  };
  const text = reportPath === "--passed" ? recoveryText(run) : alertText(readReport(reportPath), run);
  writeFileSync(outPath, text);
  console.log(text);
}
