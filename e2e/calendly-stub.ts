import type { Page } from "@playwright/test";

// Calendly's real embed pulls about 3.5 MB from some 20 hosts, which made tests that showed the
// calendar slow and flaky (SEC-277). Tests stub both Calendly hosts instead: the widget script
// with a stand-in that frames the booking page, and the booking page with a blank document.
// Stubbed requests still pass the browser's Content Security Policy check first, so a policy that
// blocked either host still shows up as a console error.
const widgetStub = `window.Calendly = {
  initInlineWidget({ url, parentElement }) {
    const frame = document.createElement("iframe");
    frame.src = url;
    frame.title = "Booking calendar";
    frame.style.cssText = "width:100%;height:100%;border:0";
    parentElement.appendChild(frame);
  },
};`;

export const stubBookingTitle = "Stubbed booking page";

export function isCalendly(url: string) {
  const { hostname } = new URL(url);
  return hostname === "calendly.com" || hostname.endsWith(".calendly.com");
}

// On the browser context, so the booking page's own frame is covered too.
export async function stubCalendly(page: Page) {
  await page.context().route(/^https:\/\/([a-z0-9-]+\.)?calendly\.com\//, (route) => {
    const url = new URL(route.request().url());
    if (url.hostname === "assets.calendly.com") {
      return route.fulfill({ contentType: "application/javascript", body: widgetStub });
    }
    return route.fulfill({ contentType: "text/html", body: `<!doctype html><title>${stubBookingTitle}</title>` });
  });
}
