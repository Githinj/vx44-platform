import { randomBytes } from "node:crypto";
import { expect, type Locator, type Page, test } from "@playwright/test";
import en from "../src/i18n/app/en";

// Per-visitor limits on sign-in and the emailed sign-in link (SEC-241 review): 10 password attempts
// per visitor and email address in 15 minutes, then a translated "too many" message, without asking
// Supabase again. 3 sign-in links per visitor and address in an hour, likewise. The address is new
// on every run and has no account, so nothing else is affected, and no email is sent.

const EMAIL = `e2e-limit-${randomBytes(4).toString("hex")}@example.com`;

// Submits with `button` and waits for the server action's answer, since the status line can show
// the same text as the attempt before.
async function submit(page: Page, button: Locator) {
  const answered = page.waitForResponse((r) => r.request().method() === "POST" && new URL(r.url()).pathname === "/login");
  await button.click();
  await answered;
}

test("sign-in and the emailed link stop after their limits", async ({ page }) => {
  test.setTimeout(120_000);
  await page.goto("/login");
  const status = page.getByRole("status");
  const signIn = page.getByRole("button", { name: en.login.submit, exact: true });
  const link = page.getByRole("button", { name: en.login.magicLink });

  // Ten wrong passwords are each answered normally.
  for (let i = 1; i <= 10; i++) {
    await page.locator('input[name="email"]').fill(EMAIL);
    await page.locator('input[name="password"]').fill(`wrong password ${i}`);
    await submit(page, signIn);
    await expect(status, `attempt ${i}`).toHaveText(en.login.mismatch);
  }
  // The eleventh is refused.
  await page.locator('input[name="email"]').fill(EMAIL);
  await page.locator('input[name="password"]').fill("wrong password 11");
  await submit(page, signIn);
  await expect(status).toHaveText(en.login.tooManyAttempts);

  // Sign-in links: three get the usual reply, the fourth is refused. On a fresh page: the form shows
  // a password error ahead of a link's reply, so the "too many attempts" above would hide it.
  await page.goto("/login");
  for (let i = 1; i <= 3; i++) {
    await page.locator('input[name="email"]').fill(EMAIL);
    await submit(page, link);
    await expect(status, `link ${i}`).toHaveText(en.login.linkSent);
  }
  await page.locator('input[name="email"]').fill(EMAIL);
  await submit(page, link);
  await expect(status).toHaveText(en.login.tooManyLinks);
});

// A bug on main found by the test above: the form showed a password error ahead of any link reply,
// so after a wrong password, asking for a sign-in link still showed the old error, although the
// link was sent. Each button's reply now shows when it's the latest.
test("the form shows the reply to the button pressed last", async ({ page }) => {
  const email = `e2e-last-${randomBytes(4).toString("hex")}@example.com`;
  await page.goto("/login");
  const status = page.getByRole("status");
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill("wrong password");
  await submit(page, page.getByRole("button", { name: en.login.submit, exact: true }));
  await expect(status).toHaveText(en.login.mismatch);

  await page.locator('input[name="email"]').fill(email);
  await submit(page, page.getByRole("button", { name: en.login.magicLink }));
  await expect(status).toHaveText(en.login.linkSent);

  // And back: a wrong password after the link shows the password's reply again.
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill("wrong password again");
  await submit(page, page.getByRole("button", { name: en.login.submit, exact: true }));
  await expect(status).toHaveText(en.login.mismatch);
});
