import { describe, expect, it } from "vitest";
import { DEFAULT_CONFIG } from "../defaults.ts";
import { AxiomaticError } from "../errors.ts";
import { solve } from "../solver/index.ts";

/**
 * Clone DEFAULT_CONFIG for testing. The returned object is mutable.
 * We return `any` because structuredClone preserves readonly modifiers,
 * but the cloned object is actually mutable at runtime. The tests need
 * to mutate the config to trigger various error conditions.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function cloneConfig(): any {
  return structuredClone(DEFAULT_CONFIG);
}

describe("solver error surfaces", () => {
  it("throws on unparseable surface override", () => {
    const config = cloneConfig();
    config.groups[0]!.surfaces[0]!.override = { light: "not-a-color" };

    expect(() => solve(config)).toThrow(/Could not parse surface override/);
  });

  it("throws on invalid keyColors values", () => {
    const config = cloneConfig();
    config.anchors.keyColors.brand = "not-a-color";

    expect(() => solve(config)).toThrowError(AxiomaticError);
    expect(() => solve(config)).toThrow(
      /COLOR_PARSE_FAILED|Invalid color value/,
    );
  });

  it("throws on duplicate surface slugs (P1-11)", () => {
    const config = cloneConfig();
    // Add a duplicate slug in a different group
    config.groups.push({
      name: "duplicates",
      surfaces: [
        {
          slug: config.groups[0]!.surfaces[0]!.slug,
          label: "Duplicate",
          polarity: "page",
        },
      ],
    });

    expect(() => solve(config)).toThrowError(AxiomaticError);
    expect(() => solve(config)).toThrow(
      /CONFIG_DUPLICATE_SURFACE_SLUG|Duplicate surface slug/,
    );
  });

  it("throws on circular key color references (P1-13)", () => {
    const config = cloneConfig();
    // Create a circular alias: brand → accent → brand
    config.anchors.keyColors = {
      brand: "accent",
      accent: "brand",
    };

    expect(() => solve(config)).toThrowError(AxiomaticError);
    expect(() => solve(config)).toThrow(
      /CONFIG_CIRCULAR_KEY_COLOR|Circular key color reference/,
    );
  });

  it("throws on invalid anchor ordering - dark mode start > end (P1-12)", () => {
    const config = cloneConfig();
    // Dark mode: start should have lower L* than end
    // But we're making start higher than end (invalid)
    config.anchors.page.dark.start = { background: 0.6 };
    config.anchors.page.dark.end = { adjustable: true, background: 0.3 };

    expect(() => solve(config)).toThrowError(AxiomaticError);
    expect(() => solve(config)).toThrow(/Invalid anchor ordering/);
  });

  it("throws on invalid anchor ordering - light mode end > start (P1-12)", () => {
    const config = cloneConfig();
    // Light mode: start should have higher L* than end
    // But we're making end higher than start (invalid)
    config.anchors.page.light.start = { background: 0.85 };
    config.anchors.page.light.end = { adjustable: true, background: 0.95 };

    expect(() => solve(config)).toThrowError(AxiomaticError);
    expect(() => solve(config)).toThrow(/Invalid anchor ordering/);
  });

  it("throws on invalid state offset - too negative (P1-20)", () => {
    const config = cloneConfig();
    // Find a surface with states and set an invalid offset
    const cardSurface = config.groups[1]!.surfaces[0]!;
    cardSurface.states = [{ name: "hover", offset: -30 }];

    expect(() => solve(config)).toThrowError(AxiomaticError);
    expect(() => solve(config)).toThrow(/Contrast offset.*out of valid range/);
  });

  it("throws on invalid state offset - too positive (P1-20)", () => {
    const config = cloneConfig();
    // Find a surface with states and set an invalid offset
    const cardSurface = config.groups[1]!.surfaces[0]!;
    cardSurface.states = [{ name: "hover", offset: 30 }];

    expect(() => solve(config)).toThrowError(AxiomaticError);
    expect(() => solve(config)).toThrow(/Contrast offset.*out of valid range/);
  });
});
