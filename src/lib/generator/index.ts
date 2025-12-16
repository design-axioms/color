import { generateChartAlgebra } from "../charts.ts";
import type {
  BorderTargets,
  ConfigOptions,
  PresetsConfig,
  SurfaceGroup,
  Theme,
} from "../types.ts";
import { generatePresetUtilities } from "../utilities.ts";
import { generateCoreUtilities } from "./core-utilities.ts";
import { generatePrimitives } from "./primitives.ts";
import { generateSurfaces } from "./surfaces.ts";

/**
 * Generate the full CSS output for a solved theme.
 *
 * This is the library's primary CSS generation entry point: it emits primitives,
 * charts, surface rules, core utilities, and preset utilities into a single
 * stylesheet string.
 */
export function generateTokensCss(
  groups: SurfaceGroup[],
  theme: Theme,
  borderTargets?: BorderTargets,
  options?: ConfigOptions,
  keyColors?: Record<string, string>,
  presets?: PresetsConfig,
): string {
  const parts: string[] = [];

  // 1. Primitives (Shadows, Focus, Key Colors)
  parts.push(...generatePrimitives(theme, options, keyColors));

  // 2. Charts
  if (theme.charts.length > 0) {
    parts.push(`* {`);
    parts.push(`  /* Data Visualization (Reactive) */`);
    theme.charts.forEach((chart, index) => {
      const i = index + 1;
      const algebra = generateChartAlgebra(i, chart, options?.prefix);

      algebra.variables.forEach((v) => {
        parts.push(`  ${v.name}: ${v.value};`);
      });
      parts.push(algebra.css);
    });
    parts.push(`}`);
    parts.push("");
  }

  // 3. Surfaces
  parts.push(...generateSurfaces(groups, theme, borderTargets, options));

  // 4. Core Utilities
  parts.push(...generateCoreUtilities(options, keyColors));

  // 5. Preset Utilities
  parts.push(generatePresetUtilities(presets, options));

  return ["", ...parts].join("\n");
}
