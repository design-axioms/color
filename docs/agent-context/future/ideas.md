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
