/**
 * @description
 * This script is the "Engine" of the color system. It solves for the precise lightness values (L in OKLCH)
 * required to meet specific APCA contrast targets for various surfaces and text.
 *
 * GOALS:
 * 1. Accessibility: Ensure text is legible on every surface in both Light and Dark modes.
 * 2. Consistency: Distribute surfaces evenly based on *contrast*, not just linear lightness.
 * 3. Automation: Generate CSS tokens automatically so we don't have to manually pick colors.
 *
 * OUTPUT:
 * - Generates `css/generated-tokens.css` containing `light-dark()` color tokens.
 * - These tokens are then consumed by `css/utilities.css` to apply Hue and Chroma.
 */

// APCA is used for perceptual contrast calculations (simulating human vision).
// We use it instead of WCAG 2.x because it handles dark mode and font weight much better.
import { APCAcontrast, sRGBtoY } from "apca-w3";
import { converter } from "culori";

type Mode = "light" | "dark";
type Polarity = "page" | "inverted";

type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};

// --- ANCHOR SYSTEM ---
// Anchors define the "Dynamic Range" of lightness available for a given polarity.
// They act as the bookends (Start/End) between which all surfaces must fit.

interface AnchorValue {
  readonly background: number;
  readonly adjustable?: boolean;
}

interface ModeAnchors {
  readonly start: AnchorValue;
  readonly end: AnchorValue;
}

interface Anchors {
  readonly light: ModeAnchors;
  readonly dark: ModeAnchors;
}

interface PolarityAnchors {
  readonly page: Anchors;
  readonly inverted: Anchors;
  readonly keyColors: Record<string, string>;
}

// --- CONFIGURATION TYPES ---
// These mirror the structure of `surface-lightness.config.json`.

type KeyColorAnchors = Record<string, string>;

type ModeSpec = {
  background: number;
  "fg-high": number;
  "fg-strong": number;
  "fg-baseline": number;
  "fg-subtle": number;
  "fg-subtlest": number;
};

export type ContrastOffsets = Partial<Record<Mode, number>>;

export type StateDefinition = {
  name: string;
  /**
   * Contrast offset relative to the parent surface.
   * Positive = more contrast against text (lighter in light mode, darker in dark mode).
   */
  offset: number;
};

export type SurfaceConfig = {
  slug: string;
  label: string;
  description?: string;
  polarity: Polarity;
  /**
   * Shifts the surface's target contrast relative to its position in the sequence.
   */
  contrastOffset?: ContrastOffsets;
  /**
   * Target chroma for this surface.
   * If set, the solver will adjust Lightness to compensate for the HK effect.
   */
  targetChroma?: number;
  /**
   * Derivative surfaces (states) that are solved relative to this surface.
   */
  states?: StateDefinition[];
  computed?: Record<Mode, ModeSpec>;
};

export type SurfaceGroup = {
  name: string;
  surfaces: SurfaceConfig[];
  /**
   * Extra spacing (in contrast steps) before this group starts.
   * Used to create visual separation between groups.
   */
  gapBefore?: number;
};

export type BezierCurve = {
  p1: [number, number];
  p2: [number, number];
};

export type HueShiftConfig = {
  curve: BezierCurve;
  /**
   * Maximum hue rotation in degrees.
   */
  maxRotation: number;
};

export type BorderTargets = {
  decorative: number;
  interactive: number;
  critical: number;
};

export type SolverConfig = {
  anchors: PolarityAnchors;
  groups: SurfaceGroup[];
  hueShift?: HueShiftConfig;
  borderTargets?: BorderTargets;
};

// ... Raw interfaces omitted for brevity (internal use only) ...

const MODES: Mode[] = ["light", "dark"];
const POLARITIES: Polarity[] = ["page", "inverted"];

// --- CONSTANTS ---

const CONTRAST_EPSILON = 0.005; // The acceptable margin of error for the binary search.
const LIGHTNESS_PRECISION = 4; // Number of decimal places for output lightness.
const FOREGROUND_STEP_COUNT = 3; // Steps between Strong and Subtlest text.

// APCA Target Values (Lc)
// These are the "magic numbers" that drive the legibility of the system.
// 108 is roughly the max contrast possible (Black on White).
// 75 is the minimum for "Subtlest" text (roughly equivalent to WCAG AA for small text).
const HIGH_CONTRAST = 108;
const STRONG_CONTRAST = 105;
const SUBTLEST_CONTRAST = 75;

const STEP = (STRONG_CONTRAST - SUBTLEST_CONTRAST) / FOREGROUND_STEP_COUNT;

export type ContrastBand = "strong" | "subtle" | "subtler";

export const TARGET_CONTRAST: Record<ContrastBand, number> = {
  strong: STRONG_CONTRAST,
  subtle: 90,
  subtler: 75,
};

export type SurfaceDefinition = {
  slug: string;
  label: string;
  lightness: Record<Mode, number>;
};

const toRgb = converter("rgb");
const toOklch = converter("oklch");

// Removed duplicate getSurfaceDefinitions

/**
 * Calculates the average lightness of the defined key colors (Brand, Blue, etc.).
 * This is used to align the "End" anchor of the Inverted polarity to the brand colors,
 * ensuring that the deepest/richest surfaces align with the brand identity.
 */
function computeKeyColorLightness(
  keyColors?: KeyColorAnchors
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

const avg = (numbers: number[]): number => {
  const total = numbers.reduce((sum, n) => sum + n, 0);
  return total / numbers.length;
};

// --- KEY COLOR ALIGNMENT ---
// If key colors are present, we clamp the "End" of the Inverted polarity
// to match their average lightness. This ensures that "Surface Spotlight"
// or similar deep surfaces feel related to the brand colors.
function alignInvertedAnchors(
  anchors: PolarityAnchors,
  keyColors?: KeyColorAnchors
): void {
  const keyColorLightness = computeKeyColorLightness(keyColors);

  if (keyColorLightness !== undefined) {
    const invertedAnchors = anchors.inverted;

    if (!invertedAnchors) {
      throw new Error("Missing inverted anchors for key color alignment.");
    }

    // Functional update: Create a new object with the updated end anchor
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

function clamp01(value: number): number {
  if (value < 0) return 0;
  if (value > 1) return 1;
  return value;
}

function clampToRange(value: number, min: number, max: number): number {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

function roundLightness(value: number): number {
  return Number(value.toFixed(LIGHTNESS_PRECISION));
}

/**
 * A generic binary search implementation for finding a value `x` in `[min, max]`
 * such that `evaluate(x)` is close to `target`.
 *
 * Assumes `evaluate` is monotonic within the given range.
 */
function binarySearch(
  min: number,
  max: number,
  evaluate: (candidate: number) => number,
  target: number,
  epsilon: number = 0.005,
  maxIterations: number = 40
): number {
  let low = min;
  let high = max;

  // Determine the slope (does value increase or decrease as candidate increases?)
  const valAtMin = evaluate(min);
  const valAtMax = evaluate(max);
  const slope = Math.sign(valAtMax - valAtMin) || 1;

  // Optimization: Check if target is outside the range
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

    // If slope is positive: delta > 0 (too high) -> move high down
    // If slope is negative: delta > 0 (too high, so candidate is too low) -> move low up
    if (delta * slope > 0) {
      high = mid;
    } else {
      low = mid;
    }
  }

  return (low + high) / 2;
}

// --- CONTRAST HELPERS ---

function toRgbTriplet(lightness: number): [number, number, number] {
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

/**
 * Calculates the APCA contrast between a foreground and background lightness.
 * Note: APCA is not symmetric like WCAG. The order matters (fg vs bg),
 * but for our purposes we usually take the absolute value to check "magnitude" of contrast.
 */
function contrastForPair(foreground: number, background: number): number {
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

/**
 * Determines the lightness of text (0 or 1) based on the polarity and mode.
 * - Page/Light -> Black text (0)
 * - Page/Dark -> White text (1)
 * - Inverted/Light -> White text (1) (e.g. dark sidebar)
 * - Inverted/Dark -> Black text (0) (e.g. light sidebar in dark mode? Rare but possible)
 */
function textLightness(polarity: Polarity, mode: Mode): number {
  if (polarity === "page") {
    return mode === "light" ? 0 : 1;
  }

  return mode === "light" ? 1 : 0;
}

function contrastForBackground(
  polarity: Polarity,
  mode: Mode,
  background: number
): number {
  return contrastForPair(textLightness(polarity, mode), background);
}

function backgroundBounds(start: number, end: number): [number, number] {
  return [Math.min(start, end), Math.max(start, end)];
}

function clampContrast(polarity: Polarity, mode: Mode, target: number): number {
  const contrastAtZero = contrastForBackground(polarity, mode, 0);
  const contrastAtOne = contrastForBackground(polarity, mode, 1);
  const max = Math.max(contrastAtZero, contrastAtOne);
  const min = Math.min(contrastAtZero, contrastAtOne);
  if (target > max) return max;
  if (target < min) return min;
  return target;
}

/**
 * Solves for a background lightness that achieves a specific target contrast
 * against the standard text color for the given polarity/mode.
 *
 * ALGORITHM: Binary Search
 * We search the range [lowerBound, upperBound] to find a lightness value `L`
 * such that `contrast(L, text) ~= targetContrast`.
 */
function solveBackgroundForContrast(
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

/**
 * Solves for a foreground lightness (0-1) that achieves a target contrast
 * against a fixed background.
 *
 * STRATEGY:
 * 1. Check if Black (0) or White (1) is better (preferLighter).
 * 2. If the preferred extreme meets the target, try to move closer to the background
 *    (reduce contrast) to find the "minimum viable contrast" point?
 *    Actually, the logic below tries to find the value that *meets* the target
 *    while being as close to the background as possible?
 *    Wait, no. It tries to find the value that meets the target.
 *    If multiple values meet the target, it picks the one closest to the "best overall" (0 or 1).
 */
export function solveForegroundLightness(
  background: number,
  targetContrast: number
): number {
  const contrastLighter = contrastForPair(1, background);
  const contrastDarker = contrastForPair(0, background);
  const preferLighter = contrastLighter >= contrastDarker;

  // If preferLighter, we search [background, 1]. Contrast goes from 0 to contrastLighter.
  // If !preferLighter, we search [0, background]. Contrast goes from contrastDarker to 0.
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

function formatPrecision(value: number, digits = 4): number {
  return Number(value.toFixed(digits));
}

type DeltaInfo = {
  startBackground: number;
  endBackground: number;
  startContrast: number;
  endContrast: number;
  delta: number;
};

export function getSurfaceDefinitions(
  config: SolverConfig
): SurfaceDefinition[] {
  const allSurfaces = config.groups.flatMap((g) => g.surfaces);
  return allSurfaces.map(({ slug, label, computed }) => {
    const light = computed?.light?.background;
    const dark = computed?.dark?.background;

    if (light === undefined || dark === undefined) {
      throw new Error(
        `Surface ${slug} is missing computed backgrounds. Run the solver first.`
      );
    }

    return {
      slug,
      label,
      lightness: { light, dark },
    } satisfies SurfaceDefinition;
  });
}

function computeDeltaInfo(
  polarity: Polarity,
  mode: Mode,
  anchors: ModeAnchors,
  count: number
): DeltaInfo {
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

// --- HUE SHIFT (WARMTH) ---

function cubicBezier(t: number, p1: number, p2: number): number {
  // Cubic Bezier with P0=0, P3=1
  // B(t) = (1-t)^3*P0 + 3(1-t)^2*t*P1 + 3(1-t)*t^2*P2 + t^3*P3
  // B(t) = 3(1-t)^2*t*P1 + 3(1-t)*t^2*P2 + t^3
  const oneMinusT = 1 - t;
  return (
    3 * oneMinusT * oneMinusT * t * p1 + 3 * oneMinusT * t * t * p2 + t * t * t
  );
}

function calculateHueShift(lightness: number, config?: HueShiftConfig): number {
  if (!config) return 0;

  const { curve, maxRotation } = config;
  // Map lightness (0-1) to t (0-1)
  // We assume the curve maps Lightness -> Shift Factor (0-1)
  const factor = cubicBezier(lightness, curve.p1[1], curve.p2[1]);
  return factor * maxRotation;
}

// --- CHROMA COMPENSATION ---

function compensateForChroma(lightness: number, chroma: number): number {
  // Simple heuristic: High chroma makes things look lighter.
  // We darken the L value slightly to compensate.
  // Factor is experimental.
  const compensationFactor = 0.1;
  return Math.max(0, lightness - chroma * compensationFactor);
}

// --- BORDER SOLVER ---

function solveBorderAlpha(
  surfaceL: number,
  textL: number,
  targetContrast: number
): number {
  // We assume the border color is the same as the text color (fg-strong)
  // but with reduced alpha.
  // Effectively: BorderColor = TextColor * Alpha + SurfaceColor * (1 - Alpha)
  // We need to find Alpha such that Contrast(BorderColor, SurfaceColor) >= Target.

  // Binary search for Alpha [0, 1]
  return binarySearch(
    0,
    1,
    (alpha) => {
      // Mix logic (simplified for single channel L)
      const borderL = textL * alpha + surfaceL * (1 - alpha);
      return contrastForPair(borderL, surfaceL);
    },
    targetContrast,
    0.01
  );
}

// --- GLASSMORPHISM VERIFICATION ---

function verifyTransparentContrast(
  surfaceL: number,
  opacity: number,
  textL: number
): boolean {
  // Check against White background
  const onWhite = surfaceL * opacity + 1 * (1 - opacity);
  const contrastWhite = contrastForPair(textL, onWhite);

  // Check against Black background
  const onBlack = surfaceL * opacity + 0 * (1 - opacity);
  const contrastBlack = contrastForPair(textL, onBlack);

  // We require a minimum legibility (e.g. 60 APCA) for the WORST case.
  const MIN_GLASS_CONTRAST = 60;
  return (
    contrastWhite >= MIN_GLASS_CONTRAST && contrastBlack >= MIN_GLASS_CONTRAST
  );
}

// --- SEQUENCE SOLVING (GROUPS) ---

function solveBackgroundSequence(
  polarity: Polarity,
  mode: Mode,
  anchors: ModeAnchors,
  groups: SurfaceGroup[]
): Map<string, number> {
  const backgrounds = new Map<string, number>();

  if (groups.length === 0) return backgrounds;

  // Flatten groups to count total "steps"
  // Each group starts at a new "Base Step".
  // Surfaces within a group are offsets from that Base Step.
  // We need to distribute the Base Steps across the available range.

  const totalGroups = groups.length;
  const deltaInfo = computeDeltaInfo(polarity, mode, anchors, totalGroups);

  const [minBg, maxBg] = backgroundBounds(
    anchors.start.background,
    anchors.end.background
  );
  const minContrast = Math.min(deltaInfo.startContrast, deltaInfo.endContrast);
  const maxContrast = Math.max(deltaInfo.startContrast, deltaInfo.endContrast);

  groups.forEach((group, groupIndex) => {
    // Calculate Base Contrast for this Group
    // Apply gapBefore if present (shifts the group further)
    const gap = group.gapBefore ?? 0;
    const adjustedGroupIndex = groupIndex + gap;

    const groupBaseContrast =
      deltaInfo.startContrast + deltaInfo.delta * adjustedGroupIndex;

    group.surfaces.forEach((surface, surfaceIndex) => {
      // Intra-group spacing: We assume surfaces in a group are tight.
      // We use a smaller step (e.g., 1/5th of a main step) or just the contrastOffset.
      // If no contrastOffset is provided, we might stagger them slightly?
      // For now, let's rely on contrastOffset for intra-group positioning.
      // Or we can add a small default stagger.
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

      // Chroma Compensation
      if (surface.targetChroma) {
        solvedL = compensateForChroma(solvedL, surface.targetChroma);
      }

      backgrounds.set(surface.slug, solvedL);

      // Solve States (Derivative Surfaces)
      if (surface.states) {
        surface.states.forEach((state) => {
          // State target = Parent Target + State Offset
          // We solve for the state L relative to the *Text* color?
          // No, states are usually background shifts.
          // We want the state to have `offset` more/less contrast against the text than the parent.
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

function anchorBoundsForHighContrast(
  anchors: ModeAnchors,
  anchorType: "start" | "end"
): [number, number] {
  const initial = anchors[anchorType].background;

  if (anchorType === "end") {
    const direction = initial < anchors.start.background ? -1 : 1;
    if (direction < 0) {
      return [0, anchors.start.background];
    }
    return [anchors.start.background, 1];
  }

  const direction = initial < anchors.end.background ? 1 : -1;
  if (direction < 0) {
    return [anchors.end.background, anchors.start.background];
  }
  return [anchors.start.background, anchors.end.background];
}

function adjustAnchorsForHighContrast(
  polarity: Polarity,
  mode: Mode,
  anchors: ModeAnchors
): ModeAnchors {
  let start = anchors.start;
  let end = anchors.end;

  if (start.adjustable) {
    const [minBound, maxBound] = anchorBoundsForHighContrast(anchors, "start");
    const newBg = solveBackgroundForContrast(
      polarity,
      mode,
      HIGH_CONTRAST,
      minBound,
      maxBound
    );
    start = { ...start, background: newBg };
  }

  if (end.adjustable) {
    const [minBound, maxBound] = anchorBoundsForHighContrast(anchors, "end");
    const newBg = solveBackgroundForContrast(
      polarity,
      mode,
      HIGH_CONTRAST,
      minBound,
      maxBound
    );
    end = { ...end, background: newBg };
  }

  return { start, end };
}

function solveForegroundSpec(background: number): ModeSpec {
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

/**
 * Generates the final CSS content.
 *
 * OUTPUT FORMAT:
 * - Uses `light-dark()` to bundle Light and Dark mode values into a single token.
 * - Uses `oklch(L 0 0)` to define the color.
 *   - `L`: The solved lightness.
 *   - `C`: 0 (Chroma is applied by utility classes).
 *   - `H`: 0 (Hue is applied by utility classes).
 *
 * This output allows the CSS to be "Theme Agnostic" regarding Hue/Chroma,
 * while being "Contrast Strict" regarding Lightness.
 */
export function generateTokensCss(
  groups: SurfaceGroup[],
  backgrounds: Map<string, Record<Mode, number>>,
  hueShiftConfig?: HueShiftConfig,
  borderTargets?: BorderTargets
): string {
  const rootLines: string[] = [
    "/* AUTO-GENERATED by scripts/solver-engine.ts */",
    ":root {",
  ];
  const darkLines: string[] = [
    "@media (prefers-color-scheme: dark) {",
    "  :root {",
  ];

  const allSurfaces = groups.flatMap((g) => g.surfaces);

  for (const surface of allSurfaces) {
    const bg = backgrounds.get(surface.slug);
    if (!bg) continue;

    const lightSpec = solveForegroundSpec(bg.light);
    const darkSpec = solveForegroundSpec(bg.dark);

    const toColor = (l: number) => `oklch(${l} 0 0)`;

    rootLines.push(
      `  /* Surface: ${surface.label}${
        surface.description ? ` - ${surface.description}` : ""
      } */`
    );

    // Colors can still use light-dark() for compactness
    rootLines.push(
      `  --lightness-surface-${surface.slug}: light-dark(${toColor(
        bg.light
      )}, ${toColor(bg.dark)});`
    );

    // Hue Shift (Non-color: Use Cascade)
    if (hueShiftConfig) {
      const shiftLight = calculateHueShift(bg.light, hueShiftConfig);
      const shiftDark = calculateHueShift(bg.dark, hueShiftConfig);

      rootLines.push(`  --hue-shift-${surface.slug}: ${shiftLight};`);
      darkLines.push(`    --hue-shift-${surface.slug}: ${shiftDark};`);
    }

    rootLines.push(
      `  --lightness-text-on-${surface.slug}: light-dark(${toColor(
        lightSpec["fg-strong"]
      )}, ${toColor(darkSpec["fg-strong"])});`
    );
    rootLines.push(
      `  --lightness-subtle-on-${surface.slug}: light-dark(${toColor(
        lightSpec["fg-subtle"]
      )}, ${toColor(darkSpec["fg-subtle"])});`
    );
    rootLines.push(
      `  --lightness-subtler-on-${surface.slug}: light-dark(${toColor(
        lightSpec["fg-subtlest"]
      )}, ${toColor(darkSpec["fg-subtlest"])});`
    );

    // Borders (Non-color: Use Cascade)
    if (borderTargets) {
      const solveB = (bgL: number, textL: number, target: number) =>
        solveBorderAlpha(bgL, textL, target);
      const decLight = solveB(
        bg.light,
        lightSpec["fg-strong"],
        borderTargets.decorative
      );
      const decDark = solveB(
        bg.dark,
        darkSpec["fg-strong"],
        borderTargets.decorative
      );

      rootLines.push(`  --border-decorative-on-${surface.slug}: ${decLight};`);
      darkLines.push(`    --border-decorative-on-${surface.slug}: ${decDark};`);

      const intLight = solveB(
        bg.light,
        lightSpec["fg-strong"],
        borderTargets.interactive
      );
      const intDark = solveB(
        bg.dark,
        darkSpec["fg-strong"],
        borderTargets.interactive
      );

      rootLines.push(`  --border-interactive-on-${surface.slug}: ${intLight};`);
      darkLines.push(
        `    --border-interactive-on-${surface.slug}: ${intDark};`
      );
    }

    // States
    if (surface.states) {
      surface.states.forEach((state) => {
        const stateSlug = `${surface.slug}-${state.name}`;
        const stateBg = backgrounds.get(stateSlug);
        if (stateBg) {
          rootLines.push(
            `  --lightness-surface-${stateSlug}: light-dark(${toColor(
              stateBg.light
            )}, ${toColor(stateBg.dark)});`
          );
        }
      });
    }

    rootLines.push("");
  }

  rootLines.push("}");
  darkLines.push("  }");
  darkLines.push("}");

  return rootLines.join("\n") + "\n\n" + darkLines.join("\n");
}

export function solve(config: SolverConfig): {
  surfaces: SurfaceConfig[];
  backgrounds: Map<string, Record<Mode, number>>;
} {
  const anchors = config.anchors;
  const groups = config.groups;
  const allSurfaces = groups.flatMap((g) => g.surfaces);

  // Align inverted anchors to key colors
  alignInvertedAnchors(anchors, anchors.keyColors);

  const backgrounds = new Map<string, { light: number; dark: number }>();

  for (const polarity of POLARITIES) {
    if (!anchors[polarity]) {
      throw new Error(`Missing anchors for polarity ${polarity}.`);
    }

    for (const mode of MODES) {
      // Functional update: get the adjusted anchors
      // DISABLE: This forces the range to collapse to [1,1] or [0,0] because HIGH_CONTRAST is 108.
      // We want to respect the configured range.
      /*
      const adjustedAnchors = adjustAnchorsForHighContrast(
        polarity,
        mode,
        anchors[polarity][mode]
      );
      */
      const adjustedAnchors = anchors[polarity][mode];

      // Update the reference for the next step (solving sequence)
      (anchors[polarity] as Mutable<Anchors>)[mode] = adjustedAnchors;
    }

    for (const mode of MODES) {
      // Filter groups that have at least one surface with this polarity
      const relevantGroups = groups.filter((g) =>
        g.surfaces.some((s) => s.polarity === polarity)
      );

      // We need to pass only the surfaces of this polarity to the solver?
      // No, the solver now handles groups. But a group might contain mixed polarities?
      // Unlikely. Let's assume groups are polarity-consistent or we filter inside.
      // Actually, `solveBackgroundSequence` iterates groups.
      // We should probably filter the *surfaces* inside the groups.

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
      // It might be that this surface belongs to a polarity we haven't solved yet?
      // Or it failed.
      // If we loop over all surfaces at the end, we must ensure they were all solved.
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
