import { describe, expect, it } from "vitest";
import { errorPageHome } from "@/lib/app-home";

// Where the sign-in, back-office and portal error page (src/app/(app)/error.tsx) sends its wordmark
// and "Go to the dashboard" link. It used to be /admin everywhere, which sent a client to "no access".
describe("errorPageHome", () => {
  it("keeps an admin in the back office", () => {
    expect(errorPageHome("/admin")).toBe("/admin");
    expect(errorPageHome("/admin/leads")).toBe("/admin");
    expect(errorPageHome("/admin/clients/3f0c")).toBe("/admin");
  });

  it("sends a portal error to the portal", () => {
    // The portal's own error page sits inside the portal layout, so an error in that layout lands here.
    expect(errorPageHome("/portal")).toBe("/portal");
    expect(errorPageHome("/portal/sites")).toBe("/portal");
  });

  it("uses the portal everywhere else, which sends each person on to their own home", () => {
    // /portal sends an admin on to /admin, a client to the overview, and anyone signed out to sign-in.
    for (const path of ["/login", "/no-access", "/auth/confirm", "/administrator", "/", null]) {
      expect(errorPageHome(path), String(path)).toBe("/portal");
    }
  });
});
