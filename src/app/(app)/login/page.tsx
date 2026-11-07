import type { Metadata } from "next";
import { Wordmark } from "@/components/marketing/wordmark";
import { getAppText } from "@/i18n/app-text";
import { LoginForm } from "./login-form";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getAppText();
  return { title: t.meta.signIn, robots: { index: false } };
}

export default async function LoginPage() {
  const { t } = await getAppText();
  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-4 py-16">
      <Wordmark label={t.common.homeLabel} />
      <h1 className="mt-8 text-3xl font-semibold tracking-[-0.02em]">{t.login.heading}</h1>
      <LoginForm t={t.login} />
    </main>
  );
}
