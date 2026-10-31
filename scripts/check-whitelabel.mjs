// Fails if the provider's name appears anywhere user-facing (build spec section 10).
// Database column names in supabase/ are internal and are not scanned.
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const ROOTS = ["src", "public"];
const FORBIDDEN = /videoloft/i;

function* walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(path);
    else yield path;
  }
}

const matches = [];
for (const root of ROOTS) {
  for (const file of walk(root)) {
    readFileSync(file, "utf8")
      .split("\n")
      .forEach((line, index) => {
        if (FORBIDDEN.test(line)) matches.push(`${file}:${index + 1}`);
      });
  }
}

if (matches.length > 0) {
  console.error(`White-label check failed. Forbidden provider name found in:\n${matches.join("\n")}`);
  process.exit(1);
}
console.log("White-label check passed.");
