/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { converter } from "culori";
import {
  avg,
  backgroundBounds,
  calculateHueShift,
  clamp01,
  clampTo,
  contrastForBackground,
  roundLightness,
  solveBackgroundForContrast,
  solveForegroundLightness,
  solveForegroundSpec,
} from "./math.ts";
import type {
  Anchors,
  AnchorValue,
  ChartColor,
  ColorSpec,
  Context,
  Mode,
  ModeAnchors,
  ModeSpec,
  Mutable,
  PolarityAnchors,
  Primitives,
  SolverConfig,
  SurfaceGroup,
  Theme,
} from "./types.ts";

const toOklch = converter("oklch");

export function getKeyColorStats(keyColors?: Record<string, string>): {
  lightness?: number;
  chroma?: number;
  hue?: number;
} {
  if (!keyColors) {
    return {};
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

function computeKeyColorLightness(
  keyColors?: Record<string, string>,
): number | undefined {
  if (!keyColors) {
    return undefined;
  }

  const lightnesses: number[] = [];

  for (const value of Object.values(keyColors)) {
    const entry = toOklch(value) as { l: number } | undefined;

    if (entry) {
      lightnesses.push(entry.l);
    }
  }

  if (lightnesses.length === 0) {
    return undefined;
  }

  return roundLightness(avg(lightnesses));
}

function alignInvertedAnchors(
  anchors: PolarityAnchors,
  keyColors?: Record<string, string>,
): void {
  const keyColorLightness = computeKeyColorLightness(keyColors);

  if (keyColorLightness !== undefined) {
    const invertedAnchors = anchors.inverted;

    const updateEnd = (
      modeAnchors: ModeAnchors,
      lightness: number,
    ): ModeAnchors => ({
      ...modeAnchors,
      end: { ...modeAnchors.end, background: lightness },
    });

    const lightness = clamp01(keyColorLightness);

    const newInverted: Anchors = {
      light: updateEnd(invertedAnchors.light, lightness),
      dark: updateEnd(invertedAnchors.dark, lightness),
    };

    (anchors as Mutable<PolarityAnchors>).inverted = newInverted;
  }
}

export function syncDarkToLight(
  anchors: PolarityAnchors,
  polarity: "page" | "inverted",
  adjustProperty: "start" | "end" = "end",
): void {
  const lightStart = anchors[polarity].light.start.background;
  const lightEnd = anchors[polarity].light.end.background;

  const lightStartContrast = contrastForBackground(
    { polarity, mode: "light" },
    lightStart,
  );
  const lightEndContrast = contrastForBackground(
    { polarity, mode: "light" },
    lightEnd,
  );
  const deltaContrast = lightStartContrast - lightEndContrast;

  const darkStart = anchors[polarity].dark.start.background;
  const darkEnd = anchors[polarity].dark.end.background;

  if (adjustProperty === "end") {
    const darkStartContrast = contrastForBackground(
      { polarity, mode: "dark" },
      darkStart,
    );

    // We want Dark End to have a contrast that is deltaContrast lower than Dark Start
    const targetDarkEndContrast = darkStartContrast - deltaContrast;

    const newDarkEnd = solveBackgroundForContrast(
      { polarity, mode: "dark" },
      targetDarkEndContrast,
      0,
      1,
    );

    (anchors[polarity].dark.end as Mutable<AnchorValue>).background =
      newDarkEnd;
  } else {
    // Adjust Start
    const darkEndContrast = contrastForBackground(
      { polarity, mode: "dark" },
      darkEnd,
    );

    // We want Dark Start to have a contrast that is deltaContrast higher than Dark End
    const targetDarkStartContrast = darkEndContrast + deltaContrast;

    const newDarkStart = solveBackgroundForContrast(
      { polarity, mode: "dark" },
      targetDarkStartContrast,
      0,
      1,
    );

    (anchors[polarity].dark.start as Mutable<AnchorValue>).background =
      newDarkStart;
  }
}

function computeDeltaInfo(
  context: Context,
  anchors: ModeAnchors,
  count: number,
): {
  startBackground: number;
  endBackground: number;
  startContrast: number;
  endContrast: number;
  delta: number;
} {
  const startBackground = anchors.start.background;
  const endBackground = anchors.end.background;
  const startContrast = contrastForBackground(context, startBackground);
  const endContrast = contrastForBackground(context, endBackground);
  const delta = count <= 1 ? 0 : (endContrast - startContrast) / (count - 1);

  return {
    startBackground,
    endBackground,
    startContrast,
    endContrast,
    delta,
  };
}

function solveBackgroundSequence(
  context: Context,
  anchors: ModeAnchors,
  groups: SurfaceGroup[],
): Map<string, number> {
  const backgrounds = new Map<string, number>();
  const { mode } = context;

  if (groups.length === 0) return backgrounds;

  const totalGroups = groups.length;
  const deltaInfo = computeDeltaInfo(context, anchors, totalGroups);

  const [minBg, maxBg] = backgroundBounds(
    anchors.start.background,
    anchors.end.background,
  );
  const minContrast = Math.min(deltaInfo.startContrast, deltaInfo.endContrast);
  const maxContrast = Math.max(deltaInfo.startContrast, deltaInfo.endContrast);

  groups.forEach((group, groupIndex) => {
    const gap = group.gapBefore ?? 0;
    const adjustedGroupIndex = groupIndex + gap;

    const groupBaseContrast =
      deltaInfo.startContrast + deltaInfo.delta * adjustedGroupIndex;

    group.surfaces.forEach((surface, surfaceIndex) => {
      const intraGroupStep = deltaInfo.delta * 0.2;
      const stagger = surfaceIndex * intraGroupStep;

      const offset =
        (surface.contrastOffset && surface.contrastOffset[mode]) || 0;
      const targetContrast = groupBaseContrast + stagger + offset;

      const clampedContrast = clampTo(targetContrast, minContrast, maxContrast);

      const solvedL = solveBackgroundForContrast(
        context,
        clampedContrast,
        minBg,
        maxBg,
      );

      backgrounds.set(surface.slug, solvedL);

      if (surface.states) {
        surface.states.forEach((state) => {
          const stateTarget = clampedContrast + state.offset;

          const stateL = solveBackgroundForContrast(
            context,
            stateTarget,
            minBg,
            maxBg,
          );

          backgrounds.set(`${surface.slug}-${state.name}`, stateL);
        });
      }
    });
  });

  return backgrounds;
}

function solveCharts(
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

function getHue(color: string | undefined, fallback: number): number {
  if (!color) return fallback;
  const oklch = toOklch(color);
  if (!oklch || typeof oklch.h !== "number" || isNaN(oklch.h)) return fallback;
  return oklch.h;
}

function solvePrimitives(config: SolverConfig): Primitives {
  const brandHue = getHue(config.anchors.keyColors?.brand, 250);
  const highlightHue = getHue(config.anchors.keyColors?.highlight, 320);

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

export function solve(config: SolverConfig): Theme {
  const anchors = config.anchors;
  const groups = config.groups;
  const allSurfaces = groups.flatMap((g) => g.surfaces);

  alignInvertedAnchors(anchors, anchors.keyColors);

  // Calculate global key color stats (for default hue/chroma)
  const keyColorStats = getKeyColorStats(anchors.keyColors);
  const defaultHue = keyColorStats.hue ?? 0;
  const defaultChroma = 0; // Default to neutral if no specific target

  const backgrounds = new Map<string, { light: ColorSpec; dark: ColorSpec }>();

  for (const polarity of ["page", "inverted"] as const) {
    for (const mode of ["light", "dark"] as const) {
      const relevantGroups = groups.filter((g) =>
        g.surfaces.some((s) => s.polarity === polarity),
      );

      const filteredGroups = relevantGroups
        .map((g) => ({
          ...g,
          surfaces: g.surfaces.filter((s) => s.polarity === polarity),
        }))
        .filter((g) => g.surfaces.length > 0);

      const sequence = solveBackgroundSequence(
        { polarity, mode },
        anchors[polarity][mode],
        filteredGroups,
      );

      for (const [slug, lightness] of sequence.entries()) {
        const entry = backgrounds.get(slug) ?? {
          light: { l: 0, c: 0, h: 0 },
          dark: { l: 0, c: 0, h: 0 },
        };

        // Determine Chroma and Hue
        // 1. Find the surface config
        const surface = allSurfaces.find(
          (s) => s.slug === slug || slug.startsWith(`${s.slug}-`),
        );

        let chroma = defaultChroma;
        let hue = defaultHue;

        if (surface) {
          // Use targetChroma if specified
          if (surface.targetChroma !== undefined) {
            chroma = surface.targetChroma;
          }
          // If it's a state (e.g. hover), we might want to adjust chroma?
          // For now, keep it simple.
        }

        // Apply Hue Shift based on lightness
        const shift = calculateHueShift(lightness, config.hueShift);
        hue += shift;

        entry[mode] = { l: lightness, c: chroma, h: hue };

        if (surface && surface.override && surface.override[mode]) {
          const hex = surface.override[mode];
          const oklch = toOklch(hex) as
            | { l: number; c: number; h: number }
            | undefined;
          if (oklch) {
            entry[mode] = {
              l: oklch.l,
              c: oklch.c,
              h: isNaN(oklch.h) ? 0 : oklch.h,
            };
          }
        }

        backgrounds.set(slug, entry);
      }
    }
  }

  const solvedSurfaces = allSurfaces.map((surface) => {
    const background = backgrounds.get(surface.slug);

    if (!background) {
      throw new Error(`Missing solved backgrounds for ${surface.slug}.`);
    }

    const computed: Record<Mode, ModeSpec> = {
      light: solveForegroundSpec(background.light.l),
      dark: solveForegroundSpec(background.dark.l),
    };

    return { ...surface, computed };
  });

  const charts = solveCharts(config, backgrounds);
  const primitives = solvePrimitives(config);

  return {
    surfaces: solvedSurfaces,
    backgrounds: backgrounds,
    charts,
    primitives,
  };
}
