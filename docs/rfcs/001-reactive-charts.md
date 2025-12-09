# RFC: Reactive Data Visualization (The "Chart Algebra")

- **Status**: Draft
- **Date**: 2025-12-08
- **Author**: GitHub Copilot

## Executive Summary

**The Core Idea: "Smart" Colors instead of Static Colors.**

Currently, our chart colors are hardcoded lists (like "Dark Red for Light Mode" and "Pastel Red for Dark Mode"). This breaks if you put a chart inside a dark card on a light page—the chart doesn't know it's on a dark surface, so it stays dark and becomes invisible.

**The Solution:**
Instead of defining the _final color_, we only define the **Identity** of the color (e.g., "Vibrant Red").

1.  **Automatic Contrast**: When the chart renders, it looks at the background it is sitting on.
    - If the background is **Light**, the system automatically makes the Red **darker** so it's readable.
    - If the background is **Dark**, the system automatically makes the Red **lighter** (pastel) so it pops.
2.  **Works Everywhere**: This means you can drop a chart anywhere—Light Mode, Dark Mode, or a Dark Card inside a Light Dashboard—and it will mathematically guarantee it is visible.
3.  **Fail-Safe**: If a user turns on "High Contrast Mode" (where colors are stripped away), the system automatically adds borders to the chart bars so the data is still readable without color.

## 1. The Problem

The current Data Visualization implementation (`--axm-chart-N`) operates outside the core **Grand Unified Algebra** of the Axiomatic Color System.

1.  **Static Duality**: Chart colors are generated as static `light-dark()` pairs. They do not respect **Time ($\tau$)** (nested inversion). A chart inside a dark card on a light page will render with "Light Mode" colors (dark), making it invisible or low-contrast.
2.  **Context Blindness**: Charts ignore **Atmosphere ($\alpha$)**. A "Warm" dashboard should ideally have warmer chart colors, or at least chart colors that harmonize with the warmth. Currently, they are absolute.
3.  **Accessibility Gaps**:
    - **Gain ($\gamma$)**: No support for `prefers-contrast: more`.
    - **System ($\sigma$)**: No strategy for Windows High Contrast Mode (X-Ray), where background colors are stripped.

## 2. The Goal

To bring Data Visualization into the **Reactive Pipeline**, ensuring charts are:

1.  **Context-Aware**: Legible on _any_ surface (Light, Dark, or Nested).
2.  **Adaptive**: Responding to user preferences for contrast and forced colors.
3.  **Harmonious**: mathematically tuned to the current theme's atmosphere.

## 3. The Proposed Algebra

We propose extending the State Tuple $\Sigma$ to govern Chart Colors.

### 3.1. Time ($\tau$) and Lightness

Instead of static tokens, chart colors should be calculated relative to the **Local Surface Lightness**.

$$ L*{chart} = f(L*{surface}, \tau) $$

**The Logic:**

- In a **Light Context** ($\tau=1$), chart colors must be darker (lower $L$) to pass APCA contrast against the white background.
- In a **Dark Context** ($\tau=-1$), chart colors must be lighter (higher $L$) to pass APCA contrast against the dark background.

**Implementation:**
We can use the same "Late-Binding" technique used for text.

1.  Define a base hue/chroma for each chart step.
2.  Calculate the final color using `oklch(from ...)` based on the current `--axm-surface-token` lightness.

### 3.2. Atmosphere ($\alpha$) and Harmonization

Charts usually need to be distinct (high chroma), but they can still participate in the atmosphere.

**Proposal: Vibrancy Injection**
Instead of shifting hues (which risks merging categories or creating muddy colors), we allow the **Atmosphere Vibrancy** ($\beta$) to influence the chart chroma.

$$ C*{chart(i)} = C*{base(i)} + (\beta \times k) $$

This ensures that in a "Vibrant" theme (high $\beta$), the charts become slightly more vivid to match the energy. In a "Muted" theme (low $\beta$), they remain standard. This is a safer and more harmonious approach than hue rotation.

### 3.3. System ($\sigma$) and X-Ray Mode

In **Forced Colors Mode**, we cannot rely on hue.

**Strategy:**

1.  **Borders**: All chart elements must have a transparent border in Rich Mode that becomes opaque in X-Ray Mode.
    ```css
    border: 1px solid transparent; /* Rich Mode */
    border-color: ButtonText; /* Forced Colors Override */
    ```
2.  **Patterns (Future)**: Ideally, we map colors to SVG patterns (stripes, dots) for true color-blind/X-Ray support.

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
  --_l-target: calc(0.6 + (0.2 * var(--tau))); /* Simplified example */

  background-color: oklch(var(--_l-target) var(--chart-1-c) var(--chart-1-h));
}
```

### Phase 2: The Generator Update

Update `src/lib/generator.ts` to:

1.  Accept a `chart` configuration (hues).
2.  Generate the raw H/C variables.
3.  Generate the utility classes that perform the `oklch` calculation.

### Phase 3: Component Update

Update `DataVizDemo` and any consumer components to use the new utility classes or reactive variables instead of static tokens.

## 5. Open Questions

1.  **Contrast vs. Vibrancy**: How much Chroma can we afford while maintaining APCA contrast?
2.  **Categorical Separation**: Does shifting hues based on Atmosphere risk merging two distinct categories (e.g., making Red and Orange too similar)?
3.  **Pattern Generation**: Should the system generate SVG patterns automatically?
