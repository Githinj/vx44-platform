import type { ReactNode } from "react";

// Each language provides the body of both legal pages. Top-level <h2> headings become the
// "On this page" contents list.
export type LegalContent = {
  privacy: () => ReactNode;
  terms: () => ReactNode;
};
