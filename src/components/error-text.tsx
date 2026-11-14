"use client";

import { createContext, useContext, type ReactNode } from "react";

// Error boundaries are Client Components, so they can't load the dictionaries themselves. Each
// root layout passes its translated error strings down through this provider instead.

export type ErrorText = {
  heading: string;
  body: string;
  retry: string;
  home: string;
  /** Accessible name for the VX44 wordmark link. */
  homeLabel: string;
  /** Followed by the error's digest, which matches the server log entry. */
  reference: string;
};

const ErrorTextContext = createContext<ErrorText | null>(null);

export function ErrorTextProvider({ value, children }: { value: ErrorText; children: ReactNode }) {
  return <ErrorTextContext value={value}>{children}</ErrorTextContext>;
}

const fallback: ErrorText = {
  heading: "Something went wrong",
  body: "This page didn’t load properly. Try again, or come back in a few minutes.",
  retry: "Try again",
  home: "Back to the homepage",
  homeLabel: "VX44 AI Monitoring home",
  reference: "Reference:",
};

export function useErrorText(): ErrorText {
  return useContext(ErrorTextContext) ?? fallback;
}

/** The server-log reference for an error, if it has one. Never the message, which can leak detail. */
export function errorDigest(error: unknown): string | undefined {
  if (error instanceof Error && "digest" in error && typeof error.digest === "string") return error.digest;
  return undefined;
}
