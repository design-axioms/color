# Implementation Plan - Epoch 15: Concept-to-Code Bridge (Phase 1)

## Goal
Connect abstract concepts (Surfaces, Context) directly to implementation details within the documentation by creating an "Inline Token Inspector". This will allow users to inspect the exact CSS variables and values applied to surfaces in our diagrams.

## Context
In Epoch 13, we identified a gap between the high-level concepts (Surfaces, Context) and the low-level implementation (CSS Variables). Users understand *that* surfaces exist, but they struggle to know *which* variables to use in their code. This phase aims to bridge that gap.

## Proposed Solution
We will build a `TokenInspector` component that can be embedded in MDX. This component will:
1.  Render a visual representation of a surface (or set of surfaces).
2.  Allow users to click/hover on these surfaces.
3.  Display a "Inspector Panel" showing the computed CSS variables for that element (e.g., `--surface-token`, `--text-high-token`).
4.  Show the resolved values (e.g., `oklch(...)`) to demystify the system.

## Detailed Plan

### 1. Component Architecture
- **`TokenInspector.svelte`**: The main container.
- **`InspectorSurface.svelte`**: A wrapper for elements that can be inspected. It will register itself with the parent inspector.
- **`InspectorPanel.svelte`**: The UI that displays the tokens.

### 2. Implementation Steps
- [ ] **Scaffold Components**: Create the basic Svelte components in `site/src/components/inspector/`.
- [ ] **State Management**: Use Svelte 5 Runes to manage the "selected" surface state.
- [ ] **Token Extraction**: Implement logic to read `getComputedStyle` for relevant system tokens.
  - We need a list of "interesting" tokens to show (e.g., `bg`, `text`, `border`).
- [ ] **Visual Design**: Design the inspector panel to look like a mini DevTools or an overlay.
- [ ] **Integration**: Add the `TokenInspector` to `site/src/content/docs/concepts/thinking-in-surfaces.mdx`.

### 3. Verification
- Verify that clicking a surface updates the panel.
- Verify that the values change when switching themes (Light/Dark).
- Verify that it works within the Astro/Starlight environment.

## Questions for User
- Should the inspector be a floating overlay or a fixed panel next to the diagram?
- Which specific tokens are most important to show? (Just surface/text, or also borders/focus?)
