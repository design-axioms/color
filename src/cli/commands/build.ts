import { readFileSync, watch, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { generateTokensCss, toHighContrast } from "../../lib/generator.ts";
import { getKeyColorStats, solve } from "../../lib/index.ts";
import type { SolverConfig } from "../../lib/types.ts";

export function buildCommand(args: string[], cwd: string): void {
  let configPath = "color-config.json";
  let outPath = "theme.css";
  let isWatch = false;

  for (let i = 0; i < args.length; i++) {
    const nextArg = args[i + 1];
    if (args[i] === "--config" && nextArg) {
      configPath = nextArg;
      i++;
    } else if (args[i] === "--out" && nextArg) {
      outPath = nextArg;
      i++;
    } else if (args[i] === "--watch") {
      isWatch = true;
    }
  }

  const absConfigPath = resolve(cwd, configPath);
  const absOutPath = resolve(cwd, outPath);

  const build = (): void => {
    console.log(`Reading config from: ${absConfigPath}`);
    let config: SolverConfig;
    try {
      config = JSON.parse(readFileSync(absConfigPath, "utf8")) as SolverConfig;
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
      config.options
    );

    const stats = getKeyColorStats(config.anchors.keyColors);
    if (
      stats.chroma !== undefined ||
      stats.hue !== undefined ||
      stats.lightness !== undefined
    ) {
      const vars: string[] = [];
      if (stats.chroma !== undefined)
        vars.push(`  --chroma-brand: ${stats.chroma};`);
      if (stats.hue !== undefined) vars.push(`  --hue-brand: ${stats.hue};`);
      if (stats.lightness !== undefined)
        vars.push(`  --lightness-brand: ${stats.lightness};`);

      if (vars.length > 0) {
        css = `:root {\n${vars.join("\n")}\n}\n\n` + css;
      }
    }

    // --- High Contrast Generation ---
    console.log("Generating High Contrast variant...");
    const hcConfig = toHighContrast(config);
    const hcTheme = solve(hcConfig);
    const hcCss = generateTokensCss(
      hcConfig.groups,
      hcTheme,
      hcConfig.borderTargets,
      config.options
    );

    // Wrap in media query and add overrides
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
