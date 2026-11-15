import { expect, test } from "@playwright/test";
import { expectLogicalTabOrder, expectVisibleFocus, focused, tabTo } from "./keyboard";

// Keyboard-only use of the public pages and sign-in (docs/frontend-standards.md, section 8):
// Tab and Shift+Tab move in a logical order with a visible focus, nothing traps focus except the
// mobile menu while it's open (Escape closes it), and after a form answers, focus is still on
// something sensible instead of dropping back to the top of the page.

for (const path of ["/", "/privacy", "/login"]) {
  test(`${path} can be tabbed through in order, with visible focus`, async ({ page }) => {
    // One key press at a time through a whole page: slow on a busy machine.
    test.setTimeout(120_000);
    await page.goto(path, { waitUntil: "load" });
    const stops = await expectLogicalTabOrder(page);
    // Spot-check the focus indicator on the first few stops.
    await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
    for (let i = 0; i < Math.min(stops.length, 6); i++) {
      await page.keyboard.press("Tab");
      await expectVisibleFocus(page);
    }
  });
}

test("sign-in works from the keyboard and keeps focus after an error", async ({ page }) => {
  await page.goto("/login");
  await tabTo(page, /^Email$/);
  await page.keyboard.type("someone@example.com");
  await page.keyboard.press("Tab");
  expect((await focused(page))?.label).toBe("Password");
  await page.keyboard.type("not the password");

  // Submit from the button. These browser tests run without Supabase, so sign-in answers with
  // an error, which is exactly the case to check: focus mustn't fall back to the page.
  await page.keyboard.press("Tab");
  expect((await focused(page))?.label).toBe("Sign in");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("status")).not.toBeEmpty();
  await expect.poll(async () => (await focused(page))?.label ?? null).toBe("Sign in");

  // Shift+Tab goes back the way it came.
  await page.keyboard.press("Shift+Tab");
  expect((await focused(page))?.label).toBe("Password");
});

test.describe("on a phone", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test("the menu opens from the keyboard, holds focus while open and closes with Escape", async ({ page }) => {
    await page.goto("/", { waitUntil: "load" });
    const menuButton = page.locator('button[aria-controls="mobile-menu"]');
    await tabTo(page, /^Open menu$/);
    await page.keyboard.press("Enter");
    await expect(menuButton).toHaveAttribute("aria-expanded", "true");

    // Focus moves into the menu and stays there, in both directions.
    const inside = () => page.evaluate(() => {
      const active = document.activeElement;
      return Boolean(active?.closest("#mobile-menu") || active?.getAttribute("aria-controls") === "mobile-menu");
    });
    await expect.poll(inside).toBe(true);
    for (let i = 0; i < 12; i++) {
      await page.keyboard.press("Tab");
      expect(await inside(), "Tab left the open menu").toBe(true);
    }
    for (let i = 0; i < 12; i++) {
      await page.keyboard.press("Shift+Tab");
      expect(await inside(), "Shift+Tab left the open menu").toBe(true);
    }

    await page.keyboard.press("Escape");
    await expect(menuButton).toHaveAttribute("aria-expanded", "false");
    await expect(menuButton).toBeFocused();
  });
});

test("after the lead form is refused, focus goes to the field that needs fixing", async ({ page }) => {
  // The API refuses the email address; nothing is saved or sent.
  await page.route("**/api/leads", (route) =>
    route.fulfill({
      status: 422,
      contentType: "application/json",
      body: JSON.stringify({ ok: false, fieldErrors: { email: ["Enter a valid email address."] } }),
    }),
  );
  await page.goto("/demo");
  await page.fill('[name="fullName"]', "Test Visitor");
  await page.fill('[name="businessName"]', "Example Store");
  await page.fill('[name="email"]', "visitor@example.com");
  await page.fill('[name="phone"]', "+1 555 0100");
  await page.fill('[name="city"]', "Austin");
  await page.fill('[name="state"]', "TX");
  await page.fill('[name="cameraCount"]', "8");
  await page.selectOption('[name="dvrBrand"]', "Hikvision");
  await page.check('[name="knowsDvrPassword"][value="yes"]');
  await expect(page.locator('[name="cf-turnstile-response"]')).not.toHaveValue("", { timeout: 20_000 });

  await page.locator('form button[type="submit"]').focus();
  await page.keyboard.press("Enter");
  await expect(page.locator('[name="email"]')).toHaveAttribute("aria-invalid", "true");
  await expect(page.locator('[name="email"]')).toBeFocused();
});
