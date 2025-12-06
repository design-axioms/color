# Design: DTCG Import Heuristics

## Goal

The goal of the DTCG Importer is to allow users to "bootstrap" an Axiomatic configuration from an existing set of design tokens. This is primarily aimed at users migrating from tools like Figma (via Tokens Studio) or Style Dictionary, which often export tokens in the W3C Design Token Community Group (DTCG) format.

## The Problem

Most design token sets are **Palette-based** (e.g., `blue.500`, `gray.100`), whereas Axiomatic Color is **Constraint-based** (e.g., `anchors.page.light.start`, `surface.card`).

We cannot simply "copy" the tokens because they represent fundamentally different concepts. A palette is a list of available ingredients; Axiomatic config is a recipe.

Therefore, the importer must be **Heuristic**. It must look at the ingredients (tokens) and guess the recipe (config).

## Official Spec Alignment

We align with the [Design Tokens Format Module](https://design-tokens.github.io/community-group/format/) (Draft).
Local reference: `vendor/design-tokens-community-group/technical-reports/format/`

- **Groups**: Used for organization. We flatten them to find tokens. (See `groups.md`)
- **Types**: We respect `$type` (color, dimension, etc.) but also infer it if missing. (See `types.md`)
- **Extensions**: We look into `$extensions` for tool-specific metadata (e.g., Tokens Studio). (See `design-token.md`)

## Heuristic Strategy

### 1. Key Color Extraction

**Goal**: Identify the semantic "Key Colors" (Brand, Danger, Success) that drive the theme's hue.

**Algorithm**:

1.  **Flatten**: Flatten the token hierarchy into dot-notation paths (e.g., `color.brand.primary`).
2.  **Keyword Scan**: Search for known semantic keywords in the path:
    - `brand`, `primary`, `accent` -> `keyColors.brand`
    - `success`, `positive`, `green` -> `keyColors.success`
    - `warning`, `caution`, `yellow`, `orange` -> `keyColors.warning`
    - `danger`, `error`, `critical`, `red` -> `keyColors.danger`
    - `info`, `blue` -> `keyColors.info`
3.  **Value Selection**:
    - **Single Value**: If the match is a single color (e.g., `brand: #007bff`), use it.
    - **Scale**: If the match is a scale (e.g., `brand.100`...`brand.900`), we need to pick _one_ representative color.
      - _Heuristic_: Pick the "middle" value (e.g., `500`) or the one with the highest Chroma. High chroma usually indicates the "pure" brand color.

### 2. Anchor Inference

**Goal**: Determine the dynamic range of the theme (Light/Dark mode boundaries) by analyzing the neutral scale.

**Algorithm**:

1.  **Find Neutral Scale**: Look for keys containing `gray`, `neutral`, `slate`, `zinc`, `mono`, `sand`.
2.  **Analyze Lightness**: Convert all values in the scale to OKLCH.
3.  **Set Anchors**:
    - `anchors.page.light.start`: The **Lightest** color in the scale (e.g., `gray.50` -> L=98).
    - `anchors.page.light.end`: The **Darkest** color in the scale (e.g., `gray.900` -> L=10).
    - `anchors.page.dark.start`: The **Darkest** color (L=10).
    - `anchors.page.dark.end`: The **Lightest** color (L=98).
    - _Note_: We assume a symmetrical range for simplicity, but we could infer asymmetry if the input scale is skewed.

### 3. Surface Mapping

**Goal**: Map existing semantic tokens to Axiomatic Surfaces.

**Algorithm**:

1.  **Direct Mapping**: If tokens follow the Axiomatic naming convention (`surface.card`, `surface.sunken`), map them directly to a `SurfaceConfig`.
2.  **Semantic Guessing**:
    - `bg.primary`, `background.page` -> `surface.page` (Polarity: Page)
    - `bg.secondary`, `background.card`, `container` -> `surface.card` (Polarity: Page)
    - `bg.tertiary`, `background.overlay` -> `surface.overlay` (Polarity: Page)
    - `bg.inverse`, `background.dark` -> `surface.inverse` (Polarity: Inverted)
3.  **Fallback**: If no surfaces are detected, create a default "Imported" group with a generic `card` surface to ensure the config is valid.

## Example Scenarios

### Scenario A: Tailwind-like Palette

**Input**:

```json
{
  "colors": {
    "blue": { "500": "#3b82f6" },
    "gray": { "50": "#f9fafb", "900": "#111827" }
  }
}
```

**Inferred Config**:

- `keyColors.brand`: `#3b82f6` (from `blue.500`)
- `anchors.page.light.start`: 98% (from `gray.50`)
- `anchors.page.light.end`: 10% (from `gray.900`)

### Scenario B: Semantic Tokens

**Input**:

```json
{
  "brand": { "primary": "#6366f1" },
  "bg": { "canvas": "#ffffff", "surface": "#f3f4f6" }
}
```

**Inferred Config**:

- `keyColors.brand`: `#6366f1`
- `anchors.page.light.start`: 100% (from `bg.canvas`)
- `groups`: [{ name: "Imported", surfaces: [{ slug: "surface", ... }] }]

## Limitations

- **Lossy**: We cannot preserve every single color from the input. The goal is to preserve the _intent_ and _range_.
- **Ambiguity**: `primary` might mean "Brand Color" or "Primary Text". We prioritize "Brand Color" for key color extraction.

## Modern Patterns & Future Work

### Modes & Themes

Research into tools like Tokens Studio and Cobalt UI reveals two common patterns for handling modes (Light/Dark/High Contrast):

1.  **Token Sets (Multi-file)**: Tokens are split into separate files or top-level groups (e.g., `global.json`, `light.json`, `dark.json`).
    - _Strategy_: The CLI should accept multiple input files and perform a "Deep Merge" where later files override earlier ones. This allows inferring mode-specific values by comparing the `light` and `dark` sets.
2.  **$extensions**: Some tools embed mode data directly into the token using the `$extensions` property.
    - _Strategy_: The importer should inspect `$extensions` for known keys (e.g., `studio.tokens`) to extract mode-specific values.

### Semantic vs Primitive

A common pattern is separating "Primitive" scales (numeric, e.g., `gray.500`) from "Semantic" aliases (functional, e.g., `text.primary`).

- **Heuristic**: If a token's value is a reference (e.g., `{gray.900}`), it is likely a **Semantic Decision**. If it is a raw hex code, it is likely a **Primitive**.
- **Application**: When extracting Key Colors, we should prioritize Semantic tokens that alias to a Primitive, as they represent the "intended" usage of that color.

### Groups & Hierarchy

The [DTCG Spec](https://design-tokens.github.io/community-group/format/) defines `$root` as a way to give a value to a group itself.

- _Strategy_: The importer must handle `$root` tokens correctly, treating `color.brand.$root` as `color.brand`.
