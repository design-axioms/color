// @ts-check
import preact from "@astrojs/preact";
import starlight from "@astrojs/starlight";
import { defineConfig } from "astro/config";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://astro.build/config
export default defineConfig({
  vite: {
    resolve: {
      alias: {
        "@demo": path.resolve(__dirname, "../demo/src"),
        "@lib": path.resolve(__dirname, "../src/lib"),
      },
    },
  },
  integrations: [
    preact(),
    starlight({
      title: "Algebraic Color System",
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/wycats/algebraic",
        },
      ],
      sidebar: [
        {
          label: "Start Here",
          items: [
            { label: "Introduction", slug: "introduction" },
            { label: "Quick Start", slug: "quick-start" },
            { label: "Philosophy", slug: "philosophy" },
          ],
        },
        {
          label: "Core Concepts",
          items: [
            { label: "Surfaces", slug: "concepts/surfaces" },
            { label: "Context", slug: "concepts/context" },
            { label: "Accessibility", slug: "concepts/accessibility" },
            { label: "The Solver", slug: "concepts/solver" },
          ],
        },
        {
          label: "Deep Dive",
          items: [
            { label: "Understanding APCA", slug: "internals/apca" },
            { label: "Anchors", slug: "concepts/anchors" },
            { label: "Hue Shifting", slug: "concepts/hue-shifting" },
          ],
        },
        {
          label: "Usage",
          items: [
            { label: "CLI", slug: "usage/cli" },
            { label: "CSS Architecture", slug: "usage/css-architecture" },
            { label: "UI Primitives", slug: "usage/primitives" },
            { label: "Data Visualization", slug: "usage/data-viz" },
            { label: "Frameworks", slug: "usage/frameworks" },
          ],
        },
        {
          label: "API Reference",
          items: [
            { label: "Generator API", slug: "api/generator" },
            { label: "Solver API", slug: "api/solver" },
            { label: "Runtime API", slug: "api/runtime" },
          ],
        },
      ],
    }),
  ],
});
