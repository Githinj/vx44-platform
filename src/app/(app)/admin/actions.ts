"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { ActionState } from "@/lib/admin/action-state";
import {
  clientNotesSchema,
  clientSchema,
  clientStatusSchema,
  firstError,
  inviteSchema,
  leadUpdateSchema,
  planSchema,
  reconciliationSchema,
  siteSchema,
  siteVideoPlatformSchema,
  subscriptionSchema,
} from "@/lib/admin/schemas";
import { getAppText } from "@/i18n/app-text";
import { fill } from "@/i18n/format";
import { statusEmailFor } from "@/lib/admin/status-email";
import { appUrl } from "@/lib/app-url";
import { requireAdmin } from "@/lib/auth";
import { sendStatusEmail } from "@/lib/email";
import { getServerEnv, getServiceRoleEnv } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";
import { createSessionClient } from "@/lib/supabase/server";

const MAX_DOCUMENT_BYTES = 4 * 1024 * 1024;
const DOCUMENT_TYPES: Record<string, string> = {
  "application/pdf": "pdf",
  "image/png": "png",
  "image/jpeg": "jpg",
};

function fields(formData: FormData) {
  return Object.fromEntries(
    [...formData.entries()].filter(([name]) => !name.startsWith("$ACTION")),
  );
}

// Every message an action returns is in the admin's language.
async function errors() {
  return (await getAppText()).t.errors;
}

async function done(): Promise<ActionState> {
  revalidatePath("/admin", "layout");
  return { saved: (await getAppText()).t.common.saved };
}

async function failed(context: string, error: { message: string }): Promise<ActionState> {
  console.error(`Admin action failed (${context}):`, error.message);
  return { error: (await errors()).saveFailed };
}

async function invalid(error: z.ZodError): Promise<ActionState> {
  return { error: firstError(error, await errors()) };
}

export async function updateLead(_state: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const parsed = leadUpdateSchema.safeParse(fields(formData));
  if (!parsed.success) return invalid(parsed.error);

  const { id, ...values } = parsed.data;
  const { error } = await supabase.from("leads").update(values).eq("id", id);
  return error ? failed("update lead", error) : done();
}

export async function convertLead(_state: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const id = z.uuid().safeParse(formData.get("id"));
  if (!id.success) return { error: (await errors()).leadNotFound };

  const { data, error } = await supabase.rpc("convert_lead", { p_lead_id: id.data });
  if (error) {
    if (error.message.includes("already converted")) {
      return { error: (await errors()).alreadyConverted };
    }
    return failed("convert lead", error);
  }
  revalidatePath("/admin", "layout");
  redirect(`/admin/clients/${data}`);
}

export async function createClient(_state: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const name = formData.get("name");
  const parsed = clientSchema.pick({ name: true }).safeParse({ name });
  if (!parsed.success) return invalid(parsed.error);

  const { data, error } = await supabase
    .from("organizations")
    .insert({ ...parsed.data, status: "lead" })
    .select("id")
    .single();
  if (error) return failed("create client", error);
  revalidatePath("/admin", "layout");
  redirect(`/admin/clients/${data.id}`);
}

export async function updateClient(_state: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const id = z.uuid().safeParse(formData.get("id"));
  const parsed = clientSchema.safeParse(fields(formData));
  if (!id.success) return { error: (await errors()).clientNotFound };
  if (!parsed.success) return invalid(parsed.error);

  const { error } = await supabase.from("organizations").update(parsed.data).eq("id", id.data);
  return error ? failed("update client", error) : done();
}

export async function updateClientStatus(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const parsed = clientStatusSchema.safeParse(fields(formData));
  if (!parsed.success) return invalid(parsed.error);
  const { id, status } = parsed.data;
  const { t } = await getAppText();

  // The old status decides whether the client's owners hear about the change (SEC-272).
  const { data: before, error: readError } = await supabase
    .from("organizations")
    .select("name, status")
    .eq("id", id)
    .maybeSingle();
  if (readError) return failed("load client status", readError);
  if (!before) return { error: t.errors.clientNotFound };

  const { error } = await supabase.from("organizations").update({ status }).eq("id", id);
  if (error) return failed("update client status", error);
  revalidatePath("/admin", "layout");

  const emailStatus = statusEmailFor(before.status, status);
  if (!emailStatus) return { saved: t.common.saved };

  const { data: owners, error: ownersError } = await supabase
    .from("memberships")
    .select("profiles(email)")
    .eq("org_id", id)
    .eq("role", "owner")
    .overrideTypes<{ profiles: { email: string } | null }[], { merge: false }>();
  if (ownersError) {
    console.error("Status email: owners couldn't be read:", ownersError.message);
    return { error: t.errors.statusEmailFailed };
  }
  const to = (owners ?? []).flatMap((owner) => (owner.profiles?.email ? [owner.profiles.email] : []));
  if (to.length === 0) return { saved: t.client.statusNoOwner };

  // The status is already saved, so a failed email only needs the admin to tell the client.
  try {
    await sendStatusEmail(
      { organization: before.name, status: emailStatus, portalUrl: `${appUrl()}/portal` },
      to,
      getServerEnv(),
    );
  } catch (emailError) {
    console.error(`Status email for client ${id} wasn't sent:`, emailError);
    return { error: t.errors.statusEmailFailed };
  }
  return { saved: t.client.statusEmailed };
}

export async function updateClientNotes(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const parsed = clientNotesSchema.safeParse(fields(formData));
  if (!parsed.success) return invalid(parsed.error);

  const { error } = await supabase
    .from("organizations")
    .update({ notes: parsed.data.notes })
    .eq("id", parsed.data.id);
  return error ? failed("update client notes", error) : done();
}

export async function saveSite(_state: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const parsed = siteSchema.safeParse(fields(formData));
  if (!parsed.success) return invalid(parsed.error);

  const rawId = formData.get("id");
  if (rawId) {
    const id = z.uuid().safeParse(rawId);
    if (!id.success) return { error: (await errors()).siteNotFound };
    const { error } = await supabase.from("sites").update(parsed.data).eq("id", id.data);
    return error ? failed("update site", error) : done();
  }
  const { error } = await supabase.from("sites").insert(parsed.data);
  return error ? failed("add site", error) : done();
}

// Which video platform serves a site (SEC-264). The database lets only admins with MFA write it,
// and the sites audit trigger logs the change.
export async function setSiteVideoPlatform(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const parsed = siteVideoPlatformSchema.safeParse(fields(formData));
  if (!parsed.success) return invalid(parsed.error);

  const { id, video_platform } = parsed.data;
  const { error } = await supabase.from("sites").update({ video_platform }).eq("id", id);
  return error ? failed("update site video platform", error) : done();
}

export async function saveSubscription(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const parsed = subscriptionSchema.safeParse(fields(formData));
  if (!parsed.success) return invalid(parsed.error);

  const rawId = formData.get("id");
  if (rawId) {
    const id = z.uuid().safeParse(rawId);
    if (!id.success) return { error: (await errors()).subscriptionNotFound };
    const { error } = await supabase.from("subscriptions").update(parsed.data).eq("id", id.data);
    return error ? failed("update subscription", error) : done();
  }
  const { error } = await supabase.from("subscriptions").insert(parsed.data);
  return error ? failed("add subscription", error) : done();
}

export async function savePlan(_state: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const parsed = planSchema.safeParse({
    ...fields(formData),
    active: formData.get("active") === "on",
  });
  if (!parsed.success) return invalid(parsed.error);

  const { error } = await supabase.from("plans").upsert(parsed.data, { onConflict: "name" });
  return error ? failed("save plan", error) : done();
}

export async function saveReconciliation(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase, user } = await requireAdmin();
  const parsed = reconciliationSchema.safeParse({
    ...fields(formData),
    matched: formData.get("matched") === "on",
  });
  if (!parsed.success) return invalid(parsed.error);

  const { data: site, error: siteError } = await supabase
    .from("sites")
    .select("camera_count")
    .eq("id", parsed.data.site_id)
    .single();
  if (siteError) return failed("load site for reconciliation", siteError);

  // A site can't be recorded as matched while the two counts differ, even if the box was ticked.
  const countsAgree = parsed.data.provider_camera_count === site.camera_count;
  const { error } = await supabase.from("reconciliations").upsert(
    {
      ...parsed.data,
      our_camera_count: site.camera_count,
      matched: parsed.data.matched && countsAgree,
      checked_by: user.id,
      checked_at: new Date().toISOString(),
    },
    { onConflict: "month,site_id" },
  );
  return error ? failed("save reconciliation", error) : done();
}

export async function uploadDocument(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase, user } = await requireAdmin();
  const orgId = z.uuid().safeParse(formData.get("org_id"));
  const title = z.string().trim().min(1).max(200).safeParse(formData.get("title"));
  const file = formData.get("file");

  const t = await errors();
  if (!orgId.success) return { error: t.clientNotFound };
  if (!title.success) return { error: t.documentTitle };
  if (!(file instanceof File) || file.size === 0) return { error: t.chooseFile };
  if (file.size > MAX_DOCUMENT_BYTES) return { error: t.fileTooBig };
  const extension = DOCUMENT_TYPES[file.type];
  if (!extension) return { error: t.fileType };

  // The path uses a random name, so nothing from the uploaded filename reaches storage.
  const storagePath = `${orgId.data}/${crypto.randomUUID()}.${extension}`;
  const { error: uploadError } = await supabase.storage
    .from("documents")
    .upload(storagePath, file, { contentType: file.type });
  if (uploadError) return failed("upload document", uploadError);

  const { error } = await supabase.from("documents").insert({
    org_id: orgId.data,
    title: title.data,
    storage_path: storagePath,
    uploaded_by: user.id,
  });
  if (error) {
    await supabase.storage.from("documents").remove([storagePath]);
    return failed("record document", error);
  }
  return done();
}

// Gives someone access to one client's portal (SEC-271, build spec sections 5 and 6). A new
// person gets an invite email from Supabase Auth with a link to /auth/confirm, where they choose a
// password. Someone already using a client account (for another business, say) is linked without
// a new email, since they can already sign in. Admin accounts are refused: admins already see
// every client, and a membership would make them look like a client.
export async function inviteClientUser(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const parsed = inviteSchema.safeParse(fields(formData));
  if (!parsed.success) return invalid(parsed.error);
  const { org_id, email, full_name, role } = parsed.data;
  const { t } = await getAppText();

  const { data: organization, error: orgError } = await supabase
    .from("organizations")
    .select("id")
    .eq("id", org_id)
    .maybeSingle();
  if (orgError) return failed("load client for invite", orgError);
  if (!organization) return { error: t.errors.clientNotFound };

  const { data: existing, error: profileError } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("email", email)
    .maybeSingle();
  if (profileError) return failed("look up invitee", profileError);
  if (existing?.role === "admin") return { error: t.errors.inviteAdmin };

  // The only service-role call here: inviting needs it. Everything else runs as the admin, under
  // row level security. Supabase sends a fresh invite to someone who was invited but never
  // accepted (so an expired link can be replaced by inviting again), and answers email_exists for
  // someone who already uses their account, who is then just linked.
  let service: ReturnType<typeof createAdminClient>;
  try {
    service = createAdminClient(getServiceRoleEnv());
  } catch (error) {
    console.error("Invite failed:", error);
    return { error: t.errors.inviteFailed };
  }
  const { data, error: inviteError } = await service.auth.admin.inviteUserByEmail(email, {
    data: full_name ? { full_name } : undefined,
    redirectTo: `${appUrl()}/auth/confirm`,
  });
  const alreadyActive = inviteError?.code === "email_exists" && existing;
  if (!alreadyActive && (inviteError || !data.user)) {
    console.error("Invite failed:", inviteError?.code ?? inviteError?.message);
    return { error: t.errors.inviteFailed };
  }
  const userId: string = alreadyActive ? existing.id : data.user!.id;

  // Written with the admin's own session, so the audit trigger records who added whom. Upsert, so
  // inviting someone again only changes their access level.
  const { error } = await supabase
    .from("memberships")
    .upsert({ user_id: userId, org_id, role }, { onConflict: "user_id,org_id" });
  if (error) return failed("add membership", error);

  revalidatePath("/admin", "layout");
  return { saved: fill(alreadyActive ? t.client.memberAdded : t.client.inviteSent, { email }) };
}

export async function signOut() {
  const supabase = await createSessionClient();
  await supabase.auth.signOut();
  redirect("/login");
}
