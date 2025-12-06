# Concept Model: Theme Builder V2

**Date**: 2025-12-02
**Epoch**: 21 (Phase 1)

## Core Philosophy: "The Studio"

We are moving from a "Settings Panel" metaphor to a "Design Studio" metaphor. The UI should feel like a workspace where you construct a system, not just a form where you fill in values.

## 1. The Workspace Layout

The new layout is divided into three primary zones:

### Zone A: The Context Tree (Left Panel)

- **Purpose**: Visualizes the "Laws of Architecture" (Axiom III).
- **Representation**: A hierarchical tree view (like a file explorer or DOM tree).
- **Content**:
  - `Root (Page)`
    - `Surface: Card`
      - `Text: Body`
      - `Action: Primary`
    - `Surface: Sidebar`
      - `Surface: Item (Active)`
- **Interaction**: Clicking a node selects it as the "Active Context" for inspection.

### Zone B: The Stage (Center Panel)

- **Purpose**: Immediate visual feedback (Persona: Alex).
- **Representation**: A canvas rendering the "Live Preview".
- **Modes**:
  - **Component View**: Shows the standard "Kitchen Sink" components.
  - **Abstract View**: Shows a simplified block diagram of the nesting.
  - **Audit View**: Shows a matrix of all surfaces against all backgrounds.
- **Interaction**: "Inspect Mode" allows clicking elements on the stage to select them in the Tree.

### Zone C: The Inspector (Right Panel)

- **Purpose**: Deep control and data density (Persona: Dr. Chen).
- **Content**: Context-sensitive controls based on the selection in Zone A/B.
  - **Global Selection**: Shows Anchors, Curves, Key Colors.
  - **Surface Selection**: Shows specific overrides, contrast scores, and "Context Trace" (how it got its color).

## 2. Key Visualizations

### The "Context Trace"

A visualization that explains the _why_.

> "This button is `oklch(0.2 0 0)` because:"
>
> 1.  **Root**: Dark Mode (Base L=0.1)
> 2.  **Parent**: Card (L+0.05 -> L=0.15)
> 3.  **Self**: Button (L+0.05 -> L=0.20)

### The "Gamut Slice" (L-C Plane)

A 2D graph showing Lightness (Y-axis) vs Chroma (X-axis) for the current Hue.

- **Boundary**: Draws the P3 and sRGB gamut boundaries.
- **Points**: Plots the current surface colors as dots.
- **Interaction**: Drag a dot to adjust its Chroma/Lightness. If you drag it outside the boundary, it shows a "Clipping" warning.

### The "Hue Ribbon"

A horizontal ribbon showing the hue rotation curve.

- **X-axis**: Lightness (0-100).
- **Y-axis**: Hue (0-360).
- **Interaction**: Drag handles to bend the curve (Bezier control points).

## 3. Interaction Model: "Direct Manipulation"

- **No Abstract Sliders**: Wherever possible, controls should be overlaid on the visualization.
  - _Don't_ have a slider for "Anchor Start".
  - _Do_ have a draggable handle on the Lightness Graph.
- **Live "What-If"**: Hovering over a preset or a color wheel segment should preview the change immediately, committing only on click.

## 4. The "Vibe" Controller (For Sarah)

For the "Overwhelmed Pragmatist", we offer a "Simple Mode" that abstracts the math into high-level semantic controls:

- **Contrast**: Low (Soft) <-> High (Accessible).
- **Vibrancy**: Grayscale <-> Neon.
- **Warmth**: Cool (Blue-ish) <-> Warm (Yellow-ish).

These controls macro-adjust the underlying anchors and curves.
