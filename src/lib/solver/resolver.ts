import { converter } from "culori";
import { AxiomaticError } from "../errors.ts";
import { avg, roundLightness, solveForegroundLightness } from "../math.ts";
import type {
  ChartColor,
  ColorSpec,
  Mode,
  Primitives,
  SolverConfig,
} from "../types.ts";

const toOklch = converter("oklch");

function isOklchLike(
  value: unknown,
): value is { l: number; c: number; h?: number } {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.l === "number" &&
    Number.isFinite(record.l) &&
    typeof record.c === "number" &&
    Number.isFinite(record.c) &&
    (record.h === undefined || typeof record.h === "number")
  );
}

/**
 * Detects circular references in key color aliases.
 * Throws if a cycle is found, e.g. brand → accent → brand.
 */
function detectKeyColorCycles(keyColors: Record<string, string>): void {
  for (const startKey of Object.keys(keyColors)) {
    const visited = new Set<string>();
    const path: string[] = [];
    let current: string | undefined = startKey;

    while (current) {
      if (visited.has(current)) {
        // Found a cycle - build the chain from where the cycle starts
        const cycleStart = path.indexOf(current);
        const chain = [...path.slice(cycleStart), current];
        throw new AxiomaticError(
          "CONFIG_CIRCULAR_KEY_COLOR",
          `Circular key color reference detected: ${chain.join(" → ")}.`,
          { chain, startKey },
        );
      }

      visited.add(current);
      path.push(current);

      const value: string | undefined = keyColors[current];
      // If the value references another key, continue following
      const nextKey: string | undefined = value ? keyColors[value] : undefined;
      if (value && nextKey !== undefined) {
        current = value;
      } else {
        break;
      }
    }
  }
}

export function getKeyColorStats(keyColors?: Record<string, string>): {
  lightness?: number;
  chroma?: number;
  hue?: number;
} {
  if (!keyColors) {
    return {};
  }

  // P1-13: Detect circular key color references early
  detectKeyColorCycles(keyColors);

  // If 'brand' exists, use it exclusively for global stats
  if (keyColors.brand) {
    const brandValue = keyColors.brand;
    const entry = toOklch(brandValue);
    if (isOklchLike(entry)) {
      return {
        lightness: roundLightness(entry.l),
        chroma: parseFloat(entry.c.toFixed(4)),
        hue:
          typeof entry.h === "number" && !isNaN(entry.h)
            ? parseFloat(entry.h.toFixed(4))
            : undefined,
      };
    }

    // Allow brand alias (e.g. "brand": "accent"); fall back to aggregate stats.
    if (!keyColors[brandValue]) {
      throw new AxiomaticError(
        "COLOR_PARSE_FAILED",
        `Invalid color value ${JSON.stringify(brandValue)} for keyColors.brand.`,
        { value: brandValue, context: "keyColors.brand" },
      );
    }
  }

  const lightnesses: number[] = [];
  const chromas: number[] = [];
  const hues: number[] = [];

  for (const [name, value] of Object.entries(keyColors)) {
    const entry = toOklch(value);

    if (isOklchLike(entry)) {
      lightnesses.push(entry.l);
      chromas.push(entry.c);
      if (typeof entry.h === "number" && !isNaN(entry.h)) {
        hues.push(entry.h);
      }
      continue;
    }

    // Allow aliases.
    if (keyColors[value]) {
      continue;
    }

    throw new AxiomaticError(
      "COLOR_PARSE_FAILED",
      `Invalid color value ${JSON.stringify(value)} for keyColors.${name}.`,
      { value, context: `keyColors.${name}` },
    );
  }

  if (lightnesses.length === 0) {
    return {};
  }

  return {
    lightness: roundLightness(avg(lightnesses)),
    chroma: parseFloat(avg(chromas).toFixed(4)),
    hue: hues.length > 0 ? parseFloat(avg(hues).toFixed(4)) : undefined,
  };
}

export function getHue(color: string | undefined, fallback: number): number {
  if (!color) return fallback;
  const oklch = toOklch(color);
  if (!oklch || typeof oklch.h !== "number" || isNaN(oklch.h)) return fallback;
  return oklch.h;
}

export function solveCharts(
  config: SolverConfig,
  backgrounds: Map<string, Record<Mode, ColorSpec>>,
): ChartColor[] {
  const palette = config.palette;
  if (!palette || !palette.hues) {
    return [];
  }

  // P1-23: Warn about palette hue collisions
  const hues = palette.hues;
  for (let i = 0; i < hues.length; i++) {
    for (let j = i + 1; j < hues.length; j++) {
      const hueI = hues[i];
      const hueJ = hues[j];
      if (hueI === undefined || hueJ === undefined) continue;
      const diff = Math.abs(hueI - hueJ);
      const minDiff = Math.min(diff, 360 - diff); // Account for hue wrapping
      if (minDiff < 30) {
        console.warn(
          `[Axiomatic] Palette hues ${hueI}° and ${hueJ}° are ` +
            `only ${minDiff.toFixed(0)}° apart (< 30°). ` +
            `Consider spacing hues further for better distinction.`,
        );
      }
    }
  }

  const targetChroma = palette.targetChroma ?? 0.12;
  const targetContrast = palette.targetContrast ?? 60;

  const pageBg = backgrounds.get("page") ?? {
    light: { l: 1, c: 0, h: 0 },
    dark: { l: 0, c: 0, h: 0 },
  };

  return palette.hues.map((hue) => {
    const lightL = solveForegroundLightness(pageBg.light.l, targetContrast);
    const darkL = solveForegroundLightness(pageBg.dark.l, targetContrast);

    return {
      light: { l: lightL, c: targetChroma, h: hue },
      dark: { l: darkL, c: targetChroma, h: hue },
    };
  });
}

export function solvePrimitives(config: SolverConfig): Primitives {
  const brandHue = getHue(config.anchors.keyColors.brand, 250);
  const highlightHue = getHue(config.anchors.keyColors.highlight, 320);

  return {
    shadows: {
      sm: {
        light: "0 1px 2px 0 oklch(0 0 0 / 0.05)",
        dark: "0 1px 2px 0 oklch(1 0 0 / 0.15)",
      },
      md: {
        light:
          "0 4px 6px -1px oklch(0 0 0 / 0.1), 0 2px 4px -1px oklch(0 0 0 / 0.06)",
        dark: "0 4px 6px -1px oklch(1 0 0 / 0.15), 0 2px 4px -1px oklch(1 0 0 / 0.1)",
      },
      lg: {
        light:
          "0 10px 15px -3px oklch(0 0 0 / 0.1), 0 4px 6px -2px oklch(0 0 0 / 0.05)",
        dark: "0 10px 15px -3px oklch(1 0 0 / 0.15), 0 4px 6px -2px oklch(1 0 0 / 0.1)",
      },
      xl: {
        light:
          "0 20px 25px -5px oklch(0 0 0 / 0.1), 0 10px 10px -5px oklch(0 0 0 / 0.04)",
        dark: "0 20px 25px -5px oklch(1 0 0 / 0.15), 0 10px 10px -5px oklch(1 0 0 / 0.1)",
      },
    },
    focus: {
      ring: {
        light: `oklch(0.45 0.2 ${brandHue})`,
        dark: `oklch(0.75 0.2 ${brandHue})`,
      },
    },
    highlight: {
      ring: {
        light: `oklch(0.60 0.25 ${highlightHue})`,
        dark: `oklch(0.60 0.25 ${highlightHue})`,
      },
      // Constraint: Must be accessible as a text background (for <mark>) and as a list item background.
      // Light Mode: L=0.96 provides high contrast against dark text.
      // Dark Mode: L=0.25 provides high contrast against light text.
      surface: {
        light: `oklch(0.96 0.05 ${highlightHue})`,
        dark: `oklch(0.25 0.05 ${highlightHue})`,
      },
    },
  };
}
