import type { Metadata } from "next";
import { Suspense } from "react";
import { setFirstPassword } from "@/app/(app)/portal/actions";
import { ActionForm } from "@/components/admin/action-form";
import { Loading, PageTitle, Panel, primaryButtonClass } from "@/components/admin/ui";
import { PasswordFields } from "@/components/portal/password-fields";
import { getAppText } from "@/i18n/app-text";
import { fill } from "@/i18n/format";
import { requireClient } from "@/lib/auth";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getAppText()).t.meta.setPassword };
}

// Where an invite link lands (SEC-271), after /auth/confirm has signed the person in.
async function Welcome() {
  const [{ t }, { user }] = await Promise.all([getAppText(), requireClient()]);
  const p = t.portal;
  return (
    <>
      <p className="mt-3 max-w-prose text-sm">{fill(p.setPasswordBody, { email: user.email ?? "" })}</p>
      <Panel className="mt-6 max-w-md">
        <ActionForm action={setFirstPassword} className="space-y-4">
          <PasswordFields t={t.account} />
          <button type="submit" className={primaryButtonClass}>
            {p.setPasswordSubmit}
          </button>
        </ActionForm>
      </Panel>
    </>
  );
}

export default async function SetPasswordPage() {
  const { t } = await getAppText();
  return (
    <>
      <PageTitle>{t.meta.setPassword}</PageTitle>
      <Suspense fallback={<Loading label={t.common.loading} />}>
        <Welcome />
      </Suspense>
    </>
  );
}
