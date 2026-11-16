"use client";

import { useActionState, useRef } from "react";
import { inputClass, primaryButtonClass } from "@/components/admin/ui";
import { useKeepFocus } from "@/components/use-keep-focus";
import type { AppDictionary } from "@/i18n/app/en";
import { type EnrollState, startEnrollment, type VerifyState, verifyCode } from "./actions";

const initialVerify: VerifyState = {};
const initialEnroll: EnrollState = {};

type MfaText = AppDictionary["mfa"];

export function VerifyForm({ factorId, t, focusOnShow = false }: { factorId: string; t: MfaText; focusOnShow?: boolean }) {
  const [state, action, pending] = useActionState(verifyCode, initialVerify);
  const formRef = useRef<HTMLFormElement>(null);
  // A wrong code marks the field invalid, so focus returns there for another try.
  useKeepFocus(formRef, pending);
  return (
    <form ref={formRef} action={action} className="mt-6 flex flex-col gap-4">
      <input type="hidden" name="factorId" value={factorId} />
      <label className="text-sm font-medium text-text">
        {t.codeLabel}
        <input
          name="code"
          required
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          // Shown in place of the setup button, which had focus, so take it over.
          autoFocus={focusOnShow}
          aria-invalid={Boolean(state.error) && !pending}
          aria-describedby="mfa-code-status"
          className={inputClass}
        />
      </label>
      <button type="submit" disabled={pending} className={`${primaryButtonClass} py-2.5`}>
        {t.verify}
      </button>
      <p id="mfa-code-status" role="status" className="min-h-5 text-sm text-red">
        {state.error}
      </p>
    </form>
  );
}

export function EnrollFlow({ t }: { t: MfaText }) {
  const [state, action, pending] = useActionState(startEnrollment, initialEnroll);
  const formRef = useRef<HTMLFormElement>(null);
  useKeepFocus(formRef, pending);

  if (state.factorId && state.qrCode) {
    return (
      <div className="mt-6">
        <p>{t.scan}</p>
        {/* The QR code is a data URL from Supabase, so next/image has nothing to optimize. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={state.qrCode}
          alt={t.qrAlt}
          width={200}
          height={200}
          className="mt-4 bg-white p-2"
        />
        <p className="mt-4 text-sm">{t.cantScan}</p>
        <code className="mt-1 block font-mono text-sm break-all text-text">{state.secret}</code>
        <VerifyForm factorId={state.factorId} t={t} focusOnShow />
      </div>
    );
  }

  return (
    <form ref={formRef} action={action} className="mt-6">
      <button type="submit" disabled={pending} className={`${primaryButtonClass} w-full py-2.5`}>
        {t.setUp}
      </button>
      <p role="status" className="mt-4 min-h-5 text-sm text-red">
        {state.error}
      </p>
    </form>
  );
}
