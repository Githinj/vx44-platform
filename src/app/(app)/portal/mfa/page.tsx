import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { signOut } from "@/app/(app)/admin/actions";
import { verifySignInCode } from "@/app/(app)/portal/actions";
import { Loading, PageTitle, Panel } from "@/components/admin/ui";
import { CodeForm } from "@/components/mfa-forms";
import { PendingButton } from "@/components/pending-button";
import { getAppText } from "@/i18n/app-text";
import { hasVerifiedFactor, requireClientRole } from "@/lib/auth";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getAppText()).t.meta.mfa };
}

// Where requireClient() sends a client who turned on two-step verification (SEC-276) but hasn't
// entered a code this session.
async function Challenge() {
  const [{ t }, { supabase, user }] = await Promise.all([getAppText(), requireClientRole()]);
  if (!hasVerifiedFactor(user)) redirect("/portal");
  const { data: level } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (level?.currentLevel === "aal2") redirect("/portal");

  const factor = user.factors?.find((candidate) => candidate.status === "verified" && candidate.factor_type === "totp");
  if (!factor) redirect("/portal");

  return (
    <Panel className="mt-6 max-w-md">
      <p className="text-sm">{t.portal.mfaPrompt}</p>
      <CodeForm factorId={factor.id} action={verifySignInCode} t={t.mfa} />
      <p className="mt-2 text-sm text-muted">{t.portal.mfaLost}</p>
      <form action={signOut} className="mt-4">
        <PendingButton className="text-sm underline underline-offset-4 transition hover:text-gold disabled:opacity-60">
          {t.common.signOut}
        </PendingButton>
      </form>
    </Panel>
  );
}

export default async function PortalMfaPage() {
  const { t } = await getAppText();
  return (
    <>
      <PageTitle>{t.mfa.enterCode}</PageTitle>
      <Suspense fallback={<Loading label={t.common.loading} />}>
        <Challenge />
      </Suspense>
    </>
  );
}
