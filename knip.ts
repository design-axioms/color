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
        "tsup",
        "vitest",
        "@vitest/coverage-v8",
        "@vitest/ui",
        "lefthook",
        "publint",
        "glob",
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
      ],
    },
    site: {
      entry: ["astro.config.mjs", "src/content.config.ts"],
      project: ["src/**/*.{ts,tsx,astro,svelte,mdx}"],
      ignore: ["dist/**", ".astro/**"],
      ignoreDependencies: [
        "astro",
        "@astrojs/check",
        "typescript",
        "sharp", // Used by Astro image optimization
        "@fontsource-variable/inter",
        "@fontsource-variable/jetbrains-mono",
        "@fontsource-variable/space-grotesk",
        "apca-w3", // Used in components
        "lucide-preact", // Used in components
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
