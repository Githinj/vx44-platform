import type { ConsoleMessage } from "@playwright/test";

// What browser tests treat as a problem in the console.

/**
 * React's hydration complaints: the server HTML didn't match what the browser rendered. In
 * development React logs the difference ("A tree hydrated but some attributes ... didn't
 * match"); in production builds it reports minified errors #418, #419, #422, #423 or #425.
 */
export const HYDRATION = /hydrat|did ?n[o']t match|server rendered HTML|Minified React error #4(18|19|22|23|25)/i;

/** A blocked script or resource under the Content Security Policy. */
export const CSP = /Content Security Policy|Refused to/i;

/** A hydration message at any level, or a CSP error. */
export function isConsoleProblem(message: ConsoleMessage): boolean {
  const text = message.text();
  if (HYDRATION.test(text)) return message.type() === "error" || message.type() === "warning";
  return message.type() === "error" && CSP.test(text);
}
