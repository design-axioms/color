import { formatPrecision } from "./math.ts";
import type { ChartColor } from "./types.ts";

/**
 * The Chart Algebra
 *
 * Defines how chart colors are calculated reactively based on the environment.
 *
 * State Tuple:
 * - Tau (Time): Light/Dark mode context
 * - Alpha (Atmosphere): Theme hue influence
 * - Sigma (System): X-Ray/Forced Colors mode (handled via CSS borders)
 */

export interface ChartVariable {
  name: string;
  value: string | number;
}

export interface ChartDefinition {
  variables: ChartVariable[];
  css: string;
}

/**
 * Generates the CSS variables for a single chart color step.
 *
 * @param index The 1-based index of the chart color (e.g., 1 for --axm-chart-1)
 * @param chart The chart color definition (light/dark pairs)
 * @param prefix The variable prefix (default: "axm")
 */
export function generateChartAlgebra(
  index: number,
  chart: ChartColor,
  prefix: string = "axm",
): ChartDefinition {
  const v = (name: string): string => `--${prefix}-${name}`;
  const toNumber = (n: number): number => formatPrecision(n);

  // 1. Extract Raw Values
  // We use the Light Mode definition as the "Canonical" hue/chroma for the raw variables.
  // In the future, we might want to average them or allow explicit overrides.
  const h = toNumber(chart.light.h);
  const c = toNumber(chart.light.c);

  // 2. Calculate Reactive Lightness Constants
  // The formula is: L = L_mid - (k * tau)
  // Where:
  //   tau = 1 (Light Mode) -> L = L_mid - k = L_light
  //   tau = -1 (Dark Mode) -> L = L_mid + k = L_dark
  //
  // Solving for L_mid and k:
  //   L_mid = (L_dark + L_light) / 2
  //   k = (L_dark - L_light) / 2

  const l_light = chart.light.l;
  const l_dark = chart.dark.l;

  const l_mid = toNumber((l_dark + l_light) / 2);
  const k = toNumber((l_dark - l_light) / 2);

  // 3. Define Variables
  const variables: ChartVariable[] = [
    { name: v(`chart-${index}-h`), value: h },
    { name: v(`chart-${index}-c`), value: c },
  ];

  // 4. Define the Reactive CSS Calculation
  // Phase 2: Atmosphere Harmonization (Vibrancy Injection)
  // We allow the atmosphere's vibrancy (alpha-beta) to boost the chart's chroma.
  // C_final = C_base + (alpha_beta * 0.5)
  // This ensures charts feel more vivid in vibrant themes.

  const css = `  ${v(`chart-${index}`)}: oklch(
    calc(${l_mid} - (${k} * var(--tau)))
    calc(var(${v(`chart-${index}-c`)}) + (var(--alpha-beta) * 0.5))
    var(${v(`chart-${index}-h`)})
  );`;

  return {
    variables,
    css,
  };
}
