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
type ChangeText = Pick<AppDictionary, "activity" | "status" | "common">;
type Change = Pick<ActivityEntry, "action" | "details">;

/** Names of linked records by id: clients, plans, sites and people. */
export type LinkedNames = Record<string, string>;

export function describeActivity(action: string, t: ActivityText) {
  const [table, operation] = action.split(".");
  const subject = t.subjects[table as keyof ActivityText["subjects"]] ?? table;
  if (operation === "insert") return fill(t.added, { subject });
  if (operation === "update") return fill(t.updated, { subject });
  return action;
}

// Which label set a stored value belongs to, so the log uses the same words as the rest of the
// console (SEC-280 round 2: it showed "status: compatibility_check").
const STATUS_LABELS: Record<string, keyof AppDictionary["status"]> = {
  organizations: "org",
  leads: "lead",
  sites: "site",
  subscriptions: "subscription",
};
const FIELD_LABELS: Record<string, keyof AppDictionary["status"]> = {
  billing_method: "billing",
  knows_dvr_password: "password",
};

// Columns that hold another record's id. Their values are shown by name.
function isLink(field: string) {
  return field.endsWith("_id") || field === "uploaded_by";
}

function displayValue(table: string, field: string, value: unknown, t: ChangeText, names: LinkedNames) {
  if (value === null || value === undefined || value === "") return t.activity.emptyValue;
  if (typeof value === "boolean") return value ? t.status.yesNoUnknown.yes : t.status.yesNoUnknown.no;
  if (typeof value === "string") {
    if (isLink(field)) return names[value] ?? t.common.unknown;
    const set = field === "status" ? STATUS_LABELS[table] : FIELD_LABELS[field];
    if (set) return (t.status[set] as Record<string, string>)[value] ?? value;
  }
  return typeof value === "object" ? JSON.stringify(value) : String(value);
}

// Field names stay as stored (e.g. "camera count"): they are database columns, not prose.
export function describeChanges(entry: Change, t: ChangeText, names: LinkedNames = {}) {
  const changes = entry.details.changes ?? {};
  const [table, operation] = entry.action.split(".");
  const isInsert = operation === "insert";
  return Object.entries(changes)
    .filter(([field]) => !isInsert || field === "name" || field === "status" || field === "title")
    .map(([field, change]) => {
      const label = field.replaceAll("_", " ");
      const to = displayValue(table, field, change.to, t, names);
      return isInsert ? `${label}: ${to}` : `${label}: ${displayValue(table, field, change.from, t, names)} → ${to}`;
    });
}

/** The ids of linked records in a feed, to look their names up in one go. */
export function linkedIds(entries: Change[]) {
  const ids = new Set<string>();
  for (const entry of entries) {
    for (const [field, change] of Object.entries(entry.details.changes ?? {})) {
      if (!isLink(field)) continue;
      for (const value of [change.from, change.to]) if (typeof value === "string" && value) ids.add(value);
    }
  }
  return [...ids];
}
