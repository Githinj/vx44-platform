"use client";

import { useActionState, useRef } from "react";
import { inputClass, primaryButtonClass, secondaryButtonClass } from "@/components/admin/ui";
import { useKeepFocus } from "@/components/use-keep-focus";
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
  // Show the reply of the button that answered last. Before, a password error always came first, so
  // after a wrong password a link's "on its way" stayed hidden behind the old error.
  const latest = (linkState.at ?? 0) > (passwordState.at ?? 0) ? linkState : passwordState;
  const { error, notice } = latest;
  const formRef = useRef<HTMLFormElement>(null);
  // Both buttons are disabled while signing in, which drops keyboard focus.
  useKeepFocus(formRef, pending);

  return (
    <form ref={formRef} action={passwordAction} className="mt-8 flex flex-col gap-4">
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
        {!error && notice && <span className="text-green">{notice}</span>}
      </p>
    </form>
  );
}
