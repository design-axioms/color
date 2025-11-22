import { describe, it, expect } from "vitest";
import {
  binarySearch,
  contrastForPair,
  calculateHueShift,
  solveForegroundSpec,
  clamp01,
  roundLightness,
  backgroundBounds,
  clampContrast,
  solveBackgroundForContrast,
  solveBorderAlpha,
} from "../math.ts";

describe("Math Utilities", () => {
  describe("clamp01", () => {
    it("clamps values below 0", () => {
      expect(clamp01(-0.5)).toBe(0);
      expect(clamp01(-100)).toBe(0);
    });

    it("clamps values above 1", () => {
      expect(clamp01(1.5)).toBe(1);
      expect(clamp01(100)).toBe(1);
    });

    it("preserves values within range", () => {
      expect(clamp01(0.5)).toBe(0.5);
      expect(clamp01(0)).toBe(0);
      expect(clamp01(1)).toBe(1);
    });
  });

  describe("roundLightness", () => {
    it("rounds to 4 decimal places", () => {
      expect(roundLightness(0.123456789)).toBe(0.1235);
      expect(roundLightness(0.999999)).toBe(1);
    });
  });

  describe("backgroundBounds", () => {
    it("returns [min, max] when start < end", () => {
      expect(backgroundBounds(0.2, 0.8)).toEqual([0.2, 0.8]);
    });

    it("returns [min, max] when start > end", () => {
      expect(backgroundBounds(0.8, 0.2)).toEqual([0.2, 0.8]);
    });

    it("handles equal values", () => {
      expect(backgroundBounds(0.5, 0.5)).toEqual([0.5, 0.5]);
    });
  });

  describe("clampContrast", () => {
    it("clamps target above maximum contrast", () => {
      const clamped = clampContrast("page", "light", 999);
      expect(clamped).toBeLessThan(120); // Max APCA is ~108-110
    });

    it("clamps target below minimum contrast", () => {
      const clamped = clampContrast("page", "light", -999);
      expect(clamped).toBeGreaterThanOrEqual(0); // Can be 0
    });

    it("preserves achievable values", () => {
      const target = 75;
      const clamped = clampContrast("page", "light", target);
      expect(clamped).toBeCloseTo(target, 0);
    });
  });

  describe("binarySearch", () => {
    it("finds exact midpoint", () => {
      const result = binarySearch(0, 1, (x) => x, 0.5);
      expect(result).toBeCloseTo(0.5, 2);
    });

    it("finds target in linear function", () => {
      const result = binarySearch(0, 10, (x) => x * 2, 14);
      expect(result).toBeCloseTo(7, 2);
    });

    it("handles edge case when min equals max", () => {
      const result = binarySearch(5, 5, (x) => x, 5);
      expect(result).toBe(5);
    });

    it("returns min when target is below range", () => {
      const result = binarySearch(10, 20, (x) => x, 5);
      expect(result).toBeCloseTo(10, 1);
    });

    it("returns max when target is above range", () => {
      const result = binarySearch(10, 20, (x) => x, 25);
      expect(result).toBeCloseTo(20, 1);
    });

    it("handles decreasing function", () => {
      const result = binarySearch(0, 1, (x) => 1 - x, 0.3);
      expect(result).toBeCloseTo(0.7, 2);
    });
  });

  describe("contrastForPair", () => {
    it("returns higher contrast for black on white", () => {
      const contrast = contrastForPair(0, 1);
      expect(contrast).toBeGreaterThan(100);
    });

    it("returns higher contrast for white on black", () => {
      const contrast = contrastForPair(1, 0);
      expect(contrast).toBeGreaterThan(100);
    });

    it("returns low contrast for similar values", () => {
      const contrast = contrastForPair(0.5, 0.51);
      expect(contrast).toBeLessThan(10);
    });

    it("returns absolute value (always positive)", () => {
      const contrast1 = contrastForPair(0, 1);
      const contrast2 = contrastForPair(1, 0);
      expect(contrast1).toBeGreaterThan(0);
      expect(contrast2).toBeGreaterThan(0);
    });
  });

  describe("solveBackgroundForContrast", () => {
    it("finds lightness for target contrast in light mode", () => {
      const result = solveBackgroundForContrast("page", "light", 90, 0.8, 1);
      expect(result).toBeGreaterThan(0.8);
      expect(result).toBeLessThanOrEqual(1);
    });

    it("finds lightness for target contrast in dark mode", () => {
      const result = solveBackgroundForContrast("page", "dark", 90, 0, 0.3);
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(0.3); // Can equal bound
    });

    it("respects bounds", () => {
      const result = solveBackgroundForContrast("page", "light", 75, 0.5, 0.7);
      expect(result).toBeGreaterThanOrEqual(0.5);
      expect(result).toBeLessThanOrEqual(0.7);
    });
  });

  describe("solveBorderAlpha", () => {
    it("returns alpha between 0 and 1", () => {
      const alpha = solveBorderAlpha(0.9, 0.1, 15);
      expect(alpha).toBeGreaterThanOrEqual(0);
      expect(alpha).toBeLessThanOrEqual(1);
    });

    it("returns higher alpha for higher target contrast", () => {
      const alpha1 = solveBorderAlpha(0.9, 0.1, 10);
      const alpha2 = solveBorderAlpha(0.9, 0.1, 30);
      expect(alpha2).toBeGreaterThan(alpha1);
    });
  });

  describe("calculateHueShift", () => {
    it("returns 0 when no config provided", () => {
      expect(calculateHueShift(0.5)).toBe(0);
      expect(calculateHueShift(0)).toBe(0);
      expect(calculateHueShift(1)).toBe(0);
    });

    it("returns 0 at lightness 0", () => {
      const config = {
        curve: {
          p1: [0.5, 0] as [number, number],
          p2: [0.5, 1] as [number, number],
        },
        maxRotation: 10,
      };
      expect(calculateHueShift(0, config)).toBe(0);
    });

    it("returns maxRotation at lightness 1", () => {
      const config = {
        curve: {
          p1: [0.5, 0] as [number, number],
          p2: [0.5, 1] as [number, number],
        },
        maxRotation: 10,
      };
      expect(calculateHueShift(1, config)).toBeCloseTo(10, 1);
    });

    it("interpolates values between 0 and 1", () => {
      const config = {
        curve: {
          p1: [0.5, 0] as [number, number],
          p2: [0.5, 1] as [number, number],
        },
        maxRotation: 10,
      };
      const midShift = calculateHueShift(0.5, config);
      expect(midShift).toBeGreaterThan(0);
      expect(midShift).toBeLessThan(10);
    });
  });

  describe("solveForegroundSpec", () => {
    it("returns all required contrast levels", () => {
      const spec = solveForegroundSpec(0.5);
      expect(spec).toHaveProperty("background");
      expect(spec).toHaveProperty("fg-high");
      expect(spec).toHaveProperty("fg-strong");
      expect(spec).toHaveProperty("fg-baseline");
      expect(spec).toHaveProperty("fg-subtle");
      expect(spec).toHaveProperty("fg-subtlest");
    });

    it("returns lightness values between 0 and 1", () => {
      const spec = solveForegroundSpec(0.5);
      Object.values(spec).forEach((value) => {
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(1);
      });
    });

    it("produces darker text for light backgrounds", () => {
      const spec = solveForegroundSpec(0.9); // Very light background
      expect(spec["fg-high"]).toBeLessThan(0.5); // Text should be dark
    });

    it("produces lighter text for dark backgrounds", () => {
      const spec = solveForegroundSpec(0.1); // Very dark background
      expect(spec["fg-high"]).toBeGreaterThan(0.5); // Text should be light
    });
  });
});
