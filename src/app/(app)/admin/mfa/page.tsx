import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Loading } from "@/components/admin/ui";
import { Wordmark } from "@/components/marketing/wordmark";
import { requireAdminRole } from "@/lib/auth";
import { EnrollFlow, VerifyForm } from "./mfa-forms";

export const metadata: Metadata = {
  title: "Two-step verification",
  robots: { index: false },
};

async function MfaContent() {
  const { supabase } = await requireAdminRole();
  const { data: level } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (level?.currentLevel === "aal2") redirect("/admin");

  const { data: factors } = await supabase.auth.mfa.listFactors();
  const factor = factors?.totp[0];

  return factor ? (
    <>
      <h1 className="mt-8 text-3xl font-semibold tracking-[-0.02em]">Enter your code</h1>
      <VerifyForm factorId={factor.id} />
    </>
  ) : (
    <>
      <h1 className="mt-8 text-3xl font-semibold tracking-[-0.02em]">
        Set up two-step verification
      </h1>
      <p className="mt-4">The back office needs an authenticator app on every admin account.</p>
      <EnrollFlow />
    </>
  );
}

export default function MfaPage() {
  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-4 py-16">
      <Wordmark />
      <Suspense fallback={<Loading />}>
        <MfaContent />
      </Suspense>
    </main>
  );
}
