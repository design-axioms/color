# Architecture Review: Theme Builder V2

**Date**: 2025-12-02
**Epoch**: 21 (Phase 1)

## 1. State Management Architecture

### Current State

- `ConfigState`: Manages the `SolverConfig` (the document).
- `ThemeState`: Manages the global theme (light/dark mode).

### Proposed Additions

To support the "Studio" interface, we need a new layer of state to manage the _editor_ itself, separate from the _document_.

- **`BuilderState` (New)**:
  - `selection`: `SurfaceID | null` (Which node is selected in the tree?)
  - `viewMode`: `'component' | 'abstract' | 'audit'`
  - `inspectorMode`: `'global' | 'surface'`
  - `hoveredElement`: `SurfaceID | null` (For "What-If" previews)

### "Vibe" Controller Logic

The "Vibe" controls (Contrast, Vibrancy, Warmth) are _meta-controllers_. They do not map 1:1 to config values.

- **Implementation**: We should implement a `VibeEngine` class that takes the high-level parameters (0-100) and outputs a partial `SolverConfig`.
- **Reversibility**: This is a one-way operation. If a user manually tweaks an anchor, the "Vibe" sliders might become "detached" or "custom". This is acceptable (similar to Lightroom presets).

## 2. Visualization Performance

### The Gamut Slice Challenge

Rendering the P3/sRGB gamut boundary and plotting points can be expensive if done naively (e.g., iterating 0-100 L and 0-0.4 C).

- **Risk**: Blocking the main thread during drag operations.
- **Strategy**:
  1.  **Pre-calculate Boundaries**: The gamut boundary for a given Hue is constant. We can memoize it or pre-calculate it.
  2.  **SVG over Canvas**: For the number of points we have (surfaces ~20), SVG is fast enough and easier to style/animate.
  3.  **D3 Modules**: Use `d3-scale` and `d3-shape` for the math, but render using Svelte `{#each}` blocks for full reactivity.

## 3. Library Recommendations

- **Tree View**: **Custom Svelte Components**.
  - _Why_: Svelte Flow is too heavy (drag-and-drop nodes) for what is essentially a nested list. A recursive `<TreeNode>` component is simple and lightweight.
- **Graphs**: **D3 (Modules) + SVG**.
  - _Why_: We need precise control over the coordinate systems (LCH space). D3 provides the math (`scaleLinear`, `line`, `curveBasis`), and Svelte provides the DOM.
- **Icons**: **Lucide Svelte**.
  - _Why_: Already standard, clean, and consistent.

## 4. Migration Path

We can build the V2 Builder alongside the V1 Builder.

1.  Create `site/src/components/builder-v2/`.
2.  Implement `BuilderState`.
3.  Build the "Context Tree" component.
4.  Build the "Gamut Slice" component.
5.  Once feature-complete, swap the route.

## Conclusion

The current Svelte 5 architecture is well-suited for this upgrade. The main addition is the `BuilderState` to handle the increased UI complexity. No major refactors of the core `ConfigState` are required, only extensions.
