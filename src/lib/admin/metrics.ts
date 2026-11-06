type SubscriptionFigures = {
  status: string;
  cameras_billed: number;
  price_per_camera_month: number;
  provider_cost_per_camera_month: number;
};

// Build spec section 5. Only subscriptions with status 'active' count. Figures are calculated in
// cents, so summing prices such as 19.99 doesn't drift.
export function calculateRevenue(subscriptions: SubscriptionFigures[]) {
  let mrrCents = 0;
  let providerCostCents = 0;
  for (const subscription of subscriptions) {
    if (subscription.status !== "active") continue;
    mrrCents += subscription.cameras_billed * toCents(subscription.price_per_camera_month);
    providerCostCents +=
      subscription.cameras_billed * toCents(subscription.provider_cost_per_camera_month);
  }
  return {
    mrr: mrrCents / 100,
    providerCost: providerCostCents / 100,
    grossMargin: (mrrCents - providerCostCents) / 100,
  };
}

function toCents(value: number) {
  return Math.round(Number(value) * 100);
}

// A site counts as active from the moment it's added until it's marked removed, so a new
// pending site shows up in the totals straight away.
export function isActiveSite(site: { status: string }) {
  return site.status !== "removed";
}

export function summariseSites(sites: { status: string; camera_count: number }[]) {
  const active = sites.filter(isActiveSite);
  return {
    activeSites: active.length,
    totalCameras: active.reduce((total, site) => total + site.camera_count, 0),
  };
}

export function countBy<T>(items: T[], key: (item: T) => string) {
  const counts = new Map<string, number>();
  for (const item of items) {
    counts.set(key(item), (counts.get(key(item)) ?? 0) + 1);
  }
  return counts;
}

const DAY_MS = 24 * 60 * 60 * 1000;

export function countSince(items: { created_at: string }[], days: number, now: Date) {
  const cutoff = now.getTime() - days * DAY_MS;
  return items.filter((item) => new Date(item.created_at).getTime() >= cutoff).length;
}

export type ReconciliationStatus = "unchecked" | "mismatch" | "matched";

export function reconciliationStatus(
  ourCount: number,
  record: { provider_camera_count: number | null; matched: boolean } | undefined,
): ReconciliationStatus {
  if (!record || record.provider_camera_count === null) return "unchecked";
  if (record.provider_camera_count !== ourCount) return "mismatch";
  return record.matched ? "matched" : "unchecked";
}

// A site counts as reconciled only while its count still agrees with the recorded check, so
// editing a site's camera count after the check puts it back on the list.
export function countUnreconciled(
  sites: { id: string; status: string; camera_count: number }[],
  records: { site_id: string; provider_camera_count: number | null; matched: boolean }[],
) {
  const bySite = new Map(records.map((record) => [record.site_id, record]));
  return sites
    .filter(isActiveSite)
    .filter((site) => reconciliationStatus(site.camera_count, bySite.get(site.id)) !== "matched")
    .length;
}

// First day of the month as YYYY-MM-DD, the format reconciliations.month is stored in.
export function monthStart(now: Date) {
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}-01`;
}
