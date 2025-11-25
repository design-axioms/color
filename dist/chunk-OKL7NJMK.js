import { roundLightness, avg, solveForegroundSpec, clamp01, backgroundBounds, clampTo, solveBackgroundForContrast, contrastForBackground } from './chunk-7LUK7J7M.js';
import { converter } from 'culori';

var toOklch = converter("oklch");
function getKeyColorStats(keyColors) {
  if (!keyColors) {
    return {};
  }
  const lightnesses = [];
  const chromas = [];
  const hues = [];
  for (const value of Object.values(keyColors)) {
    const entry = toOklch(value);
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
    hue: hues.length > 0 ? parseFloat(avg(hues).toFixed(4)) : void 0
  };
}
function computeKeyColorLightness(keyColors) {
  if (!keyColors) {
    return void 0;
  }
  const lightnesses = [];
  for (const value of Object.values(keyColors)) {
    const entry = toOklch(value);
    if (entry) {
      lightnesses.push(entry.l);
    }
  }
  if (lightnesses.length === 0) {
    return void 0;
  }
  return roundLightness(avg(lightnesses));
}
function alignInvertedAnchors(anchors, keyColors) {
  const keyColorLightness = computeKeyColorLightness(keyColors);
  if (keyColorLightness !== void 0) {
    const invertedAnchors = anchors.inverted;
    const updateEnd = (modeAnchors, lightness2) => ({
      ...modeAnchors,
      end: { ...modeAnchors.end, background: lightness2 }
    });
    const lightness = clamp01(keyColorLightness);
    const newInverted = {
      light: updateEnd(invertedAnchors.light, lightness),
      dark: updateEnd(invertedAnchors.dark, lightness)
    };
    anchors.inverted = newInverted;
  }
}
function computeDeltaInfo(context, anchors, count) {
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
    delta
  };
}
function solveBackgroundSequence(context, anchors, groups) {
  const backgrounds = /* @__PURE__ */ new Map();
  const { mode } = context;
  if (groups.length === 0) return backgrounds;
  const totalGroups = groups.length;
  const deltaInfo = computeDeltaInfo(context, anchors, totalGroups);
  const [minBg, maxBg] = backgroundBounds(
    anchors.start.background,
    anchors.end.background
  );
  const minContrast = Math.min(deltaInfo.startContrast, deltaInfo.endContrast);
  const maxContrast = Math.max(deltaInfo.startContrast, deltaInfo.endContrast);
  groups.forEach((group, groupIndex) => {
    const gap = group.gapBefore ?? 0;
    const adjustedGroupIndex = groupIndex + gap;
    const groupBaseContrast = deltaInfo.startContrast + deltaInfo.delta * adjustedGroupIndex;
    group.surfaces.forEach((surface, surfaceIndex) => {
      const intraGroupStep = deltaInfo.delta * 0.2;
      const stagger = surfaceIndex * intraGroupStep;
      const offset = surface.contrastOffset?.[mode] ?? 0;
      const targetContrast = groupBaseContrast + stagger + offset;
      const clampedContrast = clampTo(targetContrast, minContrast, maxContrast);
      const solvedL = solveBackgroundForContrast(
        context,
        clampedContrast,
        minBg,
        maxBg
      );
      backgrounds.set(surface.slug, solvedL);
      if (surface.states) {
        surface.states.forEach((state) => {
          const stateTarget = clampedContrast + state.offset;
          const stateL = solveBackgroundForContrast(
            context,
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
function solve(config) {
  const anchors = config.anchors;
  const groups = config.groups;
  const allSurfaces = groups.flatMap((g) => g.surfaces);
  alignInvertedAnchors(anchors, anchors.keyColors);
  const backgrounds = /* @__PURE__ */ new Map();
  for (const polarity of ["page", "inverted"]) {
    for (const mode of ["light", "dark"]) {
      const relevantGroups = groups.filter(
        (g) => g.surfaces.some((s) => s.polarity === polarity)
      );
      const filteredGroups = relevantGroups.map((g) => ({
        ...g,
        surfaces: g.surfaces.filter((s) => s.polarity === polarity)
      })).filter((g) => g.surfaces.length > 0);
      const sequence = solveBackgroundSequence(
        { polarity, mode },
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
    const computed = {
      light: solveForegroundSpec(background.light),
      dark: solveForegroundSpec(background.dark)
    };
    return { ...surface, computed };
  });
  return {
    surfaces: solvedSurfaces,
    backgrounds
  };
}

export { getKeyColorStats, solve };
//# sourceMappingURL=chunk-OKL7NJMK.js.map
//# sourceMappingURL=chunk-OKL7NJMK.js.map