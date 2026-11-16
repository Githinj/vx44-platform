import type { EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { passwordPendingCookie } from "@/lib/password-pending";
import { createSessionClient } from "@/lib/supabase/server";

// Invite links land here (SEC-271). The email links to this route with a one-time token hash
// (see supabase/templates/invite.html), and it is checked here on the server, which signs the
// person in. They then choose a password. The destination is fixed by the link type, never read
// from the link, so this can't be used as an open redirect.
const destinations: Partial<Record<EmailOtpType, string>> = {
  invite: "/portal/set-password",
};

export async function GET(request: NextRequest) {
  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  const type = request.nextUrl.searchParams.get("type") as EmailOtpType | null;
  const destination = type ? destinations[type] : undefined;

  if (tokenHash && type && destination) {
    const supabase = await createSessionClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) {
      const response = NextResponse.redirect(new URL(destination, request.url));
      // Until they've chosen a password, every portal page sends them back to do it.
      if (type === "invite") response.cookies.set(passwordPendingCookie(request.nextUrl.protocol === "https:"));
      return response;
    }
    // Usually an expired or already-used link.
    console.error("Invite link failed:", error.code ?? error.message);
  }
  return NextResponse.redirect(new URL("/login", request.url));
}
