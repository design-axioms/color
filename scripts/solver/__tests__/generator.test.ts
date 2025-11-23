import { describe, it, expect } from "vitest";
import { generateTokensCss } from "../generator.ts";
import type { SurfaceGroup, Mode } from "../types.ts";

describe("generateTokensCss", () => {
  it("generates correct CSS for a standard surface group", () => {
    const groups: SurfaceGroup[] = [
      {
        name: "Base Surfaces",
        surfaces: [
          {
            slug: "page",
            polarity: "page",
            states: [{ name: "hover" }],
          },
          {
            slug: "card",
            polarity: "page",
            states: [],
          },
        ],
      },
    ];

    const backgrounds = new Map<string, Record<Mode, number>>();
    backgrounds.set("page", { light: 0.98, dark: 0.1 });
    backgrounds.set("page-hover", { light: 0.95, dark: 0.15 });
    backgrounds.set("card", { light: 1.0, dark: 0.2 });

    const hueShiftConfig = {
      curve: {
        p1: [0.5, 0] as [number, number],
        p2: [0.5, 1] as [number, number],
      },
      maxRotation: 180,
    };

    const borderTargets = {
      decorative: 0.2,
      interactive: 0.5,
    };

    const css = generateTokensCss(
      groups,
      backgrounds,
      hueShiftConfig,
      borderTargets
    );

    expect(css).toMatchSnapshot();
  });

  it("handles missing background values gracefully", () => {
    const groups: SurfaceGroup[] = [
      {
        name: "Base Surfaces",
        surfaces: [
          {
            slug: "unknown",
            polarity: "page",
          },
        ],
      },
    ];

    const backgrounds = new Map<string, Record<Mode, number>>();
    // "unknown" is missing

    const css = generateTokensCss(groups, backgrounds);
    expect(css).toMatchSnapshot();
  });
});
