"use client";

import { useActionState } from "react";
import { primaryButtonClass } from "@/components/admin/ui";
import type { AppDictionary } from "@/i18n/app/en";
import { type AcceptState, acceptInvite } from "./actions";

const initialState: AcceptState = {};

export function AcceptForm({ tokenHash, t }: { tokenHash: string; t: AppDictionary["invite"] }) {
  const [state, action, pending] = useActionState(acceptInvite, initialState);
  return (
    <form action={action} className="mt-8 flex flex-col gap-4">
      <input type="hidden" name="token_hash" value={tokenHash} />
      <button type="submit" disabled={pending} aria-busy={pending} className={`${primaryButtonClass} min-h-11 py-2.5`}>
        {t.accept}
      </button>
      <p role="status" className="min-h-5 text-sm">
        {state.error && <span className="text-red">{state.error}</span>}
      </p>
    </form>
  );
}
