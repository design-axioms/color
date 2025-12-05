import Ajv from "ajv";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { resolveConfig, solve } from "../../lib/index.ts";
import { contrastForPair, solveForegroundSpec } from "../../lib/math.ts";
import type { SolverConfig } from "../../lib/types.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));

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
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const schema = JSON.parse(schemaContent);

      // Patch schema to allow $schema property
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (schema.definitions && schema.definitions.SolverConfig) {
        // If the root refers to SolverConfig, we might need to patch SolverConfig definition
        // But here schema is the root schema.
        // The root schema has "$ref": "#/definitions/SolverConfig"
        // So we need to patch definitions.SolverConfig.properties
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if (!schema.definitions.SolverConfig.properties.$schema) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          schema.definitions.SolverConfig.properties.$schema = {
            type: "string",
          };
        }
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      } else if (schema.properties && !schema.properties.$schema) {
        // Fallback if structure is different
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        schema.properties.$schema = { type: "string" };
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const ajv = new Ajv({ allErrors: true, strict: false });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      const validate = (ajv as any).compile(schema);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment
      const valid = validate(rawConfig);

      if (!valid) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if (validate.errors) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-explicit-any
          validate.errors.forEach((err: any) => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            errors.push(`Schema Error: ${err.instancePath} ${err.message}`);
          });
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
