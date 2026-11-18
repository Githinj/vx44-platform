"use client";

import { type FormEvent, type ReactNode, startTransition, useActionState, useEffect, useRef } from "react";
import { useKeepFocus } from "@/components/use-keep-focus";
import type { ActionState } from "@/lib/admin/action-state";

type ActionFormProps<S extends ActionState> = {
  // Awaited<S>, as React types the state it hands back; for a concrete state type it is the same.
  action: (state: Awaited<S>, formData: FormData) => Promise<S>;
  /** Or a function of the last reply, for a form whose fields depend on it (client code only). */
  children: ReactNode | ((state: Awaited<S>) => ReactNode);
  className?: string;
  resetOnSuccess?: boolean;
};

// Disables its controls while saving and reports the outcome next to them. Both the error and the
// "Saved" confirmation arrive already translated from the server action.
export function ActionForm<S extends ActionState = ActionState>({
  action,
  children,
  className,
  resetOnSuccess,
}: ActionFormProps<S>) {
  const [state, formAction, pending] = useActionState<S, FormData>(action, {} as Awaited<S>);
  const formRef = useRef<HTMLFormElement>(null);
  // The fieldset below disables everything while saving, which drops keyboard focus.
  useKeepFocus(formRef, pending);

  useEffect(() => {
    if (state.saved && resetOnSuccess) formRef.current?.reset();
  }, [state, resetOnSuccess]);

  // React resets a <form action> after every action it runs, whether the save worked or was
  // refused. That wiped what the admin had typed when a save was refused, and put each <select>
  // back to the value the page first loaded with after a save, so the next save sent the old value
  // back (SEC-280). Sending the form from here skips that reset. Forms that should clear after
  // saving say so with resetOnSuccess. `action` stays on the form for a submit before the page has
  // loaded its scripts.
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget, (event.nativeEvent as SubmitEvent).submitter);
    startTransition(() => formAction(formData));
  }

  return (
    // While saving, every control is off (so nothing is sent twice) and the form says it's busy.
    <form ref={formRef} action={formAction} onSubmit={submit} className={className} aria-busy={pending || undefined}>
      <fieldset disabled={pending} className="contents">
        {typeof children === "function" ? children(state) : children}
      </fieldset>
      <p role="status" className="min-h-5 text-sm">
        {state.error && <span className="text-red">{state.error}</span>}
        {state.saved && !pending && <span className="text-green">{state.saved}</span>}
        {state.notice && !state.error && !pending && <span>{state.notice}</span>}
      </p>
    </form>
  );
}
