---
title: Generator API
---

The Generator API is used to create the CSS strings that power your theme. This is typically used in a build script or a server-side process.

## `generateTokensCss`

Generates the CSS variables for all surfaces and their states.

```typescript
import { generateTokensCss } from "color-system/generator";

const css = generateTokensCss(
  groups, // SurfaceGroup[]
  backgrounds, // Map<string, Record<Mode, number>> (from solver)
  hueShiftConfig, // Optional: HueShiftConfig
  borderTargets, // Optional: BorderTargets
  selector // Optional: Prefix selector (e.g. ".theme-dark")
);
```

### Parameters

- **`groups`**: The configuration of your surfaces (names, polarities, states).
- **`backgrounds`**: The solved lightness values for each surface (output from `solve()`).
- **`hueShiftConfig`**: Configuration for hue shifting (curve, max rotation).
- **`borderTargets`**: Target alpha values for borders.
- **`selector`**: An optional CSS selector to prefix all rules with.

### Output

Returns a string containing the CSS definitions.

```css
/* Example Output */
.surface-card {
  --surface-token: light-dark(oklch(0.98 0 0), oklch(0.2 0 0));
  --text-high-token: light-dark(oklch(0.1 0 0), oklch(0.9 0 0));
  /* ... */
}
```