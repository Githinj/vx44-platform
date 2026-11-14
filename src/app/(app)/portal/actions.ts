"use server";

import type { ActionState } from "@/lib/admin/action-state";
import { firstError } from "@/lib/admin/schemas";
import { getAppText } from "@/i18n/app-text";
import { requireClient } from "@/lib/auth";
import { sendSupportEmail } from "@/lib/email";
import { getServerEnv } from "@/lib/env";
import { supportOrganization, supportSchema } from "@/lib/portal/support";

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
