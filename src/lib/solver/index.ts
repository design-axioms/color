import { converter, oklch } from "culori";
import { AxiomaticError } from "../errors.ts";
import {
  backgroundBounds,
  calculateHueShift,
  contrastForBackground,
  solveBackgroundForContrast,
  solveForegroundSpec,
} from "../math.ts";
import type {
  ColorSpec,
  Mode,
  ModeSpec,
  SolverConfig,
  Theme,
} from "../types.ts";
import { alignInvertedAnchors, solveBackgroundSequence } from "./planner.ts";
import {
  getHue,
  getKeyColorStats,
  solveCharts,
  solvePrimitives,
} from "./resolver.ts";

export * from "./planner.ts";
export * from "./resolver.ts";

const toOklch = converter("oklch");

export function solve(config: SolverConfig): Theme {
  const anchors = config.anchors;
  const groups = config.groups;
  const allSurfaces = groups.flatMap((g) => g.surfaces);

  // P1-11: Validate no duplicate surface slugs
  const seenSlugs = new Map<string, string>();
  for (const group of groups) {
    for (const surface of group.surfaces) {
      const existing = seenSlugs.get(surface.slug);
      if (existing) {
        throw new AxiomaticError(
          "CONFIG_DUPLICATE_SURFACE_SLUG",
          `Duplicate surface slug "${surface.slug}" found in groups "${existing}" and "${group.name}".`,
          {
            slug: surface.slug,
            firstGroup: existing,
            secondGroup: group.name,
          },
        );
      }
      seenSlugs.set(surface.slug, group.name);
    }
  }

  // P1-14: Warn about empty surface groups
  for (const group of groups) {
    if (group.surfaces.length === 0) {
      console.warn(
        `[Axiomatic] CONFIG_EMPTY_SURFACE_GROUP: Surface group "${group.name}" has no surfaces.`,
      );
    }
  }

  // P1-12: Validate anchor ordering
  for (const polarity of ["page", "inverted"] as const) {
    for (const mode of ["light", "dark"] as const) {
      const modeAnchors = anchors[polarity][mode];
      const startBg = modeAnchors.start.background;
      const endBg = modeAnchors.end.background;

      // For light mode: start should have higher L* (lighter) than end
      // For dark mode: start should have lower L* (darker) than end
      const isValid = mode === "light" ? startBg >= endBg : startBg <= endBg;

      if (!isValid) {
        throw new AxiomaticError(
          "CONFIG_INVALID_ANCHOR_ORDER",
          `Invalid anchor ordering for ${polarity}/${mode}: ` +
            `start.background (${startBg.toFixed(2)}) should be ` +
            `${mode === "light" ? ">=" : "<="} end.background (${endBg.toFixed(2)}).`,
          { polarity, mode, startBg, endBg },
        );
      }
    }
  }

  // P1-20: Validate contrast offsets
  for (const surface of allSurfaces) {
    if (surface.states) {
      for (const state of surface.states) {
        const offset = state.offset;
        if (offset < -20 || offset > 20) {
          throw new AxiomaticError(
            "CONFIG_INVALID_CONTRAST_OFFSET",
            `Contrast offset ${offset} for state "${state.name}" on surface "${surface.slug}" is out of valid range (-20 to 20).`,
            { surface: surface.slug, state: state.name, offset },
          );
        }
      }
    }
  }

  alignInvertedAnchors(anchors, anchors.keyColors);

  // Calculate global key color stats (for default hue/chroma)
  const keyColorStats = getKeyColorStats(anchors.keyColors);
  const defaultHue = keyColorStats.hue ?? 0;
  const defaultChroma = 0; // Default to neutral if no specific target

  const backgrounds = new Map<string, { light: ColorSpec; dark: ColorSpec }>();
  const debugInfo = new Map<
    string,
    Record<Mode, { targetContrast: number; clamped: boolean }>
  >();

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

      // Store overridden contrasts to calculate states correctly
      const overriddenContrasts = new Map<string, number>();

      for (const [slug, result] of sequence.entries()) {
        const lightness = result.lightness;
        const debug = result.debug;

        const entry = backgrounds.get(slug) ?? {
          light: { l: 0, c: 0, h: 0 },
          dark: { l: 0, c: 0, h: 0 },
        };

        // Store debug info
        const debugEntry = debugInfo.get(slug) ?? {
          light: { targetContrast: 0, clamped: false },
          dark: { targetContrast: 0, clamped: false },
        };
        debugEntry[mode] = debug;
        debugInfo.set(slug, debugEntry);

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

          // Use target hue if specified
          if (surface.hue !== undefined) {
            if (typeof surface.hue === "number") {
              hue = surface.hue;
            } else {
              // Resolve key color
              hue = getHue(config.anchors.keyColors[surface.hue], defaultHue);
            }
          }
        }

        // Apply Hue Shift based on lightness
        const shift = calculateHueShift(lightness, config.hueShift);
        hue += shift;

        entry[mode] = { l: lightness, c: chroma, h: hue };

        // Handle Overrides
        if (surface && surface.override && surface.override[mode]) {
          const hex = surface.override[mode];
          const parsed = oklch(hex) || toOklch(hex);

          if (!parsed) {
            throw new AxiomaticError(
              "COLOR_PARSE_FAILED",
              `Could not parse surface override for ${surface.slug} (${mode}).`,
              { surface: surface.slug, mode, value: hex },
            );
          }

          const overrideL = parsed.l;
          const overrideC = parsed.c;
          const overrideH = isNaN(parsed.h ?? NaN) ? 0 : (parsed.h ?? 0);

          if (
            !Number.isFinite(overrideL) ||
            !Number.isFinite(overrideC) ||
            !Number.isFinite(overrideH)
          ) {
            throw new AxiomaticError(
              "COLOR_PARSE_FAILED",
              `Surface override produced a non-finite OKLCH value for ${surface.slug} (${mode}).`,
              {
                surface: surface.slug,
                mode,
                value: hex,
                parsed: { l: overrideL, c: overrideC, h: overrideH },
              },
            );
          }

          if (surface.slug === slug) {
            // Base Surface: Apply override directly
            entry[mode] = { l: overrideL, c: overrideC, h: overrideH };

            // Store contrast for states
            const contrast = contrastForBackground(
              { polarity, mode },
              overrideL,
            );
            overriddenContrasts.set(slug, contrast);
          } else {
            // State Surface (e.g. action-hover)
            // Check if base was overridden
            const baseContrast = overriddenContrasts.get(surface.slug);

            if (baseContrast !== undefined) {
              // Find state config
              const stateConfig = surface.states?.find(
                (s) => `${surface.slug}-${s.name}` === slug,
              );

              if (stateConfig) {
                const targetContrast = baseContrast + stateConfig.offset;
                const [minBg, maxBg] = backgroundBounds(
                  anchors[polarity][mode].start.background,
                  anchors[polarity][mode].end.background,
                );

                const newLightness = solveBackgroundForContrast(
                  { polarity, mode },
                  targetContrast,
                  minBg,
                  maxBg,
                );

                // Use override H/C but new Lightness
                entry[mode] = {
                  l: newLightness,
                  c: overrideC,
                  h: overrideH,
                };
              }
            }
          }
        }

        backgrounds.set(slug, entry);
      }
    }
  }

  const solvedSurfaces = allSurfaces.map((surface) => {
    const background = backgrounds.get(surface.slug);
    const debug = debugInfo.get(surface.slug);

    if (!background) {
      throw new AxiomaticError(
        "SOLVER_MISSING_BACKGROUNDS",
        `Missing solved backgrounds for ${surface.slug}.`,
        { surface: surface.slug, known: Array.from(backgrounds.keys()) },
      );
    }

    const computed: Record<Mode, ModeSpec> = {
      light: {
        ...solveForegroundSpec(background.light.l),
        debug: debug?.light,
      },
      dark: { ...solveForegroundSpec(background.dark.l), debug: debug?.dark },
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
