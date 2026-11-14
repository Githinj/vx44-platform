import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import { createSessionClient } from "@/lib/supabase/server";

// Signed in with the admin role, MFA not necessarily done. Only the MFA page should use this.
export const requireAdminRole = cache(async () => {
  const supabase = await createSessionClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .maybeSingle();
  if (profile?.role !== "admin") redirect("/no-access");

  return { supabase, user: data.user };
});

// Every admin page, action and route calls this. The database enforces the same rule through
// private.is_admin(), so a missed call here still returns no data.
export const requireAdmin = cache(async () => {
  const session = await requireAdminRole();
  const { data } = await session.supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (data?.currentLevel !== "aal2") redirect("/admin/mfa");
  return session;
});

type SessionClient = Awaited<ReturnType<typeof createSessionClient>>;

/** Where a user lands after signing in: admins go to the back office, clients to the portal. */
export async function homePathFor(supabase: SessionClient, userId: string) {
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();
  return profile?.role === "admin" ? "/admin" : "/portal";
}

// Signed in as a client, two-step verification not necessarily done. Only the portal's code page
// and its action should use this.
export const requireClientRole = cache(async () => {
  const supabase = await createSessionClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .maybeSingle();
  if (profile?.role === "admin") redirect("/admin");
  if (profile?.role !== "client") redirect("/no-access");

  return { supabase, user: data.user };
});

/** Whether this user has finished setting up an authenticator app. */
export function hasVerifiedFactor(user: { factors?: { status: string }[] }) {
  return (user.factors ?? []).some((factor) => factor.status === "verified");
}

// Every portal page, action and route calls this. Admins are sent to the back office. A client
// who turned on two-step verification (SEC-276) must enter a code each session: the database
// hides their data from a session without one, so they're sent to the code page first rather than
// seeing an empty portal. Row level security limits clients to their own organizations, so a
// missed call here still returns no other org's data.
export const requireClient = cache(async () => {
  const session = await requireClientRole();
  // The factors come from getUser() above, fresh from the server: the copy in the session cookie
  // can be out of date if MFA was turned on in another browser.
  if (hasVerifiedFactor(session.user)) {
    const { data } = await session.supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (data?.currentLevel !== "aal2") redirect("/portal/mfa");
  }
  return session;
});
