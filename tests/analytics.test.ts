import { describe, expect, it } from "vitest";
import { withoutQuery } from "@/lib/analytics";

describe("withoutQuery", () => {
  it("reports the page without its query string or fragment", () => {
    const event = { type: "pageview" as const, url: "https://www.vx44ai.com/es/demo?email=dana%40example.com&utm_source=x#form" };
    expect(withoutQuery(event)).toEqual({ type: "pageview", url: "https://www.vx44ai.com/es/demo" });
  });

  it("keeps the other fields, such as the Speed Insights route", () => {
    const event = { type: "vital" as const, url: "https://www.vx44ai.com/?a=1", route: "/[lang]" };
    expect(withoutQuery(event)).toEqual({ type: "vital", url: "https://www.vx44ai.com/", route: "/[lang]" });
  });

  it("passes through a URL it can't parse", () => {
    const event = { type: "event" as const, url: "not a url" };
    expect(withoutQuery(event)).toBe(event);
  });
});
