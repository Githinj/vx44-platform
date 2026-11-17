"use client";

import { type ReactNode, useId, useState } from "react";
import { secondaryButtonClass } from "@/components/admin/ui";

// On a phone, the clients list's extra filters fold behind this button so the list starts on the
// first screen (SEC-280 round 2). Folded fields still send their values, so filters already on
// stay on. From `sm` up the button is hidden and the wrapper is `display: contents`, so the
// fields sit in the form's grid exactly as before.
export function MoreFilters({ label, className = "", children }: { label: string; className?: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((value) => !value)}
        className={`${secondaryButtonClass} min-h-11 sm:hidden`}
      >
        {label}
      </button>
      <div id={id} className={`${open ? "grid" : "hidden"} gap-3 sm:contents ${className}`}>
        {children}
      </div>
    </>
  );
}
