# Axiom II: The Laws of Physics (Light)

These axioms describe how the system models light and color perception, treating color as a physical phenomenon rather than a digital value.

## 1. Lightness is Relative

A surface's lightness is never absolute; it is defined by its **Context**.

### Polarity

- A "light" surface in a dark mode context is actually dark.
- A "dark" surface in a light mode context is actually light.
- The system abstracts this into `Polarity` (Page vs. Inverted) so developers don't have to think about "Dark Mode" as a separate codebase.

### Adaptation

The system solves for **contrast ratios**, not hex codes.

- `Surface-100` might be white in one theme and black in another.
- Its relationship to its content (e.g., "This text must be Lc 60 against this surface") remains constant.
- This mimics the human eye's adaptation to different lighting conditions.

## 2. Chroma is Expensive

High chroma (saturation) reduces available lightness contrast.

### The Trade-off

You cannot have a color that is both extremely vibrant and extremely accessible against all backgrounds.

- As Chroma increases, the available Lightness range shrinks (the "Gamut Cusp").
- To maintain contrast, high-chroma colors must often be darker (on light backgrounds) or lighter (on dark backgrounds) than their neutral counterparts.

### Budgeting

Every surface has a "chroma budget".

- Spending it on vibrancy means you have less room for lightness variation.
- The system automatically manages this budget, clamping chroma if it violates contrast constraints.

## 3. Hue Rotates (The Bezold-Brücke Effect)

Hue is not static across the lightness spectrum.

### Natural Shift

As colors get lighter or darker, our perception of their hue shifts.

- A linear ramp of "Blue" often looks purple in the darks or teal in the lights.
- Shadows naturally cool down (Rayleigh scattering), while highlights often warm up (direct light).

### Non-Linear Correction

The system uses cubic Bezier curves to rotate hue non-linearly.

- We do not just mix white/black.
- We rotate the hue angle as lightness changes to mimic natural light physics.
- **Reference**: See [Hue Shift Rationale](../hue-shift.md) for the mathematical implementation.
