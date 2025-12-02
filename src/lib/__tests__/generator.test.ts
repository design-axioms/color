import { describe, expect, it } from "vitest";
import { generateTokensCss } from "../generator.ts";
import type { ColorSpec, Mode, SurfaceGroup, Theme } from "../types.ts";

describe("generateTokensCss", () => {
  it("generates correct CSS for a standard surface group", () => {
    const groups: SurfaceGroup[] = [
      {
        name: "Base Surfaces",
        surfaces: [
          {
            slug: "page",
            label: "Page",
            polarity: "page",
            states: [{ name: "hover", offset: 0 }],
          },
          {
            slug: "card",
            label: "Card",
            polarity: "page",
            states: [],
          },
        ],
      },
    ];

    const backgrounds = new Map<string, Record<Mode, ColorSpec>>();
    backgrounds.set("page", {
      light: { l: 0.98, c: 0, h: 0 },
      dark: { l: 0.1, c: 0, h: 0 },
    });
    backgrounds.set("page-hover", {
      light: { l: 0.95, c: 0, h: 0 },
      dark: { l: 0.15, c: 0, h: 0 },
    });
    backgrounds.set("card", {
      light: { l: 1.0, c: 0, h: 0 },
      dark: { l: 0.2, c: 0, h: 0 },
    });

    const borderTargets = {
      decorative: 0.2,
      interactive: 0.5,
      critical: 0.8,
    };

    const primitives = {
      shadows: {
        sm: { light: "oklch(0 0 0 / 0.05)", dark: "oklch(1 0 0 / 0.15)" },
        md: { light: "oklch(0 0 0 / 0.1)", dark: "oklch(1 0 0 / 0.15)" },
        lg: { light: "oklch(0 0 0 / 0.1)", dark: "oklch(1 0 0 / 0.15)" },
        xl: { light: "oklch(0 0 0 / 0.1)", dark: "oklch(1 0 0 / 0.15)" },
      },
      focus: {
        ring: { light: "oklch(0.45 0.2 250)", dark: "oklch(0.75 0.2 250)" },
      },
      highlight: {
        ring: { light: "oklch(0.45 0.2 300)", dark: "oklch(0.75 0.2 300)" },
        surface: { light: "oklch(0.95 0.05 300)", dark: "oklch(0.2 0.05 300)" },
      },
    };

    const theme = {
      surfaces: [],
      backgrounds,
      charts: [],
      primitives,
    } as unknown as Theme;

    const css = generateTokensCss(groups, theme, borderTargets);

    expect(css).toMatchSnapshot();
  });

  it("handles missing background values gracefully", () => {
    const groups: SurfaceGroup[] = [
      {
        name: "Base Surfaces",
        surfaces: [
          {
            slug: "unknown",
            label: "Unknown",
            polarity: "page",
          },
        ],
      },
    ];

    const backgrounds = new Map<string, Record<Mode, ColorSpec>>();
    // "unknown" is missing

    const primitives = {
      shadows: {
        sm: { light: "oklch(0 0 0 / 0.05)", dark: "oklch(1 0 0 / 0.15)" },
        md: { light: "oklch(0 0 0 / 0.1)", dark: "oklch(1 0 0 / 0.15)" },
        lg: { light: "oklch(0 0 0 / 0.1)", dark: "oklch(1 0 0 / 0.15)" },
        xl: { light: "oklch(0 0 0 / 0.1)", dark: "oklch(1 0 0 / 0.15)" },
      },
      focus: {
        ring: { light: "oklch(0.45 0.2 250)", dark: "oklch(0.75 0.2 250)" },
      },
      highlight: {
        ring: { light: "oklch(0.45 0.2 300)", dark: "oklch(0.75 0.2 300)" },
        surface: { light: "oklch(0.95 0.05 300)", dark: "oklch(0.2 0.05 300)" },
      },
    };

    const theme = {
      surfaces: [],
      backgrounds,
      charts: [],
      primitives,
    } as unknown as Theme;

    const css = generateTokensCss(groups, theme);
    expect(css).toMatchSnapshot();
  });

  it("generates palette tokens when configured", () => {
    const groups: SurfaceGroup[] = [];
    const backgrounds = new Map<string, Record<Mode, ColorSpec>>();
    backgrounds.set("page", {
      light: { l: 1, c: 0, h: 0 },
      dark: { l: 0, c: 0, h: 0 },
    });

    const charts = [
      {
        light: { l: 0.5, c: 0.15, h: 0 },
        dark: { l: 0.6, c: 0.15, h: 0 },
      },
      {
        light: { l: 0.5, c: 0.15, h: 120 },
        dark: { l: 0.6, c: 0.15, h: 120 },
      },
      {
        light: { l: 0.5, c: 0.15, h: 240 },
        dark: { l: 0.6, c: 0.15, h: 240 },
      },
    ];

    const primitives = {
      shadows: {
        sm: { light: "oklch(0 0 0 / 0.05)", dark: "oklch(1 0 0 / 0.15)" },
        md: { light: "oklch(0 0 0 / 0.1)", dark: "oklch(1 0 0 / 0.15)" },
        lg: { light: "oklch(0 0 0 / 0.1)", dark: "oklch(1 0 0 / 0.15)" },
        xl: { light: "oklch(0 0 0 / 0.1)", dark: "oklch(1 0 0 / 0.15)" },
      },
      focus: {
        ring: { light: "oklch(0.45 0.2 250)", dark: "oklch(0.75 0.2 250)" },
      },
      highlight: {
        ring: { light: "oklch(0.45 0.2 300)", dark: "oklch(0.75 0.2 300)" },
        surface: { light: "oklch(0.95 0.05 300)", dark: "oklch(0.2 0.05 300)" },
      },
    };

    const theme = {
      surfaces: [],
      backgrounds,
      charts,
      primitives,
    } as unknown as Theme;

    const css = generateTokensCss(groups, theme, undefined, undefined);

    expect(css).toContain("--chart-1");
    expect(css).toContain("--chart-2");
    expect(css).toContain("--chart-3");
    expect(css).toContain("oklch(");
    expect(css).toMatchSnapshot();
  });
});
