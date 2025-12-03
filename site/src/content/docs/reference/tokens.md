---
title: Token Reference
---

The system generates a set of CSS variables (tokens) that you can use in your application.

## Surface Tokens

These tokens are scoped to the surface class (e.g., `.surface-card`). They change value depending on the surface they are inside.

| Token                       | Description                                                     |
| :-------------------------- | :-------------------------------------------------------------- |
| `--axm-surface-token`       | The background color of the current surface.                    |
| `--axm-text-high-token`     | High-contrast text color (e.g., Black on Light, White on Dark). |
| `--axm-text-subtle-token`   | Lower-contrast text color for secondary information.            |
| `--axm-text-subtlest-token` | Lowest-contrast text color for placeholders or disabled text.   |
| `--axm-border-dec-token`    | Decorative border color (low contrast).                         |
| `--axm-border-int-token`    | Interactive border color (higher contrast).                     |

### Usage

```css
.my-component {
  background: var(--axm-surface-token);
  color: var(--axm-text-high-token);
  border: 1px solid var(--axm-border-dec-token);
}
```

## Utility Classes

These utility classes provide a semantic layer over the raw tokens. By using them, you decouple your components from specific variable names and ensure that design patterns—like how a surface border behaves or how a focus ring appears—are applied consistently across your application.

| Class                 | Description                                      |
| :-------------------- | :----------------------------------------------- |
| `.bg-surface`         | Sets `background-color` to the surface token.    |
| `.border-surface`     | Sets `border-color` to the surface token.        |
| `.stroke-surface`     | Sets SVG `stroke` to the surface token.          |
| `.fill-subtlest`      | Sets SVG `fill` to the subtlest text token.      |
| `.ring-focus-static`  | Applies a static focus ring.                     |
| `.focus-visible-ring` | Applies a focus ring only on `:focus-visible`.   |
| `.border-highlight`   | Sets `border-color` to the highlight ring color. |

### Composition

You can compose surface classes with hue utilities to create colored surfaces.

```html
<!-- A button with the highlight color -->
<button class="surface-action hue-highlight">Click Me</button>
```

## Global Tokens

These tokens are defined on `:root` and are available everywhere.

### Elevation (Shadows)

| Token             | Description                                   |
| :---------------- | :-------------------------------------------- |
| `--axm-shadow-sm` | Small shadow for subtle depth.                |
| `--axm-shadow-md` | Medium shadow for cards and dropdowns.        |
| `--axm-shadow-lg` | Large shadow for modals and floating actions. |
| `--axm-shadow-xl` | Extra large shadow for major overlays.        |

### Focus

| Token                    | Description                                 |
| :----------------------- | :------------------------------------------ |
| `--axm-focus-ring-color` | The brand-aware color used for focus rings. |

### Data Visualization

If you have configured a palette in `color-config.json`, these tokens will be available.

| Token           | Description                             |
| :-------------- | :-------------------------------------- |
| `--axm-chart-1` | First color in the categorical palette. |
| `--axm-chart-2` | Second color...                         |
| ...             | ...                                     |
| `--axm-chart-N` | Nth color.                              |

## Internal Tokens

You may see these tokens in the generated CSS, but they are generally intended for internal use by the engine.

- `--axm-chroma-brand`: The base chroma value derived from your key colors.
- `--axm-hue-brand`: The base hue value derived from your key colors.
