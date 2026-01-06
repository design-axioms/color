import { describe, expect, it } from "vitest";
import { AxiomaticError } from "../../errors.ts";
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
            "fg-high-hc": 0.0,
            "fg-strong-hc": 0.0,
            "fg-baseline-hc": 0.0,
            "fg-subtle-hc": 0.0,
            "fg-subtlest-hc": 0.0,
          },
          dark: {
            background: 0.1,
            "fg-high": 0.9,
            "fg-strong": 0.8,
            "fg-baseline": 0.7,
            "fg-subtle": 0.6,
            "fg-subtlest": 0.5,
            "fg-high-hc": 1.0,
            "fg-strong-hc": 1.0,
            "fg-baseline-hc": 1.0,
            "fg-subtle-hc": 1.0,
            "fg-subtlest-hc": 1.0,
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

    const config: any = {
      anchors: {
        keyColors: {
          brand: "#0000FF",
        },
      },
    };

    const dtcg = toDTCG(theme, config);

    expect(dtcg.files).toHaveProperty("light.json");
    expect(dtcg.files).toHaveProperty("dark.json");
    expect(dtcg.files).toHaveProperty("primitives.json");

    // Check Light Mode
    const light = dtcg.files["light.json"];
    if (!light) throw new Error("Light mode missing");

    expect(light).toHaveProperty("color");
    const colorGroup = light["color"] as any;

    expect(colorGroup).toHaveProperty("surface");
    expect(colorGroup).toHaveProperty("on-surface");

    // Check Surface Token
    const surfaceGroup = colorGroup["surface"] as any;
    const cardBg = surfaceGroup["card"];
    expect(cardBg).toHaveProperty("$type", "color");
    expect(cardBg).toHaveProperty("$value");
    expect(typeof cardBg.$value).toBe("string");
    // Expect OKLCH string format
    expect(cardBg.$value).toMatch(/^oklch\(/);

    // Check Foreground Tokens
    const onSurfaceGroup = colorGroup["on-surface"] as any;
    const cardFg = onSurfaceGroup["card"];
    expect(cardFg).toHaveProperty("high");
    expect(cardFg["high"]).toHaveProperty("$type", "color");
    expect(cardFg["high"]).toHaveProperty("$value");

    // Check Charts
    expect(colorGroup).toHaveProperty("chart");
    const chartGroup = colorGroup["chart"] as any;
    expect(chartGroup["1"]).toHaveProperty("$type", "color");

    // Check Primitives
    expect(light).toHaveProperty("shadow");
    const shadowGroup = light["shadow"] as any;
    expect(shadowGroup["sm"]).toHaveProperty("$type", "other");

    expect(colorGroup).toHaveProperty("focus");
    const focusGroup = colorGroup["focus"] as any;
    expect(focusGroup["ring"]).toHaveProperty("$type", "color");
  });

  it("throws when surface foreground lightness is not a finite number", () => {
    const surfaces: SurfaceConfig[] = [
      {
        slug: "card",
        label: "Card",
        polarity: "page",
        computed: {
          light: {
            background: 0.9,
            "fg-high": "nope" as any,
          },
          dark: {
            background: 0.1,
            "fg-high": 0.9,
          },
        } as any,
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
      charts: [],
      primitives: {
        shadows: {
          sm: { light: "", dark: "" },
          md: { light: "", dark: "" },
          lg: { light: "", dark: "" },
          xl: { light: "", dark: "" },
        },
        focus: { ring: { light: "", dark: "" } },
        highlight: {
          ring: { light: "", dark: "" },
          surface: { light: "", dark: "" },
        },
      },
    };

    const config: any = {
      anchors: {
        keyColors: {
          brand: "#0000FF",
        },
      },
    };

    expect(() => toDTCG(theme, config)).toThrowError(AxiomaticError);
    expect(() => toDTCG(theme, config)).toThrow(/DTCG_INVALID|lightness/i);
  });
});
