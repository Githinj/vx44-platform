import { type NextRequest, NextResponse } from "next/server";
import { createSessionClient } from "@/lib/supabase/server";

// Magic links land here. The destination is fixed, so this can't be used as an open redirect.
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  if (code) {
    const supabase = await createSessionClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL("/admin", request.url));
    console.error("Magic link sign-in failed:", error.message);
  }
  return NextResponse.redirect(new URL("/login", request.url));
}
