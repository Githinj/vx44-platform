import type { Metadata } from "next";
import { Wordmark } from "@/components/marketing/wordmark";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false },
};

export default function LoginPage() {
  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-4 py-16">
      <Wordmark />
      <h1 className="mt-8 text-3xl font-semibold tracking-[-0.02em]">Sign in</h1>
      <LoginForm />
    </main>
  );
}
