import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { createClient } from "@/app/(app)/admin/actions";
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
import { ORG_STATUSES, PLAN_NAMES } from "@/lib/admin/types";
import { getAppText } from "@/i18n/app-text";
import { fill } from "@/i18n/format";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getAppText()).t.meta.clients };
}

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function single(value: string | string[] | undefined) {
  return typeof value === "string" ? value : "";
}

async function ClientList({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const { t } = await getAppText();
  const c = t.clients;
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
        <Field label={c.search}>
          <input type="search" name="q" defaultValue={filters.q} className={inputClass} />
        </Field>
        <SelectField label={c.status} name="status" options={ORG_STATUSES} labels={t.status.org} defaultValue={filters.status} emptyLabel={t.common.any} />
        <Field label={c.city}>
          <input name="city" defaultValue={filters.city} className={inputClass} />
        </Field>
        <Field label={c.state}>
          <input name="state" defaultValue={filters.state} className={inputClass} />
        </Field>
        <SelectField label={c.plan} name="plan" options={PLAN_NAMES} defaultValue={filters.plan} emptyLabel={t.common.any} />
        <button type="submit" className={secondaryButtonClass}>
          {c.filter}
        </button>
      </form>

      <div className="mt-4 flex items-center justify-between gap-4 text-sm">
        <p>
          {fill(c.count, { count: clients.length })}
        </p>
        {/* A plain link: this is a file download, so it must not be prefetched. */}
        <a href={`/admin/clients/export?${query}`} className="underline underline-offset-4 hover:text-gold">
          {c.export}
        </a>
      </div>

      <div className="mt-3 overflow-x-auto">
        <table className={tableClass}>
          <thead>
            <tr>
              <th className={thClass}>{c.colClient}</th>
              <th className={thClass}>{c.colContact}</th>
              <th className={thClass}>{c.colLocation}</th>
              <th className={thClass}>{c.colStatus}</th>
              <th className={thClass}>{c.colPlan}</th>
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
                <td className={tdClass}>{t.status.org[client.status as keyof typeof t.status.org] ?? client.status}</td>
                <td className={tdClass}>{planNames(client).join(", ") || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {clients.length === 0 && <p className="mt-4 text-sm text-muted">{c.noMatch}</p>}
      </div>
    </>
  );
}

export default async function ClientsPage({ searchParams }: { searchParams: SearchParams }) {
  const { t } = await getAppText();
  return (
    <>
      <PageTitle>{t.meta.clients}</PageTitle>
      <Suspense fallback={<Loading label={t.common.loading} />}>
        <ClientList searchParams={searchParams} />
      </Suspense>

      <Panel className="mt-10 max-w-xl">
        <SectionTitle>{t.clients.addTitle}</SectionTitle>
        <ActionForm action={createClient} className="mt-4 grid gap-3">
          <Field label={t.clients.businessName}>
            <input name="name" required className={inputClass} />
          </Field>
          <button type="submit" className={`${primaryButtonClass} justify-self-start`}>
            {t.clients.add}
          </button>
        </ActionForm>
      </Panel>
    </>
  );
}
