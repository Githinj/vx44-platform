// Creates an admin account, or promotes an existing user. Prints a one-time password for a new
// account: store it in a password manager. Run with: npm run create-admin -- person@example.com
// Admins can only be created here, using the service role. Nothing in the app can do it.
import { randomBytes } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

const email = process.argv[2];
const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;

if (!email || !email.includes("@")) {
  console.error("Usage: npm run create-admin -- person@example.com");
  process.exit(1);
}
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const password = randomBytes(24).toString("base64url");
const { data: created, error: createError } = await supabase.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
});

let userId = created?.user?.id;
if (createError) {
  if (createError.code !== "email_exists") {
    console.error(`Could not create the account: ${createError.message}`);
    process.exit(1);
  }
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", email)
    .single();
  if (error) {
    console.error(`Could not find the existing account: ${error.message}`);
    process.exit(1);
  }
  userId = profile.id;
}

const { error: roleError } = await supabase.from("profiles").update({ role: "admin" }).eq("id", userId);
if (roleError) {
  console.error(`Could not set the admin role: ${roleError.message}`);
  process.exit(1);
}

console.log(`${email} is now an admin.`);
if (!createError) console.log(`One-time password (shown only here): ${password}`);
