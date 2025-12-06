# Implementation Plan - Epoch 30: Phase 4 (The Runtime Debugger)

**Goal**: Build a "X-Ray" tool that visualizes the invisible "Late Binding" context (Surface, Polarity, Intent) in the browser, helping developers understand _why_ a color is rendered the way it is.

## Phase 4.1: The Inspector (Core Logic)

**Goal**: Implement the headless logic for DOM traversal and variable resolution.

- [x] **Scaffold Module**: Create `src/lib/inspector/` structure.
- [x] **Context Walker**: Implement logic to traverse up the DOM and find the nearest "Context Root" (element defining `--bg-surface`).
- [x] **Variable Resolver**: Implement logic to read `getComputedStyle` and resolve "Indirection Variables" (e.g., `--text-lightness-source`) back to their semantic meaning.
- [x] **Reverse Solver**: Map resolved values back to semantic tokens (e.g., `0.6` lightness -> `text-subtle`).
- [x] **Unit Tests**: Verify the logic against a mock DOM.

## Phase 4.2: The Overlay (Web Component)

**Goal**: Implement the visualization layer using Web Components and Shadow DOM.

- [x] **Component Scaffold**: Create `src/lib/components/debugger.ts` (Vanilla Web Component).
- [x] **Shadow DOM**: Set up the shadow root and internal styles to ensure isolation.
- [x] **Highlight Box**: Implement `element.getClientRects()` logic to draw precise boxes around elements (handling multi-line text).
- [x] **Info Card**: Implement the details panel using CSS Anchor Positioning to float next to the target.
- [x] **Interaction**: Add mouseover/mouseout listeners to trigger the inspector.

## Phase 4.3: Integration & Dogfooding

**Goal**: Integrate the debugger into the documentation and demo app for real-world testing.

- [x] **Export**: Expose the debugger from the main package entry point.
- [x] **Site Integration**: Add the debugger to the Astro site layout (`site/src/layouts/Layout.astro` or similar).
- [x] **Toggle Mechanism**: Implement a global keyboard shortcut (e.g., `Ctrl+Shift+X`) to activate/deactivate the tool.
- [x] **Verification**: Use the tool to inspect the documentation site itself ("Dogfooding") and verify it correctly identifies surfaces and intents.
