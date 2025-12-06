import { describe, expect, it } from "vitest";
import type { ColorSpec, Mode, SurfaceConfig, Theme } from "../../types.ts";
import { toTailwind } from "../tailwind.ts";

describe("Tailwind Exporter", () => {
  it("should export a theme to Tailwind preset format", () => {
    const surfaces: SurfaceConfig[] = [
      {
        slug: "card",
        label: "Card",
        polarity: "page",
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

    const preset = toTailwind(theme) as any;

    expect(preset).toHaveProperty("theme");
    expect(preset.theme).toHaveProperty("extend");
    expect(preset.theme.extend).toHaveProperty("colors");
    expect(preset.theme.extend).toHaveProperty("boxShadow");

    const colors = preset.theme.extend.colors;

    // Check Contextual Tokens
    expect(colors.text.high).toBe("var(--text-high-token)");
    expect(colors.border.dec).toBe("var(--border-dec-token)");

    // Check Surface Colors
    expect(colors.surface.card).toContain("light-dark(");
    expect(colors.surface.card).toContain("oklch(0.9 0.01 100)");
    expect(colors.surface.card).toContain("oklch(0.1 0.01 100)");

    // Check Chart Colors
    expect(colors.chart["1"]).toContain("light-dark(");

    // Check Shadows
    const shadows = preset.theme.extend.boxShadow;
    expect(shadows.sm).toContain("light-dark(");
  });
});
