import { Context, ModeSpec } from './types.js';

declare function toRgbTriplet(lightness: number): [number, number, number];
declare function contrastForPair(foreground: number, background: number): number;
declare const CONTRAST_EPSILON = 0.005;
declare const LIGHTNESS_PRECISION = 4;
declare function clamp01(value: number): number;
declare function clampTo(value: number, min: number, max: number): number;
declare function roundLightness(value: number): number;
declare function formatPrecision(value: number, digits?: number): number;
declare const avg: (numbers: number[]) => number;
declare function binarySearch(min: number, max: number, evaluate: (candidate: number) => number, target: number, epsilon?: number, maxIterations?: number): number;
declare function textLightness(context: Context): number;
declare function contrastForBackground(context: Context, background: number): number;
declare function backgroundBounds(start: number, end: number): [number, number];
declare function clampContrast(context: Context, target: number): number;
declare function solveBackgroundForContrast(context: Context, targetContrast: number, lowerBound: number, upperBound: number): number;
declare function solveForegroundLightness(background: number, targetContrast: number): number;
declare function solveBorderAlpha(surfaceL: number, textL: number, targetContrast: number): number;
declare function calculateHueShift(lightness: number, config?: {
    curve: {
        p1: [number, number];
        p2: [number, number];
    };
    maxRotation: number;
}): number;
declare function solveForegroundSpec(background: number): ModeSpec;

export { CONTRAST_EPSILON, LIGHTNESS_PRECISION, avg, backgroundBounds, binarySearch, calculateHueShift, clamp01, clampContrast, clampTo, contrastForBackground, contrastForPair, formatPrecision, roundLightness, solveBackgroundForContrast, solveBorderAlpha, solveForegroundLightness, solveForegroundSpec, textLightness, toRgbTriplet };
