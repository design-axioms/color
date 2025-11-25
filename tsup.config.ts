import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/lib/**/*.ts", "src/cli/index.ts", "!src/lib/__tests__/**"],
  format: ["esm"],
  dts: true,
  clean: true,
  outDir: "dist",
  bundle: true,
  splitting: true,
  sourcemap: true,
  treeshake: true,
});
