# Documentation Structure Audit & Proposal

## Current State Analysis

The current structure is a direct port of the `mdbook` layout. While functional, it reflects the chronological development of the system rather than the optimal learning path for a new user.

### Issues Identified

1.  **Fragmented Core Concepts**: "Anchors" (a fundamental input) is hidden in "Deep Dive", while "The Solver" (the engine) is in "Core Concepts". This separates the *input* from the *process*.
2.  **Abstract Usage**: The "Usage" section mixes CLI tools ("CLI") with design patterns ("UI Primitives") and architecture ("CSS Architecture").
3.  **Buried Value**: "Hue Shifting", a key differentiator, is tucked away in "Deep Dive".
4.  **Redundant Intros**: We have `index.mdx` (Landing) and `introduction.md` (Chapter 1). These should likely be unified or distinct in purpose.

## Proposed "Fresh Eyes" Structure

We will reorganize the content into a "User Journey" flow: **Understand -> Setup -> Use -> Master**.

### 1. Welcome (The Hook)
*   **`index.mdx`**: The Landing Page. High-level value prop ("Math, not Magic"). Interactive "Hero" demo showing the solver in action.

### 2. The Mental Model (Understand)
*   **`concepts/thinking-in-surfaces`**: The paradigm shift. You don't pick colors; you pick surfaces. (Merges "Surfaces" and "Context").
*   **`concepts/physics-of-light`**: How the system works. Explains **Anchors** (the boundaries) and **Polarity** (Light/Dark modes). (Moves "Anchors" here).
*   **`concepts/accessibility-first`**: Why APCA? Why is contrast non-linear? (Simplified version of "Accessibility" + "APCA").

### 3. Getting Started (Setup)
*   **`guides/installation`**: CLI setup, `npm install`.
*   **`guides/theme-builder`**: A walkthrough of the visual editor. (New/Expanded).
*   **`guides/integration`**: Loading the CSS, setting up the `ThemeContext` in React/Astro/etc.

### 4. The Catalog (Use)
*   **`catalog/surfaces`**: Reference for `.surface-page`, `.surface-card`, etc.
*   **`catalog/actions`**: Reference for `.surface-action`, buttons, interactions.
*   **`catalog/typography`**: Text colors (`.text-strong`, `.text-subtle`).
*   **`catalog/data-viz`**: Chart palettes.

### 5. Advanced Topics (Master)
*   **`advanced/hue-shifting`**: The "Secret Sauce" of natural lighting.
*   **`advanced/custom-surfaces`**: How to define your own semantic roles.
*   **`advanced/solver-internals`**: How the binary search works.

### 6. Reference
*   **`reference/cli`**
*   **`reference/javascript-api`**
*   **`reference/tokens`**: List of all generated CSS variables.

## Action Plan

1.  **Restructure**: Update `astro.config.mjs` to reflect this new hierarchy.
2.  **Move & Rename**: Rename existing files to match the new slugs.
3.  **Rewrite**: Systematically go through each section and rewrite content to fit the new scope.
