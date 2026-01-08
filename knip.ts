import type { KnipConfig } from "knip";

const config: KnipConfig = {
  workspaces: {
    ".": {
      entry: ["src/cli/index.ts", "src/lib/index.ts", "scripts/**/*.ts"],
      project: ["src/**/*.ts", "scripts/**/*.ts"],
      ignore: ["**/*.test.ts", "coverage/**", "dist/**"],
      ignoreDependencies: [
        // Used indirectly by tooling (invoked via CLIs/config) and not always statically imported.
        "http-proxy",
        "@types/http-proxy",
        "preact", // Used in tsconfig.json
        "@glimmer/env",
        "vercel",
        "vite",
      ],
    },
    site: {
      entry: ["astro.config.ts", "src/content.config.ts"],
      project: ["src/**/*.{ts,tsx,astro,svelte,mdx}"],
      ignore: ["dist/**", ".astro/**", "**/*.generated.ts"],
      ignoreDependencies: [
        "svelte-check",
        "sharp", // Used by Astro image optimization
        "@fontsource-variable/inter",
        "@fontsource-variable/jetbrains-mono",
        "@fontsource-variable/space-grotesk",
        "lucide-preact", // Used in components
        "katex",
        "unist-util-visit-parents",
      ],
    },
    "packages/vscode-extension": {
      entry: ["src/extension.ts", "scripts/*.js"],
      project: ["src/**/*.ts", "scripts/*.js"],
      ignoreDependencies: ["tree-sitter-wasms"],
    },
    // demo: {
    //   entry: ["src/main.tsx", "index.html"],
    //   project: ["src/**/*.{ts,tsx}"],
    //   ignoreDependencies: ["vite"],
    // },
  },
};

export default config;
