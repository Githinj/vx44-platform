"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ActionState } from "@/lib/admin/action-state";
import { firstError } from "@/lib/admin/schemas";
import { getAppText } from "@/i18n/app-text";
import { requireClient } from "@/lib/auth";
import { sendSupportEmail } from "@/lib/email";
import { getServerEnv } from "@/lib/env";
import { newPasswordSchema, passwordErrorKey } from "@/lib/password";
import { detailsSchema } from "@/lib/portal/account";
import { supportOrganization, supportSchema } from "@/lib/portal/support";

// The client's own name and phone. Row level security limits the update to their own profile,
// and the database lets clients change only these two columns.
export async function updateDetails(_state: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase, user } = await requireClient();
  const { t } = await getAppText();

  const parsed = detailsSchema.safeParse({
    full_name: formData.get("full_name") ?? "",
    phone: formData.get("phone") ?? "",
  });
  if (!parsed.success) return { error: firstError(parsed.error, t.errors) };

  const { error } = await supabase.from("profiles").update(parsed.data).eq("id", user.id);
  if (error) {
    console.error(`Details update failed for user ${user.id}:`, error.message);
    return { error: t.errors.saveFailed };
  }
  revalidatePath("/portal", "layout");
  return { saved: t.common.saved };
}

// The session is the proof of identity here. Signing in again to check the current password would
// replace the session, so Supabase Auth's own settings (such as secure password change) decide
// whether more is needed.
export async function changePassword(_state: ActionState, formData: FormData): Promise<ActionState> {
  const { t } = await getAppText();
  const problem = await setPassword(formData);
  return problem ?? { saved: t.account.passwordChanged };
}

// The last step of an invite (SEC-271): /auth/confirm has signed the person in, and they choose
// the password they'll sign in with from now on. Then they go to their portal.
export async function setFirstPassword(_state: ActionState, formData: FormData): Promise<ActionState> {
  const problem = await setPassword(formData);
  if (problem) return problem;
  redirect("/portal");
}

/** Validates and sets a new password for the signed-in client. Returns an error state, or null. */
async function setPassword(formData: FormData): Promise<ActionState | null> {
  const { supabase, user } = await requireClient();
  const { t } = await getAppText();

  const parsed = newPasswordSchema.safeParse({
    password: formData.get("password") ?? "",
    confirm: formData.get("confirm") ?? "",
  });
  if (!parsed.success) return { error: firstError(parsed.error, t.errors) };

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) {
    const key = passwordErrorKey(error.code);
    if (!key) console.error(`Password change failed for user ${user.id}:`, error.code ?? error.message);
    return { error: t.errors[key ?? "saveFailed"] };
  }
  return null;
}

// Emails a client's support message to the admins (build spec sections 5 and 6). Nothing is
// stored, so if SendGrid refuses it the client is told and can try again or email us directly.
export async function sendSupportMessage(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase, user } = await requireClient();
  const { t } = await getAppText();

  const parsed = supportSchema.safeParse({
    org_id: formData.get("org_id") || undefined,
    message: formData.get("message") ?? "",
  });
  if (!parsed.success) return { error: firstError(parsed.error, t.errors) };

  // The view returns only the client's own organizations, so an org_id from another org matches
  // nothing here.
  const [organizations, profile] = await Promise.all([
    supabase.from("client_organizations").select("id, name"),
    supabase.from("profiles").select("full_name, phone").eq("id", user.id).maybeSingle(),
  ]);
  if (organizations.error) {
    console.error("Support message: organizations couldn't be read:", organizations.error.message);
    return { error: t.errors.sendFailed };
  }
  const organization = supportOrganization(organizations.data ?? [], parsed.data.org_id);
  if (!organization || !user.email) return { error: t.errors.checkForm };

  try {
    await sendSupportEmail(
      {
        organization: organization.name,
        name: profile.data?.full_name ?? null,
        email: user.email,
        phone: profile.data?.phone ?? null,
        message: parsed.data.message,
      },
      getServerEnv(),
    );
  } catch (error) {
    console.error(`Support message from user ${user.id} wasn't sent:`, error);
    return { error: t.errors.sendFailed };
  }
  return { saved: t.portal.supportSent };
}
