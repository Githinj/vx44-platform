"use client";

import { useActionState, useId, useRef } from "react";
import { inputClass, primaryButtonClass, secondaryButtonClass } from "@/components/admin/ui";
import { AuthenticatorKey } from "@/components/authenticator-key";
import { useKeepFocus } from "@/components/use-keep-focus";
import type { AppDictionary } from "@/i18n/app/en";
import type { EnrollState, VerifyState } from "@/lib/mfa";

// Authenticator app (TOTP) forms for the client portal (SEC-276): enter a code, and set up an
// app. The server actions are passed in, so the same forms serve sign-in, setup and turning off.

type MfaText = AppDictionary["mfa"];
type VerifyAction = (state: VerifyState, formData: FormData) => Promise<VerifyState>;

const initialVerify: VerifyState = {};
const initialEnroll: EnrollState = {};

export function CodeForm({
  factorId,
  action,
  t,
  submitLabel,
  danger = false,
  focusOnShow = false,
}: {
  factorId: string;
  action: VerifyAction;
  t: MfaText;
  submitLabel?: string;
  /** A secondary button, for turning MFA off. */
  danger?: boolean;
  /** Take focus when it appears in place of the setup button, which had it. */
  focusOnShow?: boolean;
}) {
  const [state, formAction, pending] = useActionState(action, initialVerify);
  const formRef = useRef<HTMLFormElement>(null);
  // A wrong code marks the field invalid, so focus returns there for another try.
  useKeepFocus(formRef, pending);
  const statusId = useId();
  return (
    <form ref={formRef} action={formAction} className="mt-4 flex flex-col gap-4">
      <input type="hidden" name="factorId" value={factorId} />
      <label className="text-sm font-medium text-text">
        {t.codeLabel}
        <input
          name="code"
          required
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          autoFocus={focusOnShow}
          aria-invalid={Boolean(state.error) && !pending}
          aria-describedby={statusId}
          className={inputClass}
        />
      </label>
      <button type="submit" disabled={pending} className={`${danger ? secondaryButtonClass : primaryButtonClass} self-start`}>
        {submitLabel ?? t.verify}
      </button>
      <p id={statusId} role="status" className="min-h-5 text-sm">
        {state.error && <span className="text-red">{state.error}</span>}
        {state.saved && <span className="text-green">{state.saved}</span>}
      </p>
    </form>
  );
}

export function SetUpAuthenticator({
  enroll,
  verify,
  t,
}: {
  enroll: () => Promise<EnrollState>;
  verify: VerifyAction;
  t: MfaText;
}) {
  const [state, action, pending] = useActionState(enroll, initialEnroll);
  const formRef = useRef<HTMLFormElement>(null);
  useKeepFocus(formRef, pending);

  if (state.factorId && state.qrCode) {
    return (
      <div className="mt-4">
        <p className="text-sm">{t.scan}</p>
        {/* The QR code is a data URL from Supabase, so next/image has nothing to optimize. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={state.qrCode} alt={t.qrAlt} width={200} height={200} className="mt-4 bg-white p-2" />
        <AuthenticatorKey secret={state.secret ?? ""} uri={state.uri} t={t} />
        <CodeForm factorId={state.factorId} action={verify} t={t} focusOnShow />
      </div>
    );
  }

  return (
    <form ref={formRef} action={action} className="mt-4">
      <button type="submit" disabled={pending} className={secondaryButtonClass}>
        {t.setUp}
      </button>
      <p role="status" className="mt-2 min-h-5 text-sm text-red">
        {state.error}
      </p>
    </form>
  );
}
