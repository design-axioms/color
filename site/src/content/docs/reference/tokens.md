---
title: Token Reference
---

The system generates a set of CSS variables (tokens) that you can use in your application.

## Surface Tokens

These tokens are scoped to the surface class (e.g., `.surface-card`). They change value depending on the surface they are inside.

| Token | Description |
| :--- | :--- |
| `--surface-token` | The background color of the current surface. |
| `--text-high-token` | High-contrast text color (e.g., Black on Light, White on Dark). |
| `--text-subtle-token` | Lower-contrast text color for secondary information. |
| `--text-subtlest-token` | Lowest-contrast text color for placeholders or disabled text. |
| `--border-dec-token` | Decorative border color (low contrast). |
| `--border-int-token` | Interactive border color (higher contrast). |

### Usage

```css
.my-component {
  background: var(--surface-token);
  color: var(--text-high-token);
  border: 1px solid var(--border-dec-token);
}
```

## Global Tokens

These tokens are defined on `:root` and are available everywhere.

### Elevation (Shadows)

| Token | Description |
| :--- | :--- |
| `--shadow-sm` | Small shadow for subtle depth. |
| `--shadow-md` | Medium shadow for cards and dropdowns. |
| `--shadow-lg` | Large shadow for modals and floating actions. |
| `--shadow-xl` | Extra large shadow for major overlays. |

### Focus

| Token | Description |
| :--- | :--- |
| `--focus-ring-color` | The brand-aware color used for focus rings. |

### Data Visualization

If you have configured a palette in `color-config.json`, these tokens will be available.

| Token | Description |
| :--- | :--- |
| `--chart-1` | First color in the categorical palette. |
| `--chart-2` | Second color... |
| ... | ... |
| `--chart-N` | Nth color. |

## Internal Tokens

You may see these tokens in the generated CSS, but they are generally intended for internal use by the engine.

-   `--chroma-brand`: The base chroma value derived from your key colors.
-   `--hue-brand`: The base hue value derived from your key colors.
