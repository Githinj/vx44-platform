import type { Metadata } from "next";
import Link from "next/link";
import { Wordmark } from "@/components/marketing/wordmark";
import { getAppText } from "@/i18n/app-text";
import { localePath } from "@/i18n/config";
import { AcceptForm } from "./accept-form";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getAppText();
  return { title: t.meta.acceptInvite, robots: { index: false } };
}

type SearchParams = Promise<{ token_hash?: string | string[] }>;

// Where an invite link lands (via /auth/confirm). Opening it changes nothing: the button spends the
// one-time token, so a mail scanner that opens the link can't (SEC-241 review).
export default async function AcceptInvitePage({ searchParams }: { searchParams: SearchParams }) {
  const { t, locale } = await getAppText();
  const { token_hash: tokenHash } = await searchParams;
  return (
    <main id="main" tabIndex={-1} className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-4 py-16 outline-none">
      <Wordmark href={localePath(locale, "/")} label={t.common.homeLabel} />
      <h1 className="mt-8 text-3xl font-semibold tracking-[-0.02em]">{t.invite.heading}</h1>
      {typeof tokenHash === "string" && tokenHash ? (
        <>
          <p className="mt-4">{t.invite.body}</p>
          <AcceptForm tokenHash={tokenHash} t={t.invite} />
        </>
      ) : (
        <p className="mt-4">
          {t.invite.incomplete}{" "}
          <Link href="/login" className="underline underline-offset-4 hover:text-gold">
            {t.login.heading}
          </Link>
        </p>
      )}
    </main>
  );
}
