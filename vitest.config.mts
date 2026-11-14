import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "server-only": fileURLToPath(new URL("./tests/helpers/empty.ts", import.meta.url)),
    },
  },
  test: {
    include: ["tests/**/*.test.ts"],
    testTimeout: 30000,
    // The database tests load every migration into PGlite in beforeAll, which can take
    // over a minute on a slow machine. The default 10 s hook timeout fails them there.
    hookTimeout: 120000,
  },
});
