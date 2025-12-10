import type { KnipConfig } from "knip";

const config: KnipConfig = {
  workspaces: {
    ".": {
      entry: ["src/cli/index.ts", "src/lib/index.ts", "scripts/**/*.ts"],
      project: ["src/**/*.ts", "scripts/**/*.ts"],
      ignore: ["**/*.test.ts", "coverage/**", "dist/**"],
      ignoreDependencies: [
        // Used in scripts or config files but not imported in code
        "ts-json-schema-generator",
        "@vitest/coverage-v8",
        "@vitest/ui",
        "http-proxy",
        "@types/http-proxy",
        "@types/node",
        "typescript",
        "eslint",
        "typescript-eslint",
        "@eslint/js",
        "@typescript-eslint/eslint-plugin",
        "@typescript-eslint/parser",
        "playwright", // Used in tests
        "preact", // Used in tsconfig.json
        "astro-eslint-parser",
        "svelte-eslint-parser",
        "eslint-plugin-astro",
        "eslint-plugin-svelte",
        "eslint-config-prettier",
        "prettier-plugin-astro",
        "prettier-plugin-svelte",
        "globals",
        "@glimmer/env",
        "vercel",
        "vite",
      ],
    },
    site: {
      entry: ["astro.config.mjs", "src/content.config.ts"],
      project: ["src/**/*.{ts,tsx,astro,svelte,mdx}"],
      ignore: [
        "dist/**",
        ".astro/**",
        "src/components/builder/ColorPicker.svelte",
        "src/components/builder/SurfaceManager.svelte",
        "src/components/builder/SurfaceRow.svelte",
        "src/components/algebra/OrthogonalityDemo.svelte",
        "src/components/algebra/StateVectorDemo.svelte",
        "src/components/builder-v2/stage/ExportView.svelte",
        "src/components/inspector/InspectorPanel.svelte",
        "src/components/inspector/InspectorSurface.svelte",
        "src/components/inspector/TokenInspector.svelte",
      ],
      ignoreDependencies: [
        "@astrojs/check",
        "svelte-check",
        "typescript",
        "sharp", // Used by Astro image optimization
        "@fontsource-variable/inter",
        "@fontsource-variable/jetbrains-mono",
        "@fontsource-variable/space-grotesk",
        "apca-w3", // Used in components
        "lucide-preact", // Used in components
        "katex",
      ],
    },
    "packages/vscode-extension": {
      entry: ["src/extension.ts", "scripts/*.js"],
      project: ["src/**/*.ts", "scripts/*.js"],
      ignoreDependencies: [
        "@types/vscode",
        "@types/node",
        "tsup",
        "tree-sitter-wasms",
      ],
    },
    // demo: {
    //   entry: ["src/main.tsx", "index.html"],
    //   project: ["src/**/*.{ts,tsx}"],
    //   ignoreDependencies: ["vite"],
    // },
  },
};

export default config;
