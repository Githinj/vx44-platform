import { expect, test } from "@playwright/test";

// Analytics stays off unless NEXT_PUBLIC_ANALYTICS_ENABLED=1 at build time (SEC-268). CI builds
// without it, so the public pages must load no analytics script and send nothing to Vercel's
// collection endpoints. If someone turns it on by default, this fails until the privacy policy
// and the decision are in place.
test("public pages load no analytics while it's switched off", async ({ page }) => {
  const collected: string[] = [];
  page.on("request", (request) => {
    if (/\/_vercel\/|vercel-scripts\.com/.test(request.url())) collected.push(request.url());
  });

  for (const path of ["/", "/es/demo", "/check"]) {
    await page.goto(path, { waitUntil: "load" });
    await expect(page.locator('script[src*="_vercel"], script[src*="vercel-scripts"]')).toHaveCount(0);
  }
  // Give a late script a moment to show up.
  await page.waitForTimeout(1500);
  expect(collected).toEqual([]);
});
