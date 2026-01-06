import { converter } from "culori";
import { AxiomaticError } from "../errors.ts";
import {
  avg,
  backgroundBounds,
  clamp01,
  clampTo,
  contrastForBackground,
  roundLightness,
  solveBackgroundForContrast,
} from "../math.ts";
import type {
  Anchors,
  AnchorValue,
  Context,
  ModeAnchors,
  Mutable,
  PolarityAnchors,
  SurfaceGroup,
} from "../types.ts";

const toOklch = converter("oklch");

function isOklchLike(value: unknown): value is { l: number } {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return typeof record.l === "number" && Number.isFinite(record.l);
}

function computeKeyColorLightness(
  keyColors?: Record<string, string>,
): number | undefined {
  if (!keyColors) {
    return undefined;
  }

  const lightnesses: number[] = [];

  for (const [name, value] of Object.entries(keyColors)) {
    const entry = toOklch(value);

    if (isOklchLike(entry)) {
      lightnesses.push(entry.l);
      continue;
    }

    // Allow aliases; they may resolve elsewhere.
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
    return undefined;
  }

  return roundLightness(avg(lightnesses));
}

export function alignInvertedAnchors(
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

    // Clamp lightness to ensure sufficient contrast for white text
    // L=0.40 provides better contrast than 0.45, ensuring white text is clearly legible
    const lightness = Math.min(clamp01(keyColorLightness), 0.4);

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

export function solveBackgroundSequence(
  context: Context,
  anchors: ModeAnchors,
  groups: SurfaceGroup[],
): Map<
  string,
  { lightness: number; debug: { targetContrast: number; clamped: boolean } }
> {
  const backgrounds = new Map<
    string,
    { lightness: number; debug: { targetContrast: number; clamped: boolean } }
  >();
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
      const clamped = Math.abs(targetContrast - clampedContrast) > 0.01;

      const solvedL = solveBackgroundForContrast(
        context,
        clampedContrast,
        minBg,
        maxBg,
      );

      backgrounds.set(surface.slug, {
        lightness: solvedL,
        debug: { targetContrast, clamped },
      });

      if (surface.states) {
        surface.states.forEach((state) => {
          const stateTarget = clampedContrast + state.offset;
          const stateClamped = clampTo(stateTarget, minContrast, maxContrast);
          const isStateClamped = Math.abs(stateTarget - stateClamped) > 0.01;

          const stateL = solveBackgroundForContrast(
            context,
            stateTarget,
            minBg,
            maxBg,
          );

          backgrounds.set(`${surface.slug}-${state.name}`, {
            lightness: stateL,
            debug: { targetContrast: stateTarget, clamped: isStateClamped },
          });
        });
      }
    });
  });

  return backgrounds;
}
