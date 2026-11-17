import "server-only";
import { requireAdmin } from "@/lib/auth";
import { type ActivityEntry, type LinkedNames, linkedIds } from "./activity";
import type { ClientRow } from "./clients";
import { fetchAll } from "./fetch-all";

export async function loadClients() {
  const { supabase } = await requireAdmin();
  return fetchAll<ClientRow>((from, to) =>
    supabase
      .from("organizations")
      .select("*, subscriptions(status, plans(name))")
      .order("created_at", { ascending: false })
      .order("id")
      .range(from, to)
      .overrideTypes<ClientRow[], { merge: false }>(),
  );
}

/**
 * Names for the records an activity feed links to: clients, plans, sites and people. An id
 * that's missing (deleted since) is left out, and the feed shows "Unknown".
 */
export async function loadLinkedNames(entries: Pick<ActivityEntry, "action" | "details">[]): Promise<LinkedNames> {
  const ids = linkedIds(entries);
  if (ids.length === 0) return {};
  const { supabase } = await requireAdmin();
  const [organizations, plans, sites, profiles] = await Promise.all([
    supabase.from("organizations").select("id, name").in("id", ids),
    supabase.from("plans").select("id, name").in("id", ids),
    supabase.from("sites").select("id, name").in("id", ids),
    supabase.from("profiles").select("id, full_name, email").in("id", ids),
  ]);
  const firstError = [organizations, plans, sites, profiles].find((result) => result.error)?.error;
  if (firstError) throw new Error(firstError.message);

  const names: LinkedNames = {};
  for (const row of [...(organizations.data ?? []), ...(plans.data ?? []), ...(sites.data ?? [])]) names[row.id] = row.name;
  for (const row of profiles.data ?? []) names[row.id] = row.full_name || row.email;
  return names;
}
