import { type NextRequest, NextResponse } from "next/server";

// Invite links land here (SEC-271): the email links to this route with a one-time token hash (see
// supabase/templates/invite.html).
//
// Opening the link doesn't spend the token (SEC-241 review). Mail scanners open every link in an
// email, so if this GET checked the token, a scanner could use up an invite before the person
// clicked it. Instead it sends them to /auth/accept, where the "Accept the invite" button (a POST)
// spends it. The destination is fixed, never read from the link, so this can't be used as an open
// redirect.
export function GET(request: NextRequest) {
  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  const type = request.nextUrl.searchParams.get("type");

  if (tokenHash && type === "invite") {
    const accept = new URL("/auth/accept", request.url);
    accept.searchParams.set("token_hash", tokenHash);
    return NextResponse.redirect(accept, 303);
  }
  return NextResponse.redirect(new URL("/login", request.url), 303);
}
