import { z } from "zod";

// Two-step verification (TOTP) forms for the client portal (SEC-276). The back office has its own
// copy in src/app/(app)/admin/mfa/; once Phase 1B ships, it can move onto these.

export type EnrollState = {
  error?: string;
  factorId?: string;
  qrCode?: string;
  secret?: string;
};

export type VerifyState = { error?: string; saved?: string };

/** A code from an authenticator app, for the factor it belongs to. */
export const codeSchema = z.object({
  factorId: z.uuid(),
  code: z.string().trim().regex(/^\d{6}$/),
});
