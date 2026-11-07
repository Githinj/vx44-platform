"use client";

import { useActionState } from "react";
import { inputClass, primaryButtonClass, secondaryButtonClass } from "@/components/admin/ui";
import type { AppDictionary } from "@/i18n/app/en";
import { type LoginState, sendMagicLink, signInWithPassword } from "./actions";

const initialState: LoginState = {};

export function LoginForm({ t }: { t: AppDictionary["login"] }) {
  const [passwordState, passwordAction, passwordPending] = useActionState(
    signInWithPassword,
    initialState,
  );
  const [linkState, linkAction, linkPending] = useActionState(sendMagicLink, initialState);
  const pending = passwordPending || linkPending;
  const error = passwordState.error ?? linkState.error;

  return (
    <form action={passwordAction} className="mt-8 flex flex-col gap-4">
      <label className="text-sm font-medium text-text">
        {t.email}
        <input name="email" type="email" required autoComplete="email" className={inputClass} />
      </label>
      <label className="text-sm font-medium text-text">
        {t.password}
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          className={inputClass}
        />
      </label>
      <button type="submit" disabled={pending} className={`${primaryButtonClass} mt-2 py-2.5`}>
        {t.submit}
      </button>
      <button
        type="submit"
        formAction={linkAction}
        formNoValidate
        disabled={pending}
        className={`${secondaryButtonClass} py-2.5`}
      >
        {t.magicLink}
      </button>
      <p role="status" className="min-h-5 text-sm">
        {error && <span className="text-red">{error}</span>}
        {!error && linkState.notice && <span className="text-green">{linkState.notice}</span>}
      </p>
    </form>
  );
}
