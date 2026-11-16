import { describe, expect, it } from "vitest";
import {
  currentSubscriptions,
  groupByOrg,
  httpsLink,
  labelFor,
  onboardingProgress,
} from "@/lib/portal/logic";

describe("onboardingProgress", () => {
  it("marks earlier steps done, the status current and later steps upcoming", () => {
    expect(onboardingProgress("approved")).toEqual([
      { step: "lead", state: "done" },
      { step: "compatibility_check", state: "done" },
      { step: "approved", state: "current" },
      { step: "adapter_shipped", state: "upcoming" },
      { step: "installed", state: "upcoming" },
      { step: "active", state: "upcoming" },
    ]);
  });

  it("makes active the last, current step", () => {
    const steps = onboardingProgress("active")!;
    expect(steps.at(-1)).toEqual({ step: "active", state: "current" });
    expect(steps.slice(0, -1).every((step) => step.state === "done")).toBe(true);
  });

  it.each(["paused", "cancelled", "something else"])("has no timeline for %s", (status) => {
    expect(onboardingProgress(status)).toBeNull();
  });
});

describe("httpsLink", () => {
  it("accepts a full https link", () => {
    expect(httpsLink(" https://view.example.com/site/1 ")).toBe("https://view.example.com/site/1");
  });

  it.each([
    null,
    "",
    "INV-1042",
    "http://view.example.com",
    "javascript:alert(1)",
    "data:text/html,hi",
    "//view.example.com",
    "view.example.com",
  ])("refuses %s", (value) => {
    expect(httpsLink(value)).toBeNull();
  });
});

describe("labelFor", () => {
  it("translates a known value and falls back to the stored value", () => {
    const labels = { online: "En ligne" };
    expect(labelFor(labels, "online")).toBe("En ligne");
    expect(labelFor(labels, "new_status")).toBe("new_status");
    expect(labelFor(labels, "toString")).toBe("toString");
  });
});

describe("currentSubscriptions", () => {
  const sub = (id: string, status: string, created_at: string) => ({ id, status, created_at });

  it("keeps every subscription that isn't cancelled, newest first", () => {
    const result = currentSubscriptions([
      sub("old", "active", "2026-01-01T00:00:00Z"),
      sub("gone", "cancelled", "2026-03-01T00:00:00Z"),
      sub("new", "trial", "2026-02-01T00:00:00Z"),
    ]);
    expect(result.map((s) => s.id)).toEqual(["new", "old"]);
  });

  it("shows the latest one when all are cancelled", () => {
    const result = currentSubscriptions([
      sub("first", "cancelled", "2026-01-01T00:00:00Z"),
      sub("second", "cancelled", "2026-02-01T00:00:00Z"),
    ]);
    expect(result.map((s) => s.id)).toEqual(["second"]);
  });

  it("returns nothing when there are none", () => {
    expect(currentSubscriptions([])).toEqual([]);
  });
});

describe("groupByOrg", () => {
  it("groups items under each organization in order and drops unknown orgs", () => {
    const orgs = [{ id: "b" }, { id: "a" }];
    const items = [
      { org_id: "a", n: 1 },
      { org_id: "b", n: 2 },
      { org_id: "x", n: 3 },
      { org_id: "a", n: 4 },
    ];
    expect(groupByOrg(orgs, items)).toEqual([
      { organization: { id: "b" }, items: [{ org_id: "b", n: 2 }] },
      { organization: { id: "a" }, items: [{ org_id: "a", n: 1 }, { org_id: "a", n: 4 }] },
    ]);
  });
});
