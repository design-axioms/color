import { APCAcontrast, sRGBtoY } from "apca-w3";
import { converter } from "culori";
import { AxiomaticError } from "./errors.ts";
import type { Context, ModeSpec } from "./types.ts";

const toRgb = converter("rgb");

// Original toRgbTriplet implementation (no memoization)
/**
 * Converts a lightness value (0-1) to an RGB triplet [0-255, 0-255, 0-255].
 * Uses OKLCH with C=0, H=0.
 * @param lightness The lightness value (0-1).
 * @returns The RGB triplet.
 */
export function toRgbTriplet(lightness: number): [number, number, number] {
  const rgb = toRgb({ mode: "oklch", l: clamp01(lightness), c: 0, h: 0 });

  const clampChannel = (value: number): number => {
    const clamped = clamp01(value);
    return Math.round(clamped * 255);
  };

  return [clampChannel(rgb.r), clampChannel(rgb.g), clampChannel(rgb.b)];
}

// Original contrastForPair implementation (no memoization)
/**
 * Calculates the APCA contrast between a foreground and background lightness.
 * @param foreground The foreground lightness (0-1).
 * @param background The background lightness (0-1).
 * @returns The absolute APCA contrast value.
 */
export function contrastForPair(
  foreground: number,
  background: number,
): number {
  const fgY = sRGBtoY(toRgbTriplet(foreground));
  const bgY = sRGBtoY(toRgbTriplet(background));
  const contrast = APCAcontrast(fgY, bgY);
  const numeric = typeof contrast === "number" ? contrast : Number(contrast);

  if (!Number.isFinite(numeric)) {
    throw new Error(
      `APCAcontrast returned a non-finite value for foreground ${foreground} and background ${background}.`,
    );
  }

  return Math.abs(numeric);
}

// --- CONSTANTS ---

export const CONTRAST_EPSILON = 0.005;
export const LIGHTNESS_PRECISION = 4;

const HIGH_CONTRAST = 108;
const STRONG_CONTRAST = 105;
const SUBTLEST_CONTRAST = 75;
const STEP = (STRONG_CONTRAST - SUBTLEST_CONTRAST) / 3;

// High Contrast Targets (Boosted)
const HC_OFFSET = 15;
const SUBTLEST_CONTRAST_HC = SUBTLEST_CONTRAST + HC_OFFSET;

// --- UTILS ---

/**
 * Clamps a value between 0 and 1.
 * @param value The value to clamp.
 * @returns The clamped value.
 */
export function clamp01(value: number): number {
  return clampTo(value, 0, 1);
}

/**
 * Clamps a value between a minimum and maximum.
 * @param value The value to clamp.
 * @param min The minimum value.
 * @param max The maximum value.
 * @returns The clamped value.
 */
export function clampTo(value: number, min: number, max: number): number {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

/**
 * Rounds a lightness value to the configured precision.
 * @param value The lightness value.
 * @returns The rounded value.
 */
export function roundLightness(value: number): number {
  return Number(value.toFixed(LIGHTNESS_PRECISION));
}

/**
 * Formats a number to a specific precision.
 * @param value The number to format.
 * @param digits The number of digits (default 4).
 * @returns The formatted number.
 */
export function formatPrecision(value: number, digits = 4): number {
  return Number(value.toFixed(digits));
}

/**
 * Calculates the average of an array of numbers.
 * @param numbers The array of numbers.
 * @returns The average value.
 */
export const avg = (numbers: number[]): number => {
  const total = numbers.reduce((sum, n) => sum + n, 0);
  return total / numbers.length;
};

// --- BINARY SEARCH ---

/**
 * Performs a binary search to find a value that satisfies a target condition.
 * @param min The minimum value of the search range.
 * @param max The maximum value of the search range.
 * @param evaluate A function that evaluates a candidate value.
 * @param target The target value to find.
 * @param epsilon The error tolerance (default 0.005).
 * @param maxIterations The maximum number of iterations (default 40).
 * @returns The best matching value found.
 */
export function binarySearch(
  min: number,
  max: number,
  evaluate: (candidate: number) => number,
  target: number,
  epsilon: number = 0.005,
  maxIterations: number = 40,
): number {
  let low = min;
  let high = max;

  const valAtMin = evaluate(min);
  const valAtMax = evaluate(max);

  if (!Number.isFinite(valAtMin) || !Number.isFinite(valAtMax)) {
    throw new AxiomaticError(
      "MATH_NONFINITE",
      "binarySearch evaluate() returned a non-finite value for a bound.",
      { min, max, valAtMin, valAtMax, target },
    );
  }

  const slope = Math.sign(valAtMax - valAtMin) || 1;

  const minVal = Math.min(valAtMin, valAtMax);
  const maxVal = Math.max(valAtMin, valAtMax);

  if (target <= minVal + epsilon) return valAtMin <= valAtMax ? min : max;
  if (target >= maxVal - epsilon) return valAtMax >= valAtMin ? max : min;

  for (let i = 0; i < maxIterations; i++) {
    const mid = (low + high) / 2;
    const val = evaluate(mid);

    if (!Number.isFinite(val)) {
      throw new AxiomaticError(
        "MATH_NONFINITE",
        "binarySearch evaluate() returned a non-finite value.",
        { min, max, low, high, mid, val, target, iteration: i },
      );
    }

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

// --- CONTRAST ---

/**
 * Determines the text lightness (0 or 1) for a given context.
 * @param context The context (polarity and mode).
 * @returns 0 for black text, 1 for white text.
 */
export function textLightness(context: Context): number {
  const { polarity, mode } = context;
  if (polarity === "page") {
    return mode === "light" ? 0 : 1;
  }
  return mode === "light" ? 1 : 0;
}

/**
 * Calculates the contrast of a background color against the context's text color.
 * @param context The context.
 * @param background The background lightness.
 * @returns The contrast value.
 */
export function contrastForBackground(
  context: Context,
  background: number,
): number {
  return contrastForPair(textLightness(context), background);
}

/**
 * Returns the bounds [min, max] for a background range.
 * @param start The start value.
 * @param end The end value.
 * @returns A tuple [min, max].
 */
export function backgroundBounds(start: number, end: number): [number, number] {
  return [Math.min(start, end), Math.max(start, end)];
}

/**
 * Clamps a target contrast value to the achievable range for the context.
 * @param context The context.
 * @param target The target contrast.
 * @returns The clamped contrast value.
 */
export function clampContrast(context: Context, target: number): number {
  const contrastAtZero = contrastForBackground(context, 0);
  const contrastAtOne = contrastForBackground(context, 1);
  const max = Math.max(contrastAtZero, contrastAtOne);
  const min = Math.min(contrastAtZero, contrastAtOne);
  if (target > max) return max;
  if (target < min) return min;
  return target;
}

/**
 * Solves for the background lightness that achieves a target contrast.
 * @param context The context.
 * @param targetContrast The target contrast.
 * @param lowerBound The lower bound of the background range.
 * @param upperBound The upper bound of the background range.
 * @returns The solved background lightness.
 */
export function solveBackgroundForContrast(
  context: Context,
  targetContrast: number,
  lowerBound: number,
  upperBound: number,
): number {
  const [minBg, maxBg] = backgroundBounds(lowerBound, upperBound);
  const clampedTarget = clampContrast(context, targetContrast);

  const result = binarySearch(
    minBg,
    maxBg,
    (bg) => contrastForBackground(context, bg),
    clampedTarget,
    CONTRAST_EPSILON,
  );

  return roundLightness(result);
}

/**
 * Solves for the foreground lightness that achieves a target contrast against a background.
 * @param background The background lightness.
 * @param targetContrast The target contrast.
 * @returns The solved foreground lightness.
 */
export function solveForegroundLightness(
  background: number,
  targetContrast: number,
): number {
  const contrastLighter = contrastForPair(1, background);
  const contrastDarker = contrastForPair(0, background);
  const preferLighter = contrastLighter >= contrastDarker;

  const range: [number, number] = preferLighter
    ? [background, 1]
    : [0, background];

  const result = binarySearch(
    range[0],
    range[1],
    (fg) => contrastForPair(fg, background),
    targetContrast,
    0.0001,
  );

  return formatPrecision(clamp01(result));
}

/**
 * Solves for the border alpha that achieves a target contrast against a surface.
 * @param surfaceL The surface lightness.
 * @param textL The text lightness (used as the border color source).
 * @param targetContrast The target contrast.
 * @returns The solved border alpha.
 */
export function solveBorderAlpha(
  surfaceL: number,
  textL: number,
  targetContrast: number,
): number {
  return binarySearch(
    0,
    1,
    (alpha) => {
      const borderL = textL * alpha + surfaceL * (1 - alpha);
      return contrastForPair(borderL, surfaceL);
    },
    targetContrast,
    0.01,
  );
}

// --- HUE SHIFT ---

function cubicBezier(t: number, p1: number, p2: number): number {
  const oneMinusT = 1 - t;
  return (
    3 * oneMinusT * oneMinusT * t * p1 + 3 * oneMinusT * t * t * p2 + t * t * t
  );
}

/**
 * Calculates the hue shift for a given lightness using a cubic bezier curve.
 * @param lightness The lightness value.
 * @param config The hue shift configuration (curve and max rotation).
 * @returns The hue shift amount in degrees.
 */
export function calculateHueShift(
  lightness: number,
  config?: {
    curve: { p1: [number, number]; p2: [number, number] };
    maxRotation: number;
  },
): number {
  if (!config) return 0;
  const { curve, maxRotation } = config;

  // Solve for t given x (lightness)
  // x(t) = cubicBezier(t, p1x, p2x)
  // We need to find t such that x(t) === lightness
  const t = binarySearch(
    0,
    1,
    (val) => cubicBezier(val, curve.p1[0], curve.p2[0]),
    lightness,
    0.001,
  );

  // Calculate y (hue shift factor) given t
  const factor = cubicBezier(t, curve.p1[1], curve.p2[1]);
  return factor * maxRotation;
}

/**
 * Generates a full foreground specification (all contrast levels) for a given background.
 * @param background The background lightness.
 * @returns The mode specification containing all foreground lightness values.
 */
export function solveForegroundSpec(background: number): ModeSpec {
  const solver = (target: number): number =>
    solveForegroundLightness(background, target);

  return {
    background: roundLightness(background),
    "fg-high": solver(HIGH_CONTRAST),
    "fg-strong": solver(STRONG_CONTRAST),
    "fg-baseline": solver(STRONG_CONTRAST - STEP),
    "fg-subtle": solver(STRONG_CONTRAST - STEP * 2),
    "fg-subtlest": solver(SUBTLEST_CONTRAST),
    // High Contrast
    "fg-high-hc": solver(HIGH_CONTRAST), // Already max
    "fg-strong-hc": solver(HIGH_CONTRAST), // Boost to max
    "fg-baseline-hc": solver(STRONG_CONTRAST), // Boost to Strong
    "fg-subtle-hc": solver(STRONG_CONTRAST - STEP), // Boost to Baseline
    "fg-subtlest-hc": solver(SUBTLEST_CONTRAST_HC), // Boosted floor
  };
}
