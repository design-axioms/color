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

## The Reactive Pipeline (Engine)

The core logic lives in `css/engine.css`. It uses CSS `@property` to create a reactive data flow.

1.  **Inputs:**
    - **Global Config:** `--base-hue`, `--base-chroma` (set by theme/utilities).
    - **Surface Tokens:** `--surface-token`, `--text-high-token` (set by `light-dark()` in `generated-tokens.css`).
2.  **Computation:**
    - The engine calculates intermediate values like `--computed-surface-C` (Chroma) and `--computed-surface-H` (Hue).
    - It combines these with the tokens to produce **Computed Colors**: `--computed-surface`, `--computed-fg-color`.
3.  **Output:**
    - The computed colors are assigned to CSS properties: `background-color: var(--computed-surface)`.

### Animation Strategy

We support two types of state changes, which require a specific transition strategy to animate smoothly in unison:

1.  **Continuous Changes (Hue/Chroma):**
    - Example: Changing `--hue-brand` from Blue to Red.
    - Mechanism: The browser interpolates the number. The engine recalculates the color every frame.
2.  **Discrete Changes (Light/Dark Mode):**
    - Example: `light-dark()` flipping from Light to Dark.
    - Mechanism: The input token (`--surface-token`) changes _instantly_ (snaps).
    - **The Fix:** We transition the **Computed Properties** (`--computed-surface`), _not_ the input tokens.
    - Why? CSS Transitions do not trigger on a custom property if its value changes solely due to a dependency change. By registering `--computed-surface` with `@property` and an `initial-value`, we allow the browser to interpolate the _result_ of the snap.

```css
/* css/engine.css */
transition: --computed-surface 0.2s, --computed-fg-color 0.2s;
```

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
