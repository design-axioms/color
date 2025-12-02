import { converter, formatCss } from "culori";
import type { SolverConfig, Mutable } from "@axiomatic-design/color/types";

const parse = converter("oklch");
const format = formatCss;

import { converter, formatCss } from "culori";
import type { SolverConfig, Mutable } from "@axiomatic-design/color/types";

const parse = converter("oklch");
const format = formatCss;

/**
 * Adjusts the contrast of the theme.
 * @param config The configuration to mutate.
 * @param value 0 (Low) to 100 (High). Default is ~50.
 */
export function setContrast(config: SolverConfig, value: number): void {
  const t = value / 100;

  // Light Mode Page
  // Low: 0.98 -> 0.90 (Range 0.08)
  // High: 1.0 -> 0.0 (Range 1.0)
  const start = 0.98 + (1.0 - 0.98) * t;
  const end = 0.9 + (0.0 - 0.9) * t;

  (
    config.anchors.page.light.start as Mutable<
      typeof config.anchors.page.light.start
    >
  ).background = start;
  (
    config.anchors.page.light.end as Mutable<
      typeof config.anchors.page.light.end
    >
  ).background = end;

  // Dark Mode Page
  // Low: 0.10 -> 0.20
  // High: 0.0 -> 1.0
  const darkStart = 0.1 + (0.0 - 0.1) * t;
  const darkEnd = 0.2 + (1.0 - 0.2) * t;

  (
    config.anchors.page.dark.start as Mutable<
      typeof config.anchors.page.dark.start
    >
  ).background = darkStart;
  (
    config.anchors.page.dark.end as Mutable<typeof config.anchors.page.dark.end>
  ).background = darkEnd;
}

/**
 * Adjusts the vibrancy (chroma) of the theme.
 * @param config The configuration to mutate.
 * @param value 0 (Grayscale) to 100 (Neon).
 */
export function setVibrancy(config: SolverConfig, value: number): void {
  const t = value / 100;

  for (const key in config.anchors.keyColors) {
    const colorStr = config.anchors.keyColors[key];
    const color = parse(colorStr);
    if (color) {
      // Set chroma based on value
      // 100 = 0.3 chroma (very vibrant)
      // 0 = 0 chroma (gray)
      color.c = 0.3 * t;
      config.anchors.keyColors[key] = format(color) || colorStr;
    }
  }
}
