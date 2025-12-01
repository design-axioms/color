import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { solve } from "../../lib/index.ts";
import { contrastForPair, solveForegroundSpec } from "../../lib/math.ts";
import type { SolverConfig } from "../../lib/types.ts";

export function auditCommand(args: string[], cwd: string): void {
  let configPath = "color-config.json";

  for (let i = 0; i < args.length; i++) {
    const nextArg = args[i + 1];
    if (args[i] === "--config" && nextArg) {
      configPath = nextArg;
      i++;
    }
  }

  const absConfigPath = resolve(cwd, configPath);
  console.log(`Reading config from: ${absConfigPath}`);

  let config: SolverConfig;
  try {
    config = JSON.parse(readFileSync(absConfigPath, "utf8")) as SolverConfig;
  } catch (e) {
    console.error(`Error reading config file: ${String(e)}`);
    process.exit(1);
  }

  console.log("Running audit...");
  const errors: string[] = [];
  const warnings: string[] = [];

  // 1. Solve the theme
  let theme;
  try {
    theme = solve(config);
  } catch (e) {
    errors.push(`Solver failed: ${String(e)}`);
    printReport(errors, warnings);
    process.exit(1);
  }

  // 2. Check Surfaces
  for (const group of config.groups) {
    for (const surface of group.surfaces) {
      const bg = theme.backgrounds.get(surface.slug);
      if (!bg) {
        errors.push(`Surface '${surface.slug}' missing from solved theme.`);
        continue;
      }

      // Check Light Mode
      const lightL = bg.light.l;
      const lightSpec = solveForegroundSpec(lightL);
      const lightContrast = contrastForPair(lightSpec["fg-high"], lightL);

      if (lightContrast < 60) {
        warnings.push(
          `Surface '${
            surface.slug
          }' (Light): Low contrast for high-emphasis text (${lightContrast.toFixed(
            1
          )} APCA).`
        );
      }

      // Check Dark Mode
      const darkL = bg.dark.l;
      const darkSpec = solveForegroundSpec(darkL);
      const darkContrast = contrastForPair(darkSpec["fg-high"], darkL);

      if (darkContrast < 60) {
        warnings.push(
          `Surface '${
            surface.slug
          }' (Dark): Low contrast for high-emphasis text (${darkContrast.toFixed(
            1
          )} APCA).`
        );
      }

      // Polarity Checks
      if (surface.polarity === "page") {
        if (lightL < 0.5) {
          warnings.push(
            `Surface '${
              surface.slug
            }' (Light): 'page' polarity surface is dark (${lightL.toFixed(2)}).`
          );
        }
        if (darkL > 0.5) {
          warnings.push(
            `Surface '${
              surface.slug
            }' (Dark): 'page' polarity surface is light (${darkL.toFixed(2)}).`
          );
        }
      } else {
        // Inverted
        if (lightL > 0.5) {
          warnings.push(
            `Surface '${
              surface.slug
            }' (Light): 'inverted' polarity surface is light (${lightL.toFixed(
              2
            )}).`
          );
        }
        if (darkL < 0.5) {
          warnings.push(
            `Surface '${
              surface.slug
            }' (Dark): 'inverted' polarity surface is dark (${darkL.toFixed(
              2
            )}).`
          );
        }
      }
    }
  }

  printReport(errors, warnings);

  if (errors.length > 0) {
    process.exit(1);
  }
}

function printReport(errors: string[], warnings: string[]): void {
  if (errors.length === 0 && warnings.length === 0) {
    console.log("✅ Audit passed! No issues found.");
    return;
  }

  if (warnings.length > 0) {
    console.log("\n⚠️  Warnings:");
    warnings.forEach((w) => {
      console.log(`  - ${w}`);
    });
  }

  if (errors.length > 0) {
    console.log("\n❌ Errors:");
    errors.forEach((e) => {
      console.log(`  - ${e}`);
    });
  }
}
