import { randomBytes } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";

// Seeds a client for the portal tests (SEC-275), on the local stack only (global-setup.ts checks
// that). The client belongs to one organization with two sites (one with a camera link, one
// without), a subscription with a payment link and a signed agreement. A second organization,
// which the client must never see, has its own site and document. Re-runnable: the previous
// run's client and organizations are removed first.

export const CLIENT_EMAIL = "e2e-client@example.com";
// A second person at the same business, who turns on two-step verification (SEC-276). Kept apart
// from CLIENT_EMAIL, whose password another test changes.
export const MFA_CLIENT_EMAIL = "e2e-mfa-client@example.com";
export const CLIENT_ORG = "E2E Client Org";
export const OTHER_ORG = "E2E Other Org";
export const SITE_WITH_CAMERAS = "E2E Front Door";
export const SITE_WITHOUT_CAMERAS = "E2E Back Office";
export const OTHER_SITE = "E2E Other Warehouse";
export const CAMERA_URL = "https://view.example.com/e2e-front-door";
export const PAYMENT_URL = "https://pay.example.com/e2e-invoice";
export const CLIENT_DOCUMENT = "E2E Signed Agreement";
export const OTHER_DOCUMENT = "E2E Other Agreement";

// The smallest file the documents bucket accepts as a PDF.
const PDF = Buffer.from("%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF\n");

type Result<T> = { data: T | null; error: { message: string } | null };

/** Throws if the call failed. For writes that return nothing. */
function check(result: Result<unknown>, what: string): void {
  if (result.error) throw new Error(`${what} failed: ${result.error.message}`);
}

/** Throws if the call failed or returned nothing; otherwise its data. */
function value<T>(result: Result<T>, what: string): NonNullable<T> {
  check(result, what);
  if (result.data === null || result.data === undefined) throw new Error(`${what} returned nothing`);
  return result.data;
}

async function removePrevious(supabase: SupabaseClient) {
  const { data: users } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  for (const user of users?.users.filter((u) => u.email === CLIENT_EMAIL || u.email === MFA_CLIENT_EMAIL) ?? []) {
    check(await supabase.auth.admin.deleteUser(user.id), "Removing an old test client");
  }

  const orgs = value(
    await supabase.from("organizations").select("id").in("name", [CLIENT_ORG, OTHER_ORG]),
    "Finding old test organizations",
  );
  const orgIds = orgs.map((org) => org.id as string);
  if (orgIds.length === 0) return;

  const documents = value(
    await supabase.from("documents").select("storage_path").in("org_id", orgIds),
    "Finding old test documents",
  );
  const paths = documents.map((document) => document.storage_path as string);
  if (paths.length > 0) await supabase.storage.from("documents").remove(paths);

  // Children first: these tables refuse to drop an organization (or a site) that still has rows.
  // The admin test records a reconciliation against a seeded site.
  const sites = value(await supabase.from("sites").select("id").in("org_id", orgIds), "Finding old test sites");
  if (sites.length > 0) {
    check(
      await supabase.from("reconciliations").delete().in("site_id", sites.map((site) => site.id as string)),
      "Removing old reconciliations",
    );
  }
  for (const table of ["documents", "subscriptions", "sites"]) {
    check(await supabase.from(table).delete().in("org_id", orgIds), `Removing old ${table}`);
  }
  check(await supabase.from("organizations").delete().in("id", orgIds), "Removing old organizations");
}

async function addDocument(supabase: SupabaseClient, orgId: string, title: string) {
  const path = `${orgId}/${randomBytes(6).toString("hex")}.pdf`;
  check(
    await supabase.storage.from("documents").upload(path, PDF, { contentType: "application/pdf" }),
    `Uploading ${title}`,
  );
  const document = value<{ id: string }>(
    await supabase.from("documents").insert({ org_id: orgId, title, storage_path: path }).select("id").single(),
    `Adding ${title}`,
  );
  return document.id;
}

export async function seedClient(supabase: SupabaseClient) {
  await removePrevious(supabase);

  const password = randomBytes(18).toString("base64url");
  const created = await supabase.auth.admin.createUser({
    email: CLIENT_EMAIL,
    password,
    email_confirm: true,
    user_metadata: { full_name: "E2E Client" },
  });
  if (created.error || !created.data.user) {
    throw new Error(`Creating the test client failed: ${created.error?.message}`);
  }
  const userId = created.data.user.id;

  const [clientOrg, otherOrg] = value(
    await supabase
      .from("organizations")
      .insert([
        { name: CLIENT_ORG, status: "approved", city: "Austin", state: "TX" },
        { name: OTHER_ORG, status: "active", city: "Dallas", state: "TX" },
      ])
      .select("id, name"),
    "Adding test organizations",
  ).sort((a, b) => (a.name === CLIENT_ORG ? -1 : b.name === CLIENT_ORG ? 1 : 0));

  const mfaCreated = await supabase.auth.admin.createUser({
    email: MFA_CLIENT_EMAIL,
    password,
    email_confirm: true,
    user_metadata: { full_name: "E2E MFA Client" },
  });
  if (mfaCreated.error || !mfaCreated.data.user) {
    throw new Error(`Creating the MFA test client failed: ${mfaCreated.error?.message}`);
  }

  check(
    await supabase.from("memberships").insert([
      { user_id: userId, org_id: clientOrg.id, role: "owner" },
      { user_id: mfaCreated.data.user.id, org_id: clientOrg.id, role: "viewer" },
    ]),
    "Linking the clients to their organization",
  );

  check(
    await supabase.from("sites").insert([
      { org_id: clientOrg.id, name: SITE_WITH_CAMERAS, camera_count: 4, status: "online", camera_access_url: CAMERA_URL },
      { org_id: clientOrg.id, name: SITE_WITHOUT_CAMERAS, camera_count: 2, status: "pending" },
      { org_id: otherOrg.id, name: OTHER_SITE, camera_count: 9, status: "online", camera_access_url: CAMERA_URL },
    ]),
    "Adding test sites",
  );

  const plan = value<{ id: string }>(
    await supabase
      .from("plans")
      .upsert(
        { name: "Essentials", price_per_camera_month: 10, provider_cost_per_camera_month: 4, active: true },
        { onConflict: "name" },
      )
      .select("id")
      .single(),
    "Adding a test plan",
  );
  check(
    await supabase.from("subscriptions").insert({
      org_id: clientOrg.id,
      plan_id: plan.id,
      cameras_billed: 6,
      status: "active",
      billing_method: "payment_link",
      payment_ref: PAYMENT_URL,
      renews_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    }),
    "Adding a test subscription",
  );

  await addDocument(supabase, clientOrg.id, CLIENT_DOCUMENT);
  const otherDocumentId = await addDocument(supabase, otherOrg.id, OTHER_DOCUMENT);

  return { password, otherDocumentId };
}
