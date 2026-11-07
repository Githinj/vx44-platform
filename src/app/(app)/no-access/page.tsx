import type { Metadata } from "next";
import { signOut } from "@/app/(app)/admin/actions";
import { secondaryButtonClass } from "@/components/admin/ui";
import { Wordmark } from "@/components/marketing/wordmark";
import { getAppText } from "@/i18n/app-text";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getAppText();
  return { title: t.meta.noAccess, robots: { index: false } };
}

export default async function NoAccessPage() {
  const { t } = await getAppText();
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-16">
      <Wordmark label={t.common.homeLabel} />
      <h1 className="mt-8 text-3xl font-semibold tracking-[-0.02em]">{t.noAccess.heading}</h1>
      <p className="mt-4">{t.noAccess.body}</p>
      <form action={signOut} className="mt-6">
        <button type="submit" className={secondaryButtonClass}>
          {t.common.signOut}
        </button>
      </form>
    </main>
  );
}
