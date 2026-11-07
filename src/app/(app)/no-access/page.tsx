import type { Metadata } from "next";
import { signOut } from "@/app/(app)/admin/actions";
import { secondaryButtonClass } from "@/components/admin/ui";
import { Wordmark } from "@/components/marketing/wordmark";

export const metadata: Metadata = {
  title: "No access",
  robots: { index: false },
};

export default function NoAccessPage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-16">
      <Wordmark />
      <h1 className="mt-8 text-3xl font-semibold tracking-[-0.02em]">You don’t have access</h1>
      <p className="mt-4">This account can’t open the VX44 back office.</p>
      <form action={signOut} className="mt-6">
        <button type="submit" className={secondaryButtonClass}>
          Sign out
        </button>
      </form>
    </main>
  );
}
