# Design: Determinism & Golden Master Testing

> **Related Axiom**: [The Laws of Integration](../axioms/04-integration.md) (Code is Truth)

## The Law of Determinism

**Given the same configuration, the output must be bit-for-bit identical.**

In a generative system like Axiomatic Color, "Regression" takes on a different meaning. It's not just "does the function throw an error?"; it's "did the algorithm subtly shift the hue of `surface-2` by 0.5 degrees?".

Because the system is a "Physics Engine", small changes in the solver (e.g., a floating point adjustment, a change in the Bezier interpolation logic) can have cascading effects across the entire palette.

## The Problem: Invisible Drift

Unit tests check if `solve(context)` returns _a_ value, or a value within a range. But they rarely catch subtle drift. If we upgrade a dependency or tweak a math utility, we might inadvertently change the visual output of the system for all users.

## The Solution: Golden Master Tests

We need a "Golden Master" (or Snapshot) strategy for the _entire system output_.

### Strategy

1.  **Canonical Config**: Define a comprehensive `color-config.json` that exercises every feature (Polarity, Modes, Overrides, Presets).
2.  **Snapshot Artifacts**:
    - `theme.css`: The full CSS output.
    - `tokens.json`: The DTCG token export.
    - `tailwind.preset.js`: The Tailwind config.
3.  **CI Check**:
    - On every PR, generate these artifacts from the Canonical Config.
    - Compare them bit-for-bit with the committed "Golden Masters".
    - If they differ, the build fails unless the user explicitly accepts the change (updates the snapshots).

### Implementation Details

- **Tooling**: Jest/Vitest Snapshots are good for small strings, but for large CSS files, we might want a dedicated diff tool that can ignore harmless changes (like whitespace) but flag value changes.
- **Visual Regression**: Ideally, we would also pair this with visual regression testing (Playwright) of the "Grand Simulation" to see how those token changes render in the browser.
