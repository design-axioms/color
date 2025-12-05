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

### [2025-11-27] Docs/Demo Context Integration

- **Context**: Interactive components in the documentation (like `HueShiftVisualizer`) crashed because they relied on `ThemeContext` but were rendered in isolation (Astro Islands) without a Provider.
- **Decision**: Create wrapper components (e.g., `HueShiftDemo`) that include the `ThemeProvider` and compose the visualizer within the same island.
- **Rationale**:
  - **Reliability**: Ensures the component tree is hydrated together with its required context.
  - **Isolation**: Keeps the documentation page logic separate from the core component logic.

### [2025-11-28] Unregister Override Properties

- **Context**: We implemented `--override-surface-lightness` to fix visual issues with Brand buttons. We initially registered this property via `@property` for type safety. However, registered properties always have an initial value, which prevents `var(--override, --fallback)` from ever using the fallback.
- **Decision**: Explicitly **unregister** (remove) the `@property` definition for override variables.
- **Rationale**:
  - **Functionality**: The fallback mechanism is critical for the system's default behavior. Without it, every surface would need an explicit override value.
  - **Trade-off**: We lose type safety and animation interpolation for the override value itself, but we gain the correct cascading behavior.

### [2025-11-28] Full Screen Container for Theme Builder

- **Context**: Starlight's default layout adds significant padding and constrains content width, which is ideal for reading documentation but breaks the application-like experience required for the Theme Builder.
- **Decision**: Implement a `FullScreenContainer` component that uses `position: fixed` to overlay the entire viewport, effectively breaking out of the Starlight layout flow.
- **Rationale**:
  - **Immersiveness**: Provides the full canvas needed for the complex Theme Builder UI.
  - **Isolation**: Prevents Starlight's global styles (like max-width) from interfering with the builder's internal layout.
  - **Simplicity**: Avoids needing to create a completely separate Astro layout or route just for one page.

### [2025-11-28] Layout Primitives (Stack & Cluster)

- **Context**: The Theme Builder UI relied on ad-hoc CSS and fragile flexbox hacks for alignment, leading to visual regressions (e.g., misaligned buttons and inputs).
- **Decision**: Introduce reusable layout primitives (`Stack` for vertical rhythm, `Cluster` for horizontal grouping) based on the "Every Layout" methodology.
- **Rationale**:
  - **Robustness**: Structural components enforce alignment rules more reliably than utility classes scattered across elements.
  - **Maintainability**: Centralizes layout logic, making it easier to update spacing or alignment globally.
  - **Consistency**: Ensures a uniform rhythm across the UI.

### [2025-11-28] Migrate to Svelte 5

- **Context**: The project was using Preact for interactive components. We wanted to align with other projects and leverage Svelte 5's improved developer experience and performance.
- **Decision**: Migrate all interactive components to **Svelte 5**.
- **Rationale**:
  - **Runes**: Svelte 5's new reactivity model (Runes) simplifies state management compared to React hooks.
  - **Performance**: Svelte's compiler-based approach results in smaller bundles and faster runtime performance.
  - **Ecosystem**: Svelte 5 is the future of the framework, and adopting it now ensures longevity.

### [2025-11-28] Pure Component Migration Strategy

- **Context**: We are migrating from a Context-heavy React architecture to Svelte.
- **Decision**: Port leaf components (like `ContrastBadge`) as **pure components** first, accepting data via props instead of relying on global stores/context immediately.
- **Rationale**:
  - **Isolation**: Allows testing components in isolation without mocking complex context providers.
  - **Incremental Adoption**: We can use these components within the existing React app (via islands or wrappers) or in new Svelte pages without a full rewrite of the state management layer upfront.

### [2025-11-28] Unify Demo Architecture (Fresh Eyes)

- **Context**: After migrating the Theme Builder to Svelte, the documentation demos were still using legacy React wrappers (`SystemDemo`), creating a "split-brain" state management issue where two different contexts (React vs Svelte) were active simultaneously.
- **Decision**: Replace `SystemDemo` with a Svelte-based `DemoWrapper` and migrate all documentation MDX files to use Svelte components exclusively.
- **Rationale**:
  - **Consistency**: Ensures a single source of truth for application state (`ThemeState`, `ConfigState`) across the entire site.
  - **Maintainability**: Removes the need to maintain parallel component libraries (React vs Svelte) and context providers.
  - **Performance**: Reduces bundle size by removing React/Preact dependencies from the critical path of documentation pages (once fully migrated).

### [2025-11-29] Formalize Axioms as Constitution

- **Context**: Design wisdom was scattered across multiple documents (`concepts.md`, `implementation.md`, `hue-shift.md`), making it hard to maintain consistency as the project evolved.
- **Decision**: Consolidate all core principles into a single authoritative document: `docs/design/axioms.md`.
- **Rationale**:
  - **Single Source of Truth**: Provides a clear reference for both human developers and AI agents.
  - **Alignment**: Ensures that new features (like Svelte migration) are checked against established principles.
  - **Clarity**: Explicitly defining "Laws" (Physics, Architecture, Integration) helps resolve conflicts during decision making.

### [2025-11-29] Refine Personas based on Audits

- **Context**: The "Fresh Eyes" audits revealed gaps between our theoretical personas and the actual friction points users were experiencing (e.g., CLI issues, export fidelity).
- **Decision**: Update the personas in `docs/design/personas.md` to explicitly list these "Needs" and "Frustrations".
- **Rationale**:
  - **Realism**: Personas should reflect reality, not just an ideal state. By documenting the friction, we prioritize fixing it.
  - **Alignment**: Ensures that future work (like Phase 3.5 fixes) is directly traceable to a user need.

### [2025-11-29] Raw HTML Snippets for Documentation

- **Context**: We wanted to show "Hello World" examples in the documentation that were easy to copy-paste but also rendered live previews. We considered using MDX code blocks or Svelte components.
- **Decision**: Store snippets as raw HTML files in a `snippets/` directory and use a custom `<Snippet>` component to fetch and render them.
- **Rationale**:
  - **Authenticity**: The source code shown to the user is exactly what is being rendered in the preview. No "hidden magic" or framework abstractions.
  - **Simplicity**: Users can copy the HTML directly into their projects without needing to strip out React/Svelte specific syntax.
  - **Maintainability**: Snippets are just files. They can be linted, formatted, and tested independently of the documentation content.

### [2025-11-30] Client-Only Hydration for Visualizers (REVERTED)

- **Context**: The `HueShiftVisualizer` component (Svelte 5) was causing hydration errors (`TypeError: Cannot read properties of undefined`) when rendered with `client:load` in Astro.
- **Decision**: Use `client:only="svelte"` for complex, interactive visualization components.
- **Rationale**:
  - **Stability**: Avoids hydration mismatches where the server-rendered HTML differs slightly from the client's initial state (common with SVG math or browser-specific inputs).
  - **Performance**: These components are "app-like" tools, not content. They don't need to be SEO-indexed or rendered on the server.
  - **Simplicity**: Bypasses the complexity of debugging Svelte 5 hydration edge cases in Astro islands.
- **Update (2025-11-30)**: This decision was **reverted** because `client:only` also failed with the same error. We are now investigating a deeper root cause in Epoch 14.

### [2025-11-30] The "Playbook" Approach (Epoch 14)

- **Context**: We spent significant time in Epoch 13 trying to fix a hydration error (`TypeError: ... get_first_child`) using trial-and-error methods (guards, timeouts, directives).
- **Decision**: We will stop "mashing" and start a dedicated research phase. We will create a "Playbook" document that defines the proven, reliable patterns for using Svelte 5 in this specific Astro environment.
- **Rationale**: The error is environmental, not component-specific. Continuing to patch individual components is inefficient. We need to understand the root cause (likely version mismatch or configuration) to ensure long-term stability.

### [2025-11-30] Native SVG Paths for Visualizers

- **Context**: The `HueShiftVisualizer` was using polyline approximations which looked jagged and were hard to debug.
- **Decision**: Switch to native SVG Cubic Bezier paths (`<path d="M... C...">`).
- **Rationale**:
  - **Quality**: Provides mathematically perfect curves at any zoom level.
  - **Performance**: Reduces the number of DOM elements compared to hundreds of line segments.
  - **Maintainability**: Easier to debug a single path string than a loop of points.

### [2025-11-30] Client-Only Interactivity for Tools

- **Context**: We attempted to support SSR for the `HueShiftVisualizer`, but it resulted in broken "static" versions that confused users.
- **Decision**: Remove the "Static (SSR)" versions and rely on `client:load` for interactive tools.
- **Rationale**:
  - **Clarity**: Users should only see the tool when it is fully functional.
  - **Simplicity**: Removes the need to maintain a separate "static" implementation that inevitably drifts from the interactive one.
  - **Reality**: These are "apps" embedded in docs, not just content. They require JS to be useful.

### [2025-11-30] Inline Token Inspector

- **Context**: Users struggled to map abstract concepts (Surfaces) to concrete implementation details (CSS Variables) in the documentation.
- **Decision**: Implement an "Inline Token Inspector" that allows users to click on documentation diagrams to see the active CSS variables.
- **Rationale**:
  - **Discovery**: Makes the system self-documenting. Users can "ask" the documentation what a surface is made of.
  - **Transparency**: Demystifies the "magic" of the context engine by showing the raw values.
  - **Interactivity**: Encourages exploration and reinforces the mental model that "surfaces create context".

### [2025-12-01] Configuration Options (Prefix/Selector)

- **Context**: Users needed to integrate the color system into existing applications that might have naming conflicts or require scoped styles.
- **Decision**: Add an `options` object to `SolverConfig` supporting `prefix` (for CSS variables) and `selector` (for the root rule).
- **Rationale**:
  - **Flexibility**: Allows the system to coexist with other libraries (e.g., Tailwind, Bootstrap) or legacy code.
  - **Scoping**: Enables generating multiple themes that live side-by-side on the same page (e.g., a "preview" area with a different theme).

### [2025-12-01] Audit Command Logic

- **Context**: We needed a way to verify that generated themes meet accessibility standards programmatically.
- **Decision**: Implement a `color-system audit` command that checks for APCA contrast < 60 and Polarity violations (e.g., dark text on dark background).
- **Rationale**:
  - **Automation**: Enables CI/CD pipelines to reject themes that break accessibility rules.
  - **Quality Assurance**: Provides a "safety net" for users customizing their themes, warning them if they break the system's guarantees.

### [2025-12-01] Manual Overrides in Solver

- **Context**: Some brand colors or specific UI elements (like "Delete" buttons) require exact hex values that might slightly violate the strict contrast curve but are intentional.
- **Decision**: Add an `override` property to `SurfaceConfig` that allows users to force a specific hex value, bypassing the solver's contrast logic.
- **Rationale**:
  - **Pragmatism**: Acknowledges that "perfect" math sometimes conflicts with brand guidelines or design intent.
  - **Control**: Gives power users an escape hatch while keeping the default path safe and automated.

### [2025-12-02] Publint for Verification

- **Context**: We were using a custom `verify-exports.ts` script to check if the package exports were correct. This script was brittle and hard to maintain.
- **Decision**: Switch to `publint` for package verification.
- **Rationale**:
  - **Standardization**: `publint` is a community-standard tool for this purpose.
  - **Robustness**: It handles edge cases (like CJS/ESM interop, types, etc.) much better than a custom script.
  - **Maintenance**: We offload the maintenance burden of the verification logic to the tool maintainers.

### [2025-12-02] Ember Helper API

- **Context**: We needed to document how to integrate the color system with Ember.js. The initial thought was to use a component-heavy approach (e.g., `<Surface @name="card">`).
- **Decision**: Recommend a helper-based API (`{{surface "card"}}`) and a `ThemeManager` service.
- **Rationale**:
  - **Modern Ember**: Aligns with Ember's modern "Glimmer" architecture and template capabilities.
  - **Lightweight**: Avoids the overhead of creating a component instance for every single surface, which is critical for performance in complex UIs.
  - **Flexibility**: Helpers can be used anywhere in templates (attributes, modifiers, etc.) more easily than components.

### [2025-12-02] Defer Theme Builder Refactor

- **Context**: The current Theme Builder is functional but feels more like a "configuration tool" than a "design tool". We have many ideas for improving it (visual graph, data density).
- **Decision**: Defer major refactors to a dedicated future phase and capture aspirations in `docs/agent-context/future/theme-builder-aspirations.md`.
- **Rationale**:
  - **Focus**: The current goal (Epoch 18) is deployment and sharing. Starting a major UI refactor now would derail the release.
  - **Planning**: These ideas need careful design and prototyping. Rushing them into the current codebase would likely result in technical debt.
  - **Documentation**: Capturing them in a dedicated document ensures they aren't lost and provides a clear starting point for the next phase.

### [2025-12-01] Rebrand to Axiomatic Color

- **Context**: The project was originally named "Algebraic Color System". As the design philosophy matured, we realized "Axiomatic" better described the deterministic, rule-based nature of the system.
- **Decision**: Rename the project to "Axiomatic Color" and the package to `@axiomatic-design/color`.
- **Rationale**:
  - **Clarity**: "Algebraic" implies math is the primary interface. "Axiomatic" implies _rules_ are the primary interface, which is more accurate for a design system.
  - **Ecosystem**: Aligns with the broader "Axiomatic Design" suite of tools we are planning.
  - **Identity**: Creates a stronger, more distinct brand identity.

### [2025-12-02] OIDC Trusted Publishing

- **Context**: We needed a secure way to publish to npm from GitHub Actions. The traditional method uses a long-lived `NPM_TOKEN` secret, which is a security risk and prone to expiry/rotation issues.
- **Decision**: Use **OpenID Connect (OIDC)** Trusted Publishing.
- **Rationale**:
  - **Security**: Eliminates the need for long-lived secrets. GitHub exchanges a short-lived token with npm for each run.
  - **Provenance**: Enables generating build provenance (attestations), which increases supply chain security and user trust.
  - **Modern Best Practice**: This is the recommended approach by both GitHub and npm.

### [2025-12-02] Manual Bootstrap for First Release

- **Context**: We encountered a "chicken-and-egg" problem when setting up OIDC. npm requires the package to exist _before_ you can configure Trusted Publishing for it. However, we couldn't publish it via CI because we hadn't configured it yet.
- **Decision**: Manually publish `v0.1.0` from the developer's local machine to "bootstrap" the package registry entry.
- **Rationale**:
  - **Pragmatism**: It was the only way to break the deadlock.
  - **One-Time Cost**: This is only required for the very first publish. Subsequent releases will use the automated OIDC pipeline.

### [2025-12-02] CI Workflow Optimization

- **Context**: The CI pipeline was failing due to missing Astro types during linting and redundant test flags.
- **Decision**:
  - Run `astro sync` before linting in CI.
  - Remove redundant `--run` flag from `pnpm test` in CI (since it's already in `package.json`).
- **Rationale**:
  - **Correctness**: Astro types are generated code; they must exist for the linter to validate imports correctly.
  - **Efficiency**: Fixing the configuration prevents false negatives in the CI pipeline.

### [2025-12-02] Contributing Documentation

- **Context**: As we move to a public release, we need to standardize the contribution workflow.
- **Decision**: Create `CONTRIBUTING.md` documenting the PR workflow, CI checks, and development environment.
- **Rationale**:
  - **Onboarding**: Helps new contributors (and AI agents) understand the expected workflow.
  - **Standardization**: Explicitly stating the "Branch -> PR -> Merge" flow reduces ambiguity.

### [2025-12-02] Style Isolation for Theme Builder

- **Context**: The Theme Builder UI, embedded within the Starlight documentation site, was inheriting prose styles (like margins on lists) that broke its layout.
- **Decision**: Wrap the entire `StudioLayout` in a `<Diagram>` component, which applies the `not-content` class.
- **Rationale**:
  - **Isolation**: The `not-content` class is Starlight's standard mechanism for opting out of typography styles.
  - **Simplicity**: Avoids writing complex CSS resets or using Shadow DOM.
  - **Consistency**: Reuses an existing component (`Diagram`) designed for this exact purpose.

### [2025-12-02] Unified Context Graph

- **Context**: The previous "Anchor Graph" consisted of 4 disconnected sliders, making it impossible to visualize the relationship between Light and Dark modes.
- **Decision**: Create a single `ContextGraph` component that stacks Light and Dark tracks vertically within each Context (Page/Inverted).
- **Rationale**:
  - **Mental Model**: Reinforces that Light and Dark modes are two sides of the same coin (Context).
  - **Contrast**: Allows visualizing the "Safe Zone" (the gap between background and text) directly on the graph.

### [2025-12-02] Context Tree for Surface Management

- **Context**: The "Surface Manager" was a flat list of cards, which failed to represent the hierarchical nature of the system (surfaces nest inside surfaces).
- **Decision**: Refactor the UI into a nested **Context Tree**.
- **Rationale**:
  - **Axiom Alignment**: "Context is King". The tree visualizes how context flows down the hierarchy.
  - **Scalability**: A tree view handles many surfaces better than a grid of large cards.

### [2025-12-02] Strict Token Compliance

- **Context**: We found raw CSS variable references (e.g., `var(--bg-surface-sunken-token)`) in the codebase, which bypassed our type-safe `theme.ts` system.
- **Decision**: Ban raw token usage in frontend components and enforce it via `check-tokens.sh`.
- **Rationale**:
  - **Maintainability**: If we rename a token in the generator, the type system will catch it. Raw strings would break silently.
  - **Consistency**: Ensures all UI components use the same source of truth for values.

### [2025-12-02] CSS Consolidation

- **Context**: We had duplicate utility classes in `site/src/styles/docs.css` and `css/utilities.css`, leading to confusion about which file to edit and potential inconsistencies.
- **Decision**: Consolidate all CSS utilities into the root `css/` directory and point the Astro configuration to use these shared files.
- **Rationale**:
  - **Single Source of Truth**: Ensures that the CLI, Demo, and Documentation all use the exact same CSS engine.
  - **Maintainability**: Reduces code duplication and makes it easier to update utilities globally.
  - **Consistency**: Guarantees that a utility class like `.ring-focus-visible` behaves identically in every environment.

### [2025-12-02] Utility Class Renaming

- **Context**: The utility class `.focus-visible-ring` was inconsistent with other ring utilities (e.g., Tailwind's `ring-*` convention).
- **Decision**: Rename `.focus-visible-ring` to `.ring-focus-visible`.
- **Rationale**:
  - **Consistency**: Aligns with the standard "property-modifier" naming convention used elsewhere in the system.
  - **Predictability**: Makes it easier for developers to guess the class name.

### [2025-12-03] Reactive Pipeline Architecture

- **Context**: We needed utilities like `.text-subtle` to work correctly inside context modifiers like `.hue-brand`. Previously, utilities set `color` directly, which overwrote the hue modification.
- **Decision**: Implement a "Late-Binding" architecture where utilities set "Source Variables" (`--text-lightness-source`, `--text-hue-source`) and the engine calculates the final color.
- **Rationale**:
  - **Composability**: Allows orthogonal concerns (Lightness vs Hue) to be composed without combinatorial CSS classes.
  - **Simplicity**: Reduces the number of generated CSS rules.
  - **Power**: Enables complex context interactions that were previously impossible with static CSS.

### [2025-12-03] Bezier Typography Scale

- **Context**: We needed a typography scale. We considered a static map (t-shirt sizes) vs a mathematical scale.
- **Decision**: Use **Cubic Bezier Interpolation** to generate font sizes from a `min` to `max` range over `n` steps.
- **Rationale**:
  - **Fluidity**: Allows for non-linear scaling (e.g., larger steps at the top end) that feels more natural than a linear scale.
  - **Control**: A single curve controls the entire system, making it easy to adjust the "drama" of the typography globally.
  - **Axiomatic**: Aligns with our philosophy of using math to derive values rather than hardcoding magic numbers.

### [2025-12-03] Grand Simulation for Validation

- **Context**: We needed to verify the system's robustness across different personas and workflows. Unit tests were insufficient for testing the end-to-end "feel" and integration.
- **Decision**: Create a "Grand Simulation" project (`examples/grand-simulation`) that mimics a real user's environment.
- **Rationale**:
  - **Realism**: Forces us to use the published package (via `pnpm pack`) and public documentation, exposing friction points that internal tests miss.
  - **Isolation**: Ensures that the system works without the dev-time tooling and symlinks of the monorepo.

### [2025-12-03] CSS Variable Beacon for Runtime Config

- **Context**: The runtime (`ThemeManager`) needed to know which surfaces were "inverted" to apply the Hard Flip logic. We considered generating a `constants.ts` file.
- **Decision**: Emit a CSS variable (`--axm-inverted-surfaces`) containing the selector list.
- **Rationale**:
  - **Coupling**: Keeps the configuration coupled to the CSS artifact, which is the source of truth for styling.
  - **Simplicity**: Removes the need for a separate build step or artifact for the JS runtime. The CSS _is_ the config.

### [2025-12-03] MutationObserver for Hard Flip

- **Context**: Native UI elements (checkboxes, scrollbars) inside inverted surfaces didn't respect the theme because `color-scheme` wasn't set on the element.
- **Decision**: Use a `MutationObserver` to watch for inverted surfaces and force the `color-scheme` style property.
- **Rationale**:
  - **Dynamism**: Handles dynamic content (SPAs, modals) where surfaces appear after page load.
  - **Correctness**: It's the only way to force the browser to render native controls correctly in a nested context that differs from the document root.

### [2025-12-03] Native MathML with CSS Overrides

- **Context**: We needed to render complex algebraic formulas in the documentation.
- **Decision**: Use native MathML with custom CSS overrides (`site/src/styles/starlight-custom.css`).
- **Rationale**:
  - **Performance**: Zero JS overhead compared to MathJax or KaTeX.
  - **Accessibility**: Native support in modern browsers is excellent and accessible to screen readers.
  - **Control**: CSS overrides allow us to match the font stack and spacing exactly to our design system.

### [2025-12-03] Single Source of Truth for Docs Theme

- **Context**: The documentation site was defining its own color tokens in `starlight-custom.css`, duplicating values from the generated `theme.css`. This led to maintenance issues where the docs didn't reflect the actual system state.
- **Decision**: Refactor `starlight-custom.css` to map Starlight variables _to_ Axiomatic variables (e.g., `--sl-color-bg: var(--bg-surface-sunken)`).
- **Rationale**:
  - **Consistency**: Ensures the docs always look exactly like the system they document.
  - **Maintainability**: Changing a system token automatically updates the docs theme without manual intervention.

### [2025-12-03] Targeted MutationObserver

- **Context**: The `ThemeManager` was scanning the entire `document.body` on every DOM mutation to find inverted surfaces. This is a potential performance bottleneck for large applications.
- **Decision**: Optimize the observer to check only `mutation.addedNodes`.
- **Rationale**:
  - **Performance**: Drastically reduces the work done during DOM updates.
  - **Correctness**: We only need to apply the "Hard Flip" fix to _new_ elements entering the DOM; existing elements are already handled.

### [2025-12-04] Prioritize Fresh Eyes Review

- **Context**: We planned to start Developer Tooling (VS Code extension, etc.) in Epoch 29.
- **Decision**: Insert a "Fresh Eyes & Zero-to-One Review" epoch before Developer Tooling.
- **Rationale**:
  - **Validation First**: We need to ensure the core system is usable before building tools on top of it.
  - **Foundation**: Tooling should be built on a stable, user-tested foundation.

### [2025-12-04] Tree-sitter for Class Extraction

- **Context**: We needed to extract class names from HTML, TSX, and Svelte files to provide autocompletion and hover information in the VS Code extension.
- **Decision**: Use `web-tree-sitter` with WASM grammars instead of Regular Expressions.
- **Rationale**:
  - **Robustness**: Regex is fragile for parsing nested structures and complex template syntax (like Svelte blocks or JSX expressions). Tree-sitter provides a true AST.
  - **Accuracy**: Allows us to distinguish between a class string and other string literals, reducing false positives.
  - **Performance**: WASM-based parsing is extremely fast and runs efficiently within the VS Code extension host.

### [2025-12-04] LSP Architecture for Extension

- **Context**: We needed to implement language features like completion and hover. We considered a simple extension vs. a full Language Server Protocol (LSP) implementation.
- **Decision**: Implement a lightweight LSP architecture (Client/Server split).
- **Rationale**:
  - **Scalability**: Keeps the heavy lifting (parsing, analysis) separate from the UI thread.
  - **Portability**: The server logic can theoretically be reused in other editors (Neovim, Zed) in the future.
  - **Standardization**: Follows VS Code best practices for language extensions.

### [2025-12-04] Dynamic Schema Loading

- **Context**: The extension needs to validate `color-config.json` files. Hardcoding the schema would require releasing a new extension version every time the config format evolves.
- **Decision**: Load the schema dynamically from the workspace or a bundled fallback.
- **Rationale**:
  - **Agility**: Users can update their CLI (and thus the schema) without waiting for an extension update.
  - **Correctness**: Ensures validation matches the version of the CLI installed in the project.

### [2025-12-04] Dynamic Theme Loading for Linter

- **Context**: The ESLint plugin needs to know which tokens and utility classes exist to provide accurate suggestions. We considered hardcoding the token list or reading the source config.
- **Decision**: Read the _generated_ `css/theme.css` and `css/utilities.css` files from the user's project.
- **Rationale**:
  - **Source of Truth**: The generated CSS is the ultimate source of truth for what is available in the runtime.
  - **Simplicity**: Parsing CSS variables is simpler and more robust than trying to interpret the `color-config.json` logic (which involves complex math) inside the linter.
  - **Decoupling**: The linter doesn't need to know _how_ the tokens were generated, only that they exist.

### [2025-12-04] Heuristic Suggestions for Hardcoded Colors

- **Context**: When a user hardcodes a color (e.g., `#ffffff`), we want to suggest a semantic token. However, `#ffffff` could be `surface.card`, `text.high`, or `border.token`.
- **Decision**: Use the CSS property name as a heuristic to filter suggestions.
- **Rationale**:
  - **Relevance**: If the property is `background-color`, suggesting a `text` token is unhelpful.
  - **UX**: Reduces the noise in the suggestion list, making it more likely the user will pick the correct semantic role.

### [2025-12-04] Strict Typing for Plugin

- **Context**: ESLint plugins are often untyped or loosely typed.
- **Decision**: Enforce strict TypeScript typing and linting for the plugin codebase itself.
- **Rationale**:
  - **Reliability**: Prevents runtime errors in the linter, which can crash the user's IDE or build.
  - **Maintainability**: Makes the complex AST traversal logic easier to understand and refactor.

### [2025-12-05] Heuristic DTCG Import

- **Context**: We wanted to allow users to import existing design tokens (DTCG format) into Axiomatic. However, most existing token sets are "flat" palettes (e.g., `blue.500`) rather than semantic systems.
- **Decision**: Implement a "Heuristic Importer" that infers semantic intent from common naming conventions (e.g., `brand`, `neutral`, `surface`) and color properties (Chroma, Lightness).
- **Rationale**:
  - **Low Friction**: Allows users to get started with their existing brand colors without manually mapping every single token.
  - **Intelligence**: By analyzing the color values (e.g., finding the neutral scale range), we can configure the physics engine to match the original system's contrast feel automatically.
  - **Fallback**: If heuristics fail, we map to safe defaults, ensuring a valid configuration is always produced.

### [2025-12-05] CLI Import Command

- **Context**: We needed a way to expose the importer functionality.
- **Decision**: Add a dedicated `import` command to the CLI: `axiomatic import <file>`.
- **Rationale**:
  - **Discoverability**: A top-level command makes the feature easy to find.
  - **Workflow**: Fits naturally into the "init -> import -> build" lifecycle.
  - **Safety**: Supports `--dry-run` to let users preview the changes before overwriting their config.

### [2025-12-06] Standard CSS First

- **Context**: We are migrating the build system to Lightning CSS. We need to decide whether to leverage its non-standard features (like nesting or custom media queries) or stick to standard CSS.
- **Decision**: We will write **Standard CSS** exclusively. Build tools are for optimization and bundling only.
- **Rationale**:
  - **Longevity**: Standard CSS is forever. Proprietary syntax (Sass, Less, non-standard extensions) creates technical debt and lock-in.
  - **Portability**: Our CSS should be usable without a build step if necessary (e.g., via CDN).
  - **Clarity**: Users should be able to read the source code and understand it without knowing a specific tool's syntax.

### [2025-12-06] Lightning CSS for Bundling

- **Context**: The project relied on a fragile `cat`-based shell script for bundling CSS files. This lacked minification, syntax checking, and vendor prefixing.
- **Decision**: Adopt **Lightning CSS** as the official bundler.
- **Rationale**:
  - **Performance**: Lightning CSS is written in Rust and is extremely fast.
  - **Standards Compliance**: It strictly enforces CSS syntax (e.g., requiring `initial-value` for `@property`), which caught bugs in our codebase.
  - **Features**: Provides minification, bundling, and automatic vendor prefixing out of the box without complex configuration.
  - **Alignment**: Fits our "Standard CSS First" axiom by acting as a transparent optimizer rather than a transpiler for a custom language.
