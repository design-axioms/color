export type Mode = "light" | "dark";
export type Polarity = "page" | "inverted";

export type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};

// --- ANCHOR SYSTEM ---

export interface AnchorValue {
  readonly background: number;
  readonly adjustable?: boolean;
}

export interface ModeAnchors {
  readonly start: AnchorValue;
  readonly end: AnchorValue;
}

export interface Anchors {
  readonly light: ModeAnchors;
  readonly dark: ModeAnchors;
}

export interface PolarityAnchors {
  readonly page: Anchors;
  readonly inverted: Anchors;
  readonly keyColors: Record<string, string>;
}

// --- CONFIGURATION TYPES ---

// export type KeyColorAnchors = Record<string, string>;

export type ModeSpec = {
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

export type SurfaceDefinition = {
  slug: string;
  label: string;
  lightness: Record<Mode, number>;
};
