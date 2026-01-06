import { converter } from "culori";
import { AxiomaticError } from "../errors.ts";
import type { ConfigOptions, Theme } from "../types.ts";

const toOklch = converter("oklch");

type OklchParts = {
  l: number;
  c: number;
  h: number;
  alpha: number;
};

function parseOklchCandidate(
  value: unknown,
): { l: number; c: number; h?: number; alpha?: number } | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  const l = record.l;
  const c = record.c;
  const h = record.h;
  const alpha = record.alpha;
  if (typeof l !== "number" || !Number.isFinite(l)) return null;
  if (typeof c !== "number" || !Number.isFinite(c)) return null;
  if (h !== undefined && typeof h !== "number") return null;
  if (alpha !== undefined && typeof alpha !== "number") return null;
  return { l, c, h, alpha };
}

function normalizeHue(hue: number): number {
  const wrapped = hue % 360;
  return wrapped < 0 ? wrapped + 360 : wrapped;
}

function shortestHueDelta(lightHue: number, darkHue: number): number {
  const a = normalizeHue(lightHue);
  const b = normalizeHue(darkHue);
  let delta = a - b;
  if (delta > 180) delta -= 360;
  if (delta < -180) delta += 360;
  return delta;
}

function parseOklchColor(
  color: string,
  toNumber: (n: number) => number,
): OklchParts | null {
  const parsed = parseOklchCandidate(toOklch(color));
  if (!parsed) {
    return null;
  }

  const h = typeof parsed.h === "number" && !isNaN(parsed.h) ? parsed.h : 0;
  const alpha = typeof parsed.alpha === "number" ? parsed.alpha : 1;

  return {
    l: toNumber(parsed.l),
    c: toNumber(parsed.c),
    h: toNumber(h),
    alpha: toNumber(alpha),
  };
}

function interpolateComponent(
  lightValue: number,
  darkValue: number,
  toNumber: (n: number) => number,
): string {
  const avg = toNumber((lightValue + darkValue) / 2);
  const delta = toNumber((lightValue - darkValue) / 2);
  if (delta === 0) return `${avg}`;
  return `calc(${avg} + (${delta} * var(--tau, 1)))`;
}

function interpolateHue(
  lightHue: number,
  darkHue: number,
  toNumber: (n: number) => number,
): string {
  const a = normalizeHue(lightHue);
  const b = normalizeHue(darkHue);
  const delta = shortestHueDelta(a, b);
  const avg = toNumber((a + b) / 2);
  const halfDelta = toNumber(delta / 2);
  if (halfDelta === 0) return `${avg}`;
  return `calc(${avg} + (${halfDelta} * var(--tau, 1)))`;
}

function interpolateOklch(
  lightColor: string,
  darkColor: string,
  toNumber: (n: number) => number,
  context: string,
): string {
  const light = parseOklchColor(lightColor, toNumber);
  const dark = parseOklchColor(darkColor, toNumber);
  if (!light || !dark) {
    const bad = !light ? lightColor : darkColor;
    throw new AxiomaticError(
      "COLOR_PARSE_FAILED",
      `Invalid color value ${JSON.stringify(bad)} for ${context}.`,
      { value: bad, context },
    );
  }

  return `oklch(${interpolateComponent(light.l, dark.l, toNumber)} ${interpolateComponent(
    light.c,
    dark.c,
    toNumber,
  )} ${interpolateHue(light.h, dark.h, toNumber)} / ${interpolateComponent(
    light.alpha,
    dark.alpha,
    toNumber,
  )})`;
}

export function generatePrimitives(
  theme: Theme,
  options?: ConfigOptions,
  keyColors?: Record<string, string>,
): string[] {
  const lines: string[] = [];
  const prefix = options?.prefix ? `${options.prefix}-` : "";
  const rootSelector = options?.selector || ":root";

  const v = (name: string): string => `--${prefix}${name}`;
  const pv = (name: string): string => `--_${prefix}${name}`;
  const toNumber = (n: number): number => parseFloat(n.toFixed(4));

  lines.push(`${rootSelector} {`);

  // Key Colors
  if (keyColors) {
    lines.push(`  /* Key Colors */`);
    for (const [name, value] of Object.entries(keyColors)) {
      const oklch = toOklch(value);
      if (oklch) {
        const l = toNumber(oklch.l);
        const c = toNumber(oklch.c);
        const h = toNumber(oklch.h || 0);

        lines.push(`  ${v(`key-${name}-color`)}: oklch(${l} ${c} ${h});`);
        lines.push(`  ${pv(`hue-${name}`)}: ${h};`);
        lines.push(`  ${pv(`chroma-${name}`)}: ${c};`);
      } else if (keyColors[value]) {
        // Alias
        lines.push(
          `  ${v(`key-${name}-color`)}: var(${v(`key-${value}-color`)});`,
        );
        lines.push(`  ${pv(`hue-${name}`)}: var(${pv(`hue-${value}`)});`);
        lines.push(`  ${pv(`chroma-${name}`)}: var(${pv(`chroma-${value}`)});`);
      } else {
        throw new AxiomaticError(
          "COLOR_PARSE_FAILED",
          `Invalid color value ${JSON.stringify(value)} for keyColors.${name}.`,
          { value, context: `keyColors.${name}` },
        );
      }
    }
  }

  lines.push(`  /* Elevation */`);
  const { shadows, focus, highlight } = theme.primitives;

  // Shadows
  for (const [size, token] of Object.entries(shadows)) {
    const lightColors = token.light.match(/oklch\([^)]+\)/g) || [];
    const darkColors = token.dark.match(/oklch\([^)]+\)/g) || [];

    if (lightColors.length > 0 && lightColors.length === darkColors.length) {
      let index = 0;
      const merged = token.light.replace(/oklch\([^)]+\)/g, (match) => {
        const darkColor = darkColors[index];
        index++;
        if (!darkColor) return match;
        return interpolateOklch(
          match,
          darkColor,
          toNumber,
          `primitives.shadows.${size}`,
        );
      });
      lines.push(`  ${v(`shadow-${size}`)}: ${merged};`);
    } else {
      lines.push(
        `  ${v(`shadow-${size}`)}: ${interpolateOklch(
          token.light,
          token.dark,
          toNumber,
          `primitives.shadows.${size}`,
        )};`,
      );
    }
  }

  // Focus
  lines.push(`  /* Focus */`);
  lines.push(
    `  ${v("focus-ring-color")}: ${interpolateOklch(
      focus.ring.light,
      focus.ring.dark,
      toNumber,
      "primitives.focus.ring",
    )};`,
  );

  // Highlight
  lines.push(`  /* Highlight */`);
  lines.push(
    `  ${v("highlight-ring-color")}: ${interpolateOklch(
      highlight.ring.light,
      highlight.ring.dark,
      toNumber,
      "primitives.highlight.ring",
    )};`,
  );
  lines.push(
    `  ${v("highlight-surface-color")}: ${interpolateOklch(
      highlight.surface.light,
      highlight.surface.dark,
      toNumber,
      "primitives.highlight.surface",
    )};`,
  );

  lines.push(`}`);
  lines.push("");

  return lines;
}
