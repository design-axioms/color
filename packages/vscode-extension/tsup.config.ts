import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/extension.ts"],
  external: ["vscode"],
  format: ["cjs"],
  shims: false,
  noExternal: ["web-tree-sitter"],
  sourcemap: true,
  clean: true,
});
