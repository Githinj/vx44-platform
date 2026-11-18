import type { ActionState } from "@/lib/admin/action-state";

// The Account page's password form. `codeSent` is set once Supabase's secure password change has
// asked for an emailed code, and keeps the code field open until the password is changed.
export type PasswordState = ActionState & { codeSent?: boolean };

/** An emailed re-authentication code, as Supabase sends it: digits only (6 by default). */
export const reauthCodePattern = /^\d{6,10}$/;
