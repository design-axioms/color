import preact from "@preact/preset-vite";
import { resolve } from "path";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  base: mode === "production" ? "/algebraic/demo/" : "/demo/",
  plugins: [preact()],
  resolve: {
    alias: {
      "color-system/math": resolve(__dirname, "../src/lib/math.ts"),
      "color-system/browser": resolve(__dirname, "../src/lib/browser.ts"),
      "color-system/generator": resolve(__dirname, "../src/lib/generator.ts"),
      "color-system/runtime": resolve(__dirname, "../src/lib/runtime.ts"),
      "color-system/types": resolve(__dirname, "../src/lib/types.ts"),
      "color-system/constants": resolve(__dirname, "../src/lib/constants.ts"),
      "color-system": resolve(__dirname, "../src/lib/index.ts"),
    },
  },
  server: {
    fs: {
      allow: [".."],
    },
  },
}));
