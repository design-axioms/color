# Deferred Work

## Epoch 10: Ecosystem & Interoperability

### Action Surface & Override Architecture

**Context:**
We encountered an issue where applying a brand hue to an inverted `surface-action` (which is dark in Light Mode) resulted in a very dark, almost black color because the system preserved the surface's low lightness.

**Current Solution:**

- We implemented a "Lightness Override" mechanism using `--override-surface-lightness`.
- We had to **unregister** these properties in `engine.css` to allow `var()` fallbacks to work correctly (since registered properties always have an initial value).

**Discussion Points:**

- Is unregistering properties the right approach, or does it break the "Typed CSS" philosophy?
- Should the "Brand Action" be a distinct surface type in the config rather than a CSS modifier class?
- Does the current approach scale to other surface types that might need similar overrides?

## Epoch 22: Fresh Eyes Audit

### Luminance Spectrum UI

**Context:**
We planned to replace the disconnected "Page Anchors" sliders with a unified "Luminance Spectrum" visualization to improve the mental model of lightness and contrast.

**Status:**
Deferred to prioritize the "Fresh Eyes" audit and simulation.

**Goal:**
Implement a unified slider/graph that visualizes the entire lightness spectrum (0-100) and allows manipulating anchors directly on it, showing the "Safe Zone" and contrast relationships.
