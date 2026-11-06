import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { createClient } from "@/app/admin/actions";
import { ActionForm } from "@/components/admin/action-form";
import {
  Field,
  Loading,
  PageTitle,
  Panel,
  SelectField,
  SectionTitle,
  inputClass,
  primaryButtonClass,
  secondaryButtonClass,
  tableClass,
  tdClass,
  thClass,
} from "@/components/admin/ui";
import { type ClientFilters, filterClients, planNames } from "@/lib/admin/clients";
import { loadClients } from "@/lib/admin/queries";
import { ORG_STATUSES, ORG_STATUS_LABELS, PLAN_NAMES } from "@/lib/admin/types";

export const metadata: Metadata = { title: "Clients" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function single(value: string | string[] | undefined) {
  return typeof value === "string" ? value : "";
}

async function ClientList({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const filters: ClientFilters = {
    q: single(params.q),
    status: single(params.status),
    city: single(params.city),
    state: single(params.state),
    plan: single(params.plan),
  };
  const clients = filterClients(await loadClients(), filters);
  const query = new URLSearchParams(
    Object.entries(filters).filter((entry): entry is [string, string] => Boolean(entry[1])),
  );

  return (
    <>
      <form className="mt-6 grid gap-3 sm:grid-cols-3 lg:grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] lg:items-end">
        <Field label="Search">
          <input type="search" name="q" defaultValue={filters.q} className={inputClass} />
        </Field>
        <SelectField label="Status" name="status" options={ORG_STATUSES} labels={ORG_STATUS_LABELS} defaultValue={filters.status} allowEmpty />
        <Field label="City">
          <input name="city" defaultValue={filters.city} className={inputClass} />
        </Field>
        <Field label="State">
          <input name="state" defaultValue={filters.state} className={inputClass} />
        </Field>
        <SelectField label="Plan" name="plan" options={PLAN_NAMES} defaultValue={filters.plan} allowEmpty />
        <button type="submit" className={secondaryButtonClass}>
          Filter
        </button>
      </form>

      <div className="mt-4 flex items-center justify-between gap-4 text-sm">
        <p>
          {clients.length} {clients.length === 1 ? "client" : "clients"}
        </p>
        {/* A plain link: this is a file download, so it must not be prefetched. */}
        <a href={`/admin/clients/export?${query}`} className="underline underline-offset-4 hover:text-gold">
          Export CSV
        </a>
      </div>

      <div className="mt-3 overflow-x-auto">
        <table className={tableClass}>
          <thead>
            <tr>
              <th className={thClass}>Client</th>
              <th className={thClass}>Contact</th>
              <th className={thClass}>Location</th>
              <th className={thClass}>Status</th>
              <th className={thClass}>Plan</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => (
              <tr key={client.id}>
                <td className={tdClass}>
                  <Link href={`/admin/clients/${client.id}`} className="font-medium text-text underline underline-offset-4 hover:text-gold">
                    {client.name}
                  </Link>
                </td>
                <td className={tdClass}>{client.primary_contact_name ?? "—"}</td>
                <td className={tdClass}>{[client.city, client.state].filter(Boolean).join(", ") || "—"}</td>
                <td className={tdClass}>{ORG_STATUS_LABELS[client.status]}</td>
                <td className={tdClass}>{planNames(client).join(", ") || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {clients.length === 0 && <p className="mt-4 text-sm text-muted">No clients match.</p>}
      </div>
    </>
  );
}

export default function ClientsPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <>
      <PageTitle>Clients</PageTitle>
      <Suspense fallback={<Loading />}>
        <ClientList searchParams={searchParams} />
      </Suspense>

      <Panel className="mt-10 max-w-xl">
        <SectionTitle>Add a client</SectionTitle>
        <ActionForm action={createClient} className="mt-4 grid gap-3">
          <Field label="Business name">
            <input name="name" required className={inputClass} />
          </Field>
          <button type="submit" className={`${primaryButtonClass} justify-self-start`}>
            Add client
          </button>
        </ActionForm>
      </Panel>
    </>
  );
}
