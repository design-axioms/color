# Color System Implementation

This document details the technical implementation of the color system, based on the **Grand Unified Algebra v4.0**.

## Architecture

The system is a hybrid of **Build-Time Math** (TypeScript) and **Run-Time Physics** (CSS).

### Directory Structure

- **`src/cli/`**: The "Build Time" logic (The Solver).
  - `index.ts`: The CLI entry point (`axiomatic`).
  - `commands/solve.ts`: The command that runs the solver.
- **`src/lib/`**: The Core Logic.
  - `math.ts`: The pure math functions (Taper, Tunnel, Interpolation).
  - `solver.ts`: The engine that distributes lightness values across the range.
  - `generator.ts`: Emits the CSS tokens.
- **`css/`**: The "Run Time" styles.
  - `engine.css`: The **Reactive Pipeline**. Contains the `@property` definitions and the core algebra.
  - `theme.css`: The **Generated Tokens**. Output of `pnpm solve`.
  - `index.css`: The entry point that bundles everything.

## The Reactive Pipeline (Run-Time)

The core innovation is the **Reactive Pipeline** in `css/engine.css`. Instead of pre-calculating every possible color combination, we use CSS Custom Properties to create a live physics engine in the browser.

### 1. The State Tuple ($\Sigma$)

We define the state of the UI using typed custom properties:

```css
@property --tau {
  syntax: "<number>";
  initial-value: 1;
  inherits: true;
} /* Time */
@property --alpha-hue {
  syntax: "<number>";
  initial-value: 0;
  inherits: true;
} /* Atmosphere */
@property --alpha-beta {
  syntax: "<number>";
  initial-value: 0.008;
  inherits: true;
} /* Vibrancy */
```

### 2. The Resolution Function ($\Phi$)

The engine uses `calc()` and `oklch()` to resolve the final color based on the current state.

**Key Formula: The Safe Bicone**
$$ C\_{final} = \min(\beta, \beta \times \text{Taper} \times \text{Tunnel}) $$

In CSS, this calculation happens **inline** within the `oklch` function to access the dynamic lightness (`l`) of the source token:

```css
--_axm-computed-surface: oklch(
  from var(--axm-surface-token) l
    min(
      var(--alpha-beta),
      /* Limit = Beta * Taper * Tunnel */ var(--alpha-beta) *
        (1 - abs(2 * l - 1)) * /* Taper (Space) */ var(--tau) * var(--tau)
        /* Tunnel (Time) */
    )
    h
);
```

### 3. Animation Strategy

Because the math is live, we can animate the _inputs_ ($\tau$) and the system automatically interpolates the _outputs_ (Color).

- **Continuous**: Changing `--alpha-hue` rotates the color wheel.
- **Discrete**: Switching Light/Dark mode snaps the tokens, but we transition the **Computed Properties** (`--_axm-computed-surface`) to create a smooth morph.

## The Solver (Build-Time)

The TypeScript solver (`src/lib/solver.ts`) handles the static parts of the system: **Lightness Anchors**.

1.  **Anchors**: It defines the "safe range" for Light and Dark modes.
2.  **Distribution**: It distributes surface lightness values (0-100) based on the configuration in `color-config.json`.
3.  **Output**: It generates `css/theme.css` containing the `light-dark()` tokens.

## Accessibility Implementation

### 1. High Contrast (Gain $\gamma$)

We support High Contrast preferences via the **Gain** variable.
Instead of a separate build, we use a media query to swap the input tokens for higher-contrast versions.

```css
@media (prefers-contrast: more) {
  .text-subtle {
    --_axm-text-lightness-source: var(--axm-text-subtle-hc-token);
  }
}
```

### 2. Forced Colors (X-Ray Mode $\sigma$)

When `forced-colors: active` is detected (Windows HCM), the system switches to **X-Ray Mode**.

- **Rich Mode**: Surfaces have background colors.
- **X-Ray Mode**: Surfaces become transparent and gain a **Structure** (Border).

This is handled via the `--alpha-structure` variable, which maps the "Atmosphere" (Brand Color) to a "Structure" (Border Color) automatically.

## Build Commands

- **`pnpm solve`**: Runs the solver and regenerates `css/theme.css`.
- **`pnpm build:css`**: Bundles the CSS using `lightningcss` (via `scripts/build-css.ts`).
