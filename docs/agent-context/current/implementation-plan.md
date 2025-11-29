# Implementation Plan - Epoch 12: Framework Migration (Phase 2)

## Goal

Port stateless visualization components used in documentation to Svelte 5 to validate the component architecture and reduce Preact usage.

## Strategy

- **Pure Components**: Port components as "pure" Svelte components that accept data via props (`$props()`).
- **Context Isolation**: Avoid porting the complex `ThemeContext` to Svelte stores in this phase. Instead, pass the necessary theme data (colors, config) from the parent Astro/MDX context or existing React wrappers into the Svelte components.
- **Direct Import**: Update MDX files to import Svelte components directly where possible.

## Proposed Changes

### 1. Visualization Components

- [ ] Port `ContextVisualizer` to `site/src/components/ContextVisualizer.svelte`.
  - *Note*: Currently uses `ThemeContext`. Will need to accept `theme` or `surfaces` as props.
- [ ] Port `DynamicRange` to `site/src/components/DynamicRange.svelte`.
- [ ] Port `HueShiftVisualizer` to `site/src/components/HueShiftVisualizer.svelte`.
- [ ] Port `DataVizDemo` to `site/src/components/DataVizDemo.svelte`.

### 2. Wrapper Components

- [ ] Port `Diagram` to `site/src/components/Diagram.svelte`.

### 3. Integration

- [ ] Update MDX files to import the new Svelte components.
- [ ] Verify that `SystemDemo` (React) or other wrappers can pass data to these Svelte components if they are nested.

### 4. Verification

- [ ] Check "Thinking in Surfaces" page (`docs/concepts/thinking-in-surfaces`).
- [ ] Check "Hue Shifting" page (`docs/design/hue-shift`).
- [ ] Check "Data Visualization" page (`docs/usage/data-viz`).
