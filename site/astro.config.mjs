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
      customCss: [
        "./src/styles/engine.css",
        "./src/styles/theme.css",
        "./src/styles/utilities.css",
        "./src/styles/docs.css",
      ],
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/wycats/algebraic",
        },
      ],
      sidebar: [
        {
          label: "The Mental Model",
          items: [
            {
              label: "Thinking in Surfaces",
              slug: "concepts/thinking-in-surfaces",
            },
            {
              label: "The Physics of Light",
              slug: "concepts/physics-of-light",
            },
            {
              label: "Accessibility First",
              slug: "concepts/accessibility-first",
            },
          ],
        },
        {
          label: "Getting Started",
          items: [
            { label: "Installation", slug: "guides/installation" },
            { label: "The Theme Builder", slug: "guides/theme-builder" },
            { label: "Integration", slug: "guides/integration" },
          ],
        },
        {
          label: "The Catalog",
          items: [
            { label: "Surfaces", slug: "catalog/surfaces" },
            { label: "Actions", slug: "catalog/actions" },
            { label: "Typography", slug: "catalog/typography" },
            { label: "Data Visualization", slug: "catalog/data-viz" },
          ],
        },
        {
          label: "Advanced Topics",
          items: [
            { label: "Hue Shifting", slug: "advanced/hue-shifting" },
            { label: "Custom Surfaces", slug: "advanced/custom-surfaces" },
            { label: "Solver Internals", slug: "advanced/solver-internals" },
          ],
        },
        {
          label: "Reference",
          items: [
            { label: "CLI", slug: "reference/cli" },
            { label: "JavaScript API", slug: "reference/javascript-api" },
            { label: "Tokens", slug: "reference/tokens" },
          ],
        },
      ],
    }),
  ],
});
