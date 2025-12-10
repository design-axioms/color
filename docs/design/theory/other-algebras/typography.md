# The Breathing Grid: A Fluid Hierarchy & Spacing Specification

**Version:** 1.0.0-draft
**Status:** Proposed Standard
**Context:** Foundation / Layout

## 1. Executive Summary

This specification replaces arbitrary pixel values ("magic numbers") with a rigorous, semantic spacing system.

Instead of choosing distinct pixel values (e.g., `20px` vs `24px`), designers and developers choose **Hierarchy Roles** based on the structural relationship between elements. The system automatically calculates the physical spacing based on the current viewport width using a shared mathematical easing curve.

**The Core Promise:**

1. **Semantic Clarity:** Spacing describes _what_ is being separated, not just _how far_ apart it is.
2. **Fluid Consistency:** Hierarchy never collapses. If Group A is tighter than Group B on mobile, it remains tighter on desktop.
3. **User-Controlled Density:** Because the system is parametric, "Compact" or "Spacious" modes are simple mathematical scalars, not CSS refactors.

## 2. The Five Semantic Buckets

We define exactly five levels of spatial separation. These map directly to the "Hierarchy Jump" ($\Delta$)—the structural distance between two adjacent elements.

| Token Role            | Level ($\Delta$) | Semantic Usage                                                          | Example Context                                             |
| :-------------------- | :--------------- | :---------------------------------------------------------------------- | :---------------------------------------------------------- |
| **`gap-inline`**      | 0                | **Atomic Adjacency.** Items that function as a single interactive unit. | Icon + Label, Chip + Text, Price + Currency.                |
| **`gap-intra-group`** | 1                | **Peer Items.** Distinct items belonging to the same collection.        | List items, paragraphs in an article, form fields in a set. |
| **`gap-inter-group`** | 2                | **Distinct Blocks.** Separation between different logical groups.       | Header + Body, Card + Card, Form + Submit Button.           |
| **`gap-section`**     | 3                | **Thematic Break.** A shift in context within the same page.            | "Features" vs "Testimonials" bands.                         |
| **`gap-region`**      | 4                | **Structural Divide.** Major architectural boundaries.                  | Global Nav vs Page Content, Sidebar vs Main.                |

## 3. The Physics (Axioms & Constraints)

The system is governed by four immutable laws. These ensure the system "breathes" correctly without breaking layout logic.

### Axiom 1: The Grouping Principle (Gestalt)

For any three adjacent nodes A, B, and C: If A and B are in the same group, and C is outside that group, the space between B-C must strictly be larger than A-B.

> **Constraint:** `gap-intra` < `gap-inter`

### Axiom 2: Monotone Hierarchy

The hierarchy order must be preserved across all viewport sizes. A "Section" gap on Mobile can never be smaller than an "Inter-group" gap on Desktop.

> **Constraint:** $s_{i}(t) < s_{i+1}(t)$ for all $t$.

### Axiom 3: The Contrast Guarantee

To ensure hierarchy remains distinct on large screens, larger gaps must expand at a rate equal to or faster than smaller gaps.

> **Constraint:** The Growth Factor ($\phi = Max / Min$) of a higher token must be $\ge$ the Growth Factor of a lower token.

### Axiom 4: The Shared Easing (The "Breath")

All tokens scale using the same normalized easing curve $E(t)$. This ensures the entire interface expands and contracts with a singular rhythmic "personality."

## 4. The Mathematical Model

### 4.1. Viewport Normalization ($t$)

We normalize the viewport width ($w$) into a value $t$ between 0 and 1.

- $w_{min} = 320px$
- $w_{max} = 1440px$

$$
t = \text{clamp}\left(0, \frac{w - w_{min}}{w_{max} - w_{min}}, 1\right)
$$

### 4.2. The Easing Function ($E$)

We use a customized **Ease-Out** curve. This provides rapid relaxation of spacing as we leave mobile widths, settling gently into desktop widths.

$$
E(t) = 1 - (1 - t)^2
$$

### 4.3. The Density Scalar ($D$)

To support "Comfort" settings (Compact/Spacious), we apply a global multiplier $D$.

- **Compact:** $D = 0.75$
- **Comfortable (Default):** $D = 1.0$
- **Spacious:** $D = 1.25$

### 4.4. The Master Formula

For any given token $i$, with a defined minimum ($min_i$) and maximum ($max_i$), the physical pixel value $S_i$ is:

$$
S_i = \max\left( \text{Floor}, \left[ min_i + (max_i - min_i) \cdot E(t) \right] \cdot D \right)
$$

## 5. Token Registry & Values

These values have been validated against the **Contrast Guarantee**.

| Token         | Min ($w_{320}$) | Max ($w_{1440}$) | Growth ($\phi$) | Usage                 |
| :------------ | :-------------- | :--------------- | :-------------- | :-------------------- |
| `gap-inline`  | **2px**         | **4px**          | 2.0x            | Tightest coupling.    |
| `gap-intra`   | **8px**         | **16px**         | 2.0x            | Default list rhythm.  |
| `gap-inter`   | **16px**        | **32px**         | 2.0x            | Component separation. |
| `gap-section` | **32px**        | **80px**         | 2.5x            | Major page bands.     |
| `gap-region`  | **64px**        | **160px**        | 2.5x            | Global layout.        |

_Note: The "Section" and "Region" gaps grow faster (2.5x) than smaller gaps, ensuring that macro-layout feels luxurious on large screens while remaining functional on mobile._

## 6. CSS Reference Implementation

This implementation uses modern CSS features (`clamp`, `calc`, custom properties) to achieve the mathematical model without JavaScript overhead.

### 6.1. The Engine (Global Config)

```css
:root {
  /* 1. Constraints */
  --vw-min: 320;
  --vw-max: 1440;
  --min-floor: 2px; /* Safety floor for compactness */

  /* 2. Normalized Viewport (t) 
     Result is a unitless number 0.0 -> 1.0 */
  --t-raw: calc(
    (100vw - var(--vw-min) * 1px) / (var(--vw-max) - var(--vw-min))
  );
  --t: clamp(0, var(--t-raw), 1);

  /* 3. The Easing Curve E(t) 
     Method: Ease-Out Quad [1 - (1-t)^2] */
  --ease: calc(1 - pow(1 - var(--t), 2));

  /* 4. Density Scalar (Default) */
  --density-scalar: 1;
}

/* Density Modes via Data Attribute */
body[data-density="compact"] {
  --density-scalar: 0.75;
}
body[data-density="spacious"] {
  --density-scalar: 1.25;
}
```
