#!/usr/bin/env node
import { generateTokensCss } from '../chunk-EB6GU2YN.js';
import { solve, getKeyColorStats } from '../chunk-KW6VFTAP.js';
import '../chunk-VZHHTPIW.js';
import '../chunk-LBEWBWXX.js';
import '../chunk-7LUK7J7M.js';
import '../chunk-XVS54W7J.js';
import { DEFAULT_CONFIG } from '../chunk-OJJVGUDU.js';
import { existsSync, writeFileSync, readFileSync } from 'fs';
import { join, resolve } from 'path';

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