import { execSync } from "node:child_process";

// Reads the URL and keys of this project's LOCAL Supabase stack (`npx supabase start`). The admin
// browser tests create users and leads, so they refuse to run against anything that isn't on
// this computer, such as the live project in .env.local.

export type LocalSupabase = { url: string; anonKey: string; serviceRoleKey: string };

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
  return { url, anonKey, serviceRoleKey };
}
