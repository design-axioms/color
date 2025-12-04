// @ts-check
import preact from "@astrojs/preact";
import starlight from "@astrojs/starlight";
import svelte from "@astrojs/svelte";
import { defineConfig } from "astro/config";
import path from "path";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://astro.build/config
export default defineConfig({
  site: "https://axioms.design",
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [[rehypeKatex, { output: "mathml" }]],
  },
  experimental: {
    fonts: [],
  },
  vite: {
    resolve: {
      alias: {
        "@lib": path.resolve(__dirname, "../src/lib"),
        "@axiomatic-design/color": path.resolve(__dirname, "../src/lib"),
      },
    },
  },
  integrations: [
    svelte(),
    preact(),
    starlight({
      title: "Axiomatic Color",
      components: {
        Head: "./src/components/StarlightHead.astro",
      },
      customCss: [
        path.resolve(__dirname, "../css/engine.css"),
        path.resolve(__dirname, "../css/theme.css"),
        path.resolve(__dirname, "../css/utilities.css"),
        "./src/styles/docs.css",
        "./src/styles/starlight-custom.css",
      ],
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/design-axioms/color",
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
            { label: "Quick Start", slug: "guides/quick-start" },
            { label: "React Integration", slug: "guides/frameworks/react" },
            { label: "Svelte Integration", slug: "guides/frameworks/svelte" },
            { label: "Ember Integration", slug: "guides/frameworks/ember" },
            { label: "HTML / Vanilla", slug: "guides/frameworks/html" },
            { label: "Custom Frameworks", slug: "guides/frameworks/custom" },
            { label: "The Theme Studio", slug: "guides/theme-builder" },
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
          label: "Ecosystem",
          items: [
            { label: "Figma Integration", slug: "guides/ecosystem/figma" },
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
