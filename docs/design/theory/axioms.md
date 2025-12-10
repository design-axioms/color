# The Constitution (Axioms)

> **Status**: Living Document
> **Version**: 2.0 (Epoch 30)

This document serves as the "Constitution" for Axiomatic Color. It consolidates the core philosophy, physical laws, and architectural rules that govern the system. All design decisions and code changes must align with these axioms.

## Vision

**Axiomatic Color is a Physics Engine for Design.**

We are not building a "Paint Set" (a collection of static colors). We are building a **Deterministic System** that generates accessible, harmonious, and adaptive interfaces from semantic intent.

- **Input**: Semantic Intent + Context.
- **Process**: Algorithmic Solver (Accessibility Constraints + Optical Physics).
- **Output**: Adaptive, Accessible, Harmonious UI.

## The Axioms

The axioms are organized into domains:

### [0. The Fundamental Theorem](axioms/00-fundamental-theorem.md)

**Color = f(Context, Intent)**
Color is not a static value; it is a function. The system is a reactive dependency graph that resolves pixel values based on semantic intent and environmental context.

### [I. The Prime Directive](axioms/01-accessibility.md)

**Accessibility is the Foundation of Aesthetics.**
We reject the idea that accessibility and aesthetics are in conflict. Accessibility is the mathematical constraint solver that generates the palette.

### [II. The Laws of Physics (Light)](axioms/02-physics.md)

**Lightness is Relative. Chroma is Expensive. Hue Rotates.**
We model color as a physical phenomenon, respecting the non-linear nature of human perception (Bezold-Brücke effect, Gamut Cusps).

### [III. The Laws of Architecture (Surfaces)](axioms/03-architecture.md)

**Surfaces are Containers. Context Flows Down. Text is Relative.**
We organize UI elements into a strict taxonomy of Surfaces that establish Context for their children.

### [IV. The Laws of Integration](axioms/04-integration.md)

**Code is Truth. No Magic Numbers. Baseline Newly Available. Standard CSS First.**
We ensure consistency and interoperability by deriving everything from configuration and targeting modern web standards. We use build tools only for bundling and optimization, not for language extension.

### [V. The Laws of Engineering](axioms/05-engineering.md)

**State is a Domain Model. Testing is a Ratchet. Late Binding.**
We build maintainable, testable software that leverages the power of the browser's CSS engine for dynamic resolution.

### [VI. The Law of Static Projection](axioms/06-projection.md)

**Static exports are snapshots.**
Since the system is dynamic, any static export (JSON, PDF) is a lossy projection of the system's state at a specific moment. We must enumerate states explicitly in these formats.

### [VII. The Law of Determinism](axioms/07-determinism.md)

**Given the same configuration, the output must be bit-for-bit identical.**
We rely on Golden Master testing to ensure that the "Physics Engine" does not drift silently.

### [VIII. The Law of Lossless Interoperability](axioms/08-interoperability.md)

**We export to other formats without losing semantic meaning.**
We prioritize formats that preserve the semantics of the system (like reactive CSS variables in Tailwind) over flattened values.

### [IX. The Law of "Just Enough" Configuration](axioms/09-configuration.md)

**We expose knobs for _intent_, not _implementation_.**
Users express what they want (Accessibility, Vibe), and the system handles the math.

### [X. The Law of Semantic Continuity](axioms/10-semantic-continuity.md)

**Transitions must preserve semantic intent, not just minimize distance.**
We reject linear interpolation when it violates the semantic meaning of the transition (e.g., forcing a "Cool -> Warm" hue shift to go the long way around the wheel).

## Missing / Implicit Axioms (To Be Formalized)

The following principles guide our work but have not yet been codified into Law:

- (None currently - all known axioms have been formalized)
