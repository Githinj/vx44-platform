import "server-only";
import { requireAdmin } from "@/lib/auth";
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
