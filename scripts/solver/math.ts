import { APCAcontrast, sRGBtoY } from "apca-w3";
import { converter } from "culori";
import type { Mode, ModeSpec, Polarity } from "./types.ts";

const toRgb = converter("rgb");

// --- CONSTANTS ---

export const CONTRAST_EPSILON = 0.005;
export const LIGHTNESS_PRECISION = 4;

const HIGH_CONTRAST = 108;
const STRONG_CONTRAST = 105;
const SUBTLEST_CONTRAST = 75;
const STEP = (STRONG_CONTRAST - SUBTLEST_CONTRAST) / 3;

// --- UTILS ---

export function clamp01(value: number): number {
  if (value < 0) return 0;
  if (value > 1) return 1;
  return value;
}

export function clampToRange(value: number, min: number, max: number): number {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

export function roundLightness(value: number): number {
  return Number(value.toFixed(LIGHTNESS_PRECISION));
}

export function formatPrecision(value: number, digits = 4): number {
  return Number(value.toFixed(digits));
}

export const avg = (numbers: number[]): number => {
  const total = numbers.reduce((sum, n) => sum + n, 0);
  return total / numbers.length;
};

// --- BINARY SEARCH ---

export function binarySearch(
  min: number,
  max: number,
  evaluate: (candidate: number) => number,
  target: number,
  epsilon: number = 0.005,
  maxIterations: number = 40
): number {
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

// --- CONTRAST ---

export function toRgbTriplet(lightness: number): [number, number, number] {
  const ok = { mode: "oklch", l: clamp01(lightness), c: 0, h: 0 } as const;
  const rgb = toRgb(ok) as { mode: "rgb"; r: number; g: number; b: number };

  if (!rgb || rgb.mode !== "rgb") {
    throw new Error("Failed to convert OKLCH lightness to RGB.");
  }

  const clampChannel = (value: number) => {
    const clamped = clamp01(value ?? 0);
    return Math.round(clamped * 255);
  };

  return [clampChannel(rgb.r), clampChannel(rgb.g), clampChannel(rgb.b)];
}

export function contrastForPair(
  foreground: number,
  background: number
): number {
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

export function textLightness(polarity: Polarity, mode: Mode): number {
  if (polarity === "page") {
    return mode === "light" ? 0 : 1;
  }
  return mode === "light" ? 1 : 0;
}

export function contrastForBackground(
  polarity: Polarity,
  mode: Mode,
  background: number
): number {
  return contrastForPair(textLightness(polarity, mode), background);
}

export function backgroundBounds(start: number, end: number): [number, number] {
  return [Math.min(start, end), Math.max(start, end)];
}

export function clampContrast(
  polarity: Polarity,
  mode: Mode,
  target: number
): number {
  const contrastAtZero = contrastForBackground(polarity, mode, 0);
  const contrastAtOne = contrastForBackground(polarity, mode, 1);
  const max = Math.max(contrastAtZero, contrastAtOne);
  const min = Math.min(contrastAtZero, contrastAtOne);
  if (target > max) return max;
  if (target < min) return min;
  return target;
}

export function solveBackgroundForContrast(
  polarity: Polarity,
  mode: Mode,
  targetContrast: number,
  lowerBound: number,
  upperBound: number
): number {
  const [minBg, maxBg] = backgroundBounds(lowerBound, upperBound);
  const clampedTarget = clampContrast(polarity, mode, targetContrast);

  const result = binarySearch(
    minBg,
    maxBg,
    (bg) => contrastForBackground(polarity, mode, bg),
    clampedTarget,
    CONTRAST_EPSILON
  );

  return roundLightness(result);
}

export function solveForegroundLightness(
  background: number,
  targetContrast: number
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
    0.0001
  );

  return formatPrecision(clamp01(result));
}

export function solveBorderAlpha(
  surfaceL: number,
  textL: number,
  targetContrast: number
): number {
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

// --- HUE SHIFT ---

function cubicBezier(t: number, p1: number, p2: number): number {
  const oneMinusT = 1 - t;
  return (
    3 * oneMinusT * oneMinusT * t * p1 + 3 * oneMinusT * t * t * p2 + t * t * t
  );
}

export function calculateHueShift(
  lightness: number,
  config?: {
    curve: { p1: [number, number]; p2: [number, number] };
    maxRotation: number;
  }
): number {
  if (!config) return 0;
  const { curve, maxRotation } = config;
  const factor = cubicBezier(lightness, curve.p1[1], curve.p2[1]);
  return factor * maxRotation;
}

export function solveForegroundSpec(background: number): ModeSpec {
  const solver = (target: number) =>
    solveForegroundLightness(background, target);

  return {
    background: roundLightness(background),
    "fg-high": solver(HIGH_CONTRAST),
    "fg-strong": solver(STRONG_CONTRAST),
    "fg-baseline": solver(STRONG_CONTRAST - STEP),
    "fg-subtle": solver(STRONG_CONTRAST - STEP * 2),
    "fg-subtlest": solver(SUBTLEST_CONTRAST),
  };
}
