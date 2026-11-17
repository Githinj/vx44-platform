import { expect, type Page } from "@playwright/test";
import en from "../src/i18n/app/en";

// Signed-in pages stream their content in behind a "Loading…" line (a Suspense fallback). After a
// navigation (a page.goto, a click, or a redirect such as sign-in → /admin/mfa) the URL, and even
// the load event, can come before the content. A test that reads the page in one go (counting
// buttons, axe, boundingBox) or walks it with Tab can then find only the header. That made three
// tests flaky on 2026-11-17 (#57, and the keyboard tests on #16 and #60).
//
// Locator actions (click, fill) and expect() assertions wait by themselves and don't need this.
// Call it before anything that doesn't. Pass the page language's loading text when it isn't
// English.

/** Waits until `<main>` is on the page and no longer shows a loading line. */
export async function contentShown(page: Page, loading: string = en.common.loading) {
  const main = page.getByRole("main");
  await expect(main).toBeVisible();
  await expect(main).not.toContainText(loading);
}

/** Opens `path`, then waits for its content (see contentShown). */
export async function openLoaded(page: Page, path: string, loading?: string) {
  await page.goto(path);
  await contentShown(page, loading);
}
