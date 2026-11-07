"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { getAppText } from "@/i18n/app-text";
import { createSessionClient, getAuthEnv } from "@/lib/supabase/server";

export type LoginState = { error?: string; notice?: string };


function siteUrl() {
  if (process.env.SITE_URL) return process.env.SITE_URL;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  return "http://localhost:3000";
}

export async function signInWithPassword(
  _state: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const { t } = await getAppText();
  if (!getAuthEnv()) return { error: t.login.unavailable };

  const email = z.email().safeParse(String(formData.get("email") ?? "").trim());
  const password = String(formData.get("password") ?? "");
  if (!email.success || !password) return { error: t.login.enterEmailPassword };

  const supabase = await createSessionClient();
  const { error } = await supabase.auth.signInWithPassword({ email: email.data, password });
  if (error) return { error: t.login.mismatch };
  redirect("/admin");
}

export async function sendMagicLink(_state: LoginState, formData: FormData): Promise<LoginState> {
  const { t } = await getAppText();
  if (!getAuthEnv()) return { error: t.login.unavailable };

  const email = z.email().safeParse(String(formData.get("email") ?? "").trim());
  if (!email.success) return { error: t.login.enterEmail };

  const supabase = await createSessionClient();
  // shouldCreateUser is off because accounts are invite-only (build spec section 1). The reply
  // is the same either way, so this form can't be used to find out who has an account.
  const { error } = await supabase.auth.signInWithOtp({
    email: email.data,
    options: { shouldCreateUser: false, emailRedirectTo: `${siteUrl()}/auth/callback` },
  });
  if (error) console.error("Magic link failed:", error.message);
  return { notice: t.login.linkSent };
}
