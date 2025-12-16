# RFC 008: The "Sophisticated Preprint" Layout Engine

> **System Directive**: This document serves as the authoritative specification for the `tufte.css` engine. Future agents must treat these rules as **invariants**. Deviations require a formal RFC amendment.

## 1. The Mission

To construct a **deterministic, generative layout engine** that transforms standard Markdown into a "Sophisticated Preprint" aesthetic without manual intervention. The system prioritizes **cognitive ergonomics** (zero-jump reading) and **high conceptual integrity** (parallel context).

## 2. The Physics Engine (Layout)

The layout is not a static grid; it is a **dependency graph** resolved at runtime by the browser's CSS Anchor Positioning API.

### 2.1. The Anchor Chain Topology

Sidenotes are not independent floats. They form a linked list where the position of node $N$ depends on the geometry of node $N-1$ and the anchor point $P$.

**The Collision Invariant:**

$$\text{Top}_N = \max( \text{anchor}(P_{top}), \text{anchor}(N-1_{bottom}) + \text{Gap} )$$

**The Horizontal Invariant:**

$$\text{Left}_N = \text{anchor}(P_{right}) + \text{Gap}$$

### 2.2. Implementation Strategy

- **Build-Time (Rehype)**: The AST is traversed to generate unique IDs (`#p-1`, `#note-1`) and inject the dependency logic (`style="top: max(...)"`) directly into the DOM.
- **Run-Time (CSS)**: The browser solves the constraint system.
- **Mobile Fallback**: Below `1200px`, the topology collapses into a linear stack. The "Physics" are disabled; the content flows naturally.

## 3. The Rendering Engine (Typography)

The aesthetic is defined by **strict vertical rhythm** and **academic rigor**.

### 3.1. The Stream of Truth

The main column (`60ch`) is the primary data structure.

- **Justification**: `text-align: justify` with `hyphens: auto` (TeX-like).
- **Indentation**: Paragraphs are separated by `1.5em` indentation, _never_ vertical margins.
  - _Exception_: Paragraphs following block equations or "Where:" labels have `0` indent (semantic continuation).

### 3.2. The Contextual Layer

The marginalia (`26ch`) carries meta-data.

- **Font**: Configured via `--font-serif` (default: EB Garamond) and `--font-mono` (default: SF Mono).
- **Scale**: Text is scaled to `0.9rem` relative to the body to establish hierarchy.
- **Tethering**: Notes must visually align with their reference line.

### 3.3. List Topology

Lists are **not** block elements; they are flow elements.

- **Indent**: `1.5em` (matches paragraph indent).
- **Markers**: Hanging in the gutter.
  1.  Level 1: Decimal (`1.`)
  2.  Level 2: Lower Alpha (`a.`). **Invariant**: Must never render as hollow circles (`◦`). Technical sub-definitions are sequential, not unordered.
  3.  Level 3: Lower Roman (`i.`)
- **Strictness**: The use of Em-dashes (`—`) or hollow circles (`◦`) as list markers is strictly prohibited in technical specifications. The Layout Engine must enforce `decimal` (1.) or `lower-alpha` (a.) styles via CSS, regardless of the underlying HTML tag (`<ul>` vs `<ol>`).
- **Rhythm**:
  - _Inter-item_: Tight spacing (`0.25em`) to group the list visually as a cohesive unit.
  - _Intra-item_: Relaxed line-height (`1.6`) to improve readability of dense descriptions.

### 3.4. Mathematical Typesetting

Math is a first-class citizen and must not disrupt the optical texture. The system employs a **Hybrid Architecture**:

- **Inline Scalars**: Standard $\LaTeX$ syntax (e.g., `$\gamma$`) is used for atomic variables and simple equations.
- **Structural Layouts**: S-Expressions (Lisp-like syntax) are used for complex block layouts, tables, and multi-line alignments.

**Typography Rules:**

- **Scale**: Inline math ($\LaTeX$) is scaled to `0.9em` to align x-heights with the serif body.
- **Vertical Safety**: Line height must be sufficient (`1.6`) to accommodate tall glyphs (e.g., $\langle \rangle$) without collision.
- **Texture**: Math fonts must be selected to match the optical weight of the body text.
- **Optical Weight Matching**: The stroke width of mathematical variables must match the stroke width of the body font.
  - _Constraint:_ If using `EB Garamond` (Body), use `Garamond-Math` or `Cormorant Garamond` for symbols. Do not pair a Light body font with Bold math symbols.
- **Atomic Units**: Inline math must never wrap (`white-space: nowrap`).
- **Block Equations**: Centered, with ample vertical breathing room.

### 3.5. Code Artifacts

Code snippets must integrate seamlessly.

- **No Box Junk**: Zero background, zero border.
- **Syntax**: High-quality monospace, scaled `0.85em`.
- **Distinct Ink**: Code must be rendered in a single monochromatic shade (e.g., Slate Gray `#475569` or Midnight Blue `#1e293b`). **Multicolor syntax highlighting is prohibited** as it introduces 'IDE artifacts' that break the print aesthetic.
- **Philosophy**: Code is text, not a widget.

### 3.6. Hypertext & Reference Artifacts

Web-native affordances must be suppressed in favor of print conventions.

- **Footnote Markers**: Superscript, black/body color, scale `0.75em`.
- **Sidenote Markers**: The reference number must be repeated at the start of the sidenote content as a superscript to confirm linkage.
- **Links**: No underlines. Indicated by semantic context or small-caps styling.
- **Interaction**: `cursor: pointer` is the only indication of interactivity.

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

**Invariant**: The variable for "Voice" or "Semantic Intent" must use **Calligraphic/Script** styling ($\mathcal{V}$) to distinguish it from scalar Volume or Voltage ($V$).

**Invariant**: Explicit multiplication symbols (`×`) are banned in scalar algebra. Use implicit multiplication (juxtaposition) or the dot operator (`\cdot`).

### 4.4. Operators & Relations

- **Multiplication:** Explicit cross symbols (`×`, `\times`) are prohibited for scalar multiplication. Use implicit juxtaposition ($ab$) or the centered dot (`\cdot`) for clarity.
- **Functions:** Named functions (sin, log, max) must use Roman (upright) type, not Italic.
- **Relations:** Arrows ($\rightarrow$) should have adequate padding (`\enspace` or `\quad`) when describing state transitions.

### 4.2. Structural Rules

- **Definitions**: Use formal environments.
  - **Correct:** "**Definition 1 (Label).** Body text..."
  - **Rule:** The Label must be **Bold** to visually balance against math symbols.
  - **Rule:** The Body text must be normal weight (serif).
- **Separation of Concerns**: Definitions must specify the _Domain_ (the set) separately from the _Behavior_ (the effect).
  - _Bad:_ "$\gamma$: A multiplier that increases contrast."
  - _Good:_ "$\gamma \in [1, \infty)$: A scalar multiplier. This value increases contrast..."

### 4.3. Namespace Hygiene

- **Symbolic Purity**: Never overload symbols within the same scope or tuple.
  - _Prohibited:_ Defining a Tuple as $\Sigma$ and a property inside it as $\sigma$.
  - _Required:_ Use distinct semantic buckets (e.g., Use $\mathcal{S}$ for System State, $\mu$ for Mode).
- **No Syntax Highlighting**: Mathematical variables are abstract concepts, not code. They must be rendered in the primary text color (black).

### 4.5. S-Expression Grammar (Structural Math)

For complex block-level mathematics, the system uses a Lisp-like syntax to define semantic structure.

| Construct     | S-Expression          | Rendered            |
| :------------ | :-------------------- | :------------------ |
| **Grouping**  | `(fenced x)`          | $\langle x \rangle$ |
| **Subscript** | `(sub x y)`           | $x_y$               |
| **Table**     | `(table (tr (td x)))` | Grid Layout         |
| **Function**  | `(fenced "sin" x)`    | $\sin(x)$           |

**Invariant**: Any math block starting with `(` is parsed as an S-Expression. All others are treated as $\LaTeX$.

## 5. The Narrative Separation Protocol

The document is composed of two distinct narrative streams. The Layout Agent must enforce strict content boundaries between them. This protocol supersedes previous "De-Marketing" rules by allowing product context in the margins.

### 5.1. The Main Column: "The Architect"

- **Role**: Defines the invariant laws of the system (The Physics).
- **Constraint**: Must remain **Brand Agnostic**. If the product is renamed tomorrow, this text should not require editing.
- **Allowed Vocabulary**: Mathematical symbols ($\tau, \mathcal{V}$), generic component names ("Initialization Routine", "Solver"), standard English verbs.
- **Prohibited**: Product proper nouns (_Genesis Engine_, _Axiomatic Color_), time-bound references ("New for 2025").

### 5.2. The Marginalia: "The Guide"

- **Role**: Bridges the abstract math to the concrete product (The Usage).
- **Constraint**: Must be **visually tethered** (via anchor positioning) to the concept it explains.
- **Prohibited**: Complex mathematical notation ($\LaTeX$). The sidebar is for "Plain English" context only.
- **Allowed Vocabulary**: Product names (_Genesis Engine_), implementation tips, "Plain English" metaphors, legacy mappings.

### 5.3. Implementation Logic

When the agent encounters a specific product term in the source markdown:

1.  **Extract** the term from the main definition.
2.  **Replace** it with its functional equivalent (e.g., _Genesis Engine_ $\rightarrow$ $f_{init}$).
3.  **Inject** a sidenote (`<aside>`) containing the "Marketing/Context" mapping.

**Example Transformation:**

- _Input:_ "The **Genesis Engine** calculates the lightness."
- _Output:_ "The **initialization function** $f_{init}$ calculates the lightness. $\oplus$ [Sidenote: $f_{init}$ is implemented by the **Genesis Engine** in v2.0.]"

## 6. Browser Support (Baseline 2025)

The engine relies on:

- `position-anchor` / `anchor()`
- `text-wrap: pretty`
- CSS Math Functions (`max`, `calc`)

_Legacy browsers are served the Mobile Fallback._
