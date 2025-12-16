import type { ConfigOptions, PresetsConfig, TypeScaleConfig } from "./types.ts";

const DEFAULT_FONTS = {
  mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  sans: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
};

const DEFAULT_WEIGHTS = {
  medium: 500,
  bold: 600,
};

const DEFAULT_SIZES = {
  xs: "0.75rem",
  sm: "0.875rem",
  base: "1rem",
  lg: "1.125rem",
  xl: "1.25rem",
  "2xl": "1.5rem",
};

function cubicBezier(t: number, p1: number, p2: number): number {
  const oneMinusT = 1 - t;
  return (
    3 * oneMinusT * oneMinusT * t * p1 + 3 * oneMinusT * t * t * p2 + t * t * t
  );
}

function generateTypeScale(config: TypeScaleConfig): Record<string, string> {
  const { steps, minSize, maxSize, curve } = config;
  const sizes: Record<string, string> = {};

  // Standard size names for up to 6 steps
  const names = ["xs", "sm", "base", "lg", "xl", "2xl", "3xl", "4xl", "5xl"];

  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1);
    // Calculate y (size factor) given t
    // We use the Y component of the bezier curve to determine the size interpolation
    const factor = cubicBezier(t, curve.p1[1], curve.p2[1]);
    const size = minSize + factor * (maxSize - minSize);

    const name = names[i] || `size-${i + 1}`;
    sizes[name] = `${size.toFixed(4)}rem`;
  }

  return sizes;
}

/**
 * Generates CSS utilities for presets (typography, borders, etc.).
 * @param presets The presets configuration.
 * @param options The global configuration options.
 * @returns The generated CSS string.
 */
export function generatePresetUtilities(
  presets: PresetsConfig = {},
  options?: ConfigOptions,
): string {
  const prefix = options?.prefix ? `${options.prefix}-` : "";
  const v = (name: string): string => `--${prefix}${name}`;
  const p = (name: string): string => `--${prefix}preset-${name}`;

  const lines: string[] = [];
  const rootVars: string[] = [];

  lines.push(`/* Preset Utilities (Typography & Layout) */`);

  // --- Typography ---
  const typography = presets.typography || {};
  const fonts = { ...DEFAULT_FONTS, ...typography.fonts };
  const weights = { ...DEFAULT_WEIGHTS, ...typography.weights };

  let sizes: Record<string, string> = { ...DEFAULT_SIZES, ...typography.sizes };
  if (typography.scale) {
    sizes = generateTypeScale(typography.scale);
  }

  // Fonts
  for (const [name, value] of Object.entries(fonts)) {
    rootVars.push(`  ${p(`font-${name}`)}: ${value};`);
    lines.push(`.font-${name} { font-family: var(${p(`font-${name}`)}); }`);
  }

  // Weights
  for (const [name, value] of Object.entries(weights)) {
    rootVars.push(`  ${p(`weight-${name}`)}: ${value};`);
    lines.push(`.font-${name} { font-weight: var(${p(`weight-${name}`)}); }`);
  }

  // Sizes
  for (const [name, value] of Object.entries(sizes)) {
    rootVars.push(`  ${p(`text-${name}`)}: ${value};`);
    lines.push(`.text-${name} { font-size: var(${p(`text-${name}`)}); }`);
  }

  // --- Borders ---
  // Structural
  rootVars.push(`  ${p("border-width")}: 1px;`);
  rootVars.push(`  ${p("border-style")}: solid;`);

  lines.push(
    `.preset-bordered { border: var(${p("border-width")}) var(${p("border-style")}) var(${v("border-dec-token")}); }`,
  );

  // Cosmetic (Backwards compatibility / shorthand)
  lines.push(`.bordered { border: 1px solid var(${v("border-dec-token")}); }`);

  const rootSelector = options?.selector || ":root";
  const rootBlock = `${rootSelector} {\n${rootVars.join("\n")}\n}`;

  return [rootBlock, "", ...lines].join("\n");
}
