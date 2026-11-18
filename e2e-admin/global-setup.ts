import { randomBytes } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { localSupabase } from "./local-supabase";
import { seedClient } from "./seed-client";

// Seeds the local stack before the signed-in tests: a fresh admin with no authenticator yet (so
// the test walks the real first-time MFA setup), one new lead whose email never went out (so the
// SEC-258 warning should show), and a client with their own organization for the portal tests
// (seed-client.ts). Re-runnable: it removes what the last run left behind.

export const ADMIN_EMAIL = "e2e-admin@example.com";
export const UNEMAILED_LEAD = "E2E Unemailed Shop";
// The person the admin test invites to the converted client's portal (SEC-271).
export const INVITEE_EMAIL = "e2e-invitee@example.com";

export default async function globalSetup() {
  const { url, serviceRoleKey } = localSupabase();
  const supabase = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // Remove the previous run's admin (and with it, its MFA factor), invitee and test data.
  const { data: users, error: listError } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  if (listError) throw new Error(`Listing users failed: ${listError.message}`);
  for (const user of users.users.filter((u) => u.email === ADMIN_EMAIL || u.email === INVITEE_EMAIL)) {
    const { error } = await supabase.auth.admin.deleteUser(user.id);
    if (error) throw new Error(`Removing an old test user failed: ${error.message}`);
  }
  const { data: oldLeads } = await supabase
    .from("leads")
    .select("id, converted_org_id")
    .eq("business_name", UNEMAILED_LEAD);
  for (const lead of oldLeads ?? []) {
    await supabase.from("leads").delete().eq("id", lead.id);
    if (lead.converted_org_id) await supabase.from("organizations").delete().eq("id", lead.converted_org_id);
  }

  const password = randomBytes(18).toString("base64url");
  const { data: created, error: createError } = await supabase.auth.admin.createUser({
    email: ADMIN_EMAIL,
    password,
    email_confirm: true,
  });
  if (createError || !created.user) throw new Error(`Creating the test admin failed: ${createError?.message}`);

  const { error: roleError } = await supabase.from("profiles").update({ role: "admin" }).eq("id", created.user.id);
  if (roleError) throw new Error(`Making the test user an admin failed: ${roleError.message}`);

  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
  const { error: leadError } = await supabase.from("leads").insert({
    full_name: "Test Visitor",
    business_name: UNEMAILED_LEAD,
    email: "visitor@example.com",
    phone: "+1 555 0100",
    city: "Austin",
    state: "TX",
    camera_count_estimate: 8,
    dvr_brand: "Hikvision",
    knows_dvr_password: "yes",
    created_at: tenMinutesAgo,
    notified_at: null,
  });
  if (leadError) throw new Error(`Seeding the test lead failed: ${leadError.message}`);

  // The client for the portal tests (SEC-275).
  const client = await seedClient(supabase);

  // Workers start after global setup, so they inherit these.
  process.env.E2E_ADMIN_PASSWORD = password;
  process.env.E2E_CLIENT_PASSWORD = client.password;
  process.env.E2E_OTHER_DOCUMENT_ID = client.otherDocumentId;
}
