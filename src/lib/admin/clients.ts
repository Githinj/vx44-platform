import type { Organization } from "./types";

export type ClientRow = Organization & {
  subscriptions: { status: string; plans: { name: string } | null }[];
};

export type ClientFilters = {
  q?: string;
  status?: string;
  city?: string;
  state?: string;
  plan?: string;
};

export function planNames(client: ClientRow) {
  const names = client.subscriptions
    .filter((subscription) => subscription.status !== "cancelled")
    .map((subscription) => subscription.plans?.name)
    .filter((name): name is string => Boolean(name));
  return [...new Set(names)];
}

function sameText(a: string | null, b: string) {
  return (a ?? "").trim().toLowerCase() === b.trim().toLowerCase();
}

export function filterClients(clients: ClientRow[], filters: ClientFilters) {
  const query = filters.q?.trim().toLowerCase();
  return clients.filter((client) => {
    if (filters.status && client.status !== filters.status) return false;
    if (filters.city && !sameText(client.city, filters.city)) return false;
    if (filters.state && !sameText(client.state, filters.state)) return false;
    if (filters.plan && !planNames(client).includes(filters.plan)) return false;
    if (query) {
      const haystack = [client.name, client.primary_contact_name, client.email, client.phone]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    return true;
  });
}

// A leading = + - @ tab or return makes spreadsheets treat a cell as a formula. Lead-supplied
// values end up here, so those cells are prefixed to keep them as text.
function csvCell(value: string | null | undefined) {
  let text = value ?? "";
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function clientsToCsv(clients: ClientRow[]) {
  const header = ["Name", "Contact", "Email", "Phone", "City", "State", "Country", "Status", "Plan"];
  const rows = clients.map((client) => [
    client.name,
    client.primary_contact_name,
    client.email,
    client.phone,
    client.city,
    client.state,
    client.country,
    client.status,
    planNames(client).join("; "),
  ]);
  return [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n");
}
