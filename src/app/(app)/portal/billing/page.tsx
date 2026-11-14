import type { Metadata } from "next";
import { Suspense } from "react";
import { Loading, PageTitle, Panel, formatDate, primaryButtonClass } from "@/components/admin/ui";
import { Detail, type HeadingLevel, NoOrganization, OrgGroups } from "@/components/portal/ui";
import type { AppDictionary } from "@/i18n/app/en";
import { getAppText } from "@/i18n/app-text";
import { currentSubscriptions, groupByOrg, httpsLink, labelFor } from "@/lib/portal/logic";
import { type PortalSubscription, loadOrganizations, loadSubscriptions } from "@/lib/portal/queries";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getAppText()).t.meta.billing };
}

function SubscriptionCard({
  subscription,
  t,
  format,
  heading: Heading,
}: {
  subscription: PortalSubscription;
  t: AppDictionary;
  format: string;
  heading: HeadingLevel;
}) {
  const p = t.portal;
  // payment_ref holds either a payment link or an invoice reference. Only an https:// link
  // becomes a "Pay now" button; anything else is shown as a reference.
  const payLink = httpsLink(subscription.payment_ref);
  const reference = payLink ? null : subscription.payment_ref?.trim();
  return (
    <Panel>
      <Heading className="font-semibold text-text">{subscription.plan_name ?? t.common.unknown}</Heading>
      <dl className="mt-3 text-sm">
        <Detail term={p.camerasBilled}>
          <span className="tabular-nums">{subscription.cameras_billed}</span>
        </Detail>
        <Detail term={p.subscriptionStatus}>{labelFor(t.status.subscription, subscription.status)}</Detail>
        <Detail term={p.renews}>{formatDate(subscription.renews_at, format)}</Detail>
        {reference && <Detail term={p.paymentReference}>{reference}</Detail>}
      </dl>
      {payLink && subscription.status !== "cancelled" && (
        <a href={payLink} target="_blank" rel="noopener noreferrer" className={`mt-4 ${primaryButtonClass}`}>
          {p.payNow}
          <span className="sr-only"> {p.opensInNewTab}</span>
        </a>
      )}
    </Panel>
  );
}

async function Billing() {
  const [{ t, format }, organizations, subscriptions] = await Promise.all([
    getAppText(),
    loadOrganizations(),
    loadSubscriptions(),
  ]);
  if (organizations.length === 0) return <NoOrganization text={t.portal.noOrganization} />;

  return (
    <OrgGroups
      groups={groupByOrg(organizations, subscriptions)}
      render={(items, heading) =>
        items.length === 0 ? (
          <p className="text-sm">{t.portal.noBilling}</p>
        ) : (
          <ul className="grid gap-3 md:grid-cols-2">
            {currentSubscriptions(items).map((subscription) => (
              <li key={subscription.id}>
                <SubscriptionCard subscription={subscription} t={t} format={format} heading={heading} />
              </li>
            ))}
          </ul>
        )
      }
    />
  );
}

export default async function BillingPage() {
  const { t } = await getAppText();
  return (
    <>
      <PageTitle>{t.meta.billing}</PageTitle>
      <Suspense fallback={<Loading label={t.common.loading} />}>
        <Billing />
      </Suspense>
    </>
  );
}
