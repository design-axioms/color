# Phase Walkthrough: Tailwind Integration & Visual Fixes

## Summary

This phase focused on expanding the ecosystem reach of the Color System by adding a **Tailwind CSS** exporter. During verification, a significant visual regression was discovered regarding "Action Surfaces" (Brand buttons), which led to a deep dive into the CSS Engine's property registration and fallback mechanisms.

## 1. Tailwind CSS Integration

We implemented a new exporter that generates a Tailwind CSS preset. This allows developers to use the Color System's semantic tokens directly within Tailwind utility classes.

### Key Implementation Details

- **File**: `src/lib/exporters/tailwind.ts`
- **Strategy**:
  - **Surfaces**: Mapped to `light-dark()` values to ensure they adapt automatically to the system's mode (Light/Dark).
  - **Text**: Mapped to CSS variables (e.g., `var(--text-high-token)`) to preserve the system's context-awareness. Tailwind classes like `text-high` will now adapt based on the background surface they are placed on.
- **CLI**: Updated `color-system export` to accept `--format tailwind`.

## 2. The "Black Button" Fix (CSS Engine Architecture)

While reviewing the documentation site, we noticed that "Action Surfaces" (buttons using the Brand hue) were rendering as black or near-black in many contexts.

### The Problem

The system's solver prioritizes contrast. When `surface-action` was set to `inverted` polarity (to be light on dark or dark on light), the solver calculated a very dark lightness for the Brand hue to maintain contrast, effectively washing out the color.

### The Solution: Override Architecture

We introduced a mechanism to allow specific surfaces to "break the rules" and enforce a specific lightness (e.g., the Brand color's native lightness) while still participating in the system's structure.

1.  **Configuration**: Changed `surface-action` to `inverted` polarity and added `surface-action-soft`.
2.  **Engine Update**: Added support for `--override-surface-lightness` in `engine.css`.
3.  **The `@property` Trap**: We initially defined the override property using `@property` for type safety. However, we discovered that **registered properties always have an initial value**, which breaks the `var(--override, --fallback)` pattern. The fallback is never triggered because the property is never "missing".
4.  **Resolution**: We explicitly **unregistered** (removed) the `@property` definition for `--override-surface-lightness`. This restores the standard CSS variable behavior, allowing the fallback to the calculated lightness to work correctly when no override is present.

## Next Steps

With the ecosystem integrations (DTCG, Tailwind) complete and the visual engine stabilized, we are ready to move to **Epoch 10: Phase 3**, focusing on Developer Experience (DX) improvements, specifically generating a JSON Schema for the configuration file.
