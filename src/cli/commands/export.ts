import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { extname, join, resolve } from "node:path";
import { toDTCG } from "../../lib/exporters/dtcg.ts";
import { toTailwind } from "../../lib/exporters/tailwind.ts";
import { toTypeScript } from "../../lib/exporters/typescript.ts";
import { resolveConfig, solve } from "../../lib/index.ts";
import type { SolverConfig } from "../../lib/types.ts";

export function exportCommand(args: string[], cwd: string): void {
  // Simple arg parsing
  // axiomatic export --config <file> --out <file> --format <format>

  let configPath = "color-config.json";
  let outPath = ""; // Will be set based on format if not provided
  let format = "dtcg";

  for (let i = 0; i < args.length; i++) {
    const nextArg = args[i + 1];
    if (args[i] === "--config" && nextArg) {
      configPath = nextArg;
      i++;
    } else if (args[i] === "--out" && nextArg) {
      outPath = nextArg;
      i++;
    } else if (args[i] === "--format" && nextArg) {
      format = nextArg;
      i++;
    }
  }

  // Set default output path if not provided
  if (!outPath) {
    if (format === "dtcg") {
      outPath = "tokens"; // Default to directory for DTCG
    } else if (format === "tailwind") {
      outPath = "tailwind.preset.js";
    } else if (format === "typescript") {
      outPath = "theme.ts";
    }
  }

  const absConfigPath = resolve(cwd, configPath);
  const absOutPath = resolve(cwd, outPath);

  if (format !== "dtcg" && format !== "tailwind" && format !== "typescript") {
    console.error(
      `Error: Unsupported format '${format}'. Supported formats: 'dtcg', 'tailwind', 'typescript'.`,
    );
    process.exit(1);
  }

  console.log(`Reading config from: ${absConfigPath}`);
  let rawConfig: Partial<SolverConfig>;
  try {
    rawConfig = JSON.parse(
      readFileSync(absConfigPath, "utf8"),
    ) as Partial<SolverConfig>;
  } catch (e) {
    console.error(`Error reading config file: ${String(e)}`);
    process.exit(1);
  }

  const config = resolveConfig(rawConfig);

  console.log("Solving theme...");
  const theme = solve(config);

  console.log(`Exporting to ${format.toUpperCase()}...`);

  if (format === "dtcg") {
    const exportData = toDTCG(theme, config);
    const isJsonFile = extname(absOutPath) === ".json";

    if (isJsonFile) {
      // Legacy/Single-file mode
      // We wrap the files in a root object to preserve data
      const singleFile = {
        primitives: exportData.files["primitives.json"],
        light: exportData.files["light.json"],
        dark: exportData.files["dark.json"],
      };

      console.log(`Writing to: ${absOutPath}`);
      writeFileSync(absOutPath, JSON.stringify(singleFile, null, 2));
    } else {
      // Directory mode
      console.log(`Writing tokens to directory: ${absOutPath}`);
      mkdirSync(absOutPath, { recursive: true });

      for (const [filename, content] of Object.entries(exportData.files)) {
        const filePath = join(absOutPath, filename);
        console.log(`  Writing ${filename}...`);
        writeFileSync(filePath, JSON.stringify(content, null, 2));
      }
    }
  } else {
    let outputContent = "";
    if (format === "tailwind") {
      const preset = toTailwind(theme, config.options);
      // Output as CommonJS module
      outputContent = `module.exports = ${JSON.stringify(preset, null, 2)};`;
    } else {
      outputContent = toTypeScript(theme, config.options);
    }

    console.log(`Writing to: ${absOutPath}`);
    writeFileSync(absOutPath, outputContent);
  }

  console.log("Done!");
}
