import { describe, expect, it } from "vitest";
import type { ColorSpec, Mode, SurfaceConfig, Theme } from "../../types.ts";
import { toTypeScript } from "../typescript.ts";

describe("TypeScript Exporter", () => {
  it("should export a simple theme to TypeScript format", () => {
    const surfaces: SurfaceConfig[] = [
      {
        slug: "card",
        label: "Card",
        polarity: "page",
        computed: {
          light: {
            background: 0.9,
            "fg-high": 0.1,
            "fg-strong": 0.2,
            "fg-baseline": 0.3,
            "fg-subtle": 0.4,
            "fg-subtlest": 0.5,
          },
          dark: {
            background: 0.1,
            "fg-high": 0.9,
            "fg-strong": 0.8,
            "fg-baseline": 0.7,
            "fg-subtle": 0.6,
            "fg-subtlest": 0.5,
          },
        },
      },
    ];

    const backgrounds = new Map<string, Record<Mode, ColorSpec>>();
    backgrounds.set("card", {
      light: { l: 0.9, c: 0.01, h: 100 },
      dark: { l: 0.1, c: 0.01, h: 100 },
    });

    const theme: Theme = {
      surfaces,
      backgrounds,
      charts: [
        {
          light: { l: 0.5, c: 0.1, h: 0 },
          dark: { l: 0.6, c: 0.1, h: 0 },
        },
      ],
      primitives: {
        shadows: {
          sm: {
            light: "0 1px 2px 0 oklch(0 0 0 / 0.05)",
            dark: "0 1px 2px 0 oklch(1 0 0 / 0.15)",
          },
          md: { light: "", dark: "" },
          lg: { light: "", dark: "" },
          xl: { light: "", dark: "" },
        },
        focus: {
          ring: { light: "oklch(0.5 0.2 250)", dark: "oklch(0.6 0.2 250)" },
        },
        highlight: {
          ring: { light: "oklch(0.5 0.2 320)", dark: "oklch(0.6 0.2 320)" },
          surface: {
            light: "oklch(0.9 0.05 320)",
            dark: "oklch(0.2 0.05 320)",
          },
        },
      },
    };

    const ts = toTypeScript(theme);

    // Check for key sections
    expect(ts).toContain("export const tokens = {");
    expect(ts).toContain("shadow: {");
    expect(ts).toContain('"sm": "var(--shadow-sm)",');
    expect(ts).toContain('focus: "var(--focus-ring-color)",');
    expect(ts).toContain("chart: {");
    expect(ts).toContain('"1": "var(--chart-1)",');
    expect(ts).toContain("context: {");
    expect(ts).toContain('surface: "var(--surface-token)",');
    expect(ts).toContain('high: "var(--text-high-token)",');
    expect(ts).toContain("surface: {");
    expect(ts).toContain('"card": "surface-card",');
    expect(ts).toContain("export type Tokens = typeof tokens;");
  });

  it("should respect the prefix option", () => {
    const theme: Theme = {
      surfaces: [],
      backgrounds: new Map(),
      charts: [],
      primitives: {
        shadows: { sm: { light: "", dark: "" } },
        focus: { ring: { light: "", dark: "" } },
        highlight: {
          ring: { light: "", dark: "" },
          surface: { light: "", dark: "" },
        },
      },
    } as any; // Partial theme is enough for this test

    const ts = toTypeScript(theme, { prefix: "my-app" });

    expect(ts).toContain('"sm": "var(--my-app-shadow-sm)",');
    expect(ts).toContain('focus: "var(--my-app-focus-ring-color)",');
    expect(ts).toContain('surface: "var(--my-app-surface-token)",');
  });
});
