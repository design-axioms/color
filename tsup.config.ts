import { defineConfig } from "tsup";

export default defineConfig({
  entry: [
    "src/lib/**/*.ts",
    "src/cli/index.ts",
    "!src/**/__tests__/**",
    "!src/**/*.test.ts",
    "!src/**/*.spec.ts",
  ],
  format: ["esm"],
  dts: true,
  clean: true,
  outDir: "dist",
  bundle: true,
  splitting: true,
  sourcemap: true,
  treeshake: true,
});
