"use client";

import type { ReactNode } from "react";
import { ActionForm } from "@/components/admin/action-form";
import { Field, inputClass, primaryButtonClass, secondaryButtonClass } from "@/components/admin/ui";
import type { PasswordState } from "@/lib/portal/password-change";

type Labels = { submit: string; code: string; resend: string };

// The Account page's password form. The new-password fields come in as children, rendered on the
// server. When Supabase's secure password change asks the person to confirm it's them (a session
// more than a day old), the reply opens a field for the code it emailed. The new password stays
// filled in, because ActionForm doesn't reset a form that wasn't saved.
export function ChangePasswordForm({
  action,
  labels,
  children,
}: {
  action: (state: PasswordState, formData: FormData) => Promise<PasswordState>;
  labels: Labels;
  children: ReactNode;
}) {
  return (
    <ActionForm action={action} resetOnSuccess className="mt-4 space-y-4">
      {(state) => (
        <>
          {children}
          {state.codeSent && (
            <Field label={labels.code}>
              {/* Focus moves here when the step opens, and back here when a code is refused. */}
              <input
                name="nonce"
                inputMode="numeric"
                autoComplete="one-time-code"
                required
                maxLength={10}
                autoFocus
                aria-invalid={state.error ? true : undefined}
                className={inputClass}
              />
            </Field>
          )}
          <div className="flex flex-wrap gap-2">
            <button type="submit" className={primaryButtonClass}>
              {labels.submit}
            </button>
            {state.codeSent && (
              // No checks on the other fields: a new code needs none of them.
              <button type="submit" name="resend" value="1" formNoValidate className={secondaryButtonClass}>
                {labels.resend}
              </button>
            )}
          </div>
        </>
      )}
    </ActionForm>
  );
}
