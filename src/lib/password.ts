import { z } from "zod";
import type { AppErrorKey } from "@/i18n/app/en";

// Rules for choosing a new password, shared by the portal Account page and, later, the page where
// an invited client sets their first password (SEC-271). Messages are keys into the translated
// `errors` (src/i18n/app/en.ts), read back with firstError().
//
// Supabase Auth applies its own rules too (minimum length, required characters, leaked-password
// checks), set in the project's Auth settings. Its refusals are mapped by passwordErrorKey().

// The errors.passwordShort and errors.passwordLong messages state these numbers in every language,
// so change them together.
export const PASSWORD_MIN = 10;
// bcrypt, which Supabase uses, reads only the first 72 bytes.
export const PASSWORD_MAX = 72;

export const newPasswordSchema = z
  .object({
    // Never trimmed: spaces are allowed in passwords.
    password: z.string().min(PASSWORD_MIN, "passwordShort").max(PASSWORD_MAX, "passwordLong"),
    confirm: z.string(),
  })
  .refine((value) => value.password === value.confirm, {
    message: "passwordMismatch",
    path: ["confirm"],
  });

/** The message for a password Supabase refused, or null for an unexpected failure. */
export function passwordErrorKey(code: string | undefined): AppErrorKey | null {
  switch (code) {
    case "same_password":
      return "passwordSame";
    case "weak_password":
      return "passwordWeak";
    default:
      return null;
  }
}
