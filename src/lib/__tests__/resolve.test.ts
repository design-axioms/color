import { describe, expect, it } from "vitest";
import { resolveConfig } from "../resolve.ts";

describe("resolveConfig", () => {
  it("throws on unknown vibe", () => {
    expect(() => resolveConfig({ vibe: "__nope__" } as any)).toThrow(
      /Unknown vibe/,
    );

    try {
      resolveConfig({ vibe: "__nope__" } as any);
    } catch (err) {
      expect((err as any).code).toBe("CONFIG_INVALID_VIBE");
    }
  });
});
