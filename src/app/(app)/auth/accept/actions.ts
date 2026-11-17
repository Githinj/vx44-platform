"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { getAppText } from "@/i18n/app-text";
import { SET_PASSWORD_PATH, passwordPendingCookie } from "@/lib/password-pending";
import { createSessionClient, getAuthEnv } from "@/lib/supabase/server";

export type AcceptState = { error?: string };

// Supabase's token hashes are URL-safe; anything else isn't one of ours.
const TOKEN_HASH = /^[A-Za-z0-9_-]{8,512}$/;

// The "Accept the invite" button (SEC-241 review). This POST is what spends the invite's one-time
// token, so a mail scanner that opens the link (a GET) can't. It signs the person in, and they
// choose a password before anything else (src/lib/password-pending.ts).
export async function acceptInvite(_state: AcceptState, formData: FormData): Promise<AcceptState> {
  const { t } = await getAppText();
  const tokenHash = String(formData.get("token_hash") ?? "");
  if (!TOKEN_HASH.test(tokenHash)) return { error: t.invite.incomplete };
  if (!getAuthEnv()) return { error: t.login.unavailable };

  const supabase = await createSessionClient();
  const { error } = await supabase.auth.verifyOtp({ type: "invite", token_hash: tokenHash });
  if (error) {
    // Usually an expired or already-used link.
    console.error("Invite link failed:", error.code ?? error.message);
    return { error: t.invite.expired };
  }

  // Secure on HTTPS (production); a local server is plain HTTP.
  const secure = (await headers()).get("x-forwarded-proto") === "https";
  (await cookies()).set(passwordPendingCookie(secure));
  redirect(SET_PASSWORD_PATH);
}
