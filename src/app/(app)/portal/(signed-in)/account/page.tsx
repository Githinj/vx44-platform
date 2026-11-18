import type { Metadata } from "next";
import { Suspense } from "react";
import {
  changePassword,
  confirmMfaSetup,
  startMfaSetup,
  turnOffMfa,
  updateDetails,
} from "@/app/(app)/portal/actions";
import { ActionForm } from "@/components/admin/action-form";
import { CodeForm, SetUpAuthenticator } from "@/components/mfa-forms";
import { Field, Loading, PageTitle, Panel, SectionTitle, inputClass, primaryButtonClass } from "@/components/admin/ui";
import { ChangePasswordForm } from "@/components/portal/change-password-form";
import { PasswordFields } from "@/components/portal/password-fields";
import { Detail } from "@/components/portal/ui";
import { getAppText } from "@/i18n/app-text";
import { requireClient } from "@/lib/auth";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getAppText()).t.meta.account };
}

async function DetailsForm() {
  const [{ t }, { supabase, user }] = await Promise.all([getAppText(), requireClient()]);
  const a = t.account;
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("full_name, phone")
    .eq("id", user.id)
    .maybeSingle();
  if (error) throw new Error(error.message);

  return (
    <>
      <dl className="mt-3 text-sm">
        <Detail term={a.email}>{user.email ?? t.common.unknown}</Detail>
      </dl>
      <p className="mt-2 text-sm text-muted">{a.emailNote}</p>
      <ActionForm action={updateDetails} className="mt-4 space-y-4">
        <Field label={a.fullName}>
          <input name="full_name" autoComplete="name" maxLength={200} defaultValue={profile?.full_name ?? ""} className={inputClass} />
        </Field>
        <Field label={a.phone}>
          <input name="phone" type="tel" autoComplete="tel" maxLength={32} defaultValue={profile?.phone ?? ""} className={inputClass} />
        </Field>
        <button type="submit" className={primaryButtonClass}>
          {a.saveDetails}
        </button>
      </ActionForm>
    </>
  );
}

export default async function AccountPage() {
  const { t } = await getAppText();
  const a = t.account;
  return (
    <>
      <PageTitle>{t.meta.account}</PageTitle>
      <div className="mt-6 grid gap-3 lg:grid-cols-2">
        <Panel>
          <SectionTitle>{a.details}</SectionTitle>
          <Suspense fallback={<Loading label={t.common.loading} />}>
            <DetailsForm />
          </Suspense>
        </Panel>
        <Panel>
          <SectionTitle>{a.password}</SectionTitle>
          <ChangePasswordForm
            action={changePassword}
            labels={{ submit: a.changePassword, code: a.reauthCode, resend: a.resendCode }}
          >
            <PasswordFields t={a} />
          </ChangePasswordForm>
        </Panel>
        <Panel>
          <SectionTitle>{a.mfaTitle}</SectionTitle>
          <Suspense fallback={<Loading label={t.common.loading} />}>
            <TwoStepVerification />
          </Suspense>
        </Panel>
      </div>
    </>
  );
}

// Optional for clients (SEC-276). Once on, every sign-in asks for a code from the app.
async function TwoStepVerification() {
  const [{ t }, { supabase }] = await Promise.all([getAppText(), requireClient()]);
  const a = t.account;
  const { data: factors, error } = await supabase.auth.mfa.listFactors();
  if (error) throw new Error(error.message);
  const factor = factors.totp[0];

  if (factor) {
    return (
      <>
        <p className="mt-3 text-sm">{a.mfaOn}</p>
        <p className="mt-2 text-sm text-muted">{a.mfaTurnOffHint}</p>
        <CodeForm factorId={factor.id} action={turnOffMfa} t={t.mfa} submitLabel={a.mfaTurnOff} danger />
      </>
    );
  }
  return (
    <>
      <p className="mt-3 text-sm">{a.mfaOff}</p>
      <SetUpAuthenticator enroll={startMfaSetup} verify={confirmMfaSetup} t={t.mfa} />
    </>
  );
}
