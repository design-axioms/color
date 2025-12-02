# Phase 4: V2 Implementation (Correction & Refinement)

## Context

The initial attempt at Phase 4 failed to capture critical user feedback regarding the Theme Builder V2. The user specifically noted missing selection states and an unsatisfactory "separate slider" approach for page anchors. This phase is now dedicated to correcting these issues and implementing the V2 design properly, aligning with the "System Modeling" vision.

## Goals

1.  **Robust Selection System**: Implement a visible, obvious selection state for surfaces.
    - **Visuals**: Use the "Highlight" primitive (Magenta, Hue 320) for selection rings/backgrounds, distinct from the "Focus" ring (Brand color).
    - **Behavior**: Ensure selection persists across the UI (Context Tree, Preview, Inspector).
2.  **Unified Anchor Control**: Refactor the Anchor Graph to be a cohesive "Context Editor".
    - **Problem**: Currently 4 separate sliders (Page L/D, Inverted L/D).
    - **Solution**: Group by **Context** (Page vs. Inverted). Visualize Light and Dark modes together (e.g., stacked tracks or a shared axis) to show the relationship and contrast range.
3.  **System Modeling UI**: Implement the missing "V2" features.
    - **Context Tree**: Upgrade `SurfaceManager` to a true tree view that visualizes nesting.
    - **Gamut Visualization**: Add a visualization for the color space (Gamut Slice).
    - **Direct Manipulation**: Ensure graphs and previews are interactive.

## Implementation Steps

### 1. Fix Selection States

- [x] Define `--highlight-ring-color` (Done).
- [x] **Refine Visuals**: Ensure the distinction between Focus (Interaction) and Selection (Inspection) is clear.
- [x] **Apply Globally**: Ensure the selection ring appears on the Preview Card, the Context Tree row, and the Inspector header.

### 2. Contrast Feedback

- [x] **Inspector**: Add APCA contrast score and Pass/Fail/Weak badges to `SurfaceInspector`.
- [x] **Tree View**: Add contrast badges to `ContextTreeNode` for quick scanning.
- [x] **Tokens**: Fix missing `--hue-error` token and ensure badges use system colors.

### 3. Refactor Anchor Graph

- [ ] **Design**: Create a new `ContextGraph.svelte` that replaces the 4 separate sliders.
- [ ] **Layout**:
  - Row 1: Page Context (Light Track + Dark Track aligned).
  - Row 2: Inverted Context (Light Track + Dark Track aligned).
- [ ] **Interaction**: Allow dragging "Start" and "End" handles.
- [ ] **Visualization**: Show the "Safe Zone" (APCA compliance) directly on the graph.

### 3. Context Tree & Gamut

- [ ] **Context Tree**: Refactor `SurfaceManager` to render a nested tree structure (using `details`/`summary` or recursive components).
- [ ] **Gamut Slice**: Implement `GamutSlice.svelte` to visualize the chroma/lightness boundaries.

## Technical Considerations

- **State**: Use `BuilderState` for selection and hover states.
- **Performance**: SVG graphs should be optimized.
- **Accessibility**: Ensure all new controls are keyboard accessible.
