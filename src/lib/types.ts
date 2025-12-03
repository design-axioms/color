export type Mode = "light" | "dark";
export type Polarity = "page" | "inverted";

export interface Context {
  polarity: Polarity;
  mode: Mode;
}

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
  /**
   * A map of key color names to their values.
   * Values can be:
   * - A hex color string (e.g. "#ff0000")
   * - A reference to another key color (e.g. "danger")
   */
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
   * Manual hex override for the surface background color.
   * If set, the solver will use this color instead of the calculated one.
   */
  override?: Partial<Record<Mode, string>>;
  /**
   * Target chroma for this surface.
   * If set, the solver will adjust Lightness to compensate for the HK effect.
   */
  targetChroma?: number;
  /**
   * Target hue for this surface.
   * Can be a number (0-360) or a reference to a key color (e.g. "brand").
   */
  hue?: number | string;
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

export interface PaletteConfig {
  /**
   * Target chroma for chart colors.
   * Defaults to ~0.12 (vibrant but not neon).
   * Can be set to 'auto' to match the Action color.
   */
  targetChroma?: number;
  /**
   * Target contrast against the page background (APCA).
   * Lower values (e.g. 45-60) result in lighter colors in light mode (more pastel/vibrant)
   * and darker colors in dark mode.
   * Defaults to 60.
   */
  targetContrast?: number;
  /**
   * List of hues to use for the palette.
   * Defaults to a standard 10-color categorical scale.
   */
  hues?: number[];
}

export interface ConfigOptions {
  /**
   * The prefix to use for CSS variables.
   * Defaults to "color-sys".
   */
  prefix?: string;
  /**
   * The CSS selector to scope the variables to.
   * Defaults to ":root".
   */
  selector?: string;
}

export interface ColorSpec {
  l: number;
  c: number;
  h: number;
}

export type SolverConfig = {
  anchors: PolarityAnchors;
  groups: SurfaceGroup[];
  hueShift?: HueShiftConfig;
  borderTargets?: BorderTargets;
  palette?: PaletteConfig;
  options?: ConfigOptions;
};

export type SurfaceDefinition = {
  slug: string;
  label: string;
  lightness: Record<Mode, number>;
};

export interface ChartColor {
  light: ColorSpec;
  dark: ColorSpec;
}

export interface Primitives {
  shadows: {
    sm: { light: string; dark: string };
    md: { light: string; dark: string };
    lg: { light: string; dark: string };
    xl: { light: string; dark: string };
  };
  focus: {
    ring: { light: string; dark: string };
  };
  highlight: {
    ring: { light: string; dark: string };
    surface: { light: string; dark: string };
  };
}

export interface Theme {
  surfaces: SurfaceConfig[];
  backgrounds: Map<string, Record<Mode, ColorSpec>>;
  charts: ChartColor[];
  primitives: Primitives;
}
