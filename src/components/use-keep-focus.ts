"use client";

import { type RefObject, useEffect, useRef } from "react";

/**
 * Keeps keyboard users in place when a form answers. Forms disable their controls while they
 * send, and the browser drops focus from a control the moment it's disabled, back to the top of
 * the page. When sending finishes and focus is gone, this puts it back: on the first field the
 * answer marked invalid (aria-invalid), otherwise wherever it was in the form.
 */
export function useKeepFocus(formRef: RefObject<HTMLFormElement | null>, pending: boolean) {
  const lastFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const form = formRef.current;
    if (!form) return;
    const remember = (event: FocusEvent) => {
      lastFocused.current = event.target as HTMLElement;
    };
    form.addEventListener("focusin", remember);
    return () => form.removeEventListener("focusin", remember);
  }, [formRef]);

  useEffect(() => {
    if (pending) return;
    const active = document.activeElement;
    if (active && active !== document.body) return;
    const form = formRef.current;
    if (!form) return;
    const target = form.querySelector<HTMLElement>('[aria-invalid="true"]') ?? lastFocused.current;
    if (target?.isConnected && form.contains(target)) target.focus();
  }, [pending, formRef]);
}
