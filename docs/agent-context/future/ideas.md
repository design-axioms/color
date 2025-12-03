# Future Ideas

## Infrastructure

- **CSS Bundling**: Currently, `scripts/update-docs.sh` uses `cat` to concatenate CSS files for the documentation. We should switch to a proper bundler like Lightning CSS to handle this more reliably and enable features like minification and transpilation if needed.
- **CSP Reporting**: Investigate using [report-uri.com](https://report-uri.com/) or a similar service to collect and analyze Content Security Policy (CSP) violation reports. This would allow us to monitor for potential security issues or misconfigurations in production without breaking the site for users (using `Content-Security-Policy-Report-Only`).

## Theme Builder UI Overhaul (V2) & Integration

The current Theme Builder UI is functional but sparse. It lacks data density and intuitive representations of the complex color relationships being manipulated. Additionally, it currently lives as a separate SPA in `/demo`, which creates a disjointed experience from the documentation.

> **Update (Epoch 18):** The user has noted that the current state does not meet the aspirational goals. A dedicated future phase is required to rethink the design goals. See [Theme Builder Aspirations](theme-builder-aspirations.md).

- **Problem**:
  - Information is packed into cryptic icons (locks, warnings).
  - The "Surface List" is just a list of boxes.
  - There is no visual connection between the "Global Settings" (Anchors, Key Colors) and the resulting surfaces.
  - **Architecture**: It is a separate build artifact from the Astro site.
- **Goal**: Create a UI that _teaches_ the user how the system works while they use it, and fully integrate it into the Astro site architecture.
- **Ideas**:
  - **Full Integration**: Move the Theme Builder from `demo/` into a route within the Astro site (e.g., `site/src/pages/builder.astro` or similar), sharing the same layout and navigation as the docs.
  - **Visualizer Graph**: A node-based or layer-based view showing how surfaces inherit and modify context.
  - **Data Density**: Show actual contrast ratios, lightness values, and hex codes inline without clutter.
  - **Intuitive Controls**: Instead of just sliders, use visual histograms or gradients to show where a surface sits in the gamut.

## UI/UX

- **Density Setting**: A "density" setting (similar to Gmail's comfort settings) that adjusts spacing scales. This would allow for a more compact UI without breaking the relative scaling of the system.
- **Textbook Mode**: A "vibe" setting that switches typography to a more academic style (e.g., using **Fraunces** for headings) and reorganizes the sidebar/layout to feel like a structured textbook or scientific journal.
- **Combine Density and Textbook Modes**: Don't have a bunch of sliders: have a single "vibe" setting that adjusts multiple parameters (density, typography, colorfulness) to create distinct moods (e.g., "Cozy", "Academic", "Vibrant", "Minimalist"). Potentially support custom vibes.
- **Interactive Tutorials**: Guided walkthroughs within the Theme Builder that teach users about concepts like Contrast Space, APCA, and Surface Context as they adjust settings.
  - I think this is a high priority once we get everything else sorted, but it implies thinking about how we want to represent code (a "REPL" mode?) and how to structure the tutorials. Svelte's tutorial structure is great, but implementing it will require thinking about design goals and axioms, personas, and learning outcomes. And _then_ we can build it.

## Ecosystem

- **`@algebraic-systems/layout`**: A companion layout system to complement the color system. This should likely follow similar principles (semantic, constraint-based, runtime-aware).

## Tooling

- **VS Code Extension**: A VS Code extension to visualize our tokens inline (similar to UnoCSS or Tailwind IntelliSense).
  - **Features**:
    - Color swatches for token references (e.g., `--surface-card`).
    - Hover tooltips showing the resolved values (L\*, C, H).
    - Linting for invalid token usage or hardcoded colors.
- **Custom Lints**: A set of ESLint or Stylelint rules for users of the library.
  - **Goal**: Enforce system constraints and best practices.
  - **Rules**:
    - `no-hardcoded-colors`: Warns when using hex/rgb/hsl values directly instead of tokens.
    - `prefer-semantic-tokens`: Encourages using `--surface-card` over `--surface-token` where appropriate.
    - `validate-token-usage`: Checks if a token is valid for the current context (e.g., using a text token on a background).
- **Configurable Prefix & Public Linter**:
  - **Goal**: Allow users to customize the CSS variable prefix (currently `axm-`) and enforce usage rules.
  - **Features**:
    - Configuration option in `color-config.json` for `prefix`.
    - A public CLI command (e.g., `axiomatic lint`) that wraps our internal `check-tokens.sh` logic but respects the user's configured prefix.
    - This ensures users can enforce "no raw tokens" or "no hardcoded colors" policies in their own CI pipelines.
- **AI Context (`llms.txt`)**: A standardized file to help LLMs understand the project.
  - **Goal**: Enable AI agents to effectively generate code using the Axiomatic Color system.
  - **Content**:
    - Core axioms and mental model.
    - List of available tokens and their semantic meaning.
    - Examples of correct usage (surfaces, modifiers).
    - Architecture overview (Solver -> CSS Engine).

## Architecture

- **Simplify Token Surface**: We currently have special tokens like `highlight-surface-color` and `highlight-ring-color` that might be better modeled as standard surfaces with a specific hue (e.g., `.surface-highlight` or `.surface-selected` with `.hue-highlight`).
  - **Goal**: Reduce the number of "special" global tokens and rely more on the core surface + hue composition model.
  - **Benefit**: More consistent API, fewer special cases in the generator.
