import { converter } from "culori";
import type {
  Anchors,
  Mode,
  ModeAnchors,
  ModeSpec,
  Mutable,
  Polarity,
  PolarityAnchors,
  SolverConfig,
  SurfaceConfig,
  SurfaceGroup,
} from "./types.ts";
import {
  avg,
  backgroundBounds,
  clamp01,
  clampContrast,
  clampToRange,
  contrastForBackground,
  roundLightness,
  solveBackgroundForContrast,
  solveForegroundSpec,
} from "./math.ts";

const toOklch = converter("oklch");

function computeKeyColorLightness(
  keyColors?: Record<string, string>
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
  keyColors?: Record<string, string>
): void {
  const keyColorLightness = computeKeyColorLightness(keyColors);

  if (keyColorLightness !== undefined) {
    const invertedAnchors = anchors.inverted;

    if (!invertedAnchors) {
      throw new Error("Missing inverted anchors for key color alignment.");
    }

    const updateEnd = (
      modeAnchors: ModeAnchors,
      lightness: number
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

function computeDeltaInfo(
  polarity: Polarity,
  mode: Mode,
  anchors: ModeAnchors,
  count: number
) {
  const startBackground = anchors.start.background;
  const endBackground = anchors.end.background;
  const startContrast = contrastForBackground(polarity, mode, startBackground);
  const endContrast = contrastForBackground(polarity, mode, endBackground);
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
  polarity: Polarity,
  mode: Mode,
  anchors: ModeAnchors,
  groups: SurfaceGroup[]
): Map<string, number> {
  const backgrounds = new Map<string, number>();

  if (groups.length === 0) return backgrounds;

  const totalGroups = groups.length;
  const deltaInfo = computeDeltaInfo(polarity, mode, anchors, totalGroups);

  const [minBg, maxBg] = backgroundBounds(
    anchors.start.background,
    anchors.end.background
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

      const offset = surface.contrastOffset?.[mode] ?? 0;
      const targetContrast = groupBaseContrast + stagger + offset;

      const clampedContrast = clampToRange(
        targetContrast,
        minContrast,
        maxContrast
      );

      let solvedL = solveBackgroundForContrast(
        polarity,
        mode,
        clampedContrast,
        minBg,
        maxBg
      );

      backgrounds.set(surface.slug, solvedL);

      if (surface.states) {
        surface.states.forEach((state) => {
          const stateTarget = clampedContrast + state.offset;

          const stateL = solveBackgroundForContrast(
            polarity,
            mode,
            stateTarget,
            minBg,
            maxBg
          );

          backgrounds.set(`${surface.slug}-${state.name}`, stateL);
        });
      }
    });
  });

  return backgrounds;
}

export function solve(config: SolverConfig): {
  surfaces: SurfaceConfig[];
  backgrounds: Map<string, Record<Mode, number>>;
} {
  const anchors = config.anchors;
  const groups = config.groups;
  const allSurfaces = groups.flatMap((g) => g.surfaces);

  alignInvertedAnchors(anchors, anchors.keyColors);

  const backgrounds = new Map<string, { light: number; dark: number }>();

  for (const polarity of ["page", "inverted"] as const) {
    if (!anchors[polarity]) {
      throw new Error(`Missing anchors for polarity ${polarity}.`);
    }

    for (const mode of ["light", "dark"] as const) {
      const relevantGroups = groups.filter((g) =>
        g.surfaces.some((s) => s.polarity === polarity)
      );

      const filteredGroups = relevantGroups
        .map((g) => ({
          ...g,
          surfaces: g.surfaces.filter((s) => s.polarity === polarity),
        }))
        .filter((g) => g.surfaces.length > 0);

      const sequence = solveBackgroundSequence(
        polarity,
        mode,
        anchors[polarity][mode],
        filteredGroups
      );

      for (const [slug, value] of sequence.entries()) {
        const entry = backgrounds.get(slug) ?? { light: 0, dark: 0 };
        entry[mode] = value;
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
      light: solveForegroundSpec(background.light),
      dark: solveForegroundSpec(background.dark),
    };

    return { ...surface, computed };
  });

  return {
    surfaces: solvedSurfaces,
    backgrounds: backgrounds,
  };
}
