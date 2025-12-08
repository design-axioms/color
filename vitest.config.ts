import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    exclude: [
      ...configDefaults.exclude,
      "dist/**",
      "site/**",
      ".locald/**",
      "tests/verify-colors.spec.ts",
      "tests/visual.spec.ts",
      "tests/brand-button.spec.ts",
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["src/lib/**/*.ts", "src/cli/**/*.ts"],
      exclude: [
        "src/lib/**/*.test.ts",
        "src/lib/__tests__/**",
        "src/cli/__tests__/**",
      ],
      thresholds: {
        statements: 60,
        branches: 40,
        functions: 80,
        lines: 60,
      },
    },
  },
});
