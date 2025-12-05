# Theme Builder: Aspirational Goals & Rethink

## Context

The current implementation of the Theme Builder, while functional, does not fully satisfy the aspirational goals set out at the beginning of the project. It serves as a technical demo but fails to deliver the transformative "design tool" experience we envisioned.

## The Goal

We need a future phase dedicated to reimagining the Theme Builder. This phase should not be about "fixing bugs" or "adding features" to the current codebase, but rather a fundamental design conversation.

The goal is to transform it from a simple configuration tool into a **"learning environment"** that teaches the system's mechanics (Context, Surfaces, Anchors) through interaction.

## Aspirational Features (From Epoch 17 Plan)

### 1. Visualizer Graph (The "Why")

- **Goal**: Show how surfaces inherit and modify context.
- **Ideas**:
  - Create a node-based or layer-based visualization (using Svelte Flow or custom SVG).
  - Visualize the "Context" object flowing through the tree.
  - Show how `Polarity` and `Mode` affect each node.

### 2. Data Density (The "What")

- **Goal**: Show the math behind the colors.
- **Ideas**:
  - **Inline Values**: Display calculated Lightness (L\*), Chroma (C), and Hue (H) values next to surfaces.
  - **Contrast Badges**: Show APCA or WCAG contrast ratios against the parent surface.
  - **Hex Codes**: Allow copying resolved hex values.

### 3. Intuitive Controls (The "How")

- **Goal**: Make the controls reflect the constraints.
- **Ideas**:
  - **Gamut Sliders**: Replace standard range inputs with gradient sliders that show the available color space.
  - **Histograms**: Show where the current theme's surfaces sit on the lightness scale.

## Key Questions for the Future Phase

- **Who is this for?** Is it for developers tweaking a config, or designers exploring a system?
- **What is the "Textbook" experience?** How does the tool teach the physics and math behind the system while you use it?
- **Visualizing Relationships**: How do we better represent the flow of context (Polarity -> Mode -> Surface) visually?
- **Direct Manipulation**: How can we move away from abstract sliders and towards direct manipulation of the outcome?

## Next Steps

1.  **Design Audit**: Review the current builder against the original "Axioms" and "Personas".
2.  **Concept Phase**: Sketch out (lo-fi) what an ideal interaction model looks like, ignoring current technical constraints.
3.  **Architecture Review**: Determine if the current runtime/architecture supports this new vision or if we need a different approach (e.g., a more robust state machine, a different rendering engine).

### 4. Live Export Preview

- **Goal**: Demystify the export process and allow debugging before running the CLI.
- **Ideas**:
  - Add a "JSON" or "Export" tab to the Theme Builder.
  - Display the live-generated `primitives.json`, `light.json`, and `dark.json` as the user tweaks sliders.
  - Show the connection between configuration values and output tokens.
