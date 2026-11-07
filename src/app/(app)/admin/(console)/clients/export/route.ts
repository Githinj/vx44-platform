import type { NextRequest } from "next/server";
import { clientsToCsv, filterClients } from "@/lib/admin/clients";
import { loadClients } from "@/lib/admin/queries";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const clients = filterClients(await loadClients(), {
    q: params.get("q") ?? "",
    status: params.get("status") ?? "",
    city: params.get("city") ?? "",
    state: params.get("state") ?? "",
    plan: params.get("plan") ?? "",
  });

  return new Response(clientsToCsv(clients), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="vx44-clients.csv"',
      "Cache-Control": "no-store",
    },
  });
}
