import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { z } from "zod";
import {
  saveSite,
  saveSubscription,
  updateClient,
  updateClientNotes,
  updateClientStatus,
  uploadDocument,
} from "@/app/(app)/admin/actions";
import { ActionForm } from "@/components/admin/action-form";
import {
  Field,
  Loading,
  PageTitle,
  Panel,
  SelectField,
  SectionTitle,
  formatDate,
  formatDateTime,
  inputClass,
  primaryButtonClass,
  secondaryButtonClass,
} from "@/components/admin/ui";
import { type ActivityEntry, describeActivity, describeChanges } from "@/lib/admin/activity";
import { type LeadForSite, type SitePrefill, sitePrefillFromLead } from "@/lib/admin/site-prefill";
import {
  BILLING_METHODS,
  ORG_STATUSES,
  type Organization,
  type Plan,
  SITE_STATUSES,
  SUBSCRIPTION_STATUSES,
  type Site,
  type Subscription,
} from "@/lib/admin/types";
import type { AppDictionary } from "@/i18n/app/en";
import { getAppText } from "@/i18n/app-text";
import { fill, rich } from "@/i18n/format";
import { loadLinkedNames } from "@/lib/admin/queries";
import { requireAdmin } from "@/lib/auth";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getAppText()).t.meta.client };
}

type Text = AppDictionary;

type Params = Promise<{ id: string }>;

function dateInput(value: string | null | undefined) {
  return value ? value.slice(0, 10) : "";
}

function TextField({
  label,
  name,
  defaultValue,
  type = "text",
  required,
}: {
  label: string;
  name: string;
  defaultValue?: string | number | null;
  type?: string;
  required?: boolean;
}) {
  return (
    <Field label={label}>
      <input name={name} type={type} required={required} defaultValue={defaultValue ?? ""} className={inputClass} />
    </Field>
  );
}

// `prefill` is for a new site only: the first site of a client converted from a lead.
function SiteFields({ orgId, site, prefill, t }: { orgId: string; site?: Site; prefill?: SitePrefill; t: Text }) {
  const c = t.client;
  const start = site ?? prefill;
  const passwordKnown = start?.dvr_password_known;
  return (
    <>
      <input type="hidden" name="org_id" value={orgId} />
      {site && <input type="hidden" name="id" value={site.id} />}
      <TextField label={c.siteName} name="name" defaultValue={start?.name} required />
      <TextField label={c.address} name="address" defaultValue={site?.address} />
      <TextField label={c.city} name="city" defaultValue={start?.city} />
      <TextField label={c.state} name="state" defaultValue={start?.state} />
      <TextField label={c.country} name="country" defaultValue={site?.country} />
      <TextField label={c.cameraCount} name="camera_count" type="number" defaultValue={start?.camera_count ?? 0} required />
      <TextField label={c.dvrBrand} name="dvr_brand" defaultValue={start?.dvr_brand} />
      <TextField label={c.dvrModel} name="dvr_model" defaultValue={site?.dvr_model} />
      <SelectField
        // A form reset puts a select back to the value it was first drawn with, so once the first
        // site saves and the lead's answers go, this one is drawn afresh with no answer.
        key={prefill ? "from-lead" : "blank"}
        label={c.dvrPasswordKnown}
        name="dvr_password_known"
        options={["", "yes", "no"]}
        labels={t.status.yesNoUnknown}
        defaultValue={passwordKnown === null || passwordKnown === undefined ? "" : passwordKnown ? "yes" : "no"}
      />
      <TextField label={c.monitoringHours} name="monitoring_hours" defaultValue={site?.monitoring_hours} />
      <TextField label={c.providerRef} name="provider_customer_ref" defaultValue={site?.provider_customer_ref} />
      <TextField label={c.cloudId} name="cloud_adapter_id" defaultValue={site?.cloud_adapter_id} />
      <TextField label={c.cameraUrl} name="camera_access_url" type="url" defaultValue={site?.camera_access_url} />
      <TextField label={c.installedOn} name="installed_at" type="date" defaultValue={dateInput(site?.installed_at)} />
      <SelectField label={c.status} name="status" options={SITE_STATUSES} labels={t.status.site} defaultValue={site?.status ?? "pending"} />
    </>
  );
}

function SubscriptionFields({
  orgId,
  plans,
  subscription,
  t,
}: {
  orgId: string;
  plans: Plan[];
  subscription?: Subscription;
  t: Text;
}) {
  const c = t.client;
  return (
    <>
      <input type="hidden" name="org_id" value={orgId} />
      {subscription && <input type="hidden" name="id" value={subscription.id} />}
      <Field label={c.plan}>
        <select name="plan_id" defaultValue={subscription?.plan_id ?? ""} required className={inputClass}>
          <option value="" disabled className="bg-ink">
            {c.choosePlan}
          </option>
          {plans.map((plan) => (
            <option key={plan.id} value={plan.id} className="bg-ink">
              {plan.name}
            </option>
          ))}
        </select>
      </Field>
      <TextField label={c.camerasBilled} name="cameras_billed" type="number" defaultValue={subscription?.cameras_billed ?? 0} required />
      <SelectField label={c.status} name="status" options={SUBSCRIPTION_STATUSES} labels={t.status.subscription} defaultValue={subscription?.status ?? "trial"} />
      <SelectField label={c.billingMethod} name="billing_method" options={BILLING_METHODS} labels={t.status.billing} defaultValue={subscription?.billing_method ?? "payment_link"} />
      <TextField label={c.paymentRef} name="payment_ref" defaultValue={subscription?.payment_ref} />
      <TextField label={c.started} name="started_at" type="date" defaultValue={dateInput(subscription?.started_at)} />
      <TextField label={c.renews} name="renews_at" type="date" defaultValue={dateInput(subscription?.renews_at)} />
    </>
  );
}

const formGrid = "mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3";

async function ClientDetail({ params }: { params: Params }) {
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();

  const { supabase } = await requireAdmin();
  const { t, format } = await getAppText();
  const c = t.client;
  const [organization, sites, subscriptions, plans, documents, activity, lead] = await Promise.all([
    supabase.from("organizations").select("*").eq("id", id).maybeSingle<Organization>(),
    supabase.from("sites").select("*").eq("org_id", id).order("created_at"),
    supabase.from("subscriptions").select("*").eq("org_id", id).order("created_at"),
    supabase.from("plans").select("*").order("name"),
    supabase.from("documents").select("id, title, created_at").eq("org_id", id).order("created_at", { ascending: false }),
    supabase
      .from("activity_log")
      .select("id, action, created_at, org_id, details, profiles(full_name, email)")
      .eq("org_id", id)
      .order("created_at", { ascending: false })
      .limit(50),
    // The lead this client was converted from, if any, to pre-fill its first site.
    supabase
      .from("leads")
      .select("business_name, city, state, camera_count_estimate, dvr_brand, knows_dvr_password")
      .eq("converted_org_id", id)
      .limit(1)
      .maybeSingle<LeadForSite>(),
  ]);
  const firstError = [organization, sites, subscriptions, plans, documents, activity, lead].find((result) => result.error)?.error;
  if (firstError) throw new Error(firstError.message);

  const client = organization.data;
  if (!client) notFound();
  const sitePrefill = (sites.data ?? []).length === 0 && lead.data ? sitePrefillFromLead(lead.data) : undefined;

  const allPlans = (plans.data ?? []) as Plan[];
  const clientSubscriptions = (subscriptions.data ?? []) as Subscription[];
  const availablePlans = allPlans.filter((plan) => plan.active);
  const activityEntries = (activity.data ?? []) as unknown as ActivityEntry[];
  const linkedNames = await loadLinkedNames(activityEntries);

  return (
    <>
      <Link href="/admin/clients" className="text-sm underline underline-offset-4 hover:text-gold">
        {c.allClients}
      </Link>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <PageTitle>{client.name}</PageTitle>
        <ActionForm action={updateClientStatus} className="flex flex-wrap items-end gap-2">
          <input type="hidden" name="id" value={client.id} />
          <SelectField label={c.status} name="status" options={ORG_STATUSES} labels={t.status.org} defaultValue={client.status} />
          <button type="submit" className={secondaryButtonClass}>
            {c.update}
          </button>
        </ActionForm>
      </div>

      <div className="mt-6 flex flex-col gap-4">
        <Panel>
          <SectionTitle>{c.contact}</SectionTitle>
          <ActionForm action={updateClient} className={formGrid}>
            <input type="hidden" name="id" value={client.id} />
            <TextField label={c.businessName} name="name" defaultValue={client.name} required />
            <TextField label={c.primaryContact} name="primary_contact_name" defaultValue={client.primary_contact_name} />
            <TextField label={c.email} name="email" type="email" defaultValue={client.email} />
            <TextField label={c.phone} name="phone" defaultValue={client.phone} />
            <TextField label={c.billingAddress} name="billing_address" defaultValue={client.billing_address} />
            <TextField label={c.city} name="city" defaultValue={client.city} />
            <TextField label={c.state} name="state" defaultValue={client.state} />
            <TextField label={c.country} name="country" defaultValue={client.country} />
            <button type="submit" className={`${primaryButtonClass} justify-self-start sm:col-span-full`}>
              {c.saveContact}
            </button>
          </ActionForm>
        </Panel>

        <Panel>
          <SectionTitle>{c.sites}</SectionTitle>
          <div className="mt-2 flex flex-col">
            {((sites.data ?? []) as Site[]).map((site) => (
              <details key={site.id} className="border-t border-line py-3">
                <summary className="cursor-pointer text-sm text-text">
                  {fill(c.siteSummary, {
                    name: site.name,
                    count: site.camera_count,
                    status: t.status.site[site.status as keyof typeof t.status.site] ?? site.status,
                  })}
                </summary>
                <ActionForm action={saveSite} className={formGrid}>
                  <SiteFields orgId={client.id} site={site} t={t} />
                  <button type="submit" className={`${primaryButtonClass} justify-self-start sm:col-span-full`}>
                    {c.saveSite}
                  </button>
                </ActionForm>
              </details>
            ))}
            {/* Not opened for the admin: `open` would drop once the first site saves, closing the
                form under the keyboard focus. */}
            <details className="border-t border-line py-3">
              <summary className="cursor-pointer text-sm font-semibold text-gold">{c.addSiteSummary}</summary>
              {sitePrefill && <p className="mt-2 text-sm text-muted">{c.prefilledFromLead}</p>}
              <ActionForm action={saveSite} className={formGrid} resetOnSuccess>
                <SiteFields orgId={client.id} prefill={sitePrefill} t={t} />
                <button type="submit" className={`${primaryButtonClass} justify-self-start sm:col-span-full`}>
                  {c.addSite}
                </button>
              </ActionForm>
            </details>
          </div>
        </Panel>

        <Panel>
          <SectionTitle>{c.subscription}</SectionTitle>
          <div className="mt-2 flex flex-col">
            {clientSubscriptions.map((subscription) => {
              // An inactive plan stays selectable on a subscription already using it.
              const options = allPlans.filter((plan) => plan.active || plan.id === subscription.plan_id);
              const plan = allPlans.find((candidate) => candidate.id === subscription.plan_id);
              return (
                <details key={subscription.id} className="border-t border-line py-3">
                  <summary className="cursor-pointer text-sm text-text">
                    {fill(c.subscriptionSummary, {
                      plan: plan?.name ?? "",
                      count: subscription.cameras_billed,
                      status: t.status.subscription[subscription.status as keyof typeof t.status.subscription] ?? subscription.status,
                      date: formatDate(subscription.renews_at, format),
                    })}
                  </summary>
                  <ActionForm action={saveSubscription} className={formGrid}>
                    <SubscriptionFields orgId={client.id} plans={options} subscription={subscription} t={t} />
                    <button type="submit" className={`${primaryButtonClass} justify-self-start sm:col-span-full`}>
                      {c.saveSubscription}
                    </button>
                  </ActionForm>
                </details>
              );
            })}
            {availablePlans.length === 0 ? (
              <p className="border-t border-line py-3 text-sm text-muted">
                {rich(c.noPlans, {
                  link: (
                    <Link href="/admin/plans" className="underline underline-offset-4">
                      {c.plansLink}
                    </Link>
                  ),
                })}
              </p>
            ) : (
              <details className="border-t border-line py-3">
                <summary className="cursor-pointer text-sm font-semibold text-gold">{c.addSubscriptionSummary}</summary>
                <ActionForm action={saveSubscription} className={formGrid} resetOnSuccess>
                  <SubscriptionFields orgId={client.id} plans={availablePlans} t={t} />
                  <button type="submit" className={`${primaryButtonClass} justify-self-start sm:col-span-full`}>
                    {c.addSubscription}
                  </button>
                </ActionForm>
              </details>
            )}
          </div>
        </Panel>

        <Panel>
          <SectionTitle>{c.documents}</SectionTitle>
          <ul className="mt-3 text-sm">
            {(documents.data ?? []).map((document) => (
              <li key={document.id} className="flex flex-wrap justify-between gap-x-4 border-t border-line py-2">
                {/* A plain link: this redirects to a short-lived file URL, so it must not be prefetched. */}
                <a href={`/admin/documents/${document.id}`} className="text-text underline underline-offset-4 hover:text-gold">
                  {document.title}
                </a>
                <span className="text-muted">{formatDate(document.created_at, format)}</span>
              </li>
            ))}
          </ul>
          <ActionForm action={uploadDocument} className="mt-3 grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end" resetOnSuccess>
            <input type="hidden" name="org_id" value={client.id} />
            <TextField label={c.documentTitle} name="title" required />
            <Field label={c.documentFile}>
              <input name="file" type="file" required accept=".pdf,.png,.jpg,.jpeg" className={inputClass} />
            </Field>
            <button type="submit" className={secondaryButtonClass}>
              {c.upload}
            </button>
          </ActionForm>
        </Panel>

        <Panel>
          <SectionTitle>{c.notes}</SectionTitle>
          <ActionForm action={updateClientNotes} className="mt-3 grid gap-3">
            <input type="hidden" name="id" value={client.id} />
            <textarea name="notes" aria-label={c.notes} rows={5} defaultValue={client.notes ?? ""} className={inputClass} />
            <button type="submit" className={`${secondaryButtonClass} justify-self-start`}>
              {c.saveNotes}
            </button>
          </ActionForm>
        </Panel>

        <Panel>
          <SectionTitle>{c.activity}</SectionTitle>
          <ul className="mt-3 text-sm">
            {activityEntries.map((entry) => (
              <li key={entry.id} className="border-t border-line py-2">
                <p className="text-text">
                  {describeActivity(entry.action, t.activity)}
                  <span className="text-muted"> · {entry.profiles?.full_name ?? entry.profiles?.email ?? t.common.unknown} · {formatDateTime(entry.created_at, format)}</span>
                </p>
                {describeChanges(entry, t, linkedNames).map((line) => (
                  <p key={line} className="mt-0.5 break-words text-muted">{line}</p>
                ))}
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </>
  );
}

export default async function ClientPage({ params }: { params: Params }) {
  const { t } = await getAppText();
  return (
    <Suspense fallback={<Loading label={t.common.loading} />}>
      <ClientDetail params={params} />
    </Suspense>
  );
}
