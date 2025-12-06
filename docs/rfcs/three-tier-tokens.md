# RFC: Three-Tier Token Architecture

## Summary

This RFC proposes reorganizing the Axiomatic Color system's export structure into three distinct tiers: **Primitives**, **Semantics**, and **Modes**. This aligns with the broader Design Token ecosystem (DTCG, Figma) while preserving the system's unique "Reactive Pipeline" capabilities.

## Motivation

Currently, Axiomatic exports a "Mode-First" structure (`light: {...}, dark: {...}`). While functional, this creates friction with tools like Tokens Studio and Figma, which expect a separation between "Global" values (Primitives) and "Contextual" values (Modes).

Additionally, our internal concept of "Anchors" is mathematically precise but opaque to designers who just want "The Palette".

## The Three Tiers

### Theoretical Foundation

This reorganization is driven by two core axioms:

1.  **The Fundamental Theorem**: $Color = f(Context, Intent)$
    - A color is not a static value. It is the result of a function applied to a specific context (Light/Dark, Surface) and a semantic intent (Primary, Danger).
2.  **The Law of Static Projection**
    - Any export to a static format (JSON, CSS) is a **projection** of the system at a specific point in time. It is a snapshot, not the system itself.
    - Therefore, we must explicitly enumerate the states (Light/Dark) that the runtime engine would normally calculate on the fly.

### Tier 1: Primitives (Global)

**"The Ingredients"**

These are the raw values. They are immutable and mode-agnostic. They define the _available_ color space but not how it is used.

- **Content**:
  - **Key Colors**: `color.brand.500`, `color.success.main`.
  - **Anchors**: `color.neutral.0` (White), `color.neutral.1000` (Black), `color.neutral.500` (Middle Gray).
- **Axiomatic Mapping**:
  - `config.keyColors` -> `color.{name}`
  - `config.anchors` -> `color.neutral.{step}` (We need to expose the calculated anchor points as a scale).

### Tier 2: Semantics (Abstract)

**"The Interface"**

These define the **Schema** and **Shared Constants** of the design system.

- **Schema (Colors)**: Defines the _names_ and _types_ of color tokens, but **not their values**.
  - Example: `surface.card` is defined as a color, but its value is left abstract (or null), to be implemented by the Modes.
- **Constants (Shared)**: Defines values that are stable across modes.
  - Example: Typography, Spacing, Border Widths.
- **Content**:
  - **Surfaces**: `surface.page`, `surface.card` (Schema).
  - **Text**: `text.body`, `text.subtle` (Schema).
  - **Borders**: `border.width.thin` (Constant), `border.decorative` (Schema).

### Tier 3: Modes (Concrete)

**"The Implementation"**

These provide the concrete **values** for the Semantic schema in a specific context.

- **Content**:
  - **Light Mode**: Implements `surface.page` as `#ffffff`.
  - **Dark Mode**: Implements `surface.page` as `#111827`.
- **Axiomatic Mapping**:
  - `solver.solve(light)` -> `modes/light.json`
  - `solver.solve(dark)` -> `modes/dark.json`

## Implications for Utility Architecture

The "Reactive Pipeline" relies on CSS variables. This reorganization suggests a naming convention update for our internal CSS variables to match the tiers.

### Current vs. Proposed

| Concept       | Current Variable                      | Proposed Variable            |
| :------------ | :------------------------------------ | :--------------------------- |
| **Primitive** | `--color-sys-anchor-page-light-start` | `--primitive-neutral-0`      |
| **Semantic**  | `--bg-surface-card`                   | `--semantic-surface-card`    |
| **Mode**      | (Handled via `light-dark()`)          | (Handled via `light-dark()`) |

### The "Late-Binding" Bridge

The magic happens in the mapping.

```css
:root {
  /* Tier 1: Primitives */
  --primitive-neutral-0: oklch(1 0 0);
  --primitive-neutral-900: oklch(0.1 0 0);
}

.surface-card {
  /* Tier 2: Semantics (resolved via Tier 3 Logic) */
  background: light-dark(
    var(--primitive-neutral-0),
    /* Light Mode Value */ var(--primitive-neutral-900) /* Dark Mode Value */
  );
}
```

## Export Strategy

We will update `axiomatic export` to produce a directory structure:

```
tokens/
├── primitives.json  # Global palette (Ingredients)
├── semantics.json   # Schema & Constants (The Interface)
├── light.json       # Light mode values (Implementation)
└── dark.json        # Dark mode values (Implementation)
```

This structure is natively supported by **Tokens Studio** (as "Token Sets") and **Style Dictionary** (via multi-file configuration).

### CLI Behavior

- If `--out` ends in `.json`, we default to the legacy single-file export (or error).
- If `--out` is a directory (or unspecified), we generate the multi-file structure.

## Migration Path

1.  **Update Exporter**: Modify `src/lib/exporters/dtcg.ts` to support the 3-tier generation.
2.  **Update CLI**: Allow exporting to a directory.
3.  **Update Docs**: Explain the tiers in the "Interoperability" guide.
4.  **Update CSS Generator**: (Optional) Align CSS variable names with the new tier terminology for consistency.
