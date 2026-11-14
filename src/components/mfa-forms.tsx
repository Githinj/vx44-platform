"use client";

import { useActionState } from "react";
import { inputClass, primaryButtonClass, secondaryButtonClass } from "@/components/admin/ui";
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
}: {
  factorId: string;
  action: VerifyAction;
  t: MfaText;
  submitLabel?: string;
  /** A secondary button, for turning MFA off. */
  danger?: boolean;
}) {
  const [state, formAction, pending] = useActionState(action, initialVerify);
  return (
    <form action={formAction} className="mt-4 flex flex-col gap-4">
      <input type="hidden" name="factorId" value={factorId} />
      <label className="text-sm font-medium text-text">
        {t.codeLabel}
        <input name="code" required inputMode="numeric" autoComplete="one-time-code" maxLength={6} className={inputClass} />
      </label>
      <button type="submit" disabled={pending} className={`${danger ? secondaryButtonClass : primaryButtonClass} self-start`}>
        {submitLabel ?? t.verify}
      </button>
      <p role="status" className="min-h-5 text-sm">
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

  if (state.factorId && state.qrCode) {
    return (
      <div className="mt-4">
        <p className="text-sm">{t.scan}</p>
        {/* The QR code is a data URL from Supabase, so next/image has nothing to optimize. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={state.qrCode} alt={t.qrAlt} width={200} height={200} className="mt-4 bg-white p-2" />
        <p className="mt-4 text-sm">{t.cantScan}</p>
        <code className="mt-1 block font-mono text-sm break-all text-text">{state.secret}</code>
        <CodeForm factorId={state.factorId} action={verify} t={t} />
      </div>
    );
  }

  return (
    <form action={action} className="mt-4">
      <button type="submit" disabled={pending} className={secondaryButtonClass}>
        {t.setUp}
      </button>
      <p role="status" className="mt-2 min-h-5 text-sm text-red">
        {state.error}
      </p>
    </form>
  );
}
