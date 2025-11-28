# Implementation Plan: Phase 4 (Unification)

## Overview

We are merging the standalone `demo` application (Theme Builder) into the main documentation site (`site`). This will create a unified experience where users can learn about the system and then immediately build a theme in the same interface.

## Strategy

1.  **Lift and Shift**: Move the React components from `demo/src` to `site/src`.
2.  **Hydration**: Use Astro's `client:only="react"` directive to render the Theme Builder, as it relies heavily on browser APIs (`localStorage`, `window.matchMedia`).
3.  **Context Sharing**: Ensure the `ThemeContext` used by the docs (for live demos) is compatible with or the same as the one used by the Builder.

## Risks

- **CSS Conflicts**: The `demo` app uses global CSS that might conflict with Starlight's styles.
- **Routing**: The `demo` app uses Hash Routing. We need to decide if we keep that or switch to standard URL routing within Astro.
