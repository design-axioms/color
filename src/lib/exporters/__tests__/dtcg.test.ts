import { describe, expect, it } from "vitest";
import type { ColorSpec, Mode, SurfaceConfig, Theme } from "../../types.ts";
import { toDTCG } from "../dtcg.ts";

describe("DTCG Exporter", () => {
  it("should export a simple theme to DTCG format", () => {
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

    const dtcg = toDTCG(theme);

    expect(dtcg).toHaveProperty("light");
    expect(dtcg).toHaveProperty("dark");

    // Check Light Mode
    const light = dtcg.light;
    if (!light) throw new Error("Light mode missing");

    expect(light).toHaveProperty("surface");
    expect(light).toHaveProperty("on-surface");

    // Check Surface Token
    const surfaceGroup = light["surface"] as any;
    const cardBg = surfaceGroup["card"];
    expect(cardBg).toHaveProperty("$type", "color");
    expect(cardBg).toHaveProperty("$value");
    expect(typeof cardBg.$value).toBe("string");
    // Expect OKLCH string format
    expect(cardBg.$value).toMatch(/^oklch\(/);

    // Check Foreground Tokens
    const onSurfaceGroup = light["on-surface"] as any;
    const cardFg = onSurfaceGroup["card"];
    expect(cardFg).toHaveProperty("high");
    expect(cardFg["high"]).toHaveProperty("$type", "color");
    expect(cardFg["high"]).toHaveProperty("$value");

    // Check Charts
    expect(light).toHaveProperty("chart");
    const chartGroup = light["chart"] as any;
    expect(chartGroup["1"]).toHaveProperty("$type", "color");

    // Check Primitives
    expect(light).toHaveProperty("shadow");
    const shadowGroup = light["shadow"] as any;
    expect(shadowGroup["sm"]).toHaveProperty("$type", "other");

    expect(light).toHaveProperty("focus");
    const focusGroup = light["focus"] as any;
    expect(focusGroup["ring"]).toHaveProperty("$type", "color");
  });
});
