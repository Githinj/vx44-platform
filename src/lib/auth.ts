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

// Every portal page and route calls this. Admins are sent to the back office. Row level security
// limits clients to their own organizations, so a missed call here still returns no other org's data.
export const requireClient = cache(async () => {
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
