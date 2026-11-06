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
} from "@/app/admin/actions";
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
import {
  BILLING_METHODS,
  ORG_STATUSES,
  ORG_STATUS_LABELS,
  type Organization,
  type Plan,
  SITE_STATUSES,
  SUBSCRIPTION_STATUSES,
  type Site,
  type Subscription,
} from "@/lib/admin/types";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = { title: "Client" };

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

function SiteFields({ orgId, site }: { orgId: string; site?: Site }) {
  return (
    <>
      <input type="hidden" name="org_id" value={orgId} />
      {site && <input type="hidden" name="id" value={site.id} />}
      <TextField label="Site name" name="name" defaultValue={site?.name} required />
      <TextField label="Address" name="address" defaultValue={site?.address} />
      <TextField label="City" name="city" defaultValue={site?.city} />
      <TextField label="State" name="state" defaultValue={site?.state} />
      <TextField label="Country" name="country" defaultValue={site?.country} />
      <TextField label="Camera count" name="camera_count" type="number" defaultValue={site?.camera_count ?? 0} required />
      <TextField label="DVR brand" name="dvr_brand" defaultValue={site?.dvr_brand} />
      <TextField label="DVR model" name="dvr_model" defaultValue={site?.dvr_model} />
      <SelectField
        label="DVR password known"
        name="dvr_password_known"
        options={["", "yes", "no"]}
        labels={{ "": "Not recorded", yes: "Yes", no: "No" }}
        defaultValue={site?.dvr_password_known === null || !site ? "" : site.dvr_password_known ? "yes" : "no"}
      />
      <TextField label="Monitoring hours" name="monitoring_hours" defaultValue={site?.monitoring_hours} />
      <TextField label="Provider customer ref" name="provider_customer_ref" defaultValue={site?.provider_customer_ref} />
      <TextField label="Cloud ID" name="cloud_adapter_id" defaultValue={site?.cloud_adapter_id} />
      <TextField label="Camera access URL" name="camera_access_url" type="url" defaultValue={site?.camera_access_url} />
      <TextField label="Installed on" name="installed_at" type="date" defaultValue={dateInput(site?.installed_at)} />
      <SelectField label="Status" name="status" options={SITE_STATUSES} defaultValue={site?.status ?? "pending"} />
    </>
  );
}

function SubscriptionFields({
  orgId,
  plans,
  subscription,
}: {
  orgId: string;
  plans: Plan[];
  subscription?: Subscription;
}) {
  return (
    <>
      <input type="hidden" name="org_id" value={orgId} />
      {subscription && <input type="hidden" name="id" value={subscription.id} />}
      <Field label="Plan">
        <select name="plan_id" defaultValue={subscription?.plan_id ?? ""} required className={inputClass}>
          <option value="" disabled className="bg-ink">
            Choose a plan
          </option>
          {plans.map((plan) => (
            <option key={plan.id} value={plan.id} className="bg-ink">
              {plan.name}
            </option>
          ))}
        </select>
      </Field>
      <TextField label="Cameras billed" name="cameras_billed" type="number" defaultValue={subscription?.cameras_billed ?? 0} required />
      <SelectField label="Status" name="status" options={SUBSCRIPTION_STATUSES} defaultValue={subscription?.status ?? "trial"} />
      <SelectField label="Billing method" name="billing_method" options={BILLING_METHODS} defaultValue={subscription?.billing_method ?? "payment_link"} />
      <TextField label="Payment link or reference" name="payment_ref" defaultValue={subscription?.payment_ref} />
      <TextField label="Started" name="started_at" type="date" defaultValue={dateInput(subscription?.started_at)} />
      <TextField label="Renews" name="renews_at" type="date" defaultValue={dateInput(subscription?.renews_at)} />
    </>
  );
}

const formGrid = "mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3";

async function ClientDetail({ params }: { params: Params }) {
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();

  const { supabase } = await requireAdmin();
  const [organization, sites, subscriptions, plans, documents, activity] = await Promise.all([
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
  ]);
  const firstError = [organization, sites, subscriptions, plans, documents, activity].find((result) => result.error)?.error;
  if (firstError) throw new Error(firstError.message);

  const client = organization.data;
  if (!client) notFound();

  const allPlans = (plans.data ?? []) as Plan[];
  const clientSubscriptions = (subscriptions.data ?? []) as Subscription[];
  const availablePlans = allPlans.filter((plan) => plan.active);

  return (
    <>
      <Link href="/admin/clients" className="text-sm underline underline-offset-4 hover:text-gold">
        All clients
      </Link>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <PageTitle>{client.name}</PageTitle>
        <ActionForm action={updateClientStatus} className="flex flex-wrap items-end gap-2">
          <input type="hidden" name="id" value={client.id} />
          <SelectField label="Status" name="status" options={ORG_STATUSES} labels={ORG_STATUS_LABELS} defaultValue={client.status} />
          <button type="submit" className={secondaryButtonClass}>
            Update
          </button>
        </ActionForm>
      </div>

      <div className="mt-6 flex flex-col gap-4">
        <Panel>
          <SectionTitle>Contact</SectionTitle>
          <ActionForm action={updateClient} className={formGrid}>
            <input type="hidden" name="id" value={client.id} />
            <TextField label="Business name" name="name" defaultValue={client.name} required />
            <TextField label="Primary contact" name="primary_contact_name" defaultValue={client.primary_contact_name} />
            <TextField label="Email" name="email" type="email" defaultValue={client.email} />
            <TextField label="Phone" name="phone" defaultValue={client.phone} />
            <TextField label="Billing address" name="billing_address" defaultValue={client.billing_address} />
            <TextField label="City" name="city" defaultValue={client.city} />
            <TextField label="State" name="state" defaultValue={client.state} />
            <TextField label="Country" name="country" defaultValue={client.country} />
            <button type="submit" className={`${primaryButtonClass} justify-self-start sm:col-span-full`}>
              Save contact
            </button>
          </ActionForm>
        </Panel>

        <Panel>
          <SectionTitle>Sites</SectionTitle>
          <div className="mt-2 flex flex-col">
            {((sites.data ?? []) as Site[]).map((site) => (
              <details key={site.id} className="border-t border-line py-3">
                <summary className="cursor-pointer text-sm text-text">
                  {site.name} · {site.camera_count} cameras · {site.status}
                </summary>
                <ActionForm action={saveSite} className={formGrid}>
                  <SiteFields orgId={client.id} site={site} />
                  <button type="submit" className={`${primaryButtonClass} justify-self-start sm:col-span-full`}>
                    Save site
                  </button>
                </ActionForm>
              </details>
            ))}
            <details className="border-t border-line py-3">
              <summary className="cursor-pointer text-sm font-semibold text-gold">Add a site</summary>
              <ActionForm action={saveSite} className={formGrid} resetOnSuccess>
                <SiteFields orgId={client.id} />
                <button type="submit" className={`${primaryButtonClass} justify-self-start sm:col-span-full`}>
                  Add site
                </button>
              </ActionForm>
            </details>
          </div>
        </Panel>

        <Panel>
          <SectionTitle>Subscription</SectionTitle>
          <div className="mt-2 flex flex-col">
            {clientSubscriptions.map((subscription) => {
              // An inactive plan stays selectable on a subscription already using it.
              const options = allPlans.filter((plan) => plan.active || plan.id === subscription.plan_id);
              const plan = allPlans.find((candidate) => candidate.id === subscription.plan_id);
              return (
                <details key={subscription.id} className="border-t border-line py-3">
                  <summary className="cursor-pointer text-sm text-text">
                    {plan?.name} · {subscription.cameras_billed} cameras · {subscription.status} · renews {formatDate(subscription.renews_at)}
                  </summary>
                  <ActionForm action={saveSubscription} className={formGrid}>
                    <SubscriptionFields orgId={client.id} plans={options} subscription={subscription} />
                    <button type="submit" className={`${primaryButtonClass} justify-self-start sm:col-span-full`}>
                      Save subscription
                    </button>
                  </ActionForm>
                </details>
              );
            })}
            {availablePlans.length === 0 ? (
              <p className="border-t border-line py-3 text-sm text-muted">
                Set up a plan on the <Link href="/admin/plans" className="underline underline-offset-4">Plans page</Link> before adding a subscription.
              </p>
            ) : (
              <details className="border-t border-line py-3">
                <summary className="cursor-pointer text-sm font-semibold text-gold">Add a subscription</summary>
                <ActionForm action={saveSubscription} className={formGrid} resetOnSuccess>
                  <SubscriptionFields orgId={client.id} plans={availablePlans} />
                  <button type="submit" className={`${primaryButtonClass} justify-self-start sm:col-span-full`}>
                    Add subscription
                  </button>
                </ActionForm>
              </details>
            )}
          </div>
        </Panel>

        <Panel>
          <SectionTitle>Documents</SectionTitle>
          <ul className="mt-3 text-sm">
            {(documents.data ?? []).map((document) => (
              <li key={document.id} className="flex flex-wrap justify-between gap-x-4 border-t border-line py-2">
                {/* A plain link: this redirects to a short-lived file URL, so it must not be prefetched. */}
                <a href={`/admin/documents/${document.id}`} className="text-text underline underline-offset-4 hover:text-gold">
                  {document.title}
                </a>
                <span className="text-muted">{formatDate(document.created_at)}</span>
              </li>
            ))}
          </ul>
          <ActionForm action={uploadDocument} className="mt-3 grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end" resetOnSuccess>
            <input type="hidden" name="org_id" value={client.id} />
            <TextField label="Title" name="title" required />
            <Field label="File (PDF, PNG or JPEG, up to 4 MB)">
              <input name="file" type="file" required accept=".pdf,.png,.jpg,.jpeg" className={inputClass} />
            </Field>
            <button type="submit" className={secondaryButtonClass}>
              Upload
            </button>
          </ActionForm>
        </Panel>

        <Panel>
          <SectionTitle>Notes</SectionTitle>
          <ActionForm action={updateClientNotes} className="mt-3 grid gap-3">
            <input type="hidden" name="id" value={client.id} />
            <textarea name="notes" aria-label="Notes" rows={5} defaultValue={client.notes ?? ""} className={inputClass} />
            <button type="submit" className={`${secondaryButtonClass} justify-self-start`}>
              Save notes
            </button>
          </ActionForm>
        </Panel>

        <Panel>
          <SectionTitle>Activity</SectionTitle>
          <ul className="mt-3 text-sm">
            {((activity.data ?? []) as unknown as ActivityEntry[]).map((entry) => (
              <li key={entry.id} className="border-t border-line py-2">
                <p className="text-text">
                  {describeActivity(entry.action)}
                  <span className="text-muted"> · {entry.profiles?.full_name ?? entry.profiles?.email ?? "Unknown"} · {formatDateTime(entry.created_at)}</span>
                </p>
                {describeChanges(entry).map((line) => (
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

export default function ClientPage({ params }: { params: Params }) {
  return (
    <Suspense fallback={<Loading />}>
      <ClientDetail params={params} />
    </Suspense>
  );
}
