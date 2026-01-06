import { describe, expect, it } from "vitest";
import { DEFAULT_CONFIG } from "../defaults.ts";
import { AxiomaticError } from "../errors.ts";
import { solve } from "../solver/index.ts";

describe("solver error surfaces", () => {
  it("throws on unparseable surface override", () => {
    const config = structuredClone(DEFAULT_CONFIG);
    config.groups[0]!.surfaces[0]!.override = { light: "not-a-color" };

    expect(() => solve(config)).toThrow(/Could not parse surface override/);
  });

  it("throws on invalid keyColors values", () => {
    const config = structuredClone(DEFAULT_CONFIG);
    config.anchors.keyColors.brand = "not-a-color";

    expect(() => solve(config)).toThrowError(AxiomaticError);
    expect(() => solve(config)).toThrow(
      /COLOR_PARSE_FAILED|Invalid color value/,
    );
  });

  it("throws on duplicate surface slugs (P1-11)", () => {
    const config = structuredClone(DEFAULT_CONFIG);
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
    const config = structuredClone(DEFAULT_CONFIG);
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
});
