# Implementation Plan - Epoch 21, Phase 4: V2 Implementation

**Goal**: Transform the Theme Builder from a configuration form into a "System Modeling" tool that visualizes context, gamut, and relationships.

## 1. Context Tree Integration

**Objective**: Replace the mock data in `ContextTree.svelte` with the live `ConfigState` and `BuilderState`.

- [ ] **State Connection**:
  - Import `configState` from `$lib/state/ConfigState.svelte`.
  - Import `builderState` from `$lib/state/BuilderState.svelte`.
- [ ] **Tree Transformation**:
  - Create a utility to transform the flat `SurfaceConfig` list into a hierarchical tree structure for rendering.
  - Handle "Page" as the implicit root.
  - Handle nesting based on `parentId` (if we have that concept) or just visual grouping for now. _Note: The current system is flat, but the design audit calls for a tree. We may need to infer hierarchy or add `parentId` to `SurfaceConfig`._
- [ ] **Interaction**:
  - Bind `onclick` to `builderState.selectSurface(id)`.
  - Bind `onmouseenter` to `builderState.hoverSurface(id)`.

## 2. Gamut Visualization (`GamutSlice`)

**Objective**: Visualize where surfaces sit within the P3/sRGB color space to prevent "flying blind".

- [ ] **Component Structure**:
  - Create `site/src/components/builder-v2/stage/GamutSlice.svelte`.
  - Use SVG for rendering.
- [ ] **Math & Logic**:
  - Use `d3-shape` or manual SVG paths to draw the gamut boundary for the current Hue.
  - Plot the current surface's position (L, C).
  - Show the "Safe Zone" (sRGB) vs "P3 Zone".

## 3. Interactive Graph (`AbstractView`)

**Objective**: Allow direct manipulation of the lightness curve.

- [ ] **Interactivity**:
  - Add drag handlers to the anchor points on the graph.
  - Update `configState` in real-time as the user drags.
- [ ] **Visual Feedback**:
  - Show "Ghost" lines for the original position during drag.
  - Snap to grid or meaningful values (optional).

## 4. Educational Overlays

**Objective**: Explain _why_ a surface looks the way it does.

- [ ] **Context Trace**:
  - When hovering a surface in the tree or stage, show a tooltip or panel explaining its resolved values.
  - "Light Mode (Page) -> Surface 1 (Card) -> Text High".

## 5. Vibe Controls

**Objective**: High-level controls for "Soft", "Vibrant", "High Contrast".

- [ ] **VibeEngine**:
  - Create `site/src/lib/engine/VibeEngine.ts`.
  - Implement logic to map `contrast`, `vibrancy`, `warmth` (0-100) to `SolverConfig` values.
- [ ] **UI**:
  - Add a "Vibe" panel to the Global Inspector.
