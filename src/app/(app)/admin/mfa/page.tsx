import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Loading } from "@/components/admin/ui";
import { Wordmark } from "@/components/marketing/wordmark";
import { getAppText } from "@/i18n/app-text";
import { requireAdminRole } from "@/lib/auth";
import { EnrollFlow, VerifyForm } from "./mfa-forms";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getAppText();
  return { title: t.meta.mfa, robots: { index: false } };
}

async function MfaContent() {
  const { t } = await getAppText();
  const { supabase } = await requireAdminRole();
  const { data: level } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (level?.currentLevel === "aal2") redirect("/admin");

  const { data: factors } = await supabase.auth.mfa.listFactors();
  const factor = factors?.totp[0];

  return factor ? (
    <>
      <h1 className="mt-8 text-3xl font-semibold tracking-[-0.02em]">{t.mfa.enterCode}</h1>
      <VerifyForm factorId={factor.id} t={t.mfa} />
    </>
  ) : (
    <>
      <h1 className="mt-8 text-3xl font-semibold tracking-[-0.02em]">{t.mfa.setupTitle}</h1>
      <p className="mt-4">{t.mfa.setupBody}</p>
      <EnrollFlow t={t.mfa} />
    </>
  );
}

export default async function MfaPage() {
  const { t } = await getAppText();
  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-4 py-16">
      <Wordmark label={t.common.homeLabel} />
      <Suspense fallback={<Loading label={t.common.loading} />}>
        <MfaContent />
      </Suspense>
    </main>
  );
}
