# RFC-CHARTS: Reactive Data Visualization ("The Chart Algebra")

**Status**: Draft (standalone)  
**Date**: 2025-12-08 (original), 2026-01-05 (consolidated)  
**Source**: RFC001

## Executive Summary

**The Core Idea: "Smart" Colors instead of Static Colors.**

Currently, chart colors are hardcoded lists (like "Dark Red for Light Mode" and "Pastel Red for Dark Mode"). This breaks if you put a chart inside a dark card on a light page—the chart doesn't know it's on a dark surface, so it stays dark and becomes invisible.

**The Solution:**
Instead of defining the _final color_, we only define the **Identity** of the color (e.g., "Vibrant Red").

1. **Automatic Contrast**: When the chart renders, it looks at the background it is sitting on.
   - If the background is **Light**, the system automatically makes the Red **darker** so it's readable.
   - If the background is **Dark**, the system automatically makes the Red **lighter** (pastel) so it pops.
2. **Works Everywhere**: Drop a chart anywhere—Light Mode, Dark Mode, or a Dark Card inside a Light Dashboard—and it will mathematically guarantee visibility.
3. **Fail-Safe**: If a user turns on "High Contrast Mode" (where colors are stripped away), the system automatically adds borders so the data is still readable without color.

---

## 1. The Problem

The current Data Visualization implementation (`--axm-chart-N`) operates outside the core **Grand Unified Algebra** of the Axiomatic Color System.

1. **Static Duality**: Chart colors are generated as static `light-dark()` pairs. They do not respect **Time (τ)** (nested inversion). A chart inside a dark card on a light page will render with "Light Mode" colors (dark), making it invisible or low-contrast.

2. **Context Blindness**: Charts ignore **Atmosphere (α)**. A "Warm" dashboard should ideally have warmer chart colors, or at least chart colors that harmonize with the warmth. Currently, they are absolute.

3. **Accessibility Gaps**:
   - **Gain (γ)**: No support for `prefers-contrast: more`
   - **System (σ)**: No strategy for Windows High Contrast Mode (X-Ray), where background colors are stripped

---

## 2. The Goal

Bring Data Visualization into the **Reactive Pipeline**, ensuring charts are:

1. **Context-Aware**: Legible on _any_ surface (Light, Dark, or Nested)
2. **Adaptive**: Responding to user preferences for contrast and forced colors
3. **Harmonious**: Mathematically tuned to the current theme's atmosphere

---

## 3. The Proposed Algebra

Extend the State Tuple Σ to govern Chart Colors.

### 3.1. Time (τ) and Lightness

Instead of static tokens, chart colors should be calculated relative to the **Local Surface Lightness**.

$$L_{chart} = f(L_{surface}, \tau)$$

**The Logic:**

- In a **Light Context** (τ=1), chart colors must be darker to pass APCA contrast against the white background.
- In a **Dark Context** (τ=-1), chart colors must be lighter (pastel) to pass APCA contrast against the dark background.

**Implementation:**
Use the same "Late-Binding" technique used for text:

1. Define a base hue/chroma for each chart step
2. Calculate the final color using `oklch(from ...)` based on the current `--axm-surface-token` lightness

### 3.2. Atmosphere (α) and Harmonization

Charts usually need to be distinct (high chroma), but they can still participate in the atmosphere.

**Proposal: Vibrancy Injection**

Instead of shifting hues (which risks merging categories or creating muddy colors), allow the **Atmosphere Vibrancy** (β) to influence the chart chroma.

$$C_{chart(i)} = C_{base(i)} + (\beta \times k)$$

This ensures that in a "Vibrant" theme (high β), the charts become slightly more vivid to match the energy. In a "Muted" theme (low β), they remain standard.

### 3.3. System (σ) and X-Ray Mode

In **Forced Colors Mode**, we cannot rely on hue.

**Strategy:**

1. **Borders**: All chart elements must have a transparent border in Rich Mode that becomes opaque in X-Ray Mode:

   ```css
   border: 1px solid transparent; /* Rich Mode */
   border-color: ButtonText; /* Forced Colors Override */
   ```

2. **Patterns (Future)**: Map colors to SVG patterns (stripes, dots) for true color-blind/X-Ray support.

---

## 4. Implementation Plan

### Phase 1: The Reactive Token

Refactor the generator to produce "Raw" chart data (Hue/Chroma) separate from "Resolved" colors.

**New CSS Variables:**

```css
:root {
  /* The Definition (Constant) */
  --chart-1-h: 25;
  --chart-1-c: 0.15;
}

/* The Resolution (Dynamic) */
.chart-color-1 {
  /* Calculate Target Lightness based on Surface */
  --_l-target: calc(0.6 + (0.2 * var(--tau)));

  background-color: oklch(var(--_l-target) var(--chart-1-c) var(--chart-1-h));
}
```

### Phase 2: The Generator Update

Update `src/lib/generator.ts` to:

1. Accept a `chart` configuration (hues)
2. Generate the raw H/C variables
3. Generate the utility classes that perform the `oklch` calculation

### Phase 3: Component Update

Update `DataVizDemo` and any consumer components to use the new utility classes or reactive variables instead of static tokens.

---

## Implementation Status

**Current State (2026-01-05)**: Charts use **static `--axm-chart-N` tokens** that resolve to fixed colors in light/dark modes.

| Feature                 | Status             | Notes                                          |
| :---------------------- | :----------------- | :--------------------------------------------- |
| Static chart colors     | ✅ Implemented     | `--axm-chart-1` through `--axm-chart-10`       |
| Light/dark mode support | ✅ Implemented     | Colors work in both modes                      |
| Nested inversion        | ❌ Not implemented | Charts don't respect dark cards on light pages |
| Reactive H/C tokens     | ❌ Not implemented | Proposed in this RFC                           |
| Pattern fallbacks       | ❌ Not implemented | Future work                                    |

---

## Epoch Alignment

**Alpha Readiness**: The current static `--axm-chart-N` tokens are **sufficient for alpha**.

- Charts work correctly in light/dark mode at the page level
- This is "good enough" for demos and documentation

**Known Limitation (Alpha)**: Charts do not respect nested inversion (e.g., a chart inside a dark card on a light page will use light-mode chart colors). This should be **documented as a known limitation** for alpha.

**Future Work**: This RFC will be prioritized **post-alpha** based on user feedback about chart use cases. If users need reactive chart colors, we can implement Phases 1-3 in Epoch 47+.

---

## 5. Open Questions

1. **Contrast vs. Vibrancy**: How much Chroma can we afford while maintaining APCA contrast?
2. **Categorical Separation**: Does shifting hues based on Atmosphere risk merging two distinct categories (e.g., making Red and Orange too similar)?
3. **Pattern Generation**: Should the system generate SVG patterns automatically?

---

## Related RFCs

- **RFC-CONSUMER-CONTRACT**: Charts must follow the same token-driven contract
- **RFC-INTEGRATION**: Chart libraries may need adapter patterns
- **RFC-TOKENS**: Chart primitives (H/C values) would be exported in the three-tier structure
- **RFC-AUDITING**: Chart colors must pass continuity and provenance audits
