# Future Ideas

## Infrastructure

- **CSS Bundling**: Currently, `scripts/update-docs.sh` uses `cat` to concatenate CSS files for the documentation. We should switch to a proper bundler like Lightning CSS to handle this more reliably and enable features like minification and transpilation if needed.
- **CSP Reporting**: Investigate using [report-uri.com](https://report-uri.com/) or a similar service to collect and analyze Content Security Policy (CSP) violation reports. This would allow us to monitor for potential security issues or misconfigurations in production without breaking the site for users (using `Content-Security-Policy-Report-Only`).

## UI/UX

- **Density Setting**: A "density" setting (similar to Gmail's comfort settings) that adjusts spacing scales. This would allow for a more compact UI without breaking the relative scaling of the system.
- **Textbook Mode**: A "vibe" setting that switches typography to a more academic style (e.g., using **Fraunces** for headings) and reorganizes the sidebar/layout to feel like a structured textbook or scientific journal.
- **Combine Density and Textbook Modes**: Don't have a bunch of sliders: have a single "vibe" setting that adjusts multiple parameters (density, typography, colorfulness) to create distinct moods (e.g., "Cozy", "Academic", "Vibrant", "Minimalist"). Potentially support custom vibes.
- **Interactive Tutorials**: Guided walkthroughs within the Theme Builder that teach users about concepts like Contrast Space, APCA, and Surface Context as they adjust settings.
  - I think this is a high priority once we get everything else sorted, but it implies thinking about how we want to represent code (a "REPL" mode?) and how to structure the tutorials. Svelte's tutorial structure is great, but implementing it will require thinking about design goals and axioms, personas, and learning outcomes. And _then_ we can build it.

## Ecosystem

- **`@algebraic-systems/layout`**: A companion layout system to complement the color system. This should likely follow similar principles (semantic, constraint-based, runtime-aware).

## Architecture

- **Simplify Token Surface**: We currently have special tokens like `highlight-surface-color` and `highlight-ring-color` that might be better modeled as standard surfaces with a specific hue (e.g., `.surface-highlight` or `.surface-selected` with `.hue-highlight`).
  - **Goal**: Reduce the number of "special" global tokens and rely more on the core surface + hue composition model.
  - **Benefit**: More consistent API, fewer special cases in the generator.

## Developer Tooling

- **Debug Overlay**: A "debug" overlay that can be toggled anywhere in the documentation (or any app using the system) to visualize the current surface context.
  - **Features**: Show current Surface Color, Intent, Context (Hue/Chroma), and Polarity.
  - **Goal**: Help users build a mental model of how concepts compose in real-time.
  - **Portability**: Design it as a standalone tool/component that can be dropped into any app.
  - **Status**: Moved to Epoch 30 Phase 4 (Active).
