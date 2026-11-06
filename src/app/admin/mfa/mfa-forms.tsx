"use client";

import { useActionState } from "react";
import { inputClass, primaryButtonClass } from "@/components/admin/ui";
import { type EnrollState, startEnrollment, type VerifyState, verifyCode } from "./actions";

const initialVerify: VerifyState = {};
const initialEnroll: EnrollState = {};

export function VerifyForm({ factorId }: { factorId: string }) {
  const [state, action, pending] = useActionState(verifyCode, initialVerify);
  return (
    <form action={action} className="mt-6 flex flex-col gap-4">
      <input type="hidden" name="factorId" value={factorId} />
      <label className="text-sm font-medium text-text">
        6-digit code
        <input
          name="code"
          required
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          className={inputClass}
        />
      </label>
      <button type="submit" disabled={pending} className={`${primaryButtonClass} py-2.5`}>
        Verify
      </button>
      <p role="status" className="min-h-5 text-sm text-red">
        {state.error}
      </p>
    </form>
  );
}

export function EnrollFlow() {
  const [state, action, pending] = useActionState(startEnrollment, initialEnroll);

  if (state.factorId && state.qrCode) {
    return (
      <div className="mt-6">
        <p>Scan this with your authenticator app, then enter the code it shows.</p>
        {/* The QR code is a data URL from Supabase, so next/image has nothing to optimize. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={state.qrCode}
          alt="Authenticator setup QR code"
          width={200}
          height={200}
          className="mt-4 bg-white p-2"
        />
        <p className="mt-4 text-sm">Can’t scan it? Enter this key instead:</p>
        <code className="mt-1 block font-mono text-sm break-all text-text">{state.secret}</code>
        <VerifyForm factorId={state.factorId} />
      </div>
    );
  }

  return (
    <form action={action} className="mt-6">
      <button type="submit" disabled={pending} className={`${primaryButtonClass} w-full py-2.5`}>
        Set up authenticator
      </button>
      <p role="status" className="mt-4 min-h-5 text-sm text-red">
        {state.error}
      </p>
    </form>
  );
}
