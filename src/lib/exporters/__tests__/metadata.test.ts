import { describe, expect, it } from "vitest";
import { generateMetadata } from "../metadata.ts";
import type { Theme } from "../../types.ts";

describe("generateMetadata", () => {
  it("exports inverted selectors", () => {
    const mockTheme = {
      surfaces: [
        { slug: "page", polarity: "page" },
        { slug: "action", polarity: "inverted" },
        { slug: "spotlight", polarity: "inverted" },
      ],
    } as unknown as Theme;

    const output = generateMetadata(mockTheme);

    expect(output).toContain('".surface-action"');
    expect(output).toContain('".surface-spotlight"');
    expect(output).toContain("export const invertedSelectors");
    expect(output).toContain("export const defaultTau = 1");
  });

  it("handles no inverted surfaces", () => {
    const mockTheme = {
      surfaces: [{ slug: "page", polarity: "page" }],
    } as unknown as Theme;

    const output = generateMetadata(mockTheme);

    expect(output).toContain("export const invertedSelectors = [");
    expect(output).toContain("] as const");
    expect(output).not.toContain(".surface-page");
  });

  it("includes @generated marker", () => {
    const mockTheme = { surfaces: [] } as unknown as Theme;
    const output = generateMetadata(mockTheme);
    expect(output).toContain("@generated");
  });
});
