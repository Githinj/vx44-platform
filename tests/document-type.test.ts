import { describe, expect, it } from "vitest";
import { matchesDeclaredType } from "@/lib/admin/document-type";

const bytes = (...values: (number | string)[]) =>
  new Uint8Array(values.flatMap((v) => (typeof v === "string" ? [...Buffer.from(v)] : [v])));

describe("matchesDeclaredType", () => {
  it.each([
    ["application/pdf", bytes("%PDF-1.7\n%âãÏÓ")],
    ["application/pdf", bytes(0xef, 0xbb, 0xbf, "%PDF-1.4\n")], // a few bytes before the header
    ["image/png", bytes(0x89, "PNG", 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0x0d)],
    ["image/jpeg", bytes(0xff, 0xd8, 0xff, 0xe0, 0, 0x10, "JFIF")],
  ])("accepts a real %s", (type, head) => {
    expect(matchesDeclaredType(type, head)).toBe(true);
  });

  it.each([
    ["an HTML page renamed .pdf", "application/pdf", bytes("<!doctype html><script>")],
    ["a JPEG renamed .png", "image/png", bytes(0xff, 0xd8, 0xff, 0xe0)],
    ["a PNG renamed .jpg", "image/jpeg", bytes(0x89, "PNG", 0x0d, 0x0a, 0x1a, 0x0a)],
    ["an empty file", "application/pdf", new Uint8Array()],
    ["a type that isn't allowed", "image/svg+xml", bytes("<svg")],
  ])("refuses %s", (_case, type, head) => {
    expect(matchesDeclaredType(type, head)).toBe(false);
  });

  it("only looks for the PDF header in the first 1,024 bytes", () => {
    const late = new Uint8Array(2000);
    late.set(Buffer.from("%PDF-1.4"), 1500);
    expect(matchesDeclaredType("application/pdf", late)).toBe(false);
  });
});
