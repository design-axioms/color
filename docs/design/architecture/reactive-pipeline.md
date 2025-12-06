````mdc
# The Reactive Pipeline

> **Status**: Draft
> **Version**: 1.0 (Epoch 23)

The **Reactive Pipeline** is the core architectural pattern of Axiomatic Color. It fundamentally changes how color is applied in CSS, moving from a model of _static assignment_ to _dynamic resolution_.

## The Problem with Static Tokens

In traditional systems, tokens are static values:

```css
:root {
  --text-subtle: #6b7280;
}

.my-element {
  color: var(--text-subtle);
}
```

This breaks when context changes. If `.my-element` is placed inside a dark card, or a brand-tinted section, the static hex code `#6b7280` might look wrong (too dark, or clashing hue). You end up needing `on-dark` variants or complex calc chains.

## The Solution: Late-Binding Resolution

In Axiomatic Color, **Color is a Function, Not a Value**.

The final pixel value is calculated by the browser's CSS engine at render time, based on a set of input variables that represent the _Context_ and the _Intent_.

### The Equation

$$ Color = f(Context, Intent, Modifier) $$

1.  **Context (The Surface)**: Provides the environment (Mode, Polarity, Base Hue, Base Chroma).
2.  **Intent (The Token)**: Provides the target contrast/lightness (High, Subtle, Subtlest).
3.  **Modifier (The Utility)**: Overrides specific inputs to the function.

### The Mechanism: Indirection Variables

We do not set properties directly. We set **Input Variables**.

#### 1. The Engine

The engine lives in the `:where(...)` block and defines the calculation. We split the engine into two phases: **Calculation** and **Application**.

**Phase 1: Calculation (Variables)**
Matches Surfaces AND Text Utilities. This ensures that text classes (like `.text-strong`) can trigger the math to resolve their color, even if they aren't on a surface element.

```css
:where([class^="surface-"], [class^="text-"], body) {
  /* Default Inputs */
  --text-lightness-source: var(--axm-text-high-token);
  --computed-fg-H: var(--base-hue);
  --computed-fg-C: var(--base-chroma);

  /* The Function */
  --computed-fg-color: oklch(
    from var(--text-lightness-source) l var(--computed-fg-C)
      var(--computed-fg-H)
  );

  /* The Output (Foreground Only) */
  color: var(--computed-fg-color);
}
```

**Phase 2: Application (Backgrounds)**
Matches ONLY Surfaces (and body). This prevents text utilities from accidentally painting a background color.

```css
:where([class^="surface-"], body) {
  background-color: var(--computed-surface);
}
```

#### 2. The Utilities (Class-Based Composition)

Utilities are atomic classes that modify _one_ part of the equation. Because they modify orthogonal inputs, they compose naturally.

**Lightness Utility (`.text-subtle`)**:

```css
.text-subtle {
  /* Changes the Source, preserving Hue/Chroma */
  --text-lightness-source: var(--axm-text-subtle-token);
}
```

**Hue Utility (`.hue-brand`)**:

```css
.hue-brand {
  /* Changes the Context, preserving Lightness */
  --base-hue: var(--axm-hue-brand);
  --base-chroma: var(--axm-chroma-brand);
}
```

### Composition in Action

When you combine these classes, the engine resolves the intersection automatically:

```html
<div class="surface-card hue-brand">
  <!--
    Context: Brand Hue
    Intent: High Contrast (Default)
    Result: Dark Brand Purple
  -->
  <h1 class="text-strong">Hello</h1>

  <!--
    Context: Brand Hue
    Intent: Subtle (Utility)
    Result: Muted Brand Purple
  -->
  <p class="text-subtle">World</p>
</div>
```

This allows for **Combinatorial Explosion** of possibilities without combinatorial CSS size. We don't generate `.text-subtle-on-brand-dark`, we just generate the logic that makes `.text-subtle` and `.hue-brand` work together.

## The Algebra of Color Design

To rigorously define how classes interact, we model the system as a state transformation machine. This ensures that composition is predictable and invariant-preserving.

### 1. The State Vector ($\Sigma$)

The CSS variables form a state vector $\Sigma$ that flows down the DOM tree.

$$ \Sigma = \langle H, C, L\_{src} \rangle $$

- $H$: The current **Context Hue** (e.g., Brand, Neutral).
- $C$: The current **Context Chroma** (Vibrancy).
- $L_{src}$: The **Intent Lightness** (The reference token for contrast).

### 2. The Operators

Classes are operators that transform $\Sigma$ into $\Sigma'$.

#### Surface Operator ($S$)

A surface establishes a new local context. It defines the background physics and resets the foreground intent.

$$ S(\Sigma_{parent}) \rightarrow \langle H_{S}, C_{S}, L_{default} \rangle $$

- **Invariant**: Surfaces are "Context Roots". They may inherit $H/C$ from parents, but they always reset $L_{src}$ to the default (High Contrast) to ensure readability.

#### Intent Operator ($I$)

Text utilities (e.g., `.text-subtle`) modify _only_ the lightness source.

$$ I_{subtle}(\langle H, C, L \rangle) \rightarrow \langle H, C, L_{subtle} \rangle $$

- **Invariant**: Intent is **Chromatically Transparent**. It preserves the $H$ and $C$ of the context.

#### Modifier Operator ($M$)

Context modifiers (e.g., `.hue-brand`) modify the environment variables.

$$ M_{brand}(\langle H, C, L \rangle) \rightarrow \langle H_{brand}, C_{brand}, L \rangle $$

- **Invariant**: Modifiers are **Contrast Preserving**. They change the "flavor" ($H, C$) but do not touch the "structure" ($L$).

### 3. The Resolution Function ($\Phi$)

The Engine acts as the resolution function $\Phi$ that projects the state $\Sigma$ onto the final CSS property.

$$ \text{Color} = \Phi(\Sigma) = \text{oklch}( \text{from } L\_{src} \text{ l } C \ H ) $$

### 4. Commutativity & Orthogonality

Because $I$ and $M$ operate on disjoint components of the vector $\Sigma$, they are effectively commutative in their result (though CSS cascade dictates the winner if they collided, the design ensures they don't).

$$ \Phi(I(M(\Sigma))) \equiv \Phi(M(I(\Sigma))) $$

This algebraic property allows us to mix and match `text-*` and `hue-*` classes without creating $N \times M$ specific overrides.

````
