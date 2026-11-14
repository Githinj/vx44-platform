import { expect, test } from "@playwright/test";

// Sign-in from the outside only. These tests never submit the form or ask for a sign-in link:
// locally that would reach the real Supabase project. Signing in as an MFA admin and reaching
// the leads list needs a test Supabase stack, which CI doesn't have yet.

test("the back office sends signed-out visitors to sign-in", async ({ page }) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/login$/);
});

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
