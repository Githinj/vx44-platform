import Link from "next/link";
import { Suspense } from "react";
import { Loading, PageTitle, Panel, SectionTitle, formatMoney } from "@/components/admin/ui";
import { fetchAll } from "@/lib/admin/fetch-all";
import {
  calculateRevenue,
  countBy,
  countSince,
  countUnreconciled,
  monthStart,
  summariseSites,
} from "@/lib/admin/metrics";
import { LEAD_STATUSES, ORG_STATUSES, ORG_STATUS_LABELS } from "@/lib/admin/types";
import { requireAdmin } from "@/lib/auth";

type SubscriptionRow = {
  status: string;
  cameras_billed: number;
  plans: { price_per_camera_month: number; provider_cost_per_camera_month: number } | null;
};

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <Panel>
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-2 font-display text-2xl font-semibold text-text tabular-nums">{value}</p>
    </Panel>
  );
}

function Breakdown({ title, rows }: { title: string; rows: [string, number][] }) {
  return (
    <Panel>
      <SectionTitle>{title}</SectionTitle>
      {rows.length === 0 ? (
        <p className="mt-3 text-sm text-muted">Nothing yet.</p>
      ) : (
        <dl className="mt-3 text-sm">
          {rows.map(([label, count]) => (
            <div key={label} className="flex justify-between gap-4 border-t border-line py-2">
              <dt>{label}</dt>
              <dd className="text-text tabular-nums">{count}</dd>
            </div>
          ))}
        </dl>
      )}
    </Panel>
  );
}

async function Dashboard() {
  const { supabase } = await requireAdmin();
  const now = new Date();

  const [leads, organizations, sites, subscriptions, reconciliations] = await Promise.all([
    fetchAll<{ status: string; created_at: string }>((from, to) =>
      supabase.from("leads").select("status, created_at").order("id").range(from, to),
    ),
    fetchAll<{ status: string; city: string | null; state: string | null }>((from, to) =>
      supabase.from("organizations").select("status, city, state").order("id").range(from, to),
    ),
    fetchAll<{ id: string; status: string; camera_count: number }>((from, to) =>
      supabase.from("sites").select("id, status, camera_count").order("id").range(from, to),
    ),
    fetchAll<SubscriptionRow>((from, to) =>
      supabase
        .from("subscriptions")
        .select("status, cameras_billed, plans(price_per_camera_month, provider_cost_per_camera_month)")
        .order("id")
        .range(from, to)
        .overrideTypes<SubscriptionRow[], { merge: false }>(),
    ),
    fetchAll<{ site_id: string; provider_camera_count: number | null; matched: boolean }>(
      (from, to) =>
        supabase
          .from("reconciliations")
          .select("site_id, provider_camera_count, matched")
          .eq("month", monthStart(now))
          .order("id")
          .range(from, to),
    ),
  ]);

  const revenue = calculateRevenue(
    subscriptions.map((subscription) => ({
      status: subscription.status,
      cameras_billed: subscription.cameras_billed,
      price_per_camera_month: subscription.plans?.price_per_camera_month ?? 0,
      provider_cost_per_camera_month: subscription.plans?.provider_cost_per_camera_month ?? 0,
    })),
  );
  const siteTotals = summariseSites(sites);
  const unreconciled = countUnreconciled(sites, reconciliations);
  const leadsByStatus = countBy(leads, (lead) => lead.status);
  const clientsByStatus = countBy(organizations, (organization) => organization.status);
  const clientsByLocation = countBy(
    organizations.filter((organization) => organization.city || organization.state),
    (organization) => [organization.city, organization.state].filter(Boolean).join(", "),
  );

  return (
    <>
      {unreconciled > 0 && (
        <p className="mt-6 rounded-lg border border-gold/40 bg-gold/10 px-4 py-3 text-sm text-text">
          {unreconciled} {unreconciled === 1 ? "site" : "sites"} unreconciled this month.{" "}
          <Link href="/admin/reconciliation" className="font-semibold underline underline-offset-4">
            Review
          </Link>
        </p>
      )}

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="New leads, 7 days" value={countSince(leads, 7, now)} />
        <Stat label="New leads, 30 days" value={countSince(leads, 30, now)} />
        <Stat label="Active sites" value={siteTotals.activeSites} />
        <Stat label="Cameras under management" value={siteTotals.totalCameras} />
        <Stat label="MRR" value={formatMoney(revenue.mrr)} />
        <Stat label="Provider cost" value={formatMoney(revenue.providerCost)} />
        <Stat label="Gross margin" value={formatMoney(revenue.grossMargin)} />
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-3">
        <Breakdown
          title="Leads by status"
          rows={LEAD_STATUSES.map((status) => [status, leadsByStatus.get(status) ?? 0])}
        />
        <Breakdown
          title="Clients by status"
          rows={ORG_STATUSES.map((status) => [
            ORG_STATUS_LABELS[status],
            clientsByStatus.get(status) ?? 0,
          ])}
        />
        <Breakdown
          title="Clients by location"
          rows={[...clientsByLocation].sort((a, b) => b[1] - a[1])}
        />
      </div>
    </>
  );
}

export default function DashboardPage() {
  return (
    <>
      <PageTitle>Dashboard</PageTitle>
      <Suspense fallback={<Loading />}>
        <Dashboard />
      </Suspense>
    </>
  );
}
