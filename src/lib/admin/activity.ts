export type ActivityEntry = {
  id: string;
  action: string;
  created_at: string;
  org_id: string | null;
  details: { changes?: Record<string, { from: unknown; to: unknown }> };
  profiles: { full_name: string | null; email: string } | null;
};

import type { AppDictionary } from "@/i18n/app/en";
import { fill } from "@/i18n/format";

type ActivityText = AppDictionary["activity"];

export function describeActivity(action: string, t: ActivityText) {
  const [table, operation] = action.split(".");
  const subject = t.subjects[table as keyof ActivityText["subjects"]] ?? table;
  if (operation === "insert") return fill(t.added, { subject });
  if (operation === "update") return fill(t.updated, { subject });
  return action;
}

function displayValue(value: unknown, emptyLabel: string) {
  if (value === null || value === undefined || value === "") return emptyLabel;
  return typeof value === "object" ? JSON.stringify(value) : String(value);
}

// Field names stay as stored (e.g. "camera count"): they are database columns, not prose.
export function describeChanges(entry: Pick<ActivityEntry, "action" | "details">, t: ActivityText) {
  const changes = entry.details.changes ?? {};
  const isInsert = entry.action.endsWith(".insert");
  return Object.entries(changes)
    .filter(([field]) => !isInsert || field === "name" || field === "status" || field === "title")
    .map(([field, change]) => {
      const label = field.replaceAll("_", " ");
      return isInsert
        ? `${label}: ${displayValue(change.to, t.emptyValue)}`
        : `${label}: ${displayValue(change.from, t.emptyValue)} → ${displayValue(change.to, t.emptyValue)}`;
    });
}
