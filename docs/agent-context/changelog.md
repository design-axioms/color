# Changelog

## Epoch 1: Packaging & Consumption

**Focus:** Transforming the project from a local workspace into a distributable NPM package.

### Key Changes

- **Build Configuration**: Introduced `tsup` for efficient bundling and `.d.ts` generation.
- **CLI Enhancements**: Added `init` command, argument support, and CWD awareness.
- **Package Metadata**: Updated `package.json` for proper distribution.

### Verification

- Verified `color-system init` scaffolds config.
- Verified `color-system` generates correct CSS.

## Phase: System Robustness & Animation Architecture

**Focus:** Hardening the core engine for "Fearless Injection" and smooth animations.

### Key Changes

- **Animation Architecture**: Shifted transition logic to computed properties (`@property`) to handle `light-dark()` snapping smoothly.
- **Fearless Injector**: Verified runtime theme injection works with the new architecture.
- **Solver Playground**: Improved math layout and theme awareness.

## Epoch 2: The Theme Builder

**Focus:** Building a visual, interactive editor for the color system.

### Key Changes

- **Isomorphic Runtime**: Refactored core logic to run in both Node.js and Browser, enabling "Live Solving".
- **Theme Builder UI**:
  - **Global Controls**: Sliders for Anchors, Key Colors, and Hue Shift.
  - **Surface Management**: CRUD interface for Groups and Surfaces.
  - **Live Preview**: Instant feedback via `FearlessInjector`.
- **UX Refinements**: Mode-aware controls and dynamic surface preview.
- **Export**: Added JSON download and CSS copy functionality.

## Epoch 3: Polish & Persistence

**Focus:** Refining the Theme Builder into a production-grade tool.

### Key Changes

- **Persistence**:
  - Implemented `localStorage` saving for `SolverConfig`.
  - Added "Reset to Default" functionality.
- **Templates & Presets**:
  - Introduced a Preset system with "Default", "High Contrast", and "Soft" themes.
  - Added a `PresetSelector` to the Theme Builder UI.
- **Contrast Validation**:
  - Integrated APCA contrast calculation.
  - Added real-time contrast badges (Lc scores) to the Surface Manager.
  - Badges provide visual feedback (Red/Orange/Green) based on accessibility guidelines.
- **Deferred**:
  - Framework Integration (React/Vue hooks) was deferred to keep the core library lightweight.

## Epoch 4: Documentation & Education

**Focus:** Creating comprehensive, accessible documentation and enhancing the learning experience.

### Key Changes

- **mdbook Setup**: Initialized a standalone documentation site using `mdbook`.
- **Content Migration**:
  - Migrated core concepts (`Surfaces`, `Anchors`, `Context`) into dedicated chapters.
  - Created new guides for `CLI`, `Runtime`, and `Frameworks`.
  - Documented the `Hue Shifting` algorithm.
- **Visual Learning**:
  - Added Mermaid diagrams for Surface Hierarchy, Anchor Ranges, and Context Flow.
  - **Vendored Mermaid**: Implemented a lightweight, dependency-free Mermaid integration for `mdbook`.
- **Interactive Elements**:
  - Added "Try the Theme Builder" links.
  - Implemented **Invalid Lc Indicator** in the Theme Builder to warn when anchor settings break accessibility.
  - **Live Demos**: Integrated system CSS into the docs to render live surface/context examples.
- **Refinement**:
  - Restructured content into "Concepts" (Usage) and "Deep Dive" (Internals) to improve learning curve.

### Deployment

- **GitHub Pages**: Configured automated deployment via GitHub Actions.
- **Site URL**: Updated `book.toml` to serve from `/algebraic/`.

## Phase 6: Iterative Refinement (Epoch 4)

**Focus:** Polishing the documentation based on user feedback and aligning it with the product's mental model.

### Key Changes

- **Visualization Overhaul**:
  - Replaced static diagrams with **Live HTML/CSS Visualizations** using the system's own CSS variables.
  - Visualized core concepts: Polarity, Hue Shifting, Surface Nesting, and Contrast Perception.
- **Documentation Restructuring**:
  - **Renamed "Solver" to "Theme Builder"**: Aligned documentation terminology with the UI.
  - **Split Runtime Docs**: Separated "CSS Architecture" (Static) from "Runtime API" (Dynamic) to clarify the distinction between using the CSS and controlling the engine.
- **Accessibility Deep Dive**:
  - **APCA Guide**: Created a dedicated chapter explaining the math behind the contrast scores.
  - **Forced Colors**: Documented the "Variable Swap" strategy for automatic Windows High Contrast support.
  - **Prefers Contrast**: Clarified the strategy for supporting user-requested high contrast.
- **Onboarding Improvements**:
  - **Quick Start**: Added a "Zero to Hero" guide.
  - **Glossary**: Added definitions for key terms (Anchor, Polarity, Surface).
  - **Softened Language**: Refined the introduction to reassure beginners that accessibility compliance is handled automatically.

## Epoch 5: Phase 1 - Browser Integration (2025-11-25)

**Goal**: Make the Color System feel "native" to the browser environment.

**Completed Work**:

- **Native UI Integration**: Added `color-scheme: light dark` and `scrollbar-color` to the CSS engine, ensuring native controls and scrollbars match the theme.
- **Runtime Utilities**: Created `src/lib/browser.ts` with a `ThemeManager` class to handle mode switching and side effects.
- **Meta Theme Color**: Implemented automatic syncing of `<meta name="theme-color">` with the document background.
- **Dynamic Favicons**: Added support for generating and updating SVG favicons based on the current theme color.
- **Demo Update**: Refactored the demo app to use `ThemeManager`, removing manual DOM manipulation and observers.

## Epoch 5: Phase 2 - Accessibility & High Contrast (2025-11-25)

**Goal**: Ensure the Color System is robust and accessible in challenging environments (High Contrast, Print).

**Completed Work**:

- **Forced Colors (Windows High Contrast)**:
  - Audited and refined `engine.css` to map semantic surfaces to System Colors (`Canvas`, `Highlight`, etc.).
  - Ensured interactive states and borders remain visible when backgrounds are stripped.
- **High Contrast Preference (`prefers-contrast: more`)**:
  - Implemented a **Build-time Generation** strategy.
  - Created `toHighContrast` utility in `generator.ts` that widens anchors to 0-100% and forces zero chroma.
  - Updated CLI to automatically generate and append this variant inside a `@media` block.
- **Print Styles**:
  - Added `@media print` support ("Ink & Paper" strategy).
  - Forces light mode, removes backgrounds to save ink, and hides interactive elements.
- **Documentation**:
  - Added a comprehensive **Accessibility** guide covering APCA (WCAG 3), Forced Colors, and Print.

## Epoch 5: Phase 3 - P3 Gamut Support (2025-11-25)

**Goal**: Unlock the full color capabilities of the system by enabling P3 Gamut support.

**Completed Work**:

- **Solver Architecture**: Updated `solve` to return full `ColorSpec` (L, C, H) instead of just lightness.
- **Generator Update**: Updated `generateTokensCss` to output `oklch(L C H)` instead of hardcoded grayscale.
- **Configuration**: Added `targetChroma` to `SurfaceConfig` to allow specific surfaces (like buttons) to have vibrancy.
- **Policy**: Established "Baseline Newly Available" policy (no fallbacks for older browsers).
- **Verification**: Verified that the isomorphic architecture ensures consistency between CLI generation and live runtime solving.

## Epoch 5: Phase 4 - UI Polish & Education (2025-11-25)

**Goal**: Refine the Theme Builder UI and enhance educational resources to make the system easier to understand and use.

**Completed Work**:

- **UI Polish**:
  - **Dual Range Sliders**: Implemented a custom `DualRangeSlider` component to allow intuitive control of "Start" and "End" anchors on a single track.
  - **Lock Explanations**: Added lock icons with tooltips to clearly explain why certain anchors (like Brand Inverted End) are fixed to specific values.
  - **Layout Improvements**: Refined the layout and spacing of the Theme Builder for a cleaner look.
- **Educational Components**:
  - **Context Visualizer**: Added a component to demonstrate how surfaces nest and inherit context.
  - **Gamut Comparator**: Added a visualization to compare the P3 and sRGB color gamuts.
  - **Hue Shift Visualizer**: Added a component to explain the logic behind hue shifting.
- **Documentation**:
  - Updated `accessibility.md` to reflect the new high contrast implementation.
  - Ensured all documentation is up-to-date with the latest changes.
- **Build Fixes**: Resolved issues with the demo build to ensure a smooth development experience.

## Epoch 6: Phase 1 - UI Primitives (2025-11-25)

**Goal**: Implement essential UI primitives (Elevation and Focus) to support rich application interfaces.

**Completed Work**:

- **Elevation System (Shadows)**:
  - Designed a semantic shadow scale (`sm`, `md`, `lg`, `xl`).
  - Implemented `light-dark()` support for shadows in `generator.ts`.
  - **Dark Mode Strategy**: Adopted a "White Glow" approach (`oklch(1 0 0 / 0.15)`) to ensure shadows are visible against dark backgrounds.
- **Focus Indicators**:
  - Implemented a universal focus ring system using `--focus-ring-color`.
  - Added `.focus-ring` utility class for consistent accessibility.
- **Demo & Docs**:
  - Added `PrimitivesShowcase` to the demo app.
  - Created `docs/guide/src/usage/primitives.md` to document the new features.

## Epoch 6: Phase 2 - Data Visualization Palettes (2025-11-26)

**Goal**: Generate categorical color palettes for charts and graphs that harmonize with the theme.

**Completed Work**:

- **Strategy**: Adopted "Harmonized Fixed Hues" (curated hues solved for lightness against the page background).
- **Configuration**: Added `palette` object to `SolverConfig` with `hues` and `targetChroma`.
- **Generator**: Updated `generateTokensCss` to output `--chart-1` through `--chart-10` tokens.
- **Refinement**:
  - **Shuffled Hues**: Reordered the default hue list to maximize distinctiveness between adjacent colors.
  - **Contrast Tuning**: Lowered default target contrast to 60 (from 105) to prevent "muddy" colors in Light Mode.
- **Demo**: Added a "Data Visualization" showcase with interactive chroma controls and sample charts.
- **Documentation**: Added `docs/guide/src/usage/data-viz.md`.

## Epoch 7: Deployment & Infrastructure (2025-11-26)

**Goal**: Unify the Demo and Documentation into a single, cohesive site deployed to GitHub Pages, with a streamlined development workflow.

**Completed Work**:

- **Unified Development Server**:
  - Created `scripts/dev-site.ts` to run both `mdbook` and `vite` in parallel behind a proxy (`http://localhost:3000`).
  - Ensures local development mirrors production routing (`/` for docs, `/demo/` for app).
- **Unified Build Pipeline**:
  - Created `scripts/build-site.ts` to orchestrate the production build.
  - Builds the Demo App, builds the Documentation, and merges them into a single artifact.
- **GitHub Pages Deployment**:
  - Added a GitHub Actions workflow (`.github/workflows/deploy.yml`) to automatically build and deploy on push to `main`.
- **Routing & Configuration**:
  - Updated `vite.config.ts` to handle conditional base paths.
  - Switched the Demo App to **Hash Routing** (`/#/builder`) to ensure reliable deep linking on GitHub Pages (which lacks SPA rewrite support).
  - Updated `README.md` with new development instructions.

## Phase: Dev Environment Simplification (Epoch 7)

**Focus:** Simplifying the local development environment to match the production deployment structure without fragile custom scripts.

### Key Changes

- **Unified Dev Server**:
  - Replaced the custom `scripts/dev-site.ts` proxy script with Vite's built-in proxy configuration.
  - Configured `demo/vite.config.ts` to proxy non-demo requests to `mdbook` (port 3001).
  - This resolved `EADDRINUSE` errors and zombie processes associated with the custom script.
- **Script Updates**:
  - Simplified `package.json` scripts to run `docs:dev` and `demo dev` concurrently.
  - `pnpm dev:site` now reliably starts the unified environment at `http://localhost:3000`.

## Epoch 8: Architecture Migration (Astro Starlight) (2025-11-26)

**Goal**: Modernize the documentation stack to enable interactive, live components directly in the guide.

**Completed Work**:

- **Migration to Astro Starlight**:
  - Replaced `mdbook` with **Astro Starlight** for a modern, component-driven documentation site.
  - Ported all existing content (Concepts, Usage, API) to MDX.
- **Interactive Components**:
  - Configured **Preact** integration to share components with the Demo App.
  - Integrated `ContextVisualizer` and `HueShiftVisualizer` directly into the documentation pages, replacing static HTML/images.
  - Created `SystemDemo` wrapper to inject the runtime theme context into MDX pages.
- **Infrastructure**:
  - Updated build pipeline (`scripts/build-site.ts`) to build both the Astro site and the standalone Demo app.
  - Updated GitHub Actions workflow to deploy the new Astro build.
  - Deleted legacy `mdbook` source.

## Epoch 9: Documentation Restructure (2025-11-27)

**Goal**: Realign the documentation structure with the "User Journey", address "Fresh Eyes" feedback, and ensure the documentation site itself is a testbed for the system ("Dogfooding").

**Completed Work**:

- **Phase 1: Strategy & Structure**:
  - Reorganized the sidebar and file structure to match the "Ideal Flow" (Welcome -> Mental Model -> Usage -> Catalog).
  - Audited and removed "dead" content.
- **Phase 2: Content Rewrite**:
  - Rewrote `index.mdx` and `philosophy.md` for a more modern tone.
  - Refactored "Mental Model" chapters (`thinking-in-surfaces`, `physics-of-light`).
  - Updated "Getting Started" and "Catalog" guides.
- **Phase 3: Visual & Interactive Polish**:
  - **Data Visualization Demo**: Implemented `DataVizDemo` to visualize the `--chart-*` tokens with live bar and pie charts.
  - **Visual Hierarchy**: Introduced `.docs-card` and `.docs-card-header` to fix alignment and spacing issues in grid layouts.
  - **Theme Sync**: Fixed desynchronization between Starlight's theme picker and the internal `ThemeContext`.
- **Phase 4: Dogfooding & Robustness**:
  - **Strategy**: Configured the docs site to generate and consume its own theme using the `color-system` CLI.
  - **Refactor**: Updated `DynamicRange`, `HueShiftVisualizer`, and other components to use generated CSS variables (`--surface-*`, `--chart-*`) instead of hardcoded values.
  - **Phase 5: Holistic Review & Theme Builder Polish**:
  - **Fresh Eyes Audit**: Conducted a simulated user audit to identify navigation and layout issues.
  - **Docs Home**: Added a "Try the Theme Builder" CTA to the hero section for better discovery.
  - **Layout Fix**: Resolved a CSS conflict in `demo/src/app.css` to allow full-width layouts.
  - **Mobile Responsiveness**: Implemented a responsive layout for the Theme Builder (stacking sidebar on mobile).

