#!/usr/bin/env node
import { generateTokensCss } from '../chunk-EB6GU2YN.js';
import { solve, getKeyColorStats } from '../chunk-OKL7NJMK.js';
import '../chunk-LBEWBWXX.js';
import '../chunk-7LUK7J7M.js';
import { existsSync, writeFileSync, readFileSync } from 'fs';
import { join, resolve } from 'path';

// src/cli/default-config.ts
var DEFAULT_CONFIG = {
  anchors: {
    page: {
      light: {
        start: { background: 1 },
        end: { adjustable: true, background: 0.9 }
      },
      dark: {
        start: { background: 0.1 },
        end: { adjustable: true, background: 0.4 }
      }
    },
    inverted: {
      light: {
        start: { adjustable: true, background: 0.1 },
        end: { background: 0 }
      },
      dark: {
        start: { adjustable: true, background: 0.9 },
        end: { background: 1 }
      }
    },
    keyColors: {
      brand: "#6e56cf"
    }
  },
  hueShift: {
    curve: { p1: [0.5, 0], p2: [0.5, 1] },
    maxRotation: 5
  },
  borderTargets: {
    decorative: 10,
    interactive: 30,
    critical: 80
  },
  groups: [
    {
      name: "Base",
      surfaces: [
        {
          slug: "page",
          label: "Surface Page",
          description: "The base background of the application.",
          polarity: "page"
        },
        {
          slug: "workspace",
          label: "Surface Workspace",
          description: "A very light elevated surface, used for the main workspace area.",
          polarity: "page"
        }
      ]
    },
    {
      name: "Content",
      surfaces: [
        {
          slug: "card",
          label: "Surface Card",
          description: "A card-like element.",
          polarity: "page",
          contrastOffset: { light: 15, dark: 15 },
          states: [
            { name: "hover", offset: -5 },
            { name: "active", offset: -10 }
          ]
        },
        {
          slug: "action",
          label: "Surface Action",
          description: "A clickable action surface (e.g. button).",
          polarity: "page",
          contrastOffset: { light: 25, dark: 25 },
          states: [
            { name: "hover", offset: -5 },
            { name: "active", offset: -10 }
          ]
        }
      ]
    },
    {
      name: "Spotlight",
      surfaces: [
        {
          slug: "spotlight",
          label: "Surface Spotlight",
          description: "The darkest surface.",
          polarity: "inverted"
        }
      ]
    }
  ]
};

// src/cli/index.ts
var args = process.argv.slice(2);
var CWD = process.cwd();
if (import.meta.main) {
  if (args[0] === "init") {
    const targetPath = join(CWD, "color-config.json");
    if (existsSync(targetPath)) {
      console.error("Error: color-config.json already exists.");
      process.exit(1);
    }
    writeFileSync(targetPath, JSON.stringify(DEFAULT_CONFIG, null, 2));
    console.log("Created color-config.json");
    console.log("Run `color-system` to generate your theme.");
    process.exit(0);
  }
  const CONFIG_PATH = args[0] ? resolve(CWD, args[0]) : join(CWD, "color-config.json");
  const BASE_CSS_PATH = args[1] ? resolve(CWD, args[1]) : join(CWD, "theme.css");
  if (!args[0] && !args[1]) {
    try {
      readFileSync(CONFIG_PATH);
    } catch {
      console.error(
        "No config file found at default location: ./color-config.json"
      );
      console.error("Usage: color-system [config-file] [output-file]");
      console.error("   or: color-system init");
      process.exit(1);
    }
  }
  console.log("Reading config from:", CONFIG_PATH);
  const config = JSON.parse(readFileSync(CONFIG_PATH, "utf8"));
  console.log("Solving surfaces...");
  const { backgrounds } = solve(config);
  console.log("Generating CSS...");
  let css = generateTokensCss(
    config.groups,
    backgrounds,
    config.hueShift,
    config.borderTargets
  );
  const stats = getKeyColorStats(config.anchors.keyColors);
  if (stats.chroma !== void 0 || stats.hue !== void 0) {
    const vars = [];
    if (stats.chroma !== void 0)
      vars.push(`  --chroma-brand: ${stats.chroma};`);
    if (stats.hue !== void 0) vars.push(`  --hue-brand: ${stats.hue};`);
    if (vars.length > 0) {
      css = `:root {
${vars.join("\n")}
}

` + css;
    }
  }
  console.log("Writing CSS to:", BASE_CSS_PATH);
  writeFileSync(BASE_CSS_PATH, css);
  console.log("Done!");
}
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map