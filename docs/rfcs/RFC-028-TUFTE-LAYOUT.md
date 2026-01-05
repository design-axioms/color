# RFC-TUFTE-LAYOUT: Sophisticated Preprint Layout Engine

**Status**: Draft (consolidated)  
**Date**: 2026-01-05  
**Source**: design/007-tufte-layout.md, design/008-modern-tufte-layout.md

> **System Directive**: This document serves as the authoritative specification for the `tufte.css` engine. Future agents must treat these rules as **invariants**. Deviations require a formal RFC amendment.

---

## 1. The Mission

To construct a **deterministic, generative layout engine** that transforms standard Markdown into a "Sophisticated Preprint" aesthetic without manual intervention. The system prioritizes **cognitive ergonomics** (zero-jump reading) and **high conceptual integrity** (parallel context).

### Philosophy

We adopt the **"Sophisticated Preprint"** aesthetic, heavily inspired by Edward Tufte's design principles and the `tufte-latex` class.

- **Beautiful Evidence**: The data and equations are the heroes.
- **Marginalia**: Auxiliary content (notes, citations, small figures) lives in the margin, parallel to the text it references, rather than in footnotes or tooltips.
- **TeX-like Rendering**: The browser should mimic the high-quality typesetting of a LaTeX document.

---

## 2. The Physics Engine (Layout)

The layout is not a static grid; it is a **dependency graph** resolved at runtime by the browser's CSS Anchor Positioning API.

### 2.1. The Marginalia Grid

**Desktop (> 1200px):**
The layout uses a 5-column CSS Grid:

1. `1fr`: Left Margin (Flexible whitespace)
2. `60ch`: Main Column (The "Stream of Truth")
3. `4rem`: Gutter (Visual separation)
4. `26ch`: Sidenote Column (Contextual layer)
5. `1fr`: Right Margin (Flexible whitespace)

**Mobile (< 1200px):**
The layout linearizes. Sidenotes become distinct blocks inserted into the flow, styled with a subtle background to distinguish them from the main text.

### 2.2. The Anchor Chain Topology

Sidenotes are not independent floats. They form a linked list where the position of node $N$ depends on the geometry of node $N-1$ and the anchor point $P$.

**The Collision Invariant:**

$$\text{Top}_N = \max( \text{anchor}(P_{top}), \text{anchor}(N-1_{bottom}) + \text{Gap} )$$

**The Horizontal Invariant:**

$$\text{Left}_N = \text{anchor}(P_{right}) + \text{Gap}$$

### 2.3. Implementation Strategy

- **Build-Time (Rehype)**: The AST is traversed to generate unique IDs (`#p-1`, `#note-1`) and inject the dependency logic directly into the DOM.
- **Run-Time (CSS)**: The browser solves the constraint system via CSS Anchor Positioning.
- **Mobile Fallback**: Below `1200px`, the topology collapses into a linear stack. The "Physics" are disabled; the content flows naturally.

---

## 3. The Rendering Engine (Typography)

The aesthetic is defined by **strict vertical rhythm** and **academic rigor**.

### 3.1. The Stream of Truth (Main Column)

The main column (`60ch`) is the primary data structure.

- **Font Stack**: `EB Garamond` (Variable) is the primary typeface. It must support a wide range of weights and optical sizing.
- **Justification**: `text-align: justify` with `hyphens: auto` (TeX-like). This is non-negotiable for the academic aesthetic.
- **Indentation**: Paragraphs are separated by `1.5em` indentation, _never_ vertical margins.
  - _Exception_: The first paragraph after a heading, list, or equation is **not** indented.
  - _Exception_: Paragraphs following block equations or "Where:" labels have `0` indent (semantic continuation).

### 3.2. The Contextual Layer (Marginalia)

The marginalia (`26ch`) carries meta-data.

- **Font**: Configured via `--font-serif` (default: EB Garamond) and `--font-mono` (default: SF Mono).
- **Scale**: Text is scaled to `0.9rem` relative to the body to establish hierarchy.
- **Tethering**: Notes must visually align with their reference line.

### 3.3. List Topology

Lists are **not** block elements; they are flow elements.

- **Indent**: `1.5em` (matches paragraph indent).
- **Markers**: Hanging in the gutter.
  1. Level 1: Decimal (`1.`)
  2. Level 2: Lower Alpha (`a.`). **Invariant**: Must never render as hollow circles (`◦`).
  3. Level 3: Lower Roman (`i.`)
- **Strictness**: The use of Em-dashes (`—`) or hollow circles (`◦`) as list markers is strictly prohibited in technical specifications.
- **Rhythm**:
  - _Inter-item_: Tight spacing (`0.25em`) to group the list visually.
  - _Intra-item_: Relaxed line-height (`1.6`) for readability.

### 3.4. Mathematical Typesetting

Math is a first-class citizen and must not disrupt the optical texture.

**Typography Rules:**

- **Scale**: Inline math ($\LaTeX$) is scaled to `0.9em` to align x-heights with the serif body.
- **Vertical Safety**: Line height must be sufficient (`1.6`) to accommodate tall glyphs.
- **Optical Weight Matching**: The stroke width of mathematical variables must match the stroke width of the body font.
  - _Constraint:_ If using `EB Garamond` (Body), use `Garamond-Math` or `Cormorant Garamond` for symbols.
- **Atomic Units**: Inline math must never wrap (`white-space: nowrap`).
- **Block Equations**: Centered, with ample vertical breathing room.

**Alignment:**

- Equations must never be centered individually if they are part of a system. Use the `array` environment with `\displaystyle` to force strict vertical alignment of operators.
- Weight Matching: Math symbols inside bold headers must be explicitly bolded (`\boldsymbol{\Sigma}`).

### 3.5. Code Artifacts

Code snippets must integrate seamlessly.

- **No Box Junk**: Zero background, zero border.
- **Syntax**: High-quality monospace, scaled `0.85em`.
- **Distinct Ink**: Code must be rendered in a single monochromatic shade (e.g., Slate Gray `#475569`). **Multicolor syntax highlighting is prohibited** as it introduces 'IDE artifacts' that break the print aesthetic.
- **Philosophy**: Code is text, not a widget.

### 3.6. Hypertext & Reference Artifacts

Web-native affordances must be suppressed in favor of print conventions.

- **Footnote Markers**: Superscript, black/body color, scale `0.75em`.
- **Sidenote Markers**: The reference number must be repeated at the start of the sidenote content.
- **Links**: No underlines. Indicated by semantic context or small-caps styling.
- **Interaction**: `cursor: pointer` is the only indication of interactivity.

---

## 4. The Notation Standard (Content)

To ensure the "Preprint" vibe, the content itself must adhere to rigorous notation standards.

### 4.1. Variable Conventions

| Type             | Notation             | LaTeX             | Example                    |
| :--------------- | :------------------- | :---------------- | :------------------------- |
| **Scalar**       | Lowercase Italic     | `$x$`             | $\tau, \gamma$             |
| **Vector/Tuple** | Uppercase Greek/Bold | `$\Sigma$`        | $\Sigma, \mathcal{S}$      |
| **Set**          | Uppercase Italic     | `$S$`             | $T, S^1$                   |
| **Mode/Flag**    | Lower Greek          | `$\mu$`           | $\mu, \rho$                |
| **Token**        | Typewriter           | `\texttt{name}`   | `text-high`                |
| **Delimiters**   | Angle Brackets       | `\langle \rangle` | $\langle H, \beta \rangle$ |
| **Voice**        | Script Family        | `\mathcal{V}`     | $\mathcal{V} \in T$        |

**Invariants:**

- The variable for "Voice" or "Semantic Intent" must use **Calligraphic/Script** styling ($\mathcal{V}$) to distinguish it from scalar Volume or Voltage ($V$).
- Explicit multiplication symbols (`×`) are banned in scalar algebra. Use implicit multiplication (juxtaposition) or the dot operator (`\cdot`).

### 4.2. Structural Rules

- **Definitions**: Use formal environments.
  - **Correct:** "**Definition 1 (Label).** Body text..."
  - **Rule:** The Label must be **Bold** to visually balance against math symbols.
  - **Rule:** The Body text must be normal weight (serif).
- **Separation of Concerns**: Definitions must specify the _Domain_ (the set) separately from the _Behavior_ (the effect).

### 4.3. Namespace Hygiene

- **Symbolic Purity**: Never overload symbols within the same scope or tuple.
  - _Prohibited:_ Defining a Tuple as $\Sigma$ and a property inside it as $\sigma$.
  - _Required:_ Use distinct semantic buckets.
- **No Syntax Highlighting**: Mathematical variables must be rendered in the primary text color (black).

---

## 5. The Narrative Separation Protocol

The document is composed of two distinct narrative streams with strict content boundaries.

### 5.1. The Main Column: "The Architect"

- **Role**: Defines the invariant laws of the system (The Physics).
- **Constraint**: Must remain **Brand Agnostic**. If the product is renamed tomorrow, this text should not require editing.
- **Allowed**: Mathematical symbols, generic component names, standard English verbs.
- **Prohibited**: Product proper nouns, time-bound references.

### 5.2. The Marginalia: "The Guide"

- **Role**: Bridges the abstract math to the concrete product (The Usage).
- **Constraint**: Must be **visually tethered** to the concept it explains.
- **Prohibited**: Complex mathematical notation. The sidebar is for "Plain English" context only.
- **Allowed**: Product names, implementation tips, metaphors, legacy mappings.

---

## 6. Component Architecture

Components are provided in `site/src/components/tufte/`.

### `<Sidenote>`

Places content in the right margin on desktop, or as a distinct block on mobile.

```svelte
<Sidenote label="Intuition.">
  The Sine Wave ensures that Yellows are allowed to be brighter than Blues.
</Sidenote>
```

- **Props**: `label` (Optional bold prefix, e.g., "Note.", "Figure 1.").
- **Behavior**: On desktop, floats to the right column. On mobile, renders as a block with a left border.

### `<TufteList>`

A clean, bullet-less list style for definitions.

### `<Abstract>`

Renders the document abstract with specific formatting (italicized, centered, slightly narrower measure).

---

## 7. CSS Strategy

The styles are defined in `site/src/styles/tufte.css`. This file uses `!important` liberally to override the high-specificity selectors of the underlying documentation framework (Starlight). This is a deliberate trade-off.

---

## 8. Browser Support (Baseline 2025)

The engine relies on:

- `position-anchor` / `anchor()`
- `text-wrap: pretty`
- CSS Math Functions (`max`, `calc`)

_Legacy browsers are served the Mobile Fallback._

---

## 9. Future Work

- **Figure Support**: Extend `<Sidenote>` to support small charts and diagrams.
- **Citation System**: Implement a BibTeX-like citation system that renders as sidenotes.
- **Interactive Marginalia**: Allow "Explorables" (sliders, toggles) to live in the sidenotes.
- **S-Expression Grammar**: Complex block-level mathematics using Lisp-like syntax for semantic structure.

---

## Related RFCs

- **RFC-CHARTS**: Reactive data visualization may appear in marginalia
- **RFC-AUDITING**: Visual coherence tests may verify Tufte layout compliance
