"use client";

import type { ComponentProps } from "react";
import { useFormStatus } from "react-dom";

/**
 * A submit button for a plain server-action form (one without ActionForm, such as sign-out). It
 * turns itself off while its form is sending, so a second press doesn't send it again, and says
 * so to assistive tech (aria-busy). Styling for the off state comes from the button's classes.
 */
export function PendingButton({ children, disabled, ...props }: ComponentProps<"button">) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" {...props} disabled={disabled || pending} aria-busy={pending || undefined}>
      {children}
    </button>
  );
}
