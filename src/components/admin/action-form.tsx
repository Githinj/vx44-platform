"use client";

import { type ReactNode, useActionState, useEffect, useRef } from "react";
import type { ActionState } from "@/lib/admin/action-state";

type ActionFormProps = {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  children: ReactNode;
  className?: string;
  resetOnSuccess?: boolean;
};

// Disables its controls while saving and reports the outcome next to them. Both the error and the
// "Saved" confirmation arrive already translated from the server action.
export function ActionForm({ action, children, className, resetOnSuccess }: ActionFormProps) {
  const [state, formAction, pending] = useActionState(action, {});
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.saved && resetOnSuccess) formRef.current?.reset();
  }, [state, resetOnSuccess]);

  return (
    <form ref={formRef} action={formAction} className={className}>
      <fieldset disabled={pending} className="contents">
        {children}
      </fieldset>
      <p role="status" className="min-h-5 text-sm">
        {state.error && <span className="text-red">{state.error}</span>}
        {state.saved && !pending && <span className="text-green">{state.saved}</span>}
      </p>
    </form>
  );
}
