import { execSync } from "node:child_process";

// Reads the URL and keys of this project's LOCAL Supabase stack (`npx supabase start`). The admin
// browser tests create users and leads, so they refuse to run against anything that isn't on
// this computer, such as the live project in .env.local.

/** mailUrl is the local mail catcher (Mailpit), when the stack was started with it. */
export type LocalSupabase = { url: string; anonKey: string; serviceRoleKey: string; mailUrl?: string };

export function localSupabase(): LocalSupabase {
  let output: string;
  try {
    // CI installs the CLI as `supabase`; locally it runs through npx.
    const cli = process.env.SUPABASE_BIN ?? "npx supabase";
    output = execSync(`${cli} status -o env`, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  } catch {
    throw new Error("The local Supabase stack isn't running. Start it with: npx supabase start");
  }
  const vars = Object.fromEntries(
    output
      .split(/\r?\n/)
      .map((line) => line.match(/^([A-Z_]+)="?(.*?)"?$/))
      .filter((m): m is RegExpMatchArray => m !== null)
      .map((m) => [m[1], m[2]]),
  );
  const url = vars.API_URL;
  const anonKey = vars.ANON_KEY ?? vars.PUBLISHABLE_KEY;
  const serviceRoleKey = vars.SERVICE_ROLE_KEY ?? vars.SECRET_KEY;
  if (!url || !anonKey || !serviceRoleKey) {
    throw new Error(`Unexpected "supabase status" output; found: ${Object.keys(vars).join(", ")}`);
  }
  const host = new URL(url).hostname;
  if (host !== "127.0.0.1" && host !== "localhost") {
    throw new Error(`Refusing to run admin tests against ${host}: only a local Supabase stack is allowed.`);
  }
  return { url, anonKey, serviceRoleKey, mailUrl: vars.MAILPIT_URL ?? vars.INBUCKET_URL };
}

/**
 * Makes every session of this local test user look as if it began two days ago, so Supabase's
 * secure password change treats it as not recently signed in (its window is a fixed 24 hours).
 * Goes straight to the local stack's database container, which "supabase start" names after the
 * project_id in supabase/config.toml.
 */
export function ageSessions(email: string) {
  localSupabase(); // refuses anything but a local stack
  if (!/^e2e-[a-z-]+@example\.com$/.test(email)) throw new Error(`Not a test address: ${email}`);
  const container = process.env.SUPABASE_DB_CONTAINER ?? "supabase_db_Vx44_platform";
  const sql = `update auth.sessions set created_at = now() - interval '2 days' where user_id = (select id from auth.users where email = '${email}')`;
  const output = execSync(`docker exec ${container} psql -U postgres -d postgres -v ON_ERROR_STOP=1 -c "${sql}"`, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  if (!/^UPDATE [1-9]/m.test(output)) throw new Error(`No session to age for ${email}: ${output.trim()}`);
}
