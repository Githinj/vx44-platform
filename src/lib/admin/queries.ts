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
  if (Object.values(ids).every((list) => list.length === 0)) return {};
  const { supabase } = await requireAdmin();

  // In chunks, so a long feed doesn't make a query too long for its URL.
  const chunks = (list: string[]) => Array.from({ length: Math.ceil(list.length / 50) }, (_, i) => list.slice(i * 50, i * 50 + 50));
  const named = (table: "organizations" | "plans" | "sites") =>
    chunks(ids[table]).map((chunk) => supabase.from(table).select("id, name").in("id", chunk));
  const results = await Promise.all([
    ...named("organizations"),
    ...named("plans"),
    ...named("sites"),
    ...chunks(ids.profiles).map((chunk) => supabase.from("profiles").select("id, name:full_name, email").in("id", chunk)),
  ]);
  const firstError = results.find((result) => result.error)?.error;
  if (firstError) throw new Error(firstError.message);

  const names: LinkedNames = {};
  for (const result of results) {
    for (const row of (result.data ?? []) as { id: string; name: string | null; email?: string }[]) {
      names[row.id] = row.name || row.email || "";
    }
  }
  return names;
}
