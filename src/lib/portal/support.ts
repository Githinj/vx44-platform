import { z } from "zod";

// The portal's support form. Validation messages are keys into the translated `errors`
// (src/i18n/app/en.ts), read back with firstError().

export const SUPPORT_MESSAGE_MAX = 5000;

export const supportSchema = z.object({
  // Only sent when the client belongs to more than one organization and picks one.
  org_id: z.uuid().optional(),
  message: z
    .string({ error: "writeMessage" })
    .trim()
    .min(1, "writeMessage")
    .max(SUPPORT_MESSAGE_MAX, "messageTooLong"),
});

/**
 * The organization a message is about. The form sends org_id only when there's a choice, so a
 * client with one organization gets that one. A client with several must pick one of their own;
 * anything else returns null.
 */
export function supportOrganization<O extends { id: string }>(
  organizations: O[],
  orgId: string | undefined,
): O | null {
  if (orgId) return organizations.find((organization) => organization.id === orgId) ?? null;
  return organizations.length === 1 ? organizations[0] : null;
}
