#!/usr/bin/env node
import { toDTCG } from '../chunk-FZL5EAWM.js';
import { toTailwind } from '../chunk-Z6AAYZVX.js';
import { solve, getKeyColorStats } from '../chunk-X3BD3RLH.js';
import '../chunk-JY54TZUI.js';
import '../chunk-LBEWBWXX.js';
import { generateTokensCss, toHighContrast } from '../chunk-ACHRD352.js';
import '../chunk-AQSKLBNK.js';
import '../chunk-W5IKP2D6.js';
import { DEFAULT_CONFIG } from '../chunk-A2CSS6V4.js';
import '../chunk-G3PMV62Z.js';
import { existsSync, writeFileSync, readFileSync, watch } from 'fs';
import { join, resolve } from 'path';
import { fileURLToPath } from 'url';

function buildCommand(args2, cwd) {
  let configPath = "color-config.json";
  let outPath = "theme.css";
  let isWatch = false;
  for (let i = 0; i < args2.length; i++) {
    const nextArg = args2[i + 1];
    if (args2[i] === "--config" && nextArg) {
      configPath = nextArg;
      i++;
    } else if (args2[i] === "--out" && nextArg) {
      outPath = nextArg;
      i++;
    } else if (args2[i] === "--watch") {
      isWatch = true;
    }
  }
  const absConfigPath = resolve(cwd, configPath);
  const absOutPath = resolve(cwd, outPath);
  const build = () => {
    console.log(`Reading config from: ${absConfigPath}`);
    let config;
    try {
      config = JSON.parse(readFileSync(absConfigPath, "utf8"));
    } catch (e) {
      console.error(`Error reading config file: ${String(e)}`);
      if (!isWatch) process.exit(1);
      return;
    }
    console.log("Solving surfaces...");
    const theme = solve(config);
    console.log("Generating CSS...");
    let css = generateTokensCss(
      config.groups,
      theme,
      config.borderTargets,
      void 0
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
    const hcTheme = solve(hcConfig);
    const hcCss = generateTokensCss(
      hcConfig.groups,
      hcTheme,
      hcConfig.borderTargets,
      void 0
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
    console.log("Writing CSS to:", absOutPath);
    writeFileSync(absOutPath, css);
    console.log("Done!");
  };
  build();
  if (isWatch) {
    console.log(`Watching for changes in ${absConfigPath}...`);
    watch(absConfigPath, (eventType) => {
      if (eventType === "change") {
        console.log("Config changed, rebuilding...");
        build();
      }
    });
  }
}
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
var isMain = process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
  const command = args[0];
  if (command === "init") {
    const targetPath = join(CWD, "color-config.json");
    if (existsSync(targetPath)) {
      console.error("Error: color-config.json already exists.");
      process.exit(1);
    }
    const configWithSchema = {
      $schema: "node_modules/@algebraic-systems/color-system/color-config.schema.json",
      ...DEFAULT_CONFIG
    };
    writeFileSync(targetPath, JSON.stringify(configWithSchema, null, 2));
    console.log("Created color-config.json");
    if (!existsSync(join(CWD, "node_modules"))) {
      console.warn(
        "Note: node_modules not found in current directory. You may need to adjust the $schema path."
      );
    }
    console.log("Run `color-system build` to generate your theme.");
    process.exit(0);
  } else if (command === "export") {
    exportCommand(args.slice(1), CWD);
    process.exit(0);
  } else if (command === "build") {
    buildCommand(args.slice(1), CWD);
  } else if (command && !command.startsWith("-")) {
    const config = args[0];
    const out = args[1];
    const newArgs = [];
    if (config) newArgs.push("--config", config);
    if (out) newArgs.push("--out", out);
    buildCommand(newArgs, CWD);
  } else {
    buildCommand(args, CWD);
  }
}
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map