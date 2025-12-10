# Axiom VII: The Law of Determinism

> **Related Documents**: [Determinism](../../determinism.md)

## The Law

**Given the same configuration, the output must be bit-for-bit identical.**

In a generative system like Axiomatic Color, "Regression" takes on a different meaning. It's not just "does the function throw an error?"; it's "did the algorithm subtly shift the hue of `surface-2` by 0.5 degrees?".

Because the system is a "Physics Engine", small changes in the solver (e.g., a floating point adjustment, a change in the Bezier interpolation logic) can have cascading effects across the entire palette.

## The Rationale

Design systems are infrastructure. If the infrastructure shifts underfoot without warning, trust is eroded. Users must be confident that upgrading the library will not silently break their visual regression tests or violate their brand guidelines.

## The Implications

1.  **Golden Master Testing**: We rely on snapshot testing of the full system output (CSS, Tokens) to catch invisible drift.
2.  **Explicit Versioning**: Any change to the math that alters output, even if "better", is a breaking change or must be opt-in.
3.  **No "Magic" Randomness**: The system must be purely functional. No `Math.random()` or time-based seeds in the generation logic.
