# Demo Strategy Rethink

## The Pivot

We are moving away from "hacking" visual effects and towards **proving the system's architecture**. The demos must rely _exclusively_ on the system's public API (tokens, global theme, CSS variables) and avoid any inline style overrides or hardcoded colors.

## Core Rules (Refined)

1.  **Zero Hardcoded Colors**: No `#hex` or `rgb()` in component styles.
2.  **Public Tokens Only**: Use `--surface-token`, `--text-token`, etc. via standard classes (`.surface-card`, `.surface-action`).
3.  **Global Theme Truth**: No local "dark mode" switches. The demo respects the app's global `color-scheme`.
4.  **No Hacks**: If the system can't do it via standard tokens/variables, we don't fake it.

## The New Demos

### 1. The Intent Playground (Refactored)

**Goal**: Demonstrate how high-level intent concepts map directly to system classes, without manual style tweaking.

- **Mechanism**:
  - **Hue Control**: Toggles `.hue-brand`, `.hue-success`, `.hue-warning`, `.hue-error`.
  - **Elevation Control**: Toggles `.surface-workspace` (Sunken), `.surface-page` (Base), `.surface-card` (Raised).
  - **Prominence Control**: Toggles `.text-subtle`, `.text-strong` for content.
  - **The Lesson**: "You describe the _what_ (Intent), the system handles the _how_ (Implementation)."
  - **Dark Mode**: Works automatically because the classes use standard tokens.

### 2. The Fearless Injector (Refactored: "The Live Solver")

**Goal**: Demonstrate that for _arbitrary_ brand colors (which might break contrast if just hue-shifted), the **Solver** can generate a valid, accessible theme on the fly.

- **Mechanism**:
  - User picks a brand color.
  - We do **NOT** set inline styles.
  - Instead, we run the **TypeScript Solver** (the same engine used at build time) in the browser.
  - The Solver generates a **CSS Token Block** (string of CSS variables).
  - We inject this block into a `<style>` tag (or a scoped wrapper).
  - **The Lesson**: "The System is not just a static file; it's a living engine that guarantees accessibility for _any_ brand."

### 3. Context Portal -> [DEPRECATED]

- Removed as per feedback.

## Implementation Plan Changes

- **Delete**: `ContextPortal.tsx` and related references.
- **Refactor**: `IntentPlayground.tsx` to use `--base-hue` / `--base-chroma`.
- **Refactor**: `FearlessInjector.tsx` to use `generateTokens(brandColor)` -> inject CSS.
- **Cleanup**: Remove all inline `style={{ ... }}` overrides in demos.

## Verification

- Switch Global Theme -> Demos must adapt instantly.
- Inspect Element -> Should see standard classes (`.surface-card`) and standard variables, no inline hex codes.
