# Design: Theme Manager Inversion & The "Hard Flip"

**Status**: Draft
**Date**: 2025-12-03
**Context**: Addressing the "Soft Flip" leaky abstraction by leveraging `ThemeManager` to perform a "Hard Flip" (switching `color-scheme`) on specific surfaces.

## The Problem

Currently, "Inverted" surfaces (like `.surface-spotlight`) rely on a "Soft Flip": they manually override CSS variables to look dark in light mode (and vice versa).

This has two major downsides:

1.  **Leaky Abstraction**: `light-dark()` functions inside these surfaces resolve to the _global_ theme, not the _local_ visual context. This forces us to manually redefine every token for inverted surfaces.
2.  **Native UI Mismatch**: Scrollbars, form controls, and system colors (`Canvas`, `ButtonFace`) do not switch, leading to visual jarring (e.g., a light scrollbar on a dark card).

## The Solution: The "Hard Flip" (CSS-Only)

We want to apply `color-scheme: dark` (or light) to these surfaces. This forces the browser to treat the element as a true theme context.

### The Strategy: "Style Attribute Matching"

Since `ThemeManager` applies the theme by setting the `style="color-scheme: ..."` attribute on the root element (when not using classes), we can detect this state using CSS Attribute Selectors.

This avoids the need for:

1.  **JavaScript Observers**: No runtime overhead.
2.  **Extra Attributes**: No need to add `data-theme` if we can reliably read the `style` attribute.

### The Implementation

The CLI will generate the following CSS rules for every surface marked `polarity: "inverted"` (e.g., `.surface-spotlight`).

```css
/* ---------------------------------------------------------
   1. System Mode (Default)
   When the root has NO explicit color-scheme override,
   we rely on the OS preference.
   --------------------------------------------------------- */
@media (prefers-color-scheme: light) {
  :root:not([style*="color-scheme"]) .surface-spotlight {
    color-scheme: dark;
  }
}

@media (prefers-color-scheme: dark) {
  :root:not([style*="color-scheme"]) .surface-spotlight {
    color-scheme: light;
  }
}

/* ---------------------------------------------------------
   2. Forced Light Mode
   Detected via the style attribute set by ThemeManager.
   We match the string "color-scheme: light" within the style attribute.
   --------------------------------------------------------- */
:root[style*="color-scheme: light"] .surface-spotlight {
  color-scheme: dark;
}

/* ---------------------------------------------------------
   3. Forced Dark Mode
   Detected via the style attribute set by ThemeManager.
   We match the string "color-scheme: dark" within the style attribute.
   --------------------------------------------------------- */
:root[style*="color-scheme: dark"] .surface-spotlight {
  color-scheme: light;
}
```

### Why this works

1.  **Native `light-dark()` Support**: By setting `color-scheme: dark` on `.surface-spotlight`, any `light-dark()` color used inside it will automatically resolve to the dark variant.
2.  **Zero JS Runtime**: The browser's style engine handles the propagation.
3.  **Robustness**: While relying on `style` attribute string matching is unconventional ("funny"), the serialization of `style.setProperty('color-scheme', '...')` is well-specified in the CSSOM (typically `property: value;`). As long as `ThemeManager` is the primary writer of this property, it is safe.

## Architecture Updates

### 1. CLI (`src/cli/`)

- Update the CSS generator to emit the "Hard Flip" rules for all inverted surfaces.
- It needs to know which surfaces are inverted (already in `color-config.json`).

### 2. Runtime (`ThemeManager`)

- **No changes required** to the logic, _provided_ it continues to use `style.setProperty("color-scheme", ...)` or `style="color-scheme: ..."` consistently.
- We might want to ensure it uses `setAttribute("style", ...)` to be 100% deterministic about the string format, preventing other libraries from re-ordering the style string and breaking our selector.

## Documentation Updates

1.  **`concepts/thinking-in-surfaces.mdx`**:
    - Explain that Inverted Surfaces now create a true "System Theme Context" (Hard Flip).
    - Native controls (scrollbars, checkboxes) will now render correctly inside spotlights.

2.  **`guides/integration.md`**:
    - Note that this feature relies on the standard `color-scheme` property.

## Implementation Plan

1.  **CLI**: Update `src/cli/index.ts` (or the relevant generator) to emit the new CSS rules.
2.  **Verify**: Test with `ThemeManager` to ensure the attribute selector matches the serialized style string.
