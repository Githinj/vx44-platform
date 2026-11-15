import { defineConfig, devices } from "@playwright/test";
import { localSupabase } from "./e2e-admin/local-supabase";

// Signed-in back-office tests (SEC-269). They need this project's local Supabase stack and a
// production build:
//   npx supabase start
//   npm run build
//   npm run test:e2e:admin
// Kept apart from playwright.config.ts on purpose: these tests create an admin and test data, so
// they only ever start the app against the local stack (checked in local-supabase.ts), on their
// own port, never reusing a server that might be pointed at the live project.
const port = 3201;
const isCI = Boolean(process.env.CI);
const supabase = localSupabase();

export default defineConfig({
  testDir: "e2e-admin",
  outputDir: "test-results/admin",
  globalSetup: "./e2e-admin/global-setup.ts",
  // One admin account and one MFA enrolment: run in order.
  workers: 1,
  fullyParallel: false,
  forbidOnly: isCI,
  retries: 0,
  reporter: isCI ? [["github"], ["list"]] : "list",
  timeout: 90_000,
  // Signed-in pages fetch their data after the first paint, and every check waits on a real
  // database. On a busy machine that has run past the 5-second default.
  expect: { timeout: 15_000 },
  use: {
    baseURL: `http://localhost:${port}`,
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
    reuseExistingServer: false,
    timeout: 120_000,
    // Real environment variables win over .env.local, so the app talks to the local stack.
    env: {
      SUPABASE_URL: supabase.url,
      SUPABASE_ANON_KEY: supabase.anonKey,
      SUPABASE_SERVICE_ROLE_KEY: supabase.serviceRoleKey,
      SITE_URL: `http://localhost:${port}`,
    },
  },
});
