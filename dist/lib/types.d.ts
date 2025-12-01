type Mode = "light" | "dark";
type Polarity = "page" | "inverted";
interface Context {
    polarity: Polarity;
    mode: Mode;
}
type Mutable<T> = {
    -readonly [P in keyof T]: T[P];
};
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
type ModeSpec = {
    background: number;
    "fg-high": number;
    "fg-strong": number;
    "fg-baseline": number;
    "fg-subtle": number;
    "fg-subtlest": number;
};
type ContrastOffsets = Partial<Record<Mode, number>>;
type StateDefinition = {
    name: string;
    /**
     * Contrast offset relative to the parent surface.
     * Positive = more contrast against text (lighter in light mode, darker in dark mode).
     */
    offset: number;
};
type SurfaceConfig = {
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
     * Derivative surfaces (states) that are solved relative to this surface.
     */
    states?: StateDefinition[];
    computed?: Record<Mode, ModeSpec>;
};
type SurfaceGroup = {
    name: string;
    surfaces: SurfaceConfig[];
    /**
     * Extra spacing (in contrast steps) before this group starts.
     * Used to create visual separation between groups.
     */
    gapBefore?: number;
};
type BezierCurve = {
    p1: [number, number];
    p2: [number, number];
};
type HueShiftConfig = {
    curve: BezierCurve;
    /**
     * Maximum hue rotation in degrees.
     */
    maxRotation: number;
};
type BorderTargets = {
    decorative: number;
    interactive: number;
    critical: number;
};
interface PaletteConfig {
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
interface ConfigOptions {
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
interface ColorSpec {
    l: number;
    c: number;
    h: number;
}
type SolverConfig = {
    anchors: PolarityAnchors;
    groups: SurfaceGroup[];
    hueShift?: HueShiftConfig;
    borderTargets?: BorderTargets;
    palette?: PaletteConfig;
    options?: ConfigOptions;
};
type SurfaceDefinition = {
    slug: string;
    label: string;
    lightness: Record<Mode, number>;
};
interface ChartColor {
    light: ColorSpec;
    dark: ColorSpec;
}
interface Primitives {
    shadows: {
        sm: {
            light: string;
            dark: string;
        };
        md: {
            light: string;
            dark: string;
        };
        lg: {
            light: string;
            dark: string;
        };
        xl: {
            light: string;
            dark: string;
        };
    };
    focus: {
        ring: {
            light: string;
            dark: string;
        };
    };
}
interface Theme {
    surfaces: SurfaceConfig[];
    backgrounds: Map<string, Record<Mode, ColorSpec>>;
    charts: ChartColor[];
    primitives: Primitives;
}

export type { AnchorValue, Anchors, BezierCurve, BorderTargets, ChartColor, ColorSpec, ConfigOptions, Context, ContrastOffsets, HueShiftConfig, Mode, ModeAnchors, ModeSpec, Mutable, PaletteConfig, Polarity, PolarityAnchors, Primitives, SolverConfig, StateDefinition, SurfaceConfig, SurfaceDefinition, SurfaceGroup, Theme };
