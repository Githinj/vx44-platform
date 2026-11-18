"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { ActionState } from "@/lib/admin/action-state";
import { firstError } from "@/lib/admin/schemas";
import { getAppText } from "@/i18n/app-text";
import { requireClient, requireClientRole } from "@/lib/auth";
import { sendSupportEmail } from "@/lib/email";
import { getEmailEnv } from "@/lib/env";
import { type EnrollState, type VerifyState, codeSchema } from "@/lib/mfa";
import { newPasswordSchema, passwordErrorKey } from "@/lib/password";
import { PASSWORD_PENDING_COOKIE } from "@/lib/password-pending";
import { detailsSchema } from "@/lib/portal/account";
import { type PasswordState, reauthCodePattern } from "@/lib/portal/password-change";
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
// replace the session, so Supabase Auth's settings decide whether more is needed.
//
// Its "secure password change" (SEC-241, off in production unless Morris turns it on): once a
// session is more than a day old, Supabase refuses a new password with reauthentication_needed.
// Then this asks Supabase to email the person a code (reauthenticate()), and the form asks for it
// and sends it with the password. With the setting off, Supabase never asks, and nothing changes.
export async function changePassword(state: PasswordState, formData: FormData): Promise<PasswordState> {
  const { supabase, user } = await requireClient();
  const { t } = await getAppText();
  const codeStep = state.codeSent ? { codeSent: true } : {};

  async function emailCode(notice: string): Promise<PasswordState> {
    const { error } = await supabase.auth.reauthenticate();
    if (error) {
      console.error(`Re-authentication code for user ${user.id} wasn't sent:`, error.code ?? error.message);
      return { ...codeStep, error: t.errors.reauthSendFailed };
    }
    return { codeSent: true, notice };
  }

  if (formData.get("resend")) return emailCode(t.account.reauthResent);

  const parsed = newPasswordSchema.safeParse({
    password: formData.get("password") ?? "",
    confirm: formData.get("confirm") ?? "",
  });
  if (!parsed.success) return { ...codeStep, error: firstError(parsed.error, t.errors) };

  const nonce = String(formData.get("nonce") ?? "").trim();
  if ((state.codeSent || nonce) && !reauthCodePattern.test(nonce)) {
    return { codeSent: true, error: t.errors.reauthCodeWrong };
  }

  const { password } = parsed.data;
  const { error } = await supabase.auth.updateUser(nonce ? { password, nonce } : { password });
  if (!error) return { saved: t.account.passwordChanged };
  if (error.code === "reauthentication_needed") return emailCode(t.account.reauthSent);
  if (error.code === "reauthentication_not_valid") return { codeSent: true, error: t.errors.reauthCodeWrong };

  const key = passwordErrorKey(error.code);
  if (!key) console.error(`Password change failed for user ${user.id}:`, error.code ?? error.message);
  return { ...codeStep, error: t.errors[key ?? "saveFailed"] };
}

// The last step of an invite (SEC-271): /auth/confirm has signed the person in, and they choose
// the password they'll sign in with from now on. Then they go to their portal.
export async function setFirstPassword(_state: ActionState, formData: FormData): Promise<ActionState> {
  const problem = await setPassword(formData);
  if (problem) return problem;
  // The rest of the portal opens up now (src/lib/password-pending.ts).
  (await cookies()).delete({ name: PASSWORD_PENDING_COOKIE, path: "/portal" });
  redirect("/portal");
}

// Two-step verification for clients (SEC-276). Optional: a client turns it on from the Account
// page, and from then on every session needs a code (requireClient() and the database both
// insist on it).

export async function startMfaSetup(): Promise<EnrollState> {
  const { supabase } = await requireClient();
  const { t } = await getAppText();

  const { data: factors, error: listError } = await supabase.auth.mfa.listFactors();
  if (listError) return { error: t.mfa.setupFailed };
  if (factors.totp.length > 0) redirect("/portal/account");
  // An abandoned attempt leaves an unverified factor behind, which would block a new one.
  for (const factor of factors.all.filter((candidate) => candidate.status === "unverified")) {
    await supabase.auth.mfa.unenroll({ factorId: factor.id });
  }

  const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp", friendlyName: "VX44 client portal" });
  if (error) {
    console.error("Client MFA enrolment failed:", error.code ?? error.message);
    return { error: t.mfa.setupFailed };
  }
  return { factorId: data.id, qrCode: data.totp.qr_code, secret: data.totp.secret, uri: data.totp.uri };
}

/** The first code from a newly added app, which turns two-step verification on. */
export async function confirmMfaSetup(_state: VerifyState, formData: FormData): Promise<VerifyState> {
  const { supabase } = await requireClient();
  const { t } = await getAppText();
  const parsed = codeSchema.safeParse({ factorId: formData.get("factorId"), code: formData.get("code") });
  if (!parsed.success) return { error: t.mfa.codeFormat };

  const { error } = await supabase.auth.mfa.challengeAndVerify(parsed.data);
  if (error) return { error: t.mfa.codeFailed };
  revalidatePath("/portal", "layout");
  redirect("/portal/account");
}

/** The code asked for after signing in, once two-step verification is on. */
export async function verifySignInCode(_state: VerifyState, formData: FormData): Promise<VerifyState> {
  // Not requireClient(): that would send this very request back to the code page.
  const { supabase } = await requireClientRole();
  const { t } = await getAppText();
  const parsed = codeSchema.safeParse({ factorId: formData.get("factorId"), code: formData.get("code") });
  if (!parsed.success) return { error: t.mfa.codeFormat };

  const { error } = await supabase.auth.mfa.challengeAndVerify(parsed.data);
  if (error) return { error: t.mfa.codeFailed };
  redirect("/portal");
}

/** Turns two-step verification off. A current code proves whoever is at the screen has the app. */
export async function turnOffMfa(_state: VerifyState, formData: FormData): Promise<VerifyState> {
  const { supabase, user } = await requireClient();
  const { t } = await getAppText();
  const parsed = codeSchema.safeParse({ factorId: formData.get("factorId"), code: formData.get("code") });
  if (!parsed.success) return { error: t.mfa.codeFormat };

  const { error } = await supabase.auth.mfa.challengeAndVerify(parsed.data);
  if (error) return { error: t.mfa.codeFailed };
  const { error: unenrollError } = await supabase.auth.mfa.unenroll({ factorId: parsed.data.factorId });
  if (unenrollError) {
    console.error(`Turning off MFA failed for user ${user.id}:`, unenrollError.code ?? unenrollError.message);
    return { error: t.errors.saveFailed };
  }
  revalidatePath("/portal", "layout");
  return { saved: t.account.mfaTurnedOff };
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
  // Checked before the limit, so a form that names no organization of theirs doesn't use one up.
  const organization = supportOrganization(organizations.data ?? [], parsed.data.org_id);
  if (!organization || !user.email) return { error: t.errors.checkForm };

  // 5 messages an hour per person (SEC-241 review): each one emails the admins. Every attempt
  // counts, sent or not, so a failing send can't be retried without limit either. The database
  // keys the count on the session's own user.
  const { data: allowed, error: limitError } = await supabase.rpc("check_support_rate_limit");
  if (limitError) {
    console.error(`Support message limit check failed for user ${user.id}:`, limitError.message);
    return { error: t.errors.sendFailed };
  }
  if (!allowed) return { error: t.errors.tooManyMessages };

  try {
    await sendSupportEmail(
      {
        organization: organization.name,
        name: profile.data?.full_name ?? null,
        email: user.email,
        phone: profile.data?.phone ?? null,
        message: parsed.data.message,
      },
      getEmailEnv(),
    );
  } catch (error) {
    console.error(`Support message from user ${user.id} wasn't sent:`, error);
    return { error: t.errors.sendFailed };
  }
  return { saved: t.portal.supportSent };
}
