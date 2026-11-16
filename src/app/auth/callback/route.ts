import { type NextRequest, NextResponse } from "next/server";
import { homePathFor } from "@/lib/auth";
import { createSessionClient } from "@/lib/supabase/server";

// Magic links land here. The destination is picked by role, never read from the link, so this
// can't be used as an open redirect.
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  if (code) {
    const supabase = await createSessionClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(await homePathFor(supabase, data.user.id), request.url));
    }
    console.error("Magic link sign-in failed:", error.message);
  }
  return NextResponse.redirect(new URL("/login", request.url));
}
