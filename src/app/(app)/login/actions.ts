"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { getAppText } from "@/i18n/app-text";
import { allowAuthAttempt } from "@/lib/auth-rate-limit";
import { createSessionClient, getAuthEnv } from "@/lib/supabase/server";

// `at` is when the reply was made, so the form can show whichever button answered last.
export type LoginState = { error?: string; notice?: string; at?: number };

function reply(state: Omit<LoginState, "at">): LoginState {
  return { ...state, at: Date.now() };
}

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
  if (!getAuthEnv()) return reply({ error: t.login.unavailable });

  const email = z.email().safeParse(String(formData.get("email") ?? "").trim());
  const password = String(formData.get("password") ?? "");
  if (!email.success || !password) return reply({ error: t.login.enterEmailPassword });
  // Checked before Supabase is asked, so a refused attempt doesn't use up its limits either.
  if (!(await allowAuthAttempt("sign-in", email.data))) return reply({ error: t.login.tooManyAttempts });

  const supabase = await createSessionClient();
  const { error } = await supabase.auth.signInWithPassword({ email: email.data, password });
  if (error) return reply({ error: t.login.mismatch });
  redirect("/admin");
}

export async function sendMagicLink(_state: LoginState, formData: FormData): Promise<LoginState> {
  const { t } = await getAppText();
  if (!getAuthEnv()) return reply({ error: t.login.unavailable });

  const email = z.email().safeParse(String(formData.get("email") ?? "").trim());
  if (!email.success) return reply({ error: t.login.enterEmail });
  // Refused whether or not the account exists, so the limit doesn't reveal who has one.
  if (!(await allowAuthAttempt("link", email.data))) return reply({ error: t.login.tooManyLinks });

  const supabase = await createSessionClient();
  // shouldCreateUser is off because accounts are invite-only (build spec section 1). The reply
  // is the same either way, so this form can't be used to find out who has an account.
  const { error } = await supabase.auth.signInWithOtp({
    email: email.data,
    options: { shouldCreateUser: false, emailRedirectTo: `${siteUrl()}/auth/callback` },
  });
  if (error) console.error("Magic link failed:", error.message);
  return reply({ notice: t.login.linkSent });
}
