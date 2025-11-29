# Walkthrough - Epoch 12: Framework Migration (Phase 2)

## Goal

The goal of this phase was to port the stateless visualization components used in the documentation from Preact to Svelte 5. This serves as a validation of the Svelte component architecture and reduces the reliance on Preact for simple, presentational components.

## Changes

### 1. Svelte Component Porting

We ported the following components to Svelte 5, using the new "Runes" syntax where applicable (though most were simple enough to be stateless or use basic props):

- **`ContextVisualizer.svelte`**: A static component demonstrating surface nesting and context inversion. It was ported as a pure HTML/CSS component.
- **`DynamicRange.svelte`**: Visualizes the "Rubber Band" effect of anchors. It uses a snippet (`#snippet rangeCard`) to reuse markup for Light and Dark modes, demonstrating Svelte 5's powerful composition features.
- **`HueShiftVisualizer.svelte`**: A placeholder component for the Hue Shift visualization. Ported as static HTML.
- **`DataVizDemo.svelte`**: Visualizes the generated chart palettes. It uses `{#each}` blocks to render swatches and charts based on CSS variables (`var(--chart-n)`).
- **`Diagram.svelte`**: A wrapper component that applies the `.not-content` class to prevent Starlight's prose styles from interfering with the visualizations. It uses `{@render children?.()}` to render passed content.

### 2. MDX Integration

We updated the following MDX files to import and use the new Svelte components directly:

- `docs/concepts/physics-of-light.mdx`: Switched to `DynamicRange.svelte` and `Diagram.svelte`.
- `docs/catalog/data-viz.mdx`: Switched to `DataVizDemo.svelte`.
- `docs/concepts/thinking-in-surfaces.mdx`: Switched to `ContextVisualizer.svelte` and `Diagram.svelte`.
- `docs/advanced/hue-shifting.mdx`: Switched to `HueShiftVisualizer.svelte` and `Diagram.svelte`.

### 3. Context Strategy

We adopted a "Pure Component" strategy for this phase. Instead of porting the complex React Context (`ThemeContext`, `ConfigContext`) to Svelte stores immediately, we ensured that these visualization components rely solely on:

1.  **CSS Variables**: The system's core engine (`engine.css`, `theme.css`) provides all the necessary styling hooks (`--surface-token`, `--chart-1`, etc.).
2.  **Props**: Where dynamic data is needed (like in `DynamicRange`), it is passed via props or derived internally.

This allowed us to decouple the visualizations from the React state management, making them lighter and easier to maintain.

## Verification

We verified the changes by running `pnpm docs:build`, which successfully compiled the Astro site with the new Svelte components. The build process confirmed that all imports are correct and the components are valid.
