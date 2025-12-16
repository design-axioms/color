import { converter } from "culori";
import { avg, roundLightness, solveForegroundLightness } from "../math.ts";
import type {
  ChartColor,
  ColorSpec,
  Mode,
  Primitives,
  SolverConfig,
} from "../types.ts";

const toOklch = converter("oklch");

export function getKeyColorStats(keyColors?: Record<string, string>): {
  lightness?: number;
  chroma?: number;
  hue?: number;
} {
  if (!keyColors) {
    return {};
  }

  // If 'brand' exists, use it exclusively for global stats
  if (keyColors.brand) {
    const entry = toOklch(keyColors.brand) as
      | { l: number; c: number; h: number }
      | undefined;
    if (entry) {
      return {
        lightness: roundLightness(entry.l),
        chroma: parseFloat(entry.c.toFixed(4)),
        hue: isNaN(entry.h) ? undefined : parseFloat(entry.h.toFixed(4)),
      };
    }
  }

  const lightnesses: number[] = [];
  const chromas: number[] = [];
  const hues: number[] = [];

  for (const value of Object.values(keyColors)) {
    const entry = toOklch(value) as
      | { l: number; c: number; h: number }
      | undefined;

    if (entry) {
      lightnesses.push(entry.l);
      chromas.push(entry.c);
      if (!isNaN(entry.h)) {
        hues.push(entry.h);
      }
    }
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
