import { describe, expect, it } from "vitest";
import { generateTheme } from "../runtime.ts";
import type { SolverConfig } from "../types.ts";

describe("Runtime Scoping", () => {
  it("scopes all rules when a selector is provided", () => {
    const config: SolverConfig = {
      anchors: {
        page: {
          light: { start: { background: 1 }, end: { background: 0.9 } },
          dark: { start: { background: 0.1 }, end: { background: 0.2 } },
        },
        inverted: {
          light: { start: { background: 0.5 }, end: { background: 0.5 } },
          dark: { start: { background: 0.5 }, end: { background: 0.5 } },
        },
        keyColors: {
          brand: "#ff0000",
        },
      },
      groups: [
        {
          name: "Test Group",
          surfaces: [
            {
              slug: "card",
              label: "Card",
              polarity: "page",
            },
          ],
        },
      ],
    };

    const css = generateTheme(config, "#my-scope");

    // Check variable scoping
    expect(css).toContain("#my-scope {");
    expect(css).toContain("--hue-brand:");

    // Check class scoping
    expect(css).toContain("#my-scope .surface-card {");

    // Ensure no global class definitions
    // We split by newline and check lines that start with .surface-card
    const lines = css.split("\n");
    const globalRules = lines.filter((line: string) =>
      line.trim().startsWith(".surface-card")
    );
    expect(globalRules).toHaveLength(0);
  });
});
