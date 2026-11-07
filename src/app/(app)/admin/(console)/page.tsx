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
import { LEAD_STATUSES, ORG_STATUSES } from "@/lib/admin/types";
import { getAppText } from "@/i18n/app-text";
import { fill } from "@/i18n/format";
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

function Breakdown({ title, rows, empty }: { title: string; rows: [string, number][]; empty: string }) {
  return (
    <Panel>
      <SectionTitle>{title}</SectionTitle>
      {rows.length === 0 ? (
        <p className="mt-3 text-sm text-muted">{empty}</p>
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
  const { t, format } = await getAppText();
  const d = t.dashboard;
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
          {fill(d.unreconciled, { count: unreconciled })}{" "}
          <Link href="/admin/reconciliation" className="font-semibold underline underline-offset-4">
            {d.review}
          </Link>
        </p>
      )}

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label={d.newLeads7} value={countSince(leads, 7, now)} />
        <Stat label={d.newLeads30} value={countSince(leads, 30, now)} />
        <Stat label={d.activeSites} value={siteTotals.activeSites} />
        <Stat label={d.cameras} value={siteTotals.totalCameras} />
        <Stat label={d.mrr} value={formatMoney(revenue.mrr, format)} />
        <Stat label={d.providerCost} value={formatMoney(revenue.providerCost, format)} />
        <Stat label={d.grossMargin} value={formatMoney(revenue.grossMargin, format)} />
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-3">
        <Breakdown
          title={d.leadsByStatus}
          empty={d.nothingYet}
          rows={LEAD_STATUSES.map((status) => [t.status.lead[status], leadsByStatus.get(status) ?? 0])}
        />
        <Breakdown
          title={d.clientsByStatus}
          empty={d.nothingYet}
          rows={ORG_STATUSES.map((status) => [
            t.status.org[status],
            clientsByStatus.get(status) ?? 0,
          ])}
        />
        <Breakdown
          title={d.clientsByLocation}
          empty={d.nothingYet}
          rows={[...clientsByLocation].sort((a, b) => b[1] - a[1])}
        />
      </div>
    </>
  );
}

export default async function DashboardPage() {
  const { t } = await getAppText();
  return (
    <>
      <PageTitle>{t.meta.dashboard}</PageTitle>
      <Suspense fallback={<Loading label={t.common.loading} />}>
        <Dashboard />
      </Suspense>
    </>
  );
}
