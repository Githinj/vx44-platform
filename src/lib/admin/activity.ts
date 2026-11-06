export type ActivityEntry = {
  id: string;
  action: string;
  created_at: string;
  org_id: string | null;
  details: { changes?: Record<string, { from: unknown; to: unknown }> };
  profiles: { full_name: string | null; email: string } | null;
};

const SUBJECTS: Record<string, string> = {
  organizations: "client",
  memberships: "client user",
  sites: "site",
  plans: "plan",
  subscriptions: "subscription",
  leads: "lead",
  documents: "document",
  reconciliations: "reconciliation",
};

export function describeActivity(action: string) {
  const [table, operation] = action.split(".");
  const subject = SUBJECTS[table] ?? table;
  if (operation === "insert") return `Added ${subject}`;
  if (operation === "update") return `Updated ${subject}`;
  return action;
}

function displayValue(value: unknown) {
  if (value === null || value === undefined || value === "") return "empty";
  return typeof value === "object" ? JSON.stringify(value) : String(value);
}

export function describeChanges(entry: Pick<ActivityEntry, "action" | "details">) {
  const changes = entry.details.changes ?? {};
  const isInsert = entry.action.endsWith(".insert");
  return Object.entries(changes)
    .filter(([field]) => !isInsert || field === "name" || field === "status" || field === "title")
    .map(([field, change]) => {
      const label = field.replaceAll("_", " ");
      return isInsert
        ? `${label}: ${displayValue(change.to)}`
        : `${label}: ${displayValue(change.from)} → ${displayValue(change.to)}`;
    });
}
