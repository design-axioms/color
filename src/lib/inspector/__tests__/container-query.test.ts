import { describe, expect, it } from "vitest";
import type { ConditionalContext } from "../types.ts";

// We need to test the internal functions, so we'll re-export them for testing
// For now, let's test the type structure and basic logic

describe("Container Query Evaluation Types", () => {
  it("should define ConditionalContext with required fields", () => {
    const ctx: ConditionalContext = {
      type: "container",
      condition: "(min-width: 400px)",
      active: true,
      evaluated: true,
    };

    expect(ctx.type).toBe("container");
    expect(ctx.condition).toBe("(min-width: 400px)");
    expect(ctx.active).toBe(true);
    expect(ctx.evaluated).toBe(true);
  });

  it("should support media and supports types", () => {
    const mediaCtx: ConditionalContext = {
      type: "media",
      condition: "(prefers-color-scheme: dark)",
      active: false,
      evaluated: true,
    };

    const supportsCtx: ConditionalContext = {
      type: "supports",
      condition: "(display: grid)",
      active: true,
      evaluated: true,
    };

    expect(mediaCtx.type).toBe("media");
    expect(supportsCtx.type).toBe("supports");
  });

  it("should mark unevaluated conditions with evaluated: false", () => {
    const ctx: ConditionalContext = {
      type: "container",
      condition: "(min-width: 400px) and (max-width: 800px)",
      active: true, // Conservative fallback
      evaluated: false, // We couldn't parse this complex query
    };

    expect(ctx.evaluated).toBe(false);
    expect(ctx.active).toBe(true); // Should fallback to true
  });
});
