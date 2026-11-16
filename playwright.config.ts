import { defineConfig, devices } from "@playwright/test";

// Browser tests (SEC-267). They run against a production build, so build first:
//   npm run build && npm run test:e2e
// CI builds with Cloudflare's public Turnstile test key, which always passes.
//
// Locally they drive the installed Microsoft Edge: Windows Smart App Control blocks Playwright's
// own unsigned Chromium on this team's PCs. CI uses Playwright's Chromium.
//
// Several worktrees can run these tests at once, so a server already on the port may be another
// worktree's build. Playwright starts its own server and fails if the port is taken, rather than
// silently testing someone else's code. Pick a free port with E2E_PORT, or set
// E2E_REUSE_SERVER=1 to deliberately reuse a server you started yourself.
const port = Number(process.env.E2E_PORT ?? 3200);
const isCI = Boolean(process.env.CI);
const reuseServer = !isCI && process.env.E2E_REUSE_SERVER === "1";

export default defineConfig({
  testDir: "e2e",
  outputDir: "test-results",
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  reporter: isCI ? [["github"], ["list"]] : "list",
  use: {
    baseURL: `http://localhost:${port}`,
    // A fixed language and still motion: the homepage redirects by browser language, and the
    // fade-in animations would otherwise leave text half-transparent when axe measures contrast.
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
  webServer: {
    command: `npx next start -p ${port}`,
    url: `http://localhost:${port}/login`,
    reuseExistingServer: reuseServer,
    timeout: 120_000,
  },
});
