import type { StatusEmailStatus } from "@/lib/email";
import { ORG_STATUSES } from "./types";

// When a client status change should email the client's owners (build spec section 6, SEC-272).

const EMAIL_STATUSES: readonly string[] = ["approved", "installed", "active"];

// Where each status sits on the way to going live. Paused and cancelled are off that path.
const ONBOARDING = ORG_STATUSES.filter((status) => status !== "paused" && status !== "cancelled") as string[];

/**
 * The status to email the owners about, or null. Only a move into approved, installed or active
 * counts: saving the same status again sends nothing, and so does stepping back along the
 * onboarding path (an admin correcting a mistake). Coming back from paused or cancelled does count.
 */
export function statusEmailFor(previous: string, next: string): StatusEmailStatus | null {
  if (previous === next || !EMAIL_STATUSES.includes(next)) return null;
  const from = ONBOARDING.indexOf(previous);
  if (from !== -1 && ONBOARDING.indexOf(next) < from) return null;
  return next as StatusEmailStatus;
}
