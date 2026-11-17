import { defineConfig, devices } from "@playwright/test";

// Read-only checks of the live site (e2e-prod/), run on demand: npm run test:prod
// They never submit a form, book a time or sign in (see the guard in the spec). PROD_URL points
// them at another deployment, such as a Vercel preview, if needed.
const isCI = Boolean(process.env.CI);

export default defineConfig({
  testDir: "e2e-prod",
  outputDir: "test-results/prod",
  fullyParallel: true,
  // Gentle on the live site: a few pages at a time.
  workers: 4,
  // The internet is in the way, so one retry for a dropped connection.
  retries: 1,
  forbidOnly: isCI,
  // In CI the JSON report feeds the smoke-failure issue (scripts/smoke-alert.mjs).
  reporter: isCI ? [["github"], ["list"], ["json", { outputFile: "test-results/prod-report.json" }]] : "list",
  timeout: 60_000,
  use: {
    baseURL: process.env.PROD_URL ?? "https://www.vx44ai.com",
    locale: "en-US",
    reducedMotion: "reduce",
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], ...(isCI ? {} : { channel: "msedge" }) },
    },
  ],
});
