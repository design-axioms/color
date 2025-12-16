# RFC 007: The "Sophisticated Preprint" Layout (Tufte Design System)

## Context

The "Theory" section of the Axiomatic Color System documentation requires a presentation style that matches the rigor of its content. Standard documentation templates (sticky sidebars, colored callout boxes, sans-serif fonts) signal "SaaS Product" or "API Reference," which undermines the academic and mathematical nature of the "Algebra" and "Derivation" pages.

## Philosophy

We adopt the **"Sophisticated Preprint"** aesthetic, heavily inspired by Edward Tufte's design principles and the `tufte-latex` class.

- **Beautiful Evidence**: The data and equations are the heroes.
- **Marginalia**: Auxiliary content (notes, citations, small figures) lives in the margin, parallel to the text it references, rather than in footnotes or tooltips.
- **TeX-like Rendering**: The browser should mimic the high-quality typesetting of a LaTeX document.

## Technical Specification

### 1. The "Marginalia" Grid

The core layout is an asymmetric grid that prioritizes a readable measure for the main text while reserving space for marginalia.

**Desktop (> 1200px):**
The layout uses a 5-column CSS Grid:

1.  `1fr`: Left Margin (Flexible whitespace)
2.  `60ch`: Main Column (The "Stream of Truth")
3.  `4rem`: Gutter (Visual separation)
4.  `22ch`: Sidenote Column (Contextual layer)
5.  `1fr`: Right Margin (Flexible whitespace)

**Mobile (< 1200px):**
The layout linearizes. Sidenotes become distinct blocks inserted into the flow, styled with a subtle background to distinguish them from the main text.

### 2. Typography

To achieve the "TeX" look in a browser:

- **Font Stack**: `EB Garamond` (Variable) is the primary typeface. It must support a wide range of weights and optical sizing.
- **Justification**: Text is `text-align: justify` with `hyphens: auto`. This is non-negotiable for the academic aesthetic.
- **Indentation**: Paragraphs are separated by indentation (`1.5em`), not vertical margin.
  - _Exception_: The first paragraph after a heading, list, or equation is **not** indented.

### 3. Mathematical Rigor

- **Engine**: KaTeX is used for rendering.
- **Alignment**: Equations must never be centered individually if they are part of a system. We use the `array` environment with `\displaystyle` to force strict vertical alignment of operators (e.g., aligning the `=` signs).
- **Weight Matching**: Math symbols inside bold headers must be explicitly bolded (`\boldsymbol{\Sigma}`) to match the surrounding text weight.

## Component Architecture

To ensure consistency and ease of authoring, we provide a suite of Svelte components in `site/src/components/tufte/`.

### `<Sidenote>`

Places content in the right margin on desktop, or as a distinct block on mobile.

```svelte
<Sidenote label="Intuition.">
  The Sine Wave ensures that Yellows are allowed to be brighter than Blues.
</Sidenote>
```

- **Props**: `label` (Optional bold prefix, e.g., "Note.", "Figure 1.").
- **Behavior**: On desktop, it floats to the right column. On mobile, it renders as a block with a left border.

### `<TufteList>`

A clean, bullet-less list style for definitions and physical interpretations.

```svelte
<TufteList>
  <li><strong>Term:</strong> Definition</li>
</TufteList>
```

- **Styling**: `list-style: none`, `padding-left: 1.5em`.
- **Usage**: Prefer this over standard `<ul>` for semantic lists of terms.

### `<Abstract>`

Renders the document abstract with specific formatting (italicized, centered, slightly narrower measure).

### `<Subtitle>`

Renders the document version/subtitle below the main title.

## Implementation Details

### CSS Strategy

The styles are defined in `site/src/styles/tufte.css`. This file uses `!important` liberally to override the high-specificity selectors of the underlying documentation framework (Starlight). This is a deliberate trade-off to avoid fighting the framework's theming system for this specific layout mode.

### Authoring Guidelines

1.  **Import**: Always import the components and the CSS at the top of the MDX file.
    ```mdx
    import "../../../styles/tufte.css";
    import { Sidenote, Abstract } from "../../../components/tufte";
    ```
2.  **Math**: Use `$$` blocks for display math. Use `\begin{array}{rcl}` for multi-line equations to guarantee alignment.
3.  **Structure**: Keep the main column focused on the core argument. Move _everything_ else (analogies, implementation notes, historical context) to `<Sidenote>`.

## Future Work

- **Figure Support**: Extend `<Sidenote>` to support small charts and diagrams.
- **Citation System**: Implement a BibTeX-like citation system that renders as sidenotes.
- **Interactive Marginalia**: Allow "Explorables" (sliders, toggles) to live in the sidenotes.
