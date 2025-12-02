import { describe, expect, it } from "vitest";
import { BuilderState } from "../BuilderState.svelte";

describe("BuilderState", () => {
  it("should instantiate without error", () => {
    const builder = new BuilderState();
    expect(builder).toBeDefined();
  });

  it("should switch inspector mode when selecting a surface", () => {
    const builder = new BuilderState();

    // Initial state
    expect(builder.inspectorMode).toBe("global");
    expect(builder.selectedSurfaceId).toBeNull();

    // Select a surface
    builder.selectSurface("surface-1");
    expect(builder.selectedSurfaceId).toBe("surface-1");
    expect(builder.inspectorMode).toBe("surface");

    // Deselect
    builder.selectSurface(null);
    expect(builder.selectedSurfaceId).toBeNull();
    expect(builder.inspectorMode).toBe("global");
  });
});
