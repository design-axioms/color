# Implementation Plan - Epoch 12: Framework Migration (Phase 4)

**Goal**: Migrate the `ThemeBuilder` and its sub-components to Svelte 5, leveraging the `ConfigState` and `ThemeState` classes established in Phase 3.

## 1. Component Migration Strategy

We will migrate components bottom-up where possible, but the `ThemeBuilder` container itself might need to be established early to provide the layout context.

### Target Components

- **`ThemeBuilder.svelte`**: The main container. Will consume `configState` and `themeState`.
- **`AnchorsEditor.svelte`**: Controls for Anchor points.
- **`HueShiftEditor.svelte`**: Controls for Hue Shifting algorithm.
- **`KeyColorsEditor.svelte`**: Controls for Key Colors.
- **`SurfaceManager.svelte`**: CRUD interface for Surfaces.
- **`LiveThemeInjector.svelte`**: (Optional) Might be replaced by a `$effect` in `ThemeBuilder` or `ThemeState`.

## 2. State Integration

- **Read**: Components will read directly from `configState.config` (e.g., `configState.config.anchors`).
- **Write**: Components will call methods on `configState` (e.g., `configState.updateAnchor(...)`).
- **Reactivity**: Since `configState.config` is a `$state` proxy, fine-grained reactivity should work out of the box.

## 3. Layout & Styling

- Reuse `Stack.svelte` and `Cluster.svelte` primitives.
- Migrate `ThemeBuilder.css` to scoped `<style>` blocks where appropriate, or keep as a shared CSS file if it's used by multiple components (though Svelte prefers scoped styles).
- Ensure mobile responsiveness is preserved.

## 4. Execution Steps

1.  **`ThemeBuilder` Shell**: Create the main `ThemeBuilder.svelte` shell that sets up the layout and imports the (yet to be migrated) or placeholder components.
2.  **`AnchorsEditor`**: Migrate the sliders. This is a good test for the `DualRangeSlider` (which needs to be migrated or wrapped).
    - *Note*: We need to check if `DualRangeSlider` is a custom component or a library.
3.  **`KeyColorsEditor`**: Migrate the color pickers.
4.  **`HueShiftEditor`**: Migrate the hue shift controls.
5.  **`SurfaceManager`**: Migrate the complex CRUD logic.
6.  **Integration**: Replace the React `ThemeBuilder` in `site/src/content/docs/builder.mdx` with the new Svelte version.

## 5. Risks & Unknowns

- **`DualRangeSlider`**: If this is a React component, it needs to be rewritten in Svelte.
- **Drag and Drop**: `SurfaceManager` likely uses drag-and-drop. We need to see what library (if any) is used and find a Svelte equivalent or use native HTML5 DnD.
