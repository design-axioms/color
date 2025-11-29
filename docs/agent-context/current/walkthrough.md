# Phase 4: Theme Builder Migration Walkthrough

## Overview

In this phase, we successfully migrated the core `ThemeBuilder` application from React (Preact) to Svelte 5. This involved rewriting the main container and all sub-editors (`AnchorsEditor`, `KeyColorsEditor`, `HueShiftEditor`, `SurfaceManager`) to use the new `ConfigState` and `ThemeState` classes established in Phase 3.

## Key Components Migrated

### 1. `ThemeBuilder.svelte`

The main container that orchestrates the layout. It sets up the sidebar for editors and the main preview area.

- **Live Injection**: We implemented a `$effect` that calls `generateTheme` and `injectTheme` whenever the `config` changes. This ensures the preview area always reflects the current configuration in real-time.
- **Scoped Injection**: The generated CSS is scoped to `#theme-builder-preview` to prevent it from affecting the editor UI itself.

### 2. `AnchorsEditor.svelte` & `DualRangeSlider.svelte`

- Migrated the complex dual-thumb slider logic to Svelte 5.
- Implemented `getFailingSurfaces` logic using `contrastForPair` (APCA) to warn users about accessibility issues.
- Added `LightnessScale.svelte` visualization.

### 3. `SurfaceManager.svelte`

- Migrated the CRUD interface for managing surface groups and surfaces.
- Implemented `SurfaceRow.svelte` with expandable details for editing surface properties.
- Integrated `ContrastBadge.svelte` to show real-time contrast scores.

### 4. `KeyColorsEditor.svelte` & `HueShiftEditor.svelte`

- Straightforward migration of form controls binding directly to `configState` methods.

## Integration

We created a `BuilderWrapper.svelte` to wrap the `ThemeBuilder` with the `StateProvider`. This wrapper was then imported into `site/src/content/docs/builder.mdx` with `client:only="svelte"`, replacing the old React version.

## Challenges & Solutions

- **Type Safety**: We encountered some linting issues with `Theme` type imports in `ConfigState`, which were resolved by ensuring correct imports and return types.
- **Live Injection**: We had to ensure the `injectTheme` function was called correctly within a Svelte `$effect` to handle updates and cleanup properly.
- **Infinite Loop**: We encountered an infinite loop where `injectTheme` was triggering re-renders. This was fixed by ensuring the effect dependencies were stable and passing correct arguments.
- **State Mutation**: We encountered a `state_unsafe_mutation` error because the `solve()` function mutated the reactive config object. We fixed this by passing a deep clone of the config to `solve()`.

## Conclusion

The `ThemeBuilder` is now fully functional in Svelte 5, offering:

- **Better Performance**: Fine-grained reactivity via Runes.
- **Cleaner Code**: Simplified state management without complex Context providers.
- **Live Preview**: Instant feedback on theme changes.
- **Drag and Drop**: Full support for reordering groups and surfaces.

The system is now ready for further enhancements and more advanced visualizations.

## Fresh Eyes Cleanup

After the main migration, we performed a "Fresh Eyes" review and identified a "split-brain" architecture where documentation demos were still using legacy React wrappers (`SystemDemo`) while the Builder used Svelte.

We unified the architecture by:
1.  **Creating `DemoWrapper.svelte`**: A Svelte replacement for `SystemDemo` that uses `StateProvider` to inject the same context as the Builder.
2.  **Migrating MDX**: Updated all documentation pages (`physics-of-light.mdx`, `data-viz.mdx`, etc.) to use `DemoWrapper` and Svelte components (`Diagram.svelte`, `ContextVisualizer.svelte`).
3.  **Deleting Legacy Code**: Removed `SystemDemo.tsx`, `ConfigContext.tsx`, `ThemeContext.tsx`, and unused React components (`Cluster.tsx`, `Stack.tsx`, etc.).

This ensures a consistent, single-source-of-truth state management system across the entire site.
