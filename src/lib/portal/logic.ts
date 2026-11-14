// Client portal logic with no server or database access, so tests can reach it.

/** The onboarding steps a client sees, in order (build spec section 5). */
export const ONBOARDING_STEPS = [
  "lead",
  "compatibility_check",
  "approved",
  "adapter_shipped",
  "installed",
  "active",
] as const;

export type OnboardingStep = (typeof ONBOARDING_STEPS)[number];
export type StepState = "done" | "current" | "upcoming";

/**
 * Each step's state for an organization status. Paused and cancelled aren't steps on the way to
 * going live, so they return null and the page shows the status on its own.
 */
export function onboardingProgress(
  status: string,
): { step: OnboardingStep; state: StepState }[] | null {
  const index = ONBOARDING_STEPS.indexOf(status as OnboardingStep);
  if (index === -1) return null;
  return ONBOARDING_STEPS.map((step, position) => ({
    step,
    state: position < index ? "done" : position === index ? "current" : "upcoming",
  }));
}

/**
 * The value as a link, only if it is a full https:// address. Camera and payment links are typed
 * in by an admin, so anything else (an invoice number, a typo, a javascript: URL) is never linked.
 */
export function httpsLink(value: string | null | undefined): string | null {
  const text = value?.trim();
  if (!text) return null;
  try {
    const url = new URL(text);
    return url.protocol === "https:" && url.hostname ? url.href : null;
  } catch {
    return null;
  }
}

/** The translated label for a stored value, or the value itself if there's no label for it. */
export function labelFor(labels: Record<string, string>, value: string): string {
  return Object.hasOwn(labels, value) ? labels[value] : value;
}

type SubscriptionLike = { status: string; created_at: string };

/**
 * The subscriptions to show as current: every one that isn't cancelled, newest first. If all of
 * them are cancelled, the most recent one, so a cancelled client still sees where they stand.
 */
export function currentSubscriptions<T extends SubscriptionLike>(subscriptions: T[]): T[] {
  const newestFirst = [...subscriptions].sort((a, b) => b.created_at.localeCompare(a.created_at));
  const live = newestFirst.filter((subscription) => subscription.status !== "cancelled");
  if (live.length > 0) return live;
  return newestFirst.slice(0, 1);
}

/**
 * Items grouped under each organization, in the organizations' order. A client normally belongs to
 * one organization, but the schema allows several. Items for an organization the client can't
 * see are dropped.
 */
export function groupByOrg<O extends { id: string }, T extends { org_id: string }>(
  organizations: O[],
  items: T[],
): { organization: O; items: T[] }[] {
  return organizations.map((organization) => ({
    organization,
    items: items.filter((item) => item.org_id === organization.id),
  }));
}
