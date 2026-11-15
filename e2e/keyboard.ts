import { expect, type Page } from "@playwright/test";

// Keyboard-only checks shared by the public and signed-in browser tests.

export type Stop = { tag: string; label: string; position: number };

/** What has focus right now, and where it sits in the page, or null if nothing (the body). */
export async function focused(page: Page): Promise<Stop | null> {
  return page.evaluate(() => {
    const element = document.activeElement as HTMLElement | null;
    if (!element || element === document.body) return null;
    const all = [...document.querySelectorAll("*")];
    const label =
      element.getAttribute("aria-label") ??
      (element as HTMLInputElement).labels?.[0]?.textContent?.trim() ??
      element.textContent?.trim().slice(0, 60) ??
      "";
    return { tag: element.tagName.toLowerCase(), label, position: all.indexOf(element) };
  });
}

/** Presses Tab until `match` has focus, failing after `limit` presses. */
export async function tabTo(page: Page, match: RegExp, limit = 60) {
  for (let i = 0; i < limit; i++) {
    await page.keyboard.press("Tab");
    const stop = await focused(page);
    if (stop && match.test(stop.label)) return stop;
  }
  throw new Error(`Tab never reached ${match}`);
}

/**
 * Tabs through the whole page from the top and checks the order is logical: every stop comes
 * later in the page than the one before (no jumps back from a stray tabindex), and focus gets
 * all the way through without being trapped. Returns the stops in order.
 */
export async function expectLogicalTabOrder(page: Page, limit = 150) {
  await page.evaluate(() => {
    (document.activeElement as HTMLElement | null)?.blur();
    for (const element of document.querySelectorAll("[data-kb-stop]")) element.removeAttribute("data-kb-stop");
  });
  // Each stop is tagged in the page, because positions shift while the app adds elements.
  const labels: string[] = [];
  for (let i = 0; i < limit; i++) {
    await page.keyboard.press("Tab");
    const stop = await page.evaluate((index) => {
      const element = document.activeElement as HTMLElement | null;
      if (!element || element === document.body) return null;
      // Back at a stop already visited: focus has wrapped round to the top.
      if (element.hasAttribute("data-kb-stop")) return null;
      element.setAttribute("data-kb-stop", String(index));
      return (element.getAttribute("aria-label") ?? element.textContent ?? element.tagName).trim().slice(0, 60);
    }, i);
    // Past the last control, focus leaves the page or wraps: the end of the order.
    if (stop === null) break;
    labels.push(stop);
  }
  expect(labels.length, "nothing on the page takes focus").toBeGreaterThan(0);
  expect(labels.length, `focus never left the page within ${limit} presses: a trap?`).toBeLessThan(limit);

  const problem = await page.evaluate(() => {
    const stops = [...document.querySelectorAll<HTMLElement>("[data-kb-stop]")].sort(
      (a, b) => Number(a.dataset.kbStop) - Number(b.dataset.kbStop),
    );
    for (let i = 1; i < stops.length; i++) {
      if (!(stops[i - 1].compareDocumentPosition(stops[i]) & Node.DOCUMENT_POSITION_FOLLOWING)) {
        return `focus jumped back from "${stops[i - 1].textContent?.trim().slice(0, 30)}" to "${stops[i].textContent?.trim().slice(0, 30)}"`;
      }
    }
    const reachable = [
      ...document.querySelectorAll<HTMLElement>("a[href], button, input, select, textarea, summary, [tabindex]"),
    ].filter(
      (element) =>
        element.tabIndex >= 0 &&
        !(element as HTMLButtonElement).disabled &&
        (element as HTMLInputElement).type !== "hidden" &&
        // Inside a closed <details> or a hidden sheet, nothing has a layout box.
        element.getClientRects().length > 0 &&
        getComputedStyle(element).visibility !== "hidden" &&
        !element.closest("[inert]"),
    );
    // A radio group is one stop: reaching any radio in it counts.
    const visitedGroups = new Set(
      [...document.querySelectorAll<HTMLInputElement>('input[type="radio"][data-kb-stop]')].map((radio) => radio.name),
    );
    const skipped = reachable.filter(
      (element) =>
        !element.hasAttribute("data-kb-stop") &&
        !((element as HTMLInputElement).type === "radio" && visitedGroups.has((element as HTMLInputElement).name)),
    );
    return skipped.length > 0
      ? `Tab never reached: ${skipped.map((element) => `"${(element.textContent ?? element.tagName).trim().slice(0, 30)}"`).join(", ")}`
      : "";
  });
  expect(problem, "logical tab order").toBe("");
  return labels;
}

/** The focused element looks different from when it isn't focused: an outline, ring or border. */
export async function expectVisibleFocus(page: Page) {
  const problem = await page.evaluate(() => {
    const element = document.activeElement as HTMLElement | null;
    if (!element || element === document.body) return "nothing has focus";
    // Outline style flips at once (it can't be animated), so compare it without waiting for
    // colour transitions; borders and rings are compared too, for fields styled without outlines.
    const read = () => {
      const style = getComputedStyle(element);
      const outline = style.outlineStyle !== "none" && parseFloat(style.outlineWidth) > 0 ? style.outlineStyle : "none";
      return [outline, style.boxShadow, style.borderColor].join("|");
    };
    const withFocus = read();
    element.blur();
    const without = read();
    element.focus();
    const name = `<${element.tagName.toLowerCase()}> "${(element.textContent ?? "").trim().slice(0, 30)}"`;
    return withFocus === without ? `no focus indicator on ${name}` : "";
  });
  expect(problem, "focus is visible").toBe("");
}

/** Focus is on something in the page, not dropped to the body. */
export async function expectFocusKept(page: Page, what: string) {
  const stop = await focused(page);
  expect(stop, `focus was lost after ${what}`).not.toBeNull();
  return stop!;
}
