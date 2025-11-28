#!/usr/bin/env node
import { toDTCG } from '../chunk-MX7VB6WC.js';
import { toTailwind } from '../chunk-HKGYP2YK.js';
import { solve, getKeyColorStats } from '../chunk-4O54K6CL.js';
import '../chunk-JY54TZUI.js';
import '../chunk-LBEWBWXX.js';
import { generateTokensCss, toHighContrast } from '../chunk-JBRRT2GK.js';
import '../chunk-7LUK7J7M.js';
import '../chunk-W5IKP2D6.js';
import { DEFAULT_CONFIG } from '../chunk-A2CSS6V4.js';
import '../chunk-G3PMV62Z.js';
import { existsSync, writeFileSync, readFileSync } from 'fs';
import { join, resolve } from 'path';

function exportCommand(args2, cwd) {
  let configPath = "color-config.json";
  let outPath = "";
  let format = "dtcg";
  for (let i = 0; i < args2.length; i++) {
    const nextArg = args2[i + 1];
    if (args2[i] === "--config" && nextArg) {
      configPath = nextArg;
      i++;
    } else if (args2[i] === "--out" && nextArg) {
      outPath = nextArg;
      i++;
    } else if (args2[i] === "--format" && nextArg) {
      format = nextArg;
      i++;
    }
  }
  if (!outPath) {
    if (format === "dtcg") {
      outPath = "tokens.json";
    } else if (format === "tailwind") {
      outPath = "tailwind.preset.js";
    }
  }
  const absConfigPath = resolve(cwd, configPath);
  const absOutPath = resolve(cwd, outPath);
  if (format !== "dtcg" && format !== "tailwind") {
    console.error(
      `Error: Unsupported format '${format}'. Supported formats: 'dtcg', 'tailwind'.`
    );
    process.exit(1);
  }
  console.log(`Reading config from: ${absConfigPath}`);
  let config;
  try {
    config = JSON.parse(readFileSync(absConfigPath, "utf8"));
  } catch (e) {
    console.error(`Error reading config file: ${String(e)}`);
    process.exit(1);
  }
  console.log("Solving theme...");
  const theme = solve(config);
  console.log(`Exporting to ${format.toUpperCase()}...`);
  let outputContent = "";
  if (format === "dtcg") {
    const tokens = toDTCG(theme);
    outputContent = JSON.stringify(tokens, null, 2);
  } else if (format === "tailwind") {
    const preset = toTailwind(theme);
    outputContent = `module.exports = ${JSON.stringify(preset, null, 2)};`;
  }
  console.log(`Writing to: ${absOutPath}`);
  writeFileSync(absOutPath, outputContent);
  console.log("Done!");
}

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
  if (args[0] === "export") {
    exportCommand(args.slice(1), CWD);
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
      console.error("   or: color-system export --format dtcg");
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
    config.borderTargets,
    void 0,
    config.palette
  );
  const stats = getKeyColorStats(config.anchors.keyColors);
  if (stats.chroma !== void 0 || stats.hue !== void 0 || stats.lightness !== void 0) {
    const vars = [];
    if (stats.chroma !== void 0)
      vars.push(`  --chroma-brand: ${stats.chroma};`);
    if (stats.hue !== void 0) vars.push(`  --hue-brand: ${stats.hue};`);
    if (stats.lightness !== void 0)
      vars.push(`  --lightness-brand: ${stats.lightness};`);
    if (vars.length > 0) {
      css = `:root {
${vars.join("\n")}
}

` + css;
    }
  }
  console.log("Generating High Contrast variant...");
  const hcConfig = toHighContrast(config);
  const { backgrounds: hcBackgrounds } = solve(hcConfig);
  const hcCss = generateTokensCss(
    hcConfig.groups,
    hcBackgrounds,
    hcConfig.borderTargets,
    void 0,
    hcConfig.palette
  );
  const hcBlock = `
@media (prefers-contrast: more) {
  :root {
    --base-chroma: 0;
    --surface-chroma-adjust: 0;
    --hue-adjust: 0;
    --chroma-brand: 0;
  }

${hcCss}
}
`;
  css += hcBlock;
  console.log("Writing CSS to:", BASE_CSS_PATH);
  writeFileSync(BASE_CSS_PATH, css);
  console.log("Done!");
}
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map