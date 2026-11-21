import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 50,
        statements: 70
      },
      exclude: [
        "node_modules/",
        "dist/",
        "client/",
        "prisma/",
        "src/server.ts",
        "src/modules/telegram/telegram.service.ts",
        "tests/"
      ]
    }
  }
});
