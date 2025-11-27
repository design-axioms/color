# Decision Log

This file tracks key architectural and design decisions made throughout the project. It serves as a reference to understand _why_ things are the way they are and prevents re-litigating settled issues without new information.

## Format

### [Date] Title of Decision

- **Context**: What was the problem or situation?
- **Decision**: What did we decide to do?
- **Rationale**: Why did we choose this path? What alternatives were considered?

### [2025-11-25] Defer Framework Integration

- **Context**: We planned to add React/Vue hooks in Epoch 3.
- **Decision**: Defer this work.
- **Rationale**: The core library should remain framework-agnostic. The hooks are trivial to implement by consumers (`useMemo(() => solve(config), [config])`). Adding them now would complicate the build/test setup without significant value.

### [2025-11-25] Vendor Mermaid.js for Documentation

- **Context**: We needed to render Mermaid diagrams in `mdbook`. The standard solution is `mdbook-mermaid`, a Rust binary.
- **Decision**: Vendor `mermaid.min.js` and inject it via a custom script.
- **Rationale**:
  - **Portability**: Avoids requiring a Rust toolchain (`cargo install`) for documentation contributors.
  - **Simplicity**: Keeps the project focused on Web technologies (JS/CSS).
  - **Control**: Allows us to update the script version easily via `scripts/update-mermaid.sh`.

### [2025-11-25] Live CSS for Documentation Visualizations

- **Context**: We needed to explain complex color concepts (polarity, hue shifting) in the documentation. Static images are hard to maintain and don't show the "real" system.
- **Decision**: Inject the actual system CSS (`tokens`, `engine`, `utilities`) into the documentation site and use HTML/CSS for diagrams.
- **Rationale**: Ensures documentation is always up-to-date with the code. Demonstrates the system's capabilities directly in the guide.

### [2025-11-25] Documentation Architecture Split

- **Context**: The "Runtime" documentation was confusing because it mixed static CSS concepts (Context Variables) with dynamic JavaScript APIs (Engine).
- **Decision**: Split documentation into "CSS Architecture" (Static) and "Runtime API" (Dynamic).
- **Rationale**: Clarifies the mental model. Most users only need to understand the CSS Architecture to _use_ the system. The Runtime API is only for advanced users building dynamic tools.

### [2025-11-25] Rename "Solver" to "Theme Builder" in Docs

- **Context**: Users were confused by the term "Solver" when the UI is called "Theme Builder".
- **Decision**: Rename the documentation chapter to "Theme Builder" and frame the "Solver" as the internal engine.
- **Rationale**: Aligns documentation with the product UI. Reduces cognitive load by using consistent terminology.

### [2025-11-25] Align Taxonomy with System Colors

- **Context**: We needed a robust way to support Windows High Contrast (Forced Colors) mode.
- **Decision**: Explicitly map our semantic roles (Surface, Action, etc.) to CSS System Colors (`Canvas`, `ButtonFace`, etc.) via a variable swap in `engine.css`.
- **Rationale**: Provides automatic, platform-native accessibility support without requiring users to write manual media queries for every surface.

### [2025-11-25] Keep "Solver" Terminology for API

- **Context**: We considered renaming the `solve()` function to `build()` or `ThemeBuilder` to match the UI.
- **Decision**: Keep `Solver` and `solve()` for the core API.
- **Rationale**:
  - **Precision**: "Solve" accurately describes the constraint-based mathematical process (APCA contrast). "Build" implies simple assembly.
  - **Separation**: Distinguishes the calculation phase (`solve`) from the output generation phase (`generateTokensCss`).
  - **Clarity**: Avoids naming conflicts with the `ThemeBuilder` UI component in the demo.

### [2025-11-25] Build-time High Contrast Generation

- **Context**: We needed to support `prefers-contrast: more`. We considered a runtime solution (detecting the media query in JS and re-solving with a high-contrast config) vs. a build-time solution.
- **Decision**: Generate a high-contrast variant at build time and append it to the CSS inside a `@media` block.
- **Rationale**:
  - **Zero Runtime Cost**: No JavaScript is required to switch modes; the browser handles it instantly via the media query.
  - **Robustness**: Works even if JS is disabled or fails to load.
  - **Simplicity**: The "High Contrast" logic (widening anchors, zero chroma) is deterministic and doesn't require user configuration at runtime.

### [2025-11-25] "Ink & Paper" Print Strategy

- **Context**: We needed to support printing. The default dark/light modes often waste ink or look bad on paper.
- **Decision**: Force a "Light Mode" context and remove background colors from surfaces in `@media print`.
- **Rationale**:
  - **Economy**: Saves ink by treating the paper as the background.
  - **Legibility**: Ensures high contrast (black text on white paper).
  - **Simplicity**: Avoids complex "print stylesheets" by leveraging the existing semantic structure and just stripping the "paint".

### Browser Integration (Epoch 5: Phase 1)

- **Unified Theme Manager**: We decided to centralize all theme-related side effects (DOM classes, meta tags, favicons) into a single `ThemeManager` class rather than having disparate utilities. This ensures a single source of truth for the current mode.
- **Event-Driven Sync**: We chose to use `requestAnimationFrame` and event listeners for syncing theme changes instead of `MutationObserver` or polling. This is more performant and less prone to race conditions.
- **Native UI Primitives**: We opted to use standard CSS properties (`color-scheme`, `scrollbar-color`) for native UI integration, ensuring that the system plays nicely with the browser's built-in form controls and scrollbars without requiring custom JavaScript for every element.

### [2025-11-25] Baseline Newly Available Browser Support

- **Context**: We are implementing advanced color features (P3 Gamut) using `oklch`. We need to decide whether to support older browsers with fallbacks (e.g., hex codes).
- **Decision**: Adopt a "Baseline Newly Available" support policy. We will **not** generate fallbacks for `oklch`, `light-dark()`, or `@property`.
- **Rationale**:
  - **Simplicity**: Drastically reduces the complexity of the generator and CSS output.
  - **Future-Proof**: `oklch` is the standard for color on the web. Support is already >92% and growing.
  - **Target Audience**: This system is designed for modern web applications that likely already require modern browser features.

### [2025-11-25] Isomorphic Solver Architecture

- **Context**: We need to support both static CSS generation (CLI) and live theme editing (Demo App).
- **Decision**: Maintain a strictly isomorphic core (`src/lib`) that runs identically in Node.js and the Browser.
- **Rationale**:
  - **Consistency**: Guarantees that the "Live Preview" in the Theme Builder is pixel-perfectly identical to the final generated CSS.
  - **Maintainability**: A single codebase for the math engine reduces bugs and duplication.
  - **Flexibility**: Allows for future use cases like "Server-Side Rendering" of themes or "Edge Computing" generation.

### [2025-11-25] White Glow for Dark Mode Shadows

- **Context**: Standard black shadows (`oklch(0 0 0)`) are often invisible in Dark Mode because the background surfaces are already very dark.
- **Decision**: Use a diffuse "White Glow" (`oklch(1 0 0 / 0.15)`) for shadows in Dark Mode.
- **Rationale**:
  - **Visibility**: White light creates contrast against dark backgrounds, effectively simulating "elevation" or "backlighting".
  - **Aesthetics**: Creates a modern, neon-like effect that fits well with dark interfaces.
  - **Simplicity**: Avoids complex "elevation overlay" systems (lightening the background color) which can interfere with the color system's strict contrast guarantees.

### [2025-11-25] Harmonized Fixed Hues for Data Viz

- **Context**: We need to generate categorical palettes for charts. We considered "Auto-Rotation" (math-based) vs. "Fixed Hues" (curated).
- **Decision**: Use **Harmonized Fixed Hues**.
- **Rationale**:
  - **Quality**: Pure rotation often hits "muddy" or unappealing colors (e.g., dark yellow). Fixed hues ensure every color is distinct and nameable.
  - **Harmony**: By forcing these fixed hues to match the system's Lightness/Chroma constraints, we ensure they fit the theme even if the hues themselves are standard.
  - **Flexibility**: Users can override the specific hue list if they have brand requirements, but the default list provides a robust starting point (Tableau 10 style).

### [2025-11-26] Toolbar-Based Navigation

- **Context**: Navigation and global actions were scattered or missing in the demo app.
- **Decision**: Consolidate all navigation and global actions (Theme Toggle, Export, Reset) into a sticky top `Toolbar`.
- **Rationale**:
  - **Consistency**: Provides a stable anchor for the user across all views.
  - **Space Efficiency**: Frees up the sidebar for context-specific tools (like the Theme Builder controls).
  - **Discoverability**: Makes global actions like "Export" or "Theme Switch" always available.

### [2025-11-26] Preset Persistence Strategy

- **Context**: Switching between Presets and Custom themes was destructive and required confirmation dialogs.
- **Decision**: Implement auto-saving for the "Custom" slot in `localStorage` and track `presetId` explicitly.
- **Rationale**:
  - **Frictionless**: Users can explore presets without fear of losing their custom work.
  - **Stateful**: The app remembers exactly where you left off, even after a refresh.
  - **Simplicity**: Avoids complex "Save As" flows for temporary experimentation.

### [2025-11-26] Native Popover & Anchor Positioning

- **Context**: We needed a dropdown menu for the "Settings" panel in the Toolbar.
- **Decision**: Use the native HTML Popover API (`popover`) and CSS Anchor Positioning (`anchor-name`, `position-anchor`).
- **Rationale**:
  - **Modern Standards**: Aligns with our "Baseline Newly Available" philosophy.
  - **Performance**: Zero JavaScript overhead for positioning or focus management.
  - **Accessibility**: Native browser support for light-dismiss and focus trapping.

### [2025-11-26] Responsive Toolbar Labels

- **Context**: The Toolbar became crowded on smaller screens, causing layout breakage.
- **Decision**: Hide text labels on navigation buttons below `1100px`, showing only icons.
- **Rationale**:
  - **Density**: Preserves the layout structure without wrapping or overlapping.
  - **Usability**: Icons are standard enough (Home, Palette, Settings) to be understood without labels in constrained spaces.

### [2025-11-26] Hash Routing for Demo App

- **Context**: GitHub Pages is a static file host and does not support SPA routing (rewriting unknown paths to `index.html`). This causes 404 errors when refreshing deep links (e.g., `/demo/builder`).
- **Decision**: Use Hash Routing (`/#/builder`) via `wouter/use-hash-location`.
- **Rationale**:
  - **Reliability**: Guarantees that deep links work 100% of the time without server configuration.
  - **Simplicity**: Avoids the "404.html hack" (copying index.html to 404.html), which returns incorrect HTTP status codes and requires extra build steps.
  - **Appropriateness**: As a client-side tool/demo, "clean URLs" are less critical than functional deep linking.

### [2025-11-26] Vite Proxy for Local Dev

- **Context**: We initially wrote a custom Node.js script (`scripts/dev-site.ts`) to proxy requests between the docs (mdbook) and the demo (Vite) to simulate the production URL structure. This script was fragile, causing port conflicts and zombie processes.
- **Decision**: Use Vite's built-in `server.proxy` configuration instead of a custom script.
- **Rationale**:
  - **Stability**: Vite handles process management and port binding much more reliably than a custom script.
  - **Simplicity**: Removes ~100 lines of custom code and a dev dependency.
  - **Standardization**: Leverages standard Vite features that other developers are likely familiar with.

### [2025-11-26] Migrate to Astro Starlight

- **Context**: `mdbook` was great for static text, but we wanted to embed live, interactive components (like the `ContextVisualizer`) directly into the documentation to better explain the system.
- **Decision**: Migrate the documentation site to **Astro Starlight**.
- **Rationale**:
  - **MDX Support**: Allows importing and using React/Preact components directly in markdown.
  - **Performance**: Astro generates static HTML by default, ensuring fast load times.
  - **Ecosystem**: Starlight provides a robust documentation framework (sidebar, search, i18n) out of the box.

### [2025-11-26] Use Preact for Documentation Components

- **Context**: The Demo App is built with Preact. We wanted to reuse its components in the documentation without rewriting them.
- **Decision**: Configure Astro to use **Preact** for interactive islands.
- **Rationale**:
  - **Code Reuse**: We can directly import components from `@demo/components` into our `.mdx` files.
  - **Consistency**: The documentation demos behave exactly like the real application.
  - **Lightweight**: Preact is smaller than React, keeping the docs site fast.

### [2025-11-26] Embed Demo App in Site Build

- **Context**: We have a standalone Demo App (`/demo`) and the Documentation site. We want them to feel like a single cohesive product.
- **Decision**: Build the Demo App separately and copy it into the `dist/demo` folder of the Astro site during the build process.
- **Rationale**:
  - **Separation of Concerns**: The Demo App remains a standalone SPA with its own routing logic.
  - **Unified Deployment**: We deploy a single artifact to GitHub Pages.
  - **Deep Linking**: We use Hash Routing in the Demo App to ensure it works when hosted under a subdirectory/static host.

### [2025-11-27] Dogfooding Strategy for Docs

- **Context**: The documentation site was using hardcoded colors in its interactive components, which meant it didn't reflect the actual system configuration or theme changes.
- **Decision**: Configure the docs site to generate its own theme using the `color-system` CLI and consume those tokens in components.
- **Rationale**:
  - **Accuracy**: Ensures that the documentation always reflects the true state of the system.
  - **Testing**: Acts as a real-world integration test for the CLI and generated CSS.
  - **Maintainability**: Removes the need to manually update color values in the docs when the system defaults change.

### [2025-11-27] Data Viz Demo Implementation

- **Context**: The "Data Visualization" page described the palette generation feature but lacked any visual proof or example.
- **Decision**: Implement a lightweight `DataVizDemo` component using standard HTML/CSS (conic gradients, flexbox) rather than pulling in a charting library.
- **Rationale**:
  - **Performance**: Avoids adding heavy dependencies (like Recharts or Chart.js) to the documentation site.
  - **Simplicity**: The goal is to show the _colors_, not to build a full charting library.
  - **Dogfooding**: Demonstrates how to use the system's tokens (`--chart-1`) directly in CSS.

### [2025-11-27] Linting for Hardcoded Colors

- **Context**: To enforce the "Dogfooding" strategy, we needed a way to prevent developers (or agents) from accidentally re-introducing hardcoded colors.
- **Decision**: Add a `lint:colors` script that greps for hex/rgb/hsl patterns in the documentation source code and fails the build if found.
- **Rationale**:
  - **Automation**: Enforces the policy automatically in CI/CD.
  - **Simplicity**: A simple grep script is sufficient for this purpose without needing complex AST analysis.
  ### [2025-11-27] Responsive Theme Builder Layout

- **Context**: The Theme Builder UI was unusable on mobile devices due to a fixed-width sidebar and lack of wrapping.
- **Decision**: Implement a responsive layout using a dedicated CSS file (`ThemeBuilder.css`) that stacks the sidebar vertically on screens smaller than 768px.
- **Rationale**:
  - **Usability**: Enables users to explore the system on mobile devices.
  - **Maintainability**: Moving layout styles to a CSS file (instead of inline styles) makes it easier to manage media queries.

