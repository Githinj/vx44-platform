import { expect, test } from "@playwright/test";

// Sign-in from the outside only. These tests never submit the form or ask for a sign-in link:
// locally that would reach the real Supabase project. Signing in as an MFA admin or a client
// needs a test Supabase stack, which CI doesn't have yet (SEC-269, SEC-275).

test("the back office sends signed-out visitors to sign-in", async ({ page }) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/login$/);
});

for (const path of ["/portal", "/portal/sites", "/portal/documents/00000000-0000-4000-8000-000000000000"]) {
  test(`the client portal sends signed-out visitors to sign-in: ${path}`, async ({ page }) => {
    await page.goto(path);
    await expect(page).toHaveURL(/\/login$/);
  });
}

test("sign-in fields are labelled and the skip link reaches main", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByLabel(/email/i)).toBeVisible();
  await expect(page.getByLabel(/password/i)).toBeVisible();

  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: "Skip to content" });
  await expect(skip).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("main#main")).toBeFocused();
});
