# Design: Runtime Debugging

> **Related Axiom**: [The Law of Late Binding](../axioms/05-engineering.md)

## The Problem: Invisibility

The "Reactive Pipeline" architecture is powerful because it uses CSS variables to perform "Late Binding" of colors.

- `--text-lightness-source` is set by a utility class.
- `--bg-surface` is set by a surface class.
- The final color is calculated in the `:where()` block.

This means that if you inspect an element in Chrome DevTools, you don't see a color value on the element itself. You see a calculation: `oklch(from var(--text-lightness-source) ... )`.

To understand _why_ a text is a certain color, you have to:

1.  Find the element setting `--text-lightness-source`.
2.  Find the parent surface setting `--bg-surface`.
3.  Mentally compute the result.

This is a high friction loop for debugging.

## The Solution: The Runtime Debugger (X-Ray)

We need a tool that visualizes the "Invisible Context".

### Features

1.  **Context Sensing**:
    - Hover over any element.
    - The tool traverses up the DOM to find the nearest "Context Root" (Surface).
    - It reads the computed values of the Indirection Variables.

2.  **Visual Overlay**:
    - Displays a tooltip/overlay.
    - **Surface**: "Card (Layer 2)"
    - **Polarity**: "Light Mode" / "Inverted"
    - **Intent**: "Subtle Text"
    - **Result**: The resolved OKLCH/Hex value.

3.  **"Why is this?"**:
    - Clicking the overlay could show the "Trace":
      - `text-subtle` (set lightness to 0.6)
      - `surface-card` (set base hue to 240)
      - `theme-dark` (inverted polarity)

### Implementation Architecture

The tool will be composed of two distinct layers to ensure portability and separation of concerns.

#### Layer 1: The Inspector (Headless)

This layer is responsible for "detecting the element" and "producing the data". It is purely functional and framework-agnostic.

- **Input**: `HTMLElement` (the target under the cursor).
- **Logic**:
  - **Context Walking**: Traverses up the DOM to find the nearest "Context Root" (an element defining `--bg-surface`).
  - **Variable Resolution**: Reads `getComputedStyle` to resolve "Indirection Variables" (e.g., `--text-lightness-source`).
  - **Reverse Solving**: Maps the resolved values back to the semantic tokens (e.g., "This is `text-subtle` because lightness is `0.6`").
- **Output**: A `DebugContext` object containing:
  - `surface`: The name of the surface (e.g., "card").
  - `polarity`: "light" or "dark".
  - `intent`: The semantic intent (e.g., "subtle").
  - `value`: The resolved color.

#### Layer 2: The Overlay (UI)

This layer handles the user interaction and visualization. It is "glued" on top of the application.

- **Activation**: A global toggle (keyboard shortcut or API call) that enables the event listeners.
- **Interaction**:
  - Listens for `mousemove` to identify the target element.
  - **Inline Handling**: Uses `element.getClientRects()` to correctly highlight multi-line inline elements (text wrapping), drawing a box around each line fragment if necessary.
- **Rendering**:
  - **Web Component**: Implemented as a custom element (`<axiomatic-debugger>`) with Shadow DOM to ensure complete style isolation from the host app.
  - **Anchor Positioning**: Uses native CSS Anchor Positioning to tether the results box to the highlighted element, ensuring it stays on screen and follows the target.

### Integration Strategy

By separating the **Inspector** from the **Overlay**, we enable multiple use cases:

1.  **Standard Debugger**: The default `<axiomatic-debugger>` overlay for general use.
2.  **DevTools Extension**: The **Inspector** logic can be run in the content script of a browser extension, piping data to a custom DevTools panel.
3.  **Framework Adapters**: A React/Svelte/Vue wrapper can trigger the **Inspector** and render its own framework-native tooltip if desired.

- **Standalone Component**: A Svelte 5 component that can be injected into the app (like the Theme Builder).
- **Toggle**: Activated via keyboard shortcut or UI toggle.
- **Zero-Runtime Overhead**: When disabled, it should have 0 performance cost.
