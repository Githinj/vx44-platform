import type { Metadata } from "next";
import { Suspense } from "react";
import { sendSupportMessage } from "@/app/(app)/portal/actions";
import { ActionForm } from "@/components/admin/action-form";
import { Field, Loading, PageTitle, Panel, SectionTitle, SelectField, inputClass, primaryButtonClass } from "@/components/admin/ui";
import { EmailLink, PhoneLink } from "@/components/marketing/contact-links";
import { Detail } from "@/components/portal/ui";
import { getAppText } from "@/i18n/app-text";
import { fill } from "@/i18n/format";
import { requireClient } from "@/lib/auth";
import { SUPPORT_MESSAGE_MAX } from "@/lib/portal/support";
import { loadOrganizations } from "@/lib/portal/queries";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getAppText()).t.meta.support };
}

async function MessageForm() {
  const [{ t }, { user }, organizations] = await Promise.all([
    getAppText(),
    requireClient(),
    loadOrganizations(),
  ]);
  const p = t.portal;
  // A message is always about one of the client's businesses. Without one, they can still call
  // or email.
  if (organizations.length === 0) return <p className="mt-3 text-sm">{p.noOrganization}</p>;

  return (
    <ActionForm action={sendSupportMessage} resetOnSuccess className="mt-4 space-y-4">
      {organizations.length > 1 && (
        <SelectField
          label={p.business}
          name="org_id"
          options={organizations.map((organization) => organization.id)}
          labels={Object.fromEntries(organizations.map((organization) => [organization.id, organization.name]))}
        />
      )}
      <Field label={p.message}>
        <textarea name="message" required rows={6} maxLength={SUPPORT_MESSAGE_MAX} className={inputClass} />
      </Field>
      {user.email && <p className="text-sm text-muted">{fill(p.replyTo, { email: user.email })}</p>}
      <button type="submit" className={primaryButtonClass}>
        {p.send}
      </button>
    </ActionForm>
  );
}

export default async function SupportPage() {
  const { t } = await getAppText();
  const p = t.portal;
  return (
    <>
      <PageTitle>{t.meta.support}</PageTitle>
      <p className="mt-3 max-w-prose text-sm">{p.supportIntro}</p>
      <div className="mt-6 grid gap-3 lg:grid-cols-[1fr_2fr]">
        <Panel>
          <SectionTitle>{p.contactUs}</SectionTitle>
          <dl className="mt-3 text-sm">
            <Detail term={p.email}>
              <EmailLink />
            </Detail>
            <Detail term={p.phone}>
              <PhoneLink />
            </Detail>
          </dl>
        </Panel>
        <Panel>
          <SectionTitle>{p.sendMessage}</SectionTitle>
          <Suspense fallback={<Loading label={t.common.loading} />}>
            <MessageForm />
          </Suspense>
        </Panel>
      </div>
    </>
  );
}
