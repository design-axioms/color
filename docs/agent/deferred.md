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

# Future Ideas

## Infrastructure

- **CSP Reporting**: Investigate using [report-uri.com](https://report-uri.com/) or a similar service to collect and analyze Content Security Policy (CSP) violation reports. This would allow us to monitor for potential security issues or misconfigurations in production without breaking the site for users (using `Content-Security-Policy-Report-Only`).

## UI/UX

- **Visualizations for Physics of Light**: The `physics-of-light` documentation page needs visualizations to better explain the concepts.
- **Interactive Tutorials**: Guided walkthroughs within the Theme Builder that teach users about concepts like Contrast Space, APCA, and Surface Context as they adjust settings.
  - I think this is a high priority once we get everything else sorted, but it implies thinking about how we want to represent code (a "REPL" mode?) and how to structure the tutorials. Svelte's tutorial structure is great, but implementing it will require thinking about design goals and axioms, personas, and learning outcomes. And _then_ we can build it.

## Ecosystem

- **`@algebraic-systems/layout`**: A companion layout system to complement the color system. This should likely follow similar principles (semantic, constraint-based, runtime-aware).

## Architecture

- **Simplify Token Surface**: We currently have special tokens like `highlight-surface-color` and `highlight-ring-color` that might be better modeled as standard surfaces with a specific hue (e.g., `.surface-highlight` or `.surface-selected` with `.hue-highlight`).
  - **Goal**: Reduce the number of "special" global tokens and rely more on the core surface + hue composition model.
  - **Benefit**: More consistent API, fewer special cases in the generator.

## Documentation / User Programming Model

- **Intentional Internals Audit**: Review every `axm-docs:explanatory` span and decide whether the internal detail is truly intentional (a pedagogical deep dive) or a symptom of a missing public abstraction.
  - **Deliverable**: A decision log + remediation list: keep / replace with public contract / move to appendix.
  - **Outcome**: Reduce reliance on internals in docs without losing valuable “how it works” teaching.
