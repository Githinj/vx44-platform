import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { saveReconciliation } from "@/app/admin/actions";
import { ActionForm } from "@/components/admin/action-form";
import {
  Field,
  Loading,
  PageTitle,
  Panel,
  inputClass,
  secondaryButtonClass,
} from "@/components/admin/ui";
import { fetchAll } from "@/lib/admin/fetch-all";
import { isActiveSite, monthStart, reconciliationStatus } from "@/lib/admin/metrics";
import type { Reconciliation, Site } from "@/lib/admin/types";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = { title: "Reconciliation" };

type SearchParams = Promise<{ month?: string | string[] }>;
type SiteRow = Pick<Site, "id" | "name" | "camera_count" | "status" | "org_id" | "provider_customer_ref"> & {
  organizations: { name: string } | null;
};

const STATUS_DISPLAY = {
  unchecked: { label: "Not checked", className: "text-muted" },
  mismatch: { label: "Mismatch", className: "font-semibold text-red" },
  matched: { label: "Matched", className: "text-green" },
};

function shiftMonth(month: string, by: number) {
  const date = new Date(`${month}T00:00:00Z`);
  date.setUTCMonth(date.getUTCMonth() + by);
  return monthStart(date);
}

function monthLabel(month: string) {
  return new Date(`${month}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

async function ReconciliationList({ searchParams }: { searchParams: SearchParams }) {
  const { supabase } = await requireAdmin();
  const params = await searchParams;
  const currentMonth = monthStart(new Date());
  const month =
    typeof params.month === "string" && /^\d{4}-\d{2}-01$/.test(params.month)
      ? params.month
      : currentMonth;

  const [sites, records] = await Promise.all([
    fetchAll<SiteRow>((from, to) =>
      supabase
        .from("sites")
        .select("id, name, camera_count, status, org_id, provider_customer_ref, organizations(name)")
        .order("name")
        .order("id")
        .range(from, to)
        .overrideTypes<SiteRow[], { merge: false }>(),
    ),
    fetchAll<Reconciliation>((from, to) =>
      supabase.from("reconciliations").select("*").eq("month", month).order("id").range(from, to),
    ),
  ]);

  const recordsBySite = new Map(records.map((record) => [record.site_id, record]));
  const activeSites = sites.filter(isActiveSite);

  return (
    <>
      <div className="mt-4 flex items-center gap-4 text-sm">
        <Link href={`/admin/reconciliation?month=${shiftMonth(month, -1)}`} className="underline underline-offset-4 hover:text-gold">
          Previous
        </Link>
        <p className="font-medium text-text">{monthLabel(month)}</p>
        {month < currentMonth && (
          <Link href={`/admin/reconciliation?month=${shiftMonth(month, 1)}`} className="underline underline-offset-4 hover:text-gold">
            Next
          </Link>
        )}
      </div>

      {activeSites.length === 0 && <p className="mt-6 text-sm text-muted">No active sites yet.</p>}

      <ul className="mt-4 flex flex-col gap-3">
        {activeSites.map((site) => {
          const record = recordsBySite.get(site.id);
          // Past months are judged against the count recorded then, this month against today's.
          const ourCount = month === currentMonth ? site.camera_count : (record?.our_camera_count ?? site.camera_count);
          const status = reconciliationStatus(ourCount, record);
          const display = STATUS_DISPLAY[status];
          return (
            <li key={site.id}>
              <Panel className={status === "mismatch" ? "border-red/60" : ""}>
                <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                  <h2 className="font-semibold">
                    <Link href={`/admin/clients/${site.org_id}`} className="underline underline-offset-4 hover:text-gold">
                      {site.organizations?.name}
                    </Link>{" "}
                    · {site.name}
                  </h2>
                  <p className={`text-sm ${display.className}`}>{display.label}</p>
                </div>
                <p className="mt-1 text-sm">
                  Our count: <span className="text-text tabular-nums">{ourCount}</span>
                  {site.provider_customer_ref && ` · Provider ref: ${site.provider_customer_ref}`}
                </p>
                <ActionForm action={saveReconciliation} className="mt-3 grid gap-3 sm:grid-cols-[10rem_1fr_auto_auto] sm:items-end">
                  <input type="hidden" name="site_id" value={site.id} />
                  <input type="hidden" name="month" value={month} />
                  <Field label="Provider count">
                    <input name="provider_camera_count" type="number" min={0} required defaultValue={record?.provider_camera_count ?? ""} className={inputClass} />
                  </Field>
                  <Field label="Note">
                    <input name="note" defaultValue={record?.note ?? ""} className={inputClass} />
                  </Field>
                  <label className="flex items-center gap-2 py-2 text-sm font-medium text-text">
                    <input name="matched" type="checkbox" defaultChecked={record?.matched} className="size-4 accent-gold" />
                    Matched
                  </label>
                  <button type="submit" className={secondaryButtonClass}>
                    Save
                  </button>
                </ActionForm>
              </Panel>
            </li>
          );
        })}
      </ul>
    </>
  );
}

export default function ReconciliationPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <>
      <PageTitle>Reconciliation</PageTitle>
      <p className="mt-2 max-w-2xl text-sm">
        Enter the camera count shown in the provider portal for each active site. A site can only
        be marked as matched when both counts agree.
      </p>
      <Suspense fallback={<Loading />}>
        <ReconciliationList searchParams={searchParams} />
      </Suspense>
    </>
  );
}
