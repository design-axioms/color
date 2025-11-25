import { sRGBtoY, APCAcontrast } from 'apca-w3';
import { converter } from 'culori';

// src/lib/math.ts
var toRgb = converter("rgb");
function toRgbTriplet(lightness) {
  const rgb = toRgb({ mode: "oklch", l: clamp01(lightness), c: 0, h: 0 });
  const clampChannel = (value) => {
    const clamped = clamp01(value);
    return Math.round(clamped * 255);
  };
  return [clampChannel(rgb.r), clampChannel(rgb.g), clampChannel(rgb.b)];
}
function contrastForPair(foreground, background) {
  const fgY = sRGBtoY(toRgbTriplet(foreground));
  const bgY = sRGBtoY(toRgbTriplet(background));
  const contrast = APCAcontrast(fgY, bgY);
  const numeric = typeof contrast === "number" ? contrast : Number(contrast);
  if (!Number.isFinite(numeric)) {
    throw new Error(
      `APCAcontrast returned a non-finite value for foreground ${foreground} and background ${background}.`
    );
  }
  return Math.abs(numeric);
}
var CONTRAST_EPSILON = 5e-3;
var LIGHTNESS_PRECISION = 4;
var HIGH_CONTRAST = 108;
var STRONG_CONTRAST = 105;
var SUBTLEST_CONTRAST = 75;
var STEP = (STRONG_CONTRAST - SUBTLEST_CONTRAST) / 3;
function clamp01(value) {
  return clampTo(value, 0, 1);
}
function clampTo(value, min, max) {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}
function roundLightness(value) {
  return Number(value.toFixed(LIGHTNESS_PRECISION));
}
function formatPrecision(value, digits = 4) {
  return Number(value.toFixed(digits));
}
var avg = (numbers) => {
  const total = numbers.reduce((sum, n) => sum + n, 0);
  return total / numbers.length;
};
function binarySearch(min, max, evaluate, target, epsilon = 5e-3, maxIterations = 40) {
  let low = min;
  let high = max;
  const valAtMin = evaluate(min);
  const valAtMax = evaluate(max);
  const slope = Math.sign(valAtMax - valAtMin) || 1;
  const minVal = Math.min(valAtMin, valAtMax);
  const maxVal = Math.max(valAtMin, valAtMax);
  if (target <= minVal + epsilon) return valAtMin <= valAtMax ? min : max;
  if (target >= maxVal - epsilon) return valAtMax >= valAtMin ? max : min;
  for (let i = 0; i < maxIterations; i++) {
    const mid = (low + high) / 2;
    const val = evaluate(mid);
    const delta = val - target;
    if (Math.abs(delta) <= epsilon) {
      return mid;
    }
    if (delta * slope > 0) {
      high = mid;
    } else {
      low = mid;
    }
  }
  return (low + high) / 2;
}
function textLightness(context) {
  const { polarity, mode } = context;
  if (polarity === "page") {
    return mode === "light" ? 0 : 1;
  }
  return mode === "light" ? 1 : 0;
}
function contrastForBackground(context, background) {
  return contrastForPair(textLightness(context), background);
}
function backgroundBounds(start, end) {
  return [Math.min(start, end), Math.max(start, end)];
}
function clampContrast(context, target) {
  const contrastAtZero = contrastForBackground(context, 0);
  const contrastAtOne = contrastForBackground(context, 1);
  const max = Math.max(contrastAtZero, contrastAtOne);
  const min = Math.min(contrastAtZero, contrastAtOne);
  if (target > max) return max;
  if (target < min) return min;
  return target;
}
function solveBackgroundForContrast(context, targetContrast, lowerBound, upperBound) {
  const [minBg, maxBg] = backgroundBounds(lowerBound, upperBound);
  const clampedTarget = clampContrast(context, targetContrast);
  const result = binarySearch(
    minBg,
    maxBg,
    (bg) => contrastForBackground(context, bg),
    clampedTarget,
    CONTRAST_EPSILON
  );
  return roundLightness(result);
}
function solveForegroundLightness(background, targetContrast) {
  const contrastLighter = contrastForPair(1, background);
  const contrastDarker = contrastForPair(0, background);
  const preferLighter = contrastLighter >= contrastDarker;
  const range = preferLighter ? [background, 1] : [0, background];
  const result = binarySearch(
    range[0],
    range[1],
    (fg) => contrastForPair(fg, background),
    targetContrast,
    1e-4
  );
  return formatPrecision(clamp01(result));
}
function solveBorderAlpha(surfaceL, textL, targetContrast) {
  return binarySearch(
    0,
    1,
    (alpha) => {
      const borderL = textL * alpha + surfaceL * (1 - alpha);
      return contrastForPair(borderL, surfaceL);
    },
    targetContrast,
    0.01
  );
}
function cubicBezier(t, p1, p2) {
  const oneMinusT = 1 - t;
  return 3 * oneMinusT * oneMinusT * t * p1 + 3 * oneMinusT * t * t * p2 + t * t * t;
}
function calculateHueShift(lightness, config) {
  if (!config) return 0;
  const { curve, maxRotation } = config;
  const factor = cubicBezier(lightness, curve.p1[1], curve.p2[1]);
  return factor * maxRotation;
}
function solveForegroundSpec(background) {
  const solver = (target) => solveForegroundLightness(background, target);
  return {
    background: roundLightness(background),
    "fg-high": solver(HIGH_CONTRAST),
    "fg-strong": solver(STRONG_CONTRAST),
    "fg-baseline": solver(STRONG_CONTRAST - STEP),
    "fg-subtle": solver(STRONG_CONTRAST - STEP * 2),
    "fg-subtlest": solver(SUBTLEST_CONTRAST)
  };
}

export { CONTRAST_EPSILON, LIGHTNESS_PRECISION, avg, backgroundBounds, binarySearch, calculateHueShift, clamp01, clampContrast, clampTo, contrastForBackground, contrastForPair, formatPrecision, roundLightness, solveBackgroundForContrast, solveBorderAlpha, solveForegroundLightness, solveForegroundSpec, textLightness, toRgbTriplet };
//# sourceMappingURL=chunk-7LUK7J7M.js.map
//# sourceMappingURL=chunk-7LUK7J7M.js.map