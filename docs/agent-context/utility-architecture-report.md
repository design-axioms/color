# Utility Class Architecture Report

## 1. Analysis of Usage

We analyzed the usage of the utility classes defined in `site/src/styles/docs.css` and documented in `tokens.md`.

- **`.bg-surface`**:
  - **Definition**: Sets `background-color: var(--axm-surface-token)`.
  - **Usage**: Found in `GamutSlice.svelte` (v2) and `VibeControls.svelte` (v2).
  - **Purpose**: Explicitly sets an element's background to the current surface color. This is often redundant if the element is a `surface-*` itself, but useful for "resetting" transparency or for non-surface elements that need to match the background.

- **`.border-surface`**:
  - **Definition**: Sets `border-color: var(--axm-surface-token)`.
  - **Usage**: Defined and documented, but no explicit usage found in the current grep scope.
  - **Purpose**: Usually used to create "cutout" effects (a border that matches the background) or to blend an element into its parent.

- **`.border-highlight`**:
  - **Definition**: Sets `border-color: var(--axm-highlight-ring-color)` and `border-width: 2px`.
  - **Usage**: Used in `GamutSlice.svelte` to outline the selected color point.
  - **Purpose**: Visual indication of selection or active state.

## 2. Programming Model Evaluation

### Is `.bg-surface` necessary?

In a strict "Surface Composition" model, `surface-*` classes should handle their own background.

- **Verdict**: `.bg-surface` is a **"Context Accessor"**. It allows an element to "read" the current surface color and apply it. It is not a "Surface" itself. It is valid for edge cases (masking, separators) but should be rare.

### Is `.border-highlight` a "kind of surface"?

The user asks if the usage in `GamutSlice` implies a surface.

- **Analysis**: In `GamutSlice`, the "highlighted" point is a data point being _selected_. It is not containing content. Therefore, it is **not a surface**.
- **Concept**: It represents a **State** (Selection).
- **Token Usage**: It uses `--axm-highlight-ring-color`. This token is semantically linked to "Focus" and "Attention".
- **Conclusion**: The utility is correctly applying a "Highlight" color, but the name `.border-highlight` conflates the _property_ (border) with the _semantic_ (highlight).

## 3. The "GamutSlice" Case

The user feels `GamutSlice` usage is "Primitive".

- **Observation**: The `GamutSlice` points are "Primitives" (raw data visualizations). They are not UI surfaces.
- **Usage**: `<div class="point highlighted border-highlight">`
- **Critique**: Using a global utility `.border-highlight` here is acceptable for a "Selection Indicator". It ensures the selection color matches the system's focus/highlight color. It is **not** a surface.

## 4. Proposed Factoring

We recommend splitting the "Utility Classes" section in `tokens.md` into clearer categories to refine the mental model.

### A. Context Accessors

*Utilities that apply the *current* surface context to specific properties.*

- `.bg-surface`: "Paint background with current surface color."
- `.border-surface`: "Paint border with current surface color (blend/cutout)."
- `.stroke-surface`: "Paint SVG stroke with current surface color."

### B. Interaction States

_Utilities that apply system-wide interaction styles._

- `.ring-focus`: "Apply the standard focus ring permanently."
- `.ring-focus-visible`: "Apply the standard focus ring on keyboard focus."
- `.border-highlight`: "Apply the standard highlight/selection color to the border." (Consider renaming to `.state-selected-border` or similar if we want to be more semantic, but `.border-highlight` is consistent with atomic CSS naming).

### C. Surface Primitives (Distinct Category)

_These are NOT utilities. They are the structural blocks._

- `surface-card`, `surface-sunken`, etc.

## Recommendation for `tokens.md`

Update the documentation to reflect this split. This clarifies that `.bg-surface` is for _accessing_ the token, while `surface-*` is for _defining_ the context.

### Specific Answer on `.border-highlight`

It is **not a surface**. It is a **Selection Utility**. The usage in `GamutSlice` is correct: it marks a data point as "Selected" using the system's "Highlight" token. It does not need to be a surface because it doesn't manage a new context or contain content.
