# Walkthrough: Config State & Live Preview

## Overview

This phase connected the Theme Builder UI to a real, reactive configuration state. This allows users to modify the theme parameters (anchors, key colors, surface overrides) and see the results instantly in the browser.

## Key Changes

### 1. Package Refactoring (`@axiomatic-design/color`)

To support running the solver and generator in the browser, we refactored the core package:

- **`src/lib/solver.ts`**: Extracted the core solving logic from `index.ts` to avoid circular dependencies.
- **`src/lib/runtime.ts`**: Now exports `generateTheme` and `injectTheme` for browser usage.
- **`src/lib/index.ts`**: Exports everything, including the new `solver` and `runtime` modules.

### 2. `ConfigState` (Svelte 5 Rune)

We implemented `site/src/lib/state/ConfigState.svelte.ts` as the central store for the theme configuration.

- **Reactive Config**: Uses `$state` to track the `SolverConfig`.
- **Live Generation**: Uses `$derived` to automatically re-run `generateTheme` whenever the config changes.
- **Persistence**: Saves/loads config from `localStorage`.

### 3. Live Style Injection

We created `site/src/components/StyleInjector.svelte` which subscribes to `ConfigState.css` and injects the generated CSS into the document head using `injectTheme`. This ensures the entire app (including the Builder UI itself) reflects the current theme.

### 4. Inspector Binding

We updated the Inspector components to bind directly to `ConfigState`:

- **`GlobalInspector`**: Controls Page Anchors (Light/Dark Start/End) and Key Colors.
- **`SurfaceInspector`**: Controls Surface Overrides (Contrast Offset) and displays solved L\* values.

## Verification

- **Live Updates**: Dragging a slider in the Global Inspector instantly updates the theme colors.
- **Surface Overrides**: Selecting a surface and adjusting its contrast offset updates only that surface (and its children/states).
- **Persistence**: Reloading the page restores the custom configuration.
