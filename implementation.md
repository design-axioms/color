# Color System Implementation

This document details the technical implementation of the color system.

## Architecture

The system is built on **CSS Custom Properties**, **OKLCH** color space, and a **TypeScript Solver**.

### Directory Structure

- **`scripts/`**: The "Build Time" logic.
  - `solver-engine.ts`: The core math engine. Calculates lightness and contrast.
  - `generate-tokens.ts`: The CLI wrapper.
  - `surface-lightness.config.json`: The source of truth for surfaces, groups, and targets.
- **`css/`**: The "Run Time" styles.
  - `generated-tokens.css`: Output of the solver. Contains `light-dark()` color tokens.
  - `base.css`: Core variables, calculations (Hue/Chroma), and System Color mappings.
  - `utilities.css`: The public API (`.surface-*`, `.text-*`) and composition logic.

## The CSS Model: Context Variables

We use a **Context Provider/Consumer** pattern to handle composition and nesting.

1.  **Provider (Surface):** A class like `.surface-card` sets local variables:
    ```css
    .surface-card {
      --surface-lightness: ...;
      --context-text-subtle: var(--lightness-subtle-on-card);
      --context-border-decorative: var(--border-decorative-on-card);
    }
    ```
2.  **Consumer (Utility):** A class like `.text-subtle` consumes the context:
    ```css
    .text-subtle {
      --surface-text-lightness: var(--context-text-subtle);
    }
    ```

This ensures **Orthogonality**: Adding a new surface doesn't require updating every utility class. It also handles **Nesting** naturally, as the nearest surface ancestor provides the context.

## The Solver

The `solver-engine.ts` script automates the selection of lightness values.

1.  **Anchors:** Defines the available dynamic range (e.g., 0.1 to 0.9) for Light and Dark modes.
2.  **APCA Contrast:** Uses the APCA algorithm (perceptual contrast) to ensure text is legible on every surface.
3.  **Groups & Steps:** Distributes surfaces evenly across the range, or clusters them in groups (e.g., "Content", "Spotlight").
4.  **Hue Shift:** Applies a Bezier curve to shift hue (warmth) based on lightness.

## Accessibility Implementation

We achieve accessibility through **Taxonomy Alignment**.

- **Forced Colors:** We map our semantic tokens (`surface-action`, `text-link`) directly to System Colors (`ButtonFace`, `LinkText`) in `base.css`.
- **High Contrast:** The solver can generate a parallel set of tokens with stricter contrast targets (Future Work).

## Running the System

- **`pnpm solve`**: Runs the solver and regenerates `css/generated-tokens.css`.
- **`pnpm dev`**: Runs the demo app.
