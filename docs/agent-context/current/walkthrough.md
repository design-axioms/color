# Walkthrough - Epoch 15: Concept-to-Code Bridge (Phase 1)

## Overview
In this phase, we implemented the **Inline Token Inspector**, a tool that bridges the gap between abstract concepts (Surfaces) and implementation details (CSS Variables). This allows users to click on surfaces in the documentation diagrams and see exactly which tokens are active and what their resolved values are.

## Key Changes

### 1. Token Inspector Components
We created a set of Svelte 5 components in `site/src/components/inspector/`:

- **`TokenInspector.svelte`**: The main container that manages the selection state using Svelte Context. It renders the `InspectorPanel` when an element is selected.
- **`InspectorSurface.svelte`**: A wrapper component that makes any element interactive. It handles click events and registers the element with the inspector. It supports all standard HTML attributes and props.
- **`InspectorPanel.svelte`**: The UI that displays the tokens. It uses `getComputedStyle` to fetch the resolved values of key system tokens (Surface, Text, Border) and groups them logically.

### 2. Integration with Documentation
We integrated the inspector into the "Thinking in Surfaces" guide (`thinking-in-surfaces.mdx`).

- We wrapped the existing `ContextVisualizer` with `<TokenInspector client:load>`.
- We updated `ContextVisualizer.svelte` to use `InspectorSurface` internally, making the "Page", "Card", and "Spotlight" elements interactive.
- We added a helper text to guide users to click on the surfaces.

### 3. Visual Refinement
The `InspectorPanel` was designed to look like a mini DevTools panel:
- **Grouped Tokens**: Tokens are organized into "Surface", "Text", and "Border & UI" categories.
- **Color Previews**: Each color token shows a small swatch of the resolved color.
- **Responsive**: The panel slides up from the bottom and is scrollable if content overflows.

## Verification
- **Static Analysis**: Ran `astro check` to ensure type safety and component correctness.
- **Design Review**: The panel uses system tokens (`--surface-token`, `--text-subtle-token`) ensuring it adapts to Light/Dark mode automatically.
