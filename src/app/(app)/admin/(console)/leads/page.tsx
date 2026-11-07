import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { convertLead, updateLead } from "@/app/(app)/admin/actions";
import { ActionForm } from "@/components/admin/action-form";
import {
  Field,
  Loading,
  PageTitle,
  Panel,
  SelectField,
  formatDateTime,
  inputClass,
  primaryButtonClass,
  secondaryButtonClass,
} from "@/components/admin/ui";
import { fetchAll } from "@/lib/admin/fetch-all";
import { LEAD_STATUSES, type Lead } from "@/lib/admin/types";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = { title: "Leads" };

async function LeadList() {
  const { supabase } = await requireAdmin();
  const leads = await fetchAll<Lead>((from, to) =>
    supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false })
      .order("id")
      .range(from, to),
  );

  if (leads.length === 0) {
    return <p className="mt-6 text-sm text-muted">No leads yet. They appear here as the form on /demo is used.</p>;
  }

  return (
    <ul className="mt-6 flex flex-col gap-3">
      {leads.map((lead) => (
        <li key={lead.id}>
          <Panel>
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <h2 className="text-lg font-semibold">{lead.business_name}</h2>
              <p className="text-sm text-muted">{formatDateTime(lead.created_at)}</p>
            </div>
            <p className="mt-1 text-sm">
              {lead.full_name} · <a href={`mailto:${lead.email}`} className="underline underline-offset-4">{lead.email}</a> · {lead.phone} · {lead.city}, {lead.state}
            </p>
            <p className="mt-1 text-sm">
              About {lead.camera_count_estimate} cameras · {lead.dvr_brand} DVR · Knows DVR password: {lead.knows_dvr_password}
            </p>
            {lead.message && <p className="mt-3 text-sm whitespace-pre-wrap text-text">{lead.message}</p>}

            <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-start">
              <ActionForm action={updateLead} className="grid gap-3 sm:grid-cols-[12rem_1fr_auto] sm:items-start">
                <input type="hidden" name="id" value={lead.id} />
                <SelectField label="Status" name="status" options={LEAD_STATUSES} defaultValue={lead.status} />
                <Field label="Notes">
                  <textarea name="notes" rows={2} defaultValue={lead.notes ?? ""} className={inputClass} />
                </Field>
                <button type="submit" className={`${secondaryButtonClass} sm:mt-6.5`}>
                  Save
                </button>
              </ActionForm>

              {lead.converted_org_id ? (
                <Link href={`/admin/clients/${lead.converted_org_id}`} className={`${secondaryButtonClass} lg:mt-6.5`}>
                  Open client
                </Link>
              ) : (
                <ActionForm action={convertLead} className="lg:mt-6.5">
                  <input type="hidden" name="id" value={lead.id} />
                  <button type="submit" className={primaryButtonClass}>
                    Convert to client
                  </button>
                </ActionForm>
              )}
            </div>
          </Panel>
        </li>
      ))}
    </ul>
  );
}

export default function LeadsPage() {
  return (
    <>
      <PageTitle>Leads</PageTitle>
      <Suspense fallback={<Loading />}>
        <LeadList />
      </Suspense>
    </>
  );
}
