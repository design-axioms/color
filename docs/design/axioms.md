# The Constitution (Axioms)

> **Status**: Living Document
> **Version**: 1.1 (Epoch 11)

This document serves as the "Constitution" for the Color System. It consolidates the core philosophy, physical laws, and architectural rules that govern the system. All design decisions and code changes must align with these axioms.

## I. The Prime Directive

**Accessibility is the Foundation of Aesthetics.**

A design cannot be beautiful if it cannot be perceived. We reject the idea that accessibility and aesthetics are in conflict; instead, we treat accessibility as the physical medium upon which beauty is built.

- **Constraint, not Feature**: Accessibility is not a "nice to have" or a compliance checklist item. It is the mathematical constraint solver that generates the palette.
- **Universal Perception**: We design for the human eye in all its variations (aging, color blindness, low vision), not just the designer's monitor.

## II. The Laws of Physics (Light)

These axioms describe how the system models light and color perception.

### 1. Lightness is Relative

A surface's lightness is never absolute; it is defined by its **Context**.

- **Polarity**: A "light" surface in a dark mode context is actually dark. A "dark" surface in a light mode context is actually light.
- **Adaptation**: The system solves for _contrast ratios_, not hex codes. `Surface-100` might be white in one theme and black in another, but its relationship to its content remains constant.

### 2. Chroma is Expensive

High chroma (saturation) reduces available lightness contrast.

- **The Trade-off**: You cannot have a color that is both extremely vibrant and extremely accessible against all backgrounds.
- **Budgeting**: Every surface has a "chroma budget". Spending it on vibrancy means you have less room for lightness variation.

### 3. Hue Rotates (The Bezold-Brücke Effect)

Hue is not static across the lightness spectrum.

- **Natural Shift**: As colors get lighter or darker, our perception of their hue shifts. A linear ramp of "Blue" often looks purple in the darks or teal in the lights.
- **Non-Linear Correction**: The system uses cubic Bezier curves to rotate hue non-linearly, mimicking natural light physics (cool shadows → warm highlights) to maintain perceptual harmony.
- **Reference**: See [Hue Shift Rationale](hue-shift.md) for the mathematical implementation.

## III. The Laws of Architecture (Surfaces)

These axioms describe how the system organizes UI elements.

### 4. Surfaces are Containers

Every visible element lives on a **Surface**.

- **No Floating Content**: Text, icons, and borders never exist in a vacuum. They are always "on" something.
- **Taxonomy**:
  - **Canvas**: The infinite backdrop (`page`, `workspace`).
  - **Object**: A contained element (`card`, `tinted`).
  - **Action**: An interactive element (`action`).
  - **Spotlight**: A high-emphasis element (`spotlight`).

### 5. Context Flows Down

A surface establishes the **Context** for its children.

- **Inheritance**: When you nest a Card on a Page, the Card consumes the Page's context and creates a new context for its contents.
- **Automatic Adjustment**: The system automatically adjusts contrast and polarity based on the nesting level. You don't manually pick "Dark Card" or "Light Card"; you just pick "Card".

### 6. Text is Relative

Text color is defined by the surface it sits on, not by global variables.

- **Context Consumers**: Text tokens (`text-strong`, `text-subtle`) are abstract requests for contrast.
- **Inversion**: `text-strong` on a light surface is dark. `text-strong` on a dark surface is light. The component doesn't know or care; it just asks for "Strong Text".

## IV. The Laws of Integration

These axioms describe how the system interacts with the world.

### 7. The Code is the Source of Truth

Design tools (Figma, Sketch) are downstream consumers of the code, not the other way around.

- **Generation**: Tokens are generated from the configuration code.
- **No Manual Tweaks**: We do not manually tweak individual hex codes in the output. If a color looks wrong, we adjust the _algorithm_ or the _configuration constraints_.
- **Isomorphism**: The core logic (`src/lib`) is isomorphic. It runs identically in Node.js (CLI) and the Browser (Theme Builder), ensuring the preview always matches the build output.

### 8. No Magic Numbers

All values are derived from the configuration (Anchors, Curves).

- **Math vs. Magic**: We reject arbitrary values like "Blue-500".
- **Derivation**: Every color is the result of a solver function: `f(Context, Intent) = Color`.

### 9. Baseline Newly Available

We build for the modern web, not the legacy web.

- **Policy**: We adopt features that are "Newly Available" in major browsers (last 2 versions). We do not burden the codebase with polyfills or fallbacks for obsolete browsers unless strictly necessary.
- **Examples**: `oklch()`, `light-dark()`, `@property`, `popover`.

## V. The Laws of Engineering

These axioms describe how we build the software itself.

### 10. State is a Domain Model

We model application state using plain classes and Runes, not framework-specific boilerplate.

- **Encapsulation**: Logic lives in `*.svelte.ts` classes, not in UI components.
- **Reactivity**: We use fine-grained reactivity (`$state`, `$derived`) to track changes automatically.
- **Injection**: State is injected via Context, avoiding global singletons and ensuring testability.
- **Reference**: See [State Architecture](state-architecture.md).
