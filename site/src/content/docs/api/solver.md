---
title: Solver API
---

The Solver API contains the core logic for calculating accessible colors. It is "Universal", meaning it can be used in Node.js (for build scripts) or in the browser (for dynamic theme builders).

## `solve`

The main entry point. Calculates the lightness values for all surfaces based on the configuration.

```typescript
import { solve } from "color-system";

const result = solve({
  anchors: { ... }, // PolarityAnchors
  groups: [ ... ]   // SurfaceGroup[]
});

console.log(result.backgrounds); // Map<string, { light: number, dark: number }>
console.log(result.surfaces);    // SurfaceConfig[] (with computed values)
```

### Parameters

- **`config`**: A `SolverConfig` object containing:
  - `anchors`: The start/end lightness values for each polarity and mode.
  - `groups`: The list of surfaces to solve for.

### Return Value

Returns an object containing:

- **`backgrounds`**: A Map where the key is the surface slug (e.g., "card") and the value is an object with `light` and `dark` lightness numbers (0-1).
- **`surfaces`**: The original surface configurations, enriched with computed text colors.

## `getKeyColorStats`

Analyzes a set of key colors to determine their average lightness, chroma, and hue. Useful for aligning the theme to a brand color.

```typescript
import { getKeyColorStats } from "color-system";

const stats = getKeyColorStats({
  primary: "#3b82f6",
  secondary: "#10b981",
});

console.log(stats);
// { lightness: 0.5, chroma: 0.15, hue: 200 }
```