import Ajv from "ajv";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { resolveConfig, solve } from "../../lib/index.ts";
import { contrastForPair, solveForegroundSpec } from "../../lib/math.ts";
import type { SolverConfig } from "../../lib/types.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));

type AjvLike = {
  compile(schema: unknown): ((data: unknown) => boolean) & {
    errors?: Array<{ instancePath?: string; message?: string }> | null;
  };
};

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

  let rawConfig: unknown;
  try {
    rawConfig = JSON.parse(readFileSync(absConfigPath, "utf8"));
  } catch (e) {
    console.error(`Error reading config file: ${String(e)}`);
    process.exit(1);
  }

  const errors: string[] = [];
  const warnings: string[] = [];

  // Some consumers include a top-level "$schema" key for IDE tooling.
  // This should not cause schema validation to fail.
  const configForValidation: unknown = (() => {
    if (rawConfig && typeof rawConfig === "object") {
      const record = rawConfig as Record<string, unknown>;
      if ("$schema" in record) {
        const { $schema: _schema, ...rest } = record;
        return rest;
      }
    }
    return rawConfig;
  })();

  // 0. Schema Validation
  console.log("Validating schema...");
  try {
    const possibleSchemaPaths = [
      resolve(cwd, "color-config.schema.json"),
      resolve(
        cwd,
        "node_modules/@axiomatic-design/color/color-config.schema.json",
      ),
      resolve(__dirname, "../../color-config.schema.json"),
      resolve(__dirname, "../../../color-config.schema.json"),
    ];

    let schemaContent: string | null = null;
    for (const p of possibleSchemaPaths) {
      try {
        schemaContent = readFileSync(p, "utf8");
        break;
      } catch {
        continue;
      }
    }

    if (schemaContent) {
      const schema: unknown = JSON.parse(schemaContent);

      // AJV will validate the actual configuration payload; we strip "$schema" above.
      const ajv = new (Ajv as unknown as { new (options: unknown): AjvLike })({
        allErrors: true,
        strict: false,
      });

      const validate = ajv.compile(schema);
      const valid = validate(configForValidation);

      if (!valid) {
        const errs = validate.errors;
        if (errs) {
          for (const err of errs) {
            errors.push(
              `Schema Error: ${err.instancePath || ""} ${err.message || ""}`.trim(),
            );
          }
        }
      }
    } else {
      warnings.push("Could not find color-config.schema.json for validation.");
    }
  } catch (e) {
    warnings.push(`Schema validation failed to run: ${String(e)}`);
  }

  if (errors.length > 0) {
    printReport(errors, warnings);
    process.exit(1);
  }

  const config = resolveConfig(rawConfig as Partial<SolverConfig>);

  console.log("Running logic audit...");

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
            1,
          )} APCA).`,
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
            1,
          )} APCA).`,
        );
      }

      // Polarity Checks
      if (surface.polarity === "page") {
        if (lightL < 0.5) {
          warnings.push(
            `Surface '${
              surface.slug
            }' (Light): 'page' polarity surface is dark (${lightL.toFixed(2)}).`,
          );
        }
        if (darkL > 0.5) {
          warnings.push(
            `Surface '${
              surface.slug
            }' (Dark): 'page' polarity surface is light (${darkL.toFixed(2)}).`,
          );
        }
      } else {
        // Inverted
        if (lightL > 0.5) {
          warnings.push(
            `Surface '${
              surface.slug
            }' (Light): 'inverted' polarity surface is light (${lightL.toFixed(
              2,
            )}).`,
          );
        }
        if (darkL < 0.5) {
          warnings.push(
            `Surface '${
              surface.slug
            }' (Dark): 'inverted' polarity surface is dark (${darkL.toFixed(
              2,
            )}).`,
          );
        }
      }
    }
  }

  // 3. Dead Token Detection

  const definedKeys = new Set(Object.keys(config.anchors.keyColors));
  const usedKeys = new Set<string>();

  for (const group of config.groups) {
    for (const surface of group.surfaces) {
      if (typeof surface.hue === "string") {
        usedKeys.add(surface.hue);
      }
    }
  }

  for (const key of definedKeys) {
    if (!usedKeys.has(key)) {
      // warnings.push(`Key color '${key}' is defined but not referenced by any surface.`);
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
