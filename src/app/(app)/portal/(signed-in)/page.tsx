import type { Metadata } from "next";
import { Suspense } from "react";
import { Loading, PageTitle, Panel } from "@/components/admin/ui";
import { Detail, NoOrganization } from "@/components/portal/ui";
import type { AppDictionary } from "@/i18n/app/en";
import { getAppText } from "@/i18n/app-text";
import { fill } from "@/i18n/format";
import {
  type StepState,
  currentSubscriptions,
  groupByOrg,
  labelFor,
  onboardingProgress,
} from "@/lib/portal/logic";
import { type PortalSubscription, loadOrganizations, loadSubscriptions } from "@/lib/portal/queries";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getAppText()).t.meta.overview };
}

type Text = AppDictionary;

const barColour: Record<StepState, string> = {
  done: "bg-green",
  current: "bg-text",
  upcoming: "bg-white/10",
};

function Timeline({ status, t }: { status: string; t: Text }) {
  const steps = onboardingProgress(status);
  const p = t.portal;

  // Paused and cancelled accounts are off the path to going live, so they get a plain line.
  if (!steps) {
    return (
      <p className="mt-3 text-sm text-text">
        {fill(p.accountStatus, { status: labelFor(t.status.org, status) })}
      </p>
    );
  }

  const stateText: Record<StepState, string> = {
    done: p.stepDone,
    current: p.stepCurrent,
    upcoming: p.stepUpcoming,
  };
  return (
    <ol className="mt-4 grid gap-x-2 gap-y-4 sm:grid-cols-3 lg:grid-cols-6">
      {steps.map(({ step, state }) => (
        <li key={step} aria-current={state === "current" ? "step" : undefined}>
          <span aria-hidden className={`block h-1 rounded-full ${barColour[state]}`} />
          <span className={`mt-2 block text-sm ${state === "upcoming" ? "text-muted" : "font-medium text-text"}`}>
            {t.status.org[step]}
          </span>
          <span className="sr-only">{stateText[state]}</span>
        </li>
      ))}
    </ol>
  );
}

function Subscriptions({ subscriptions, t }: { subscriptions: PortalSubscription[]; t: Text }) {
  const p = t.portal;
  if (subscriptions.length === 0) return <p className="mt-3 text-sm">{p.noPlan}</p>;
  return currentSubscriptions(subscriptions).map((subscription) => (
    <dl key={subscription.id} className="mt-3 text-sm">
      <Detail term={p.plan}>{subscription.plan_name ?? t.common.unknown}</Detail>
      <Detail term={p.camerasBilled}>
        <span className="tabular-nums">{subscription.cameras_billed}</span>
      </Detail>
      <Detail term={p.subscriptionStatus}>{labelFor(t.status.subscription, subscription.status)}</Detail>
    </dl>
  ));
}

async function Overview() {
  const [{ t }, organizations, subscriptions] = await Promise.all([
    getAppText(),
    loadOrganizations(),
    loadSubscriptions(),
  ]);
  if (organizations.length === 0) return <NoOrganization text={t.portal.noOrganization} />;

  return groupByOrg(organizations, subscriptions).map(({ organization, items }) => (
    <section key={organization.id} aria-labelledby={`org-${organization.id}`} className="mt-6 space-y-3">
      <h2 id={`org-${organization.id}`} className="text-lg font-semibold">
        {organization.name}
      </h2>
      <Panel>
        <h3 className="font-semibold text-text">{t.portal.onboarding}</h3>
        <Timeline status={organization.status} t={t} />
      </Panel>
      <Panel>
        <h3 className="font-semibold text-text">{t.portal.plan}</h3>
        <Subscriptions subscriptions={items} t={t} />
      </Panel>
    </section>
  ));
}

export default async function OverviewPage() {
  const { t } = await getAppText();
  return (
    <>
      <PageTitle>{t.meta.overview}</PageTitle>
      <Suspense fallback={<Loading label={t.common.loading} />}>
        <Overview />
      </Suspense>
    </>
  );
}
