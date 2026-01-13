import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@axiomatic-design/color/bridge.css": path.resolve(
        __dirname,
        "../../css/bridge.css",
      ),
      "@axiomatic-design/color/engine.css": path.resolve(
        __dirname,
        "../../css/engine.css",
      ),
      "@axiomatic-design/color": path.resolve(
        __dirname,
        "../../src/lib/index.ts",
      ),
    },
  },
  server: {
    fs: {
      // Allow serving files from one level up to the project root
      allow: ["../.."],
    },
  },
});
