# Changelog

## Epoch 44: Phase 1 - ThemeManager Unification (2026-01-08)

**Goal**: Resolve ThemeManager/AxiomaticTheme confusion. Establish single theme authority. Eliminate race conditions.

**Completed Work**:

- **ThemeManager Delegation**: ThemeManager now delegates all read operations (mode, vibrancy, hue) to AxiomaticTheme singleton.
- **Inverted Selectors Option**: Added `invertedSelectors` option to ThemeManager, eliminating CSS variable parsing at runtime.
- **CLI `--emit-ts` Flag**: Generate TypeScript metadata file with `invertedSelectors` and `defaultTau` exports.
- **Race Condition Fix**: Made `invertedSelectors` required; data now available at ES module import time (before code runs).
- **Documentation**: Updated RFC-021-INTEGRATION and JavaScript API reference.

**Architecture Established**:

- ThemeManager: Browser-side coordination (mode switching, system preference, inverted surfaces)
- AxiomaticTheme: Singleton observer for computed CSS state (reads --axm-\* variables)
- Generated metadata: Build-time export of theme configuration for import-time availability

**PRs**:

- #23: ThemeManager delegation to AxiomaticTheme
- #24: ThemeManager inverted selectors option
- #25: CLI `--emit-ts` flag
- #26: Deep partial type fix
- #28: Prettierignore for site
- #29: Make `invertedSelectors` required (BREAKING - v1.0.0)

**Verification**:

- `pnpm test` (130 tests passing)
- All pre-commit hooks green
- CI passing on all PRs

---

## Claim Ledger Triage: Epoch 2 — Theme Studio alignment (2025-12-17)

**Goal**: Align Studio + Starlight to a single theme authority (ThemeManager semantic plane) and make Studio config IO strict and shareable.

**Completed Work**:

- **Theme Bridge**: Introduced a ThemeManager-backed ThemeBridge so theme intent has a single writer; `data-theme` remains a synced vendor signal.
- **Studio theme UX**: Added System/Light/Dark selector and moved Studio rendering to use resolved mode where appropriate.
- **Strict config IO**: Studio can export `color-config.json` including `$schema` and can import config with schema validation (AJV) + UI notices.
- **Hook ergonomics**: Pre-push build is hermetic via `scripts/hooks/hermetic-build.sh` to avoid leaving generated artifacts dirty; `gh auth` check is github.com-scoped.
- **Coverage**: Added Playwright coverage for Studio mode switching and config import/export.

**Verification**:

- `pnpm -w test`
- `pnpm -w check:site`
- `pnpm -w test:playwright tests/studio.spec.ts`

**PR**: https://github.com/design-axioms/color/pull/18

## Epoch 44: Phase 1 - Vercel Preset (The Foundation) (2025-12-13)

**Goal**: Build a Vercel-like demo and harden Inspector infrastructure to support the upcoming "Hard Flip" demo.

**Completed Work**:

- **Demo App**: Implemented `examples/vercel-demo` as a consumer-style Vite + React integration.
- **Theme Configuration**: Replicated Geist Blue (Hue 212) via `color-config.json` rather than hardcoding theme logic.
- **Inspector Upgrade**: Refactored Inspector internals to support Baseline 2025 cascade features (`@layer`, `@scope`) and modern specificity.
- **Entry Point Docs**: Enforced and added JSDoc block comments on package entry points via `eslint-plugin-jsdoc`.
- **Architecture Coherence**: Documented Inspector runtime constraints (cross-origin `cssRules` access, native selector matching) in the inspector architecture doc.

**Verification**:

- `scripts/agent/verify-phase.sh` (Vitest + ESLint)

## Epoch 44: Phase 1.1 - Transition Smoothness (2025-12-14)

**Goal**: Eliminate perceptual snapping during real light↔dark transitions in the docs site.

**Completed Work**:

- **Snap Detector**: Extended `scripts/check-violations.ts` to detect transition-time snaps beyond bg/fg, including border separators, box-shadow, and outline geometry.
- **Focus Probe**: Added an optional `--snaps-focus` mode to ensure focus outlines can participate in snap detection.

**Verification**:

- Run via `pnpm check:violations -- --snaps` / `--snaps-theme` / `--snaps-focus` on representative pages.

## Epoch 44: Phase 1.2 - Continuity Auditing v2 Foundations (2025-12-14)

**Goal**: Prepare RFC 011’s refactor path (trace-first + finite measurement plane) and remove workflow hazards that block automation.

**Completed Work**:

- **No Dialogs Policy**: Removed `alert()` / `confirm()` usage from non-vendor code paths and enforced via ESLint (`no-alert`).
- **Snaps Logging Codec**: Centralized snaps log shaping/serialization in a dedicated codec module to reduce runner coupling.
- **Headless Clarity**: Made headless behavior explicit in CLI parsing so flags aren’t silently ignored.
- **Runner Refactor**: Reduced the `check-violations` runner’s orchestration complexity by extracting helpers (keeps lint constraints green).

**Verification**:

- `./scripts/agent/verify-phase.sh` (Vitest + ESLint)

## Epoch 44: Phase 2 - Visual Polish (The Hard Flip & DevTools) (2025-12-14)

**Goal**: Continue RFC 011’s refactor while keeping the docs/devtools experience smooth, reproducible, and CI-friendly.

**Completed Work**:

- **RFC 011: Trace-First Refactor**: Implemented modular checks with module-owned option builders + printing and a branch-free runner spine.
- **Replay Mode**: Added log-only analysis support so checks can be replayed without Playwright.
- **Shared Log Helpers**: Centralized common ObservationLog parsing/scanning utilities to reduce repetition.
- **Documentation Governance**: Added the “Stable Spine” axiom and expanded RFC 011 with the adjacent engineering guardrails.
- **Inspector Overlay UX**:
  - Prevent continuity audits from auto-running during state restore.
  - Make continuity audits abortable when closing the overlay mid-run.
  - Hide reset button unless there are actual overlay fixes to revert.
- **Tests**: Added unit-level regression tests for the overlay behaviors.

**Verification**:

- `./scripts/agent/verify-phase.sh` (Vitest + ESLint)

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

## Phase 7: Theme Builder Refinement & Docs Fixes (Epoch 9)

**Goal**: Polish the Theme Builder to be mobile-responsive and visually consistent, and fix critical rendering issues in the documentation.

**Completed Work**:

- **Documentation Fixes**:
  - **Context Adaptation**: Fixed the "Light Context" vs "Dark Context" visualization by ensuring `engine.css` and `utilities.css` are correctly loaded in the documentation site.
  - **Data Visualization**: Renamed `data-viz.md` to `data-viz.mdx` to enable MDX features, fixing the issue where import statements were rendered as text.
  - **Hue Shifting**: Added error handling to the `HueShiftVisualizer` and created a `HueShiftDemo` wrapper to ensure proper context propagation in Astro islands.
  - **Linear Contrast**: Aligned the "Linear Contrast" visualization in `solver-internals.md` to match the "Linear Lightness" example.
- **Theme Builder Refinement**:
  - **Refactored Inline Styles**: Moved all inline styles from `ThemeBuilder.tsx` to `ThemeBuilder.css` using semantic class names.
  - **Mobile Responsiveness**: Added media queries to `ThemeBuilder.css` to ensure the layout adapts gracefully to smaller screens (stacking sidebar).
- **Visual Polish**:
  - Audited for hardcoded values and replaced them with system tokens.

## Epoch 10: Phase 1 - DTCG Export (2025-11-27)

**Goal**: Enable exporting the generated theme tokens in the W3C Design Tokens Format Module (DTCG) standard.

**Completed Work**:

- **DTCG Exporter**: Implemented `toDTCG` in `src/lib/exporters/dtcg.ts` to map the internal `Theme` object to DTCG JSON.
- **CLI Command**: Added `export` command to the CLI (`color-system export --format dtcg`).
- **Type Definitions**: Formalized the `Theme` interface in `src/lib/types.ts`.
- **Testing**: Added unit tests for the exporter and verified the CLI output.

## Epoch 10: Phase 2 - Tailwind Integration & Visual Fixes (2025-11-28)

**Goal**: Expand ecosystem reach with a Tailwind CSS preset and resolve critical visual regressions in the documentation.

**Completed Work**:

- **Tailwind Integration**:
  - Implemented `toTailwind` exporter in `src/lib/exporters/tailwind.ts`.
  - Updated CLI to support `--format tailwind`.
  - Mapped surfaces to `light-dark()` and text to CSS variables for full context awareness.
- **Visual Regression Fix (Action Surfaces)**:
  - Resolved an issue where Brand buttons appeared black in inverted contexts.
  - **Override Architecture**: Implemented `--override-surface-lightness` in `engine.css` to allow specific surfaces to break contrast rules when necessary (e.g., for brand identity).
  - **Engine Fix**: Unregistered override properties to ensure `var()` fallbacks function correctly.

## Epoch 10: Phase 3 - DX Improvements (2025-11-28)

**Goal**: Improve the Developer Experience (DX) by adding tooling support for configuration and documenting ecosystem integrations.

**Completed Work**:

- **JSON Schema Support**:
  - Added automatic generation of `color-config.schema.json` from TypeScript types.
  - Updated `color-system init` to automatically inject the `$schema` property, enabling Intellisense out of the box.
- **Figma Integration**:
  - Created a comprehensive guide (`guides/ecosystem/figma`) for using exported DTCG tokens with Figma.
  - Documented the workflow for **Tokens Studio** and Figma Variables.
- **Documentation**:
  - Added a new "Ecosystem" section to the sidebar.

## Epoch 11: Phase 3.5 - Critical Fixes (2025-11-28)

**Goal**: Address critical friction points identified in the "Fresh Eyes Audit" to ensure the system is usable and consistent with its documentation.

**Completed Work**:

- **CLI Refactor**:
  - Implemented the `build` command with `--watch` support, matching the documentation.
  - Updated `src/cli/index.ts` to correctly route commands (`init`, `build`, `export`) and handle legacy arguments.
  - Fixed `package.json` bin entry and scripts.
- **Package Identity**:
  - Renamed package to `@axiomatic-design/color` to reflect its new home and scope.
- **DTCG Export Upgrade**:
  - Updated the DTCG exporter to output `oklch(L C H)` values for full P3 gamut support.
  - Ensured all semantic foreground tokens (`fg-high`, `fg-strong`, etc.) are exported.
- **Documentation Restoration**:
  - Restored the missing `Hue Shift Rationale` document to `docs/design/hue-shift.md`.

## Epoch 11: Phase 4 - Unification (Theme Builder Integration) (2025-11-28)

**Goal**: Move the Theme Builder from the standalone `demo` app into the Astro site (`site/`) to create a unified experience.

**Completed Work**:

- **Migration**:
  - Moved all Theme Builder components from `demo/src` to `site/src/components/builder`.
  - Migrated `ConfigContext` and created a new `ThemeContext` bridge for Starlight integration.
- **Integration**:
  - Created `site/src/content/docs/builder.mdx` as the new home for the builder.
  - Implemented `FullScreenContainer` to allow the builder to break out of Starlight's layout constraints.
- **Refinement**:
  - **Layout Primitives**: Introduced `Stack` and `Cluster` components for robust layout management.
  - **Visual Fixes**: Resolved CSS box-model issues causing misalignment in the preview area.
  - **Reset Functionality**: Added a "Reset to Default" button to the sidebar.
- **Cleanup**:
  - Removed the legacy `demo` directory.

## Epoch 12: Phase 1 - Framework Migration (Infrastructure) (2025-11-28)

**Goal**: Initialize the Svelte 5 environment within the Astro project and validate the migration path by porting foundational components.

**Completed Work**:

- **Infrastructure**:
  - Installed `svelte` (v5) and `@astrojs/svelte`.
  - Configured `astro.config.mjs` to support Svelte integration.
- **Component Porting**:
  - Ported layout primitives: `Stack.svelte` and `Cluster.svelte`.
  - Ported `ContrastBadge.svelte` using Svelte 5 runes (`$props`, `$derived`).
- **Fixes**:
  - Restored missing visualization components (`ContextVisualizer`, `HueShiftVisualizer`).
  - Fixed broken imports in `SystemDemo.tsx` and `HueShiftDemo.tsx`.
  - Fixed Theme Builder layout regression in documentation using `.not-content` wrapper.

## Epoch 12: Phase 2 - Framework Migration (Visualizations) (2025-11-28)

**Goal**: Port stateless visualization components used in documentation to Svelte 5 to validate the component architecture and reduce Preact usage.

**Completed Work**:

- **Component Porting**:
  - Ported `ContextVisualizer`, `DynamicRange`, `HueShiftVisualizer`, and `DataVizDemo` to Svelte 5.
  - Implemented `Diagram.svelte` wrapper for MDX integration.
  - Adopted a "Pure Component" strategy, relying on CSS variables and props instead of React Context.
- **MDX Integration**:
  - Updated `physics-of-light.mdx`, `data-viz.mdx`, `thinking-in-surfaces.mdx`, and `hue-shifting.mdx` to use the new Svelte components.
- **Verification**:
  - Verified the build (`pnpm docs:build`) passes with the new Svelte components.

## Epoch 12: Phase 3 - Framework Migration (State Architecture) (2025-11-28)

**Goal**: Establish a robust state management pattern for the Svelte 5 migration, replacing legacy React Context with a "Classes with Runes" architecture.

**Completed Work**:

- **Architecture**:
  - Adopted a "Classes with Runes + Context Injection" pattern (inspired by Ember/Glimmer).
  - Implemented **Module Singletons** (`themeState`, `configState`) to solve Astro's cross-island state sharing challenge.
- **Implementation**:
  - Created `ThemeState.svelte.ts`: Manages light/dark mode and DOM synchronization.
  - Created `ConfigState.svelte.ts`: Manages `SolverConfig`, persistence, and CRUD operations.
  - Created `StateProvider.svelte`: Provides dependency injection for components within large islands.
  - Created `ThemeToggle.svelte`: A test component to verify the architecture.
- **Verification**:
  - Created `DemoComposition.svelte` and `demo-test.mdx` to verify the state architecture in a live environment.
  - Confirmed that the build passes and the architecture is SSR-safe.
  - **Hydration Fix**: Resolved a critical hydration error (`TypeError: Cannot read properties of undefined (reading 'call')`) by reordering Astro integrations (`svelte` before `preact`).

## Epoch 12: Phase 4 - Framework Migration (Theme Builder) (2025-11-28)

**Goal**: Migrate the core `ThemeBuilder` application to Svelte 5, leveraging the new state architecture to create a highly performant and reactive editor.

**Completed Work**:

- **Core Migration**:
  - Migrated `ThemeBuilder.svelte` (Main Container) with live theme injection via `$effect`.
  - Migrated `AnchorsEditor.svelte` with complex dual-thumb slider logic and APCA contrast validation.
  - Migrated `SurfaceManager.svelte` with CRUD operations and expandable rows.
  - Migrated `KeyColorsEditor.svelte` and `HueShiftEditor.svelte`.
- **Integration**:
  - Created `BuilderWrapper.svelte` to bridge the `StateProvider` and the `ThemeBuilder`.
  - Updated `builder.mdx` to use the new Svelte implementation.
- **Features**:
  - **Live Preview**: Implemented scoped CSS injection for real-time feedback.
  - **Persistence**: Connected `ConfigState` for automatic `localStorage` saving.
  - **Accessibility**: Integrated `ContrastBadge` and warning indicators for failing contrast.
- **Fresh Eyes Cleanup**:
  - Unified the documentation demo architecture by replacing legacy React wrappers (`SystemDemo`) with Svelte (`DemoWrapper`).
  - Migrated all MDX files to use Svelte components, eliminating the "split-brain" state management issue.
  - Deleted legacy React components and context files.

## Epoch 11: Phase 1 - The Constitution (Axioms) (2025-11-29)

**Goal**: Consolidate scattered design wisdom and architectural decisions into a single authoritative document: `docs/design/axioms.md`.

**Completed Work**:

- **The Constitution**: Updated `docs/design/axioms.md` to include new axioms for State Management (Runes), Isomorphism, and Browser Support.
- **Documentation Structure**: Updated `docs/design/index.md` to organize design docs into Core, Deep Dives, and Audits.
- **Consolidation**: Verified that `axioms.md` aligns with the current codebase and architecture.

## Epoch 11: Phase 2 - Persona Refinement (2025-11-29)

**Goal**: Update personas to reflect recent learnings from the "Fresh Eyes" audits and align with the new "Constitution" (Axioms).

**Completed Work**:

- **Persona Updates**:
  - **Sarah (The Overwhelmed Pragmatist)**: Added specific pain points around CLI reliability and documentation accuracy.
  - **Alex (The Visual Tinkerer)**: Emphasized the need for "Immediate Feedback" and "Playgrounds".
  - **Jordan (The Accessibility Champion)**: Clarified the need for "Proof of Compliance" (APCA vs WCAG).
  - **Dr. Chen (The Color Scientist)**: Linked interests to the new "Laws of Physics" axioms.
  - **Marcus (The System Architect)**: Added requirements for "Lossless Interoperability" (P3 export).
- **Alignment**: Ensured all personas reference the new `axioms.md` correctly.

## Epoch 11: Phase 3 - Fresh Eyes Audit (2025-11-29)

**Goal**: Conduct a comprehensive review of the system using the newly refined Personas and the "Constitution" (Axioms) to identify friction points, inconsistencies, and areas for improvement.

**Completed Work**:

- **Audit**: Conducted a comprehensive audit of Documentation, Theme Builder, and CLI.
- **Findings**:
  - **Package Name Mismatch**: Identified a critical error in `installation.md` pointing to the wrong package name.
  - **Incomplete Exports**: Discovered that DTCG and Tailwind exports are missing Chart Colors and Primitives because they are calculated in the CSS generator, not the core solver.
  - **Node Version**: Noted a discrepancy between documentation (v18+) and `package.json` (v25+).
- **Deliverables**:
  - Created `docs/design/fresh-eyes-audit-3.md` with detailed findings.
  - Prioritized a list of critical fixes for the next phase.

## Epoch 14: Svelte 5 + Astro Hydration Research

### Phase 2: Reproduction via Isolation (Completed)

- **Visualizer Fixes**:
  - Refactored `HueShiftVisualizer` to use native SVG Cubic Bezier paths (`<path d="M... C...">`) for smoother rendering.
  - Fixed a critical visibility bug where the curve stroke color was using an undefined CSS variable (`--key-brand-color`). Swapped to `--text-high-token`.
  - Added UI controls to toggle control handles and improved the default curve shape.
- **Documentation Integration**:
  - Integrated the interactive `HueShiftVisualizer` directly into `hue-shifting.mdx`.
  - Removed the broken "Static (SSR)" version of the component to avoid user confusion.
- **Findings**:
  - The reported "hydration errors" were likely red herrings or secondary to the visual bugs. The component hydrates correctly with `client:load` when CSS variables are present.

### Phase 1: Isolated Reproduction (Completed)

- **Isolation Strategy**: Created `src/pages/repro.astro` to test Svelte 5 components in isolation.
- **Verification**: Confirmed that basic Svelte 5 Runes (`$state`, `$derived`) and Context API work correctly in Astro.

## Epoch 13: User Experience & Integration (Concluded)

**Goal**: Address the "Missing Features" identified in Fresh Eyes Audit 4 by restructuring the documentation and tooling to create a seamless "Golden Path" for adoption.

**Status**: Concluded early due to technical blockers.

**Completed Work**:

- **Quick Start Overhaul**: Rewrote the landing page with a "Zero to Hero" tutorial.
- **Snippet Library**: Implemented a system for embedding live HTML snippets in docs.
- **Interactive "Try It"**: Added StackBlitz integration.

**Blocked Work**:

- **Hydration Instability**: Encountered severe Svelte 5 hydration errors in Astro, preventing the deployment of complex interactive documentation components (`HueShiftVisualizer`).
- **Decision**: Transitioned to Epoch 14 to focus exclusively on resolving this instability.

## Epoch 11: Phase 4 - Audit Fixes (2025-11-30)

**Goal**: Address critical gaps identified in the "Fresh Eyes Audit" to ensure the documentation meets the needs of all personas.

**Completed Work**:

- **Alex (Visual Tinkerer)**:
  - Implemented `HueShiftVisualizer.svelte` to replace the placeholder in the "Hue Shifting" documentation.
  - Created an interactive playground for visualizing the non-linear hue rotation curve.
- **Jordan (Accessibility Champion)**:
  - Added a "Mapping APCA to WCAG 2.1" section to `concepts/accessibility-first.md`.
  - Included a compliance table mapping system tokens (`text-subtlest`, etc.) to WCAG AA/AAA levels.
- **Marcus (System Architect)**:
  - Added "Token Reference" tables to `catalog/surfaces.mdx` and `catalog/actions.mdx`.
  - Documented the standard CSS variables exposed by each surface type.

## Phase: Fresh Eyes Audit & Polish (Epoch 11)

**Focus:** Addressing visual and interactive gaps identified in the "Fresh Eyes" audit, specifically polishing the Hue Shift Visualizer.

### Key Changes

- **Hue Shift Visualizer Polish**:
  - Refactored `HueShiftVisualizer.svelte` to align with the system's design language (Theme Builder aesthetic).
  - Implemented custom sliders and SVG graphing using system tokens.
  - **Hydration Strategy**: Adopted `client:only="svelte"` to avoid hydration mismatches with Svelte 5 in Astro islands.
- **Documentation Enhancements**:
  - Added WCAG contrast mappings to `tokens.json`.
  - Integrated dynamic token tables into documentation pages.

## Epoch 15: Concept-to-Code Bridge (Phase 1)

**Goal**: Connect abstract concepts (Surfaces, Context) directly to implementation details within the documentation.

**Completed Work**:

- **Inline Token Inspector**:
  - Created `TokenInspector`, `InspectorSurface`, and `InspectorPanel` components in Svelte 5.
  - Implemented a "DevTools-like" panel that displays resolved CSS variables for selected surfaces.
- **Documentation Integration**:
  - Integrated the inspector into `thinking-in-surfaces.mdx`.
  - Updated `ContextVisualizer` to be interactive, allowing users to click and inspect tokens.
- **Visual Refinement**:
  - Designed the panel to group tokens by category (Surface, Text, Border).
  - Added color previews and responsive layout.

## Epoch 13: Phase 4 - Advanced Customization (Mastery) (2025-12-01)

**Goal**: Remove friction for advanced users integrating the color system into complex environments.

**Completed Work**:

- **Configuration Options**:
  - Added `prefix` and `selector` options to `SolverConfig`.
  - Updated `generateTokensCss` and `generateTheme` to respect these options, allowing custom CSS variable prefixes (e.g., `--my-app-surface-1`) and scoping selectors.
  - Updated TypeScript exporter to use the custom prefix.
- **Audit Command**:
  - Implemented `color-system audit` CLI command.
  - Validates themes against accessibility rules (APCA contrast < 60) and polarity logic (e.g., ensuring 'page' surfaces are light in light mode).
- **Theme Builder Overrides**:
  - Added support for manual hex overrides in `SurfaceConfig`.
  - Updated the `solve` engine to respect overrides, bypassing contrast calculations.
  - Added UI controls in the Theme Builder for setting Light/Dark mode overrides, with visual warning indicators.

## Epoch 17: Theme Builder V2

**Focus:** Elevating the Theme Builder from a "utility" to a "product" with high-fidelity visualizations and intuitive controls.

### Key Changes

- **Visualizer Graph**:
  - Implemented a D3-like SVG graph for visualizing lightness curves.
  - Added interactive nodes for manipulating anchors directly on the graph.
  - Visualized the "Safe Zone" (APCA compliance) and "Danger Zone" (Contrast failure).
- **Data Density**:
  - Enhanced `SurfaceRow` to display LCH values and Hex codes.
  - Added "Copy to Clipboard" functionality for individual color values.
- **Intuitive Controls**:
  - Replaced raw number inputs with a custom `AnchorGraph` control.
  - Implemented "Sync Dark Mode" logic to automatically calculate dark mode anchors based on light mode contrast ratios.
- **Infrastructure**:
  - **CI/CD**: Configured GitHub Actions for automated testing and deployment.
  - **Lefthook**: Set up git hooks for pre-commit linting and type checking.
  - **Vite Aliases**: Fixed module resolution issues for smoother local development.
- **Documentation Polish**:
  - **MathJax**: Added support for rendering mathematical formulas in documentation.
  - **Token Visualizer**: Redesigned the "Token Level" table into a premium, card-based visualizer with live previews and accessibility badges.
  - **Typography**: Upgraded to `Inter Variable` and `JetBrains Mono Variable` fonts.
  - **Layout**: Fixed layout shifts and "jerking" issues in the sidebar and scrollbars.

## Epoch 18: Deployment & Sharing

**Focus:** Preparing the project for deployment and sharing with external stakeholders.

### Key Changes

- **CI/CD & Publishing**:
  - Created `.github/workflows/publish.yml` for automated NPM publishing.
  - Added `publint` to verify package exports.
  - Added `.stackblitzrc` for better "Try it" experience.
- **Documentation Expansion**:
  - Added a comprehensive **Ember Integration Guide** (`guides/frameworks/ember.mdx`).
  - Clarified **Build vs. Runtime** modes in documentation.
- **Production Verification**:
  - Verified production builds locally.
  - Confirmed GitHub Pages deployment configuration.
- **Review Materials**:
  - Created `REVIEW.md` and `known-issues.md` to facilitate external review.

## Epoch 19: Rebranding to Axiomatic Color (2025-12-02)

**Goal**: Establish a distinct identity for the project by renaming it from "Algebraic Color System" to "Axiomatic Color".

**Completed Work**:

- **Package Renaming**:
  - Renamed NPM package to `@axiomatic-design/color`.
  - Renamed CLI binary to `axiomatic`.
- **Documentation Overhaul**:
  - Updated all documentation content to reflect the new name and CLI commands.
  - Replaced "Algebraic Color System" with "Axiomatic Color" throughout the site.
  - Updated installation instructions in all guides.
- **Infrastructure**:
  - Updated `package.json` metadata (description, keywords).
  - Fixed Vite alias configuration in `astro.config.mjs` to support the new package name during development.
  - Verified build pipeline and CLI functionality with the new identity.

## Epoch 19: Phase 1 - Package & CLI Updates (2025-12-01)

**Goal**: Initiate the rebranding to "Axiomatic Color" by updating the core package identity and CLI tools.

**Completed Work**:

- **Package Renaming**:
  - Renamed NPM package to `@axiomatic-design/color`.
  - Renamed CLI binary to `axiomatic`.
- **CLI Updates**:
  - Updated help text and usage instructions in `src/cli/index.ts`.
  - Verified the new command works correctly.
- **Infrastructure**:
  - Updated `package.json` metadata.
  - Verified build pipeline.

## Epoch 19: Rebranding to Axiomatic Color (2025-12-02)

**Goal**: Establish a distinct identity for the project by renaming it from "Algebraic Color System" to "Axiomatic Color" and automating the release process.

**Completed Work**:

- **Package Renaming**:
  - Renamed NPM package to `@axiomatic-design/color`.
  - Renamed CLI binary to `axiomatic`.
- **Release Automation**:
  - Implemented `release-plan` for automated versioning and changelog management.
  - Configured GitHub Actions (`publish.yml`) for secure, automated publishing.
- **Publishing**:
  - **Manual Bootstrap**: Manually published `v0.1.0` to overcome initial "chicken-and-egg" authentication issues.
  - **OIDC Trusted Publishing**: Configured OpenID Connect (OIDC) for future releases, removing the need for long-lived `NPM_TOKEN` secrets.
- **Documentation Overhaul**:
  - Updated all documentation content to reflect the new name and CLI commands.
  - Replaced "Algebraic Color System" with "Axiomatic Color" throughout the site.
- **Infrastructure**:
  - Updated `package.json` metadata (description, keywords).
  - Fixed Vite alias configuration in `astro.config.mjs` to support the new package name during development.

## Epoch 20: Phase 2 - Fix Issues (2025-12-02)

**Goal**: Resolve all linting errors and warnings identified in Phase 1 to achieve a clean, zero-error codebase.

**Completed Work**:

- **Svelte Component Fixes**:
  - Systematically resolved ~130 linting errors across `site/src/components`.
  - Fixed `svelte/require-each-key` by adding unique keys to loops.
  - Fixed `@typescript-eslint/no-confusing-void-expression` by wrapping void returns in block bodies.
  - Fixed `@typescript-eslint/no-unnecessary-condition` by removing redundant checks.
  - Fixed `svelte/no-useless-mustaches` by cleaning up string literals.
  - Improved type safety by removing `any` usage and adding explicit return types.
- **Script Fixes**:
  - Fixed floating promises and return types in `scripts/check-links.ts`.
- **Library Fixes**:
  - Removed unnecessary conditional checks for mandatory properties (`charts`, `primitives`) in `dtcg.ts` and `tailwind.ts` exporters.
- **CI/CD & Documentation**:
  - **CI Fixes**: Updated `.github/workflows/ci.yml` to run `pnpm --filter site astro sync` before linting and removed redundant `--run` flag from test command.
  - **Documentation**: Added `CONTRIBUTING.md` to document the PR workflow, CI checks, and development guidelines.
  - **Deployment**: Successfully deployed to Vercel (Production) after merging PR #9.
- **Verification**:
  - Achieved 0 errors in `pnpm lint`.
  - Verified successful build with `pnpm build`.

## Epoch 21: Phase 1 - Config State & Live Preview (2025-12-02)

**Goal**: Connect the Theme Builder UI to a reactive configuration state and enable live preview in the browser.

**Completed Work**:

- **Package Refactoring**:
  - Refactored `@axiomatic-design/color` to support browser-side solving.
  - Extracted `solver.ts` to resolve circular dependencies.
  - Exported `generateTheme` and `injectTheme` via `runtime.ts`.
- **State Management**:
  - Implemented `ConfigState.svelte.ts` using Svelte 5 Runes.
  - Added persistence via `localStorage`.
  - Implemented live CSS generation via `$derived`.
- **UI Integration**:
  - Created `StyleInjector.svelte` to apply the generated theme.
  - Bound `GlobalInspector` and `SurfaceInspector` to the reactive state.
  - Verified live updates for anchors, key colors, and surface overrides.

## Epoch 21: Phase 2 - Theme Builder Layout Polish (2025-12-02)

**Goal**: Refine the Theme Builder layout for better responsiveness and isolation from documentation styles.

**Completed Work**:

- **Style Isolation**:
  - Wrapped `StudioLayout` in `<Diagram>` to apply the `not-content` class, preventing Starlight's prose styles from interfering with the UI.
- **Responsive Layout**:
  - Updated `ComponentView` to use a responsive grid (`repeat(auto-fit, minmax(320px, 1fr))`) instead of a fixed 2-column layout.
  - Optimized vertical alignment (`flex-start` + padding) to reduce whitespace on taller screens.
  - Increased `max-width` to `1000px` for better space utilization.

## Epoch 21: Phase 3 - Design & Concept (2025-12-02)

**Goal**: Implement design and usability feedback to make the Theme Builder a more powerful, intuitive, and educational tool.

**Completed Work**:

- **UI/UX Refactoring**:
  - **Inspector Panes**: Refactored the Inspector into collapsible panes (Accordion layout) for better organization.
  - **Dual-Thumb Slider**: Implemented a custom dual-thumb slider for intuitive contrast range editing.
  - **Context Tree Editing**: Enabled structural editing (Drag & Drop, Selection) in the Surface Manager.
- **Advanced Features**:
  - **Dark Mode Linking**: Implemented logic to link Dark Mode anchors to Light Mode, with a lock toggle.
  - **Custom Color Picker**: Created a custom OKLCH color picker for precise color selection.
  - **Hue Shift Editor**: Integrated an interactive Hue Shift Visualizer into the editor.
- **Polish**:
  - **Audit View**: Implemented a new view to audit contrast scores (APCA) and gamut issues.
  - **Abstract View**: Refined the Graph view to visualize the lightness curve across nesting levels.
  - **Prose**: Updated micro-copy and tooltips for better clarity.
- **System Updates**:
  - **Highlight Primitive**: Formalized `highlight` as the "Color of Attention" and mapped it to `<mark>` and `::selection`.
  - **Multiple Key Colors**: Updated `ConfigState` to support multiple key colors.

## Epoch 21: Phase 4 - V2 Implementation (2025-12-02)

**Goal**: Implement the new "System Modeling" UI, transforming the Theme Builder from a form-filler into a powerful design tool.

**Completed Work**:

- **Context Tree (Surface Manager)**:
  - Refactored the flat list into a hierarchical **Context Tree**.
  - Implemented drag-and-drop nesting and reordering.
  - Added inline actions and compact rows for better density.
- **Context Graph**:
  - Replaced disconnected sliders with a unified **Context Graph**.
  - Visualized Light and Dark mode tracks together, showing the "Safe Zone" and contrast relationships.
- **Gamut Slice**:
  - Created a canvas-based **Gamut Slice** visualization (Lightness vs Chroma).
  - Added a Hue slider to explore the color space boundaries.
- **Selection System**:
  - Implemented a robust selection state with a distinct `--highlight-ring-color` (Magenta).
  - Applied selection rings consistently across the Tree, Preview, and Inspector.
- **Token Cleanup**:
  - Refactored all frontend components to remove raw `var(--*-token)` references.
  - Enforced strict ESLint rules (no unused vars, no void returns) to ensure code quality.

## Epoch 21: Phase 5 - Cleanup & Consolidation (2025-12-02)

**Goal**: Refactor utility classes for consistency and consolidate the CSS architecture to simplify maintenance and reduce duplication.

**Completed Work**:

- **Utility Refactor**:
  - Renamed `.focus-visible-ring` to `.ring-focus-visible` to align with the `ring-*` naming convention.
  - Removed `.fill-subtlest` as it was redundant.
- **CSS Consolidation**:
  - Moved `site/src/styles/docs.css` to `css/utilities.css` (or merged relevant parts).
  - Pointed Astro configuration to use the root `css/` directory instead of local styles.
  - Ensured a single source of truth for all CSS utilities across the CLI, Demo, and Documentation.
- **Verification**:
  - Updated snapshots in `generator.test.ts` and `scoping.test.ts` to reflect the new class names.
  - Verified that the documentation site builds and renders correctly with the consolidated CSS.

## Epoch 23: Phase 1 - Reactive Pipeline Architecture (2025-12-03)

**Goal**: Implement a "Late-Binding" architecture for CSS utilities, allowing them to be context-aware and composable without combinatorial class explosion.

**Completed Work**:

- **Architecture**:
  - Designed the "Reactive Pipeline" model ($Color = f(Context, Intent, Modifier)$).
  - Documented the architecture in `docs/design/reactive-pipeline.md`.
  - Added "Axiom XII: The Law of Late Binding" to `docs/design/axioms.md`.
- **Engine Refactor**:
  - Updated `css/engine.css` to use **Indirection Variables** (`--text-lightness-source`, `--text-hue-source`, etc.) instead of direct token references.
  - Updated the calculation logic to derive final colors from these sources.
  - Added text utility selectors to the main calculation block to ensure they trigger color resolution.
- **Generator Update**:
  - Updated `src/lib/generator.ts` to generate utilities that set these indirection variables.
  - `.text-subtle` now sets `--text-lightness-source`.
  - `.hue-brand` now sets `--text-hue-source` and `--text-chroma-source`.
- **Verification**:
  - Regenerated `css/theme.css` and verified the output matches the new architecture.

## Epoch 23: Phase 2 - Presets & Utilities (2025-12-03)

**Goal**: Implement a robust system for presets (Typography, Borders) and refactor the CSS engine to support reactive composition.

**Completed Work**:

- **Typography Scale**:
  - Implemented `TypeScaleConfig` and Cubic Bezier interpolation for fluid font scaling.
  - Generated `--axm-preset-text-*` variables and utilities.
- **Border Refactor**:
  - Split border definitions into structural (`--axm-preset-border-*`) and cosmetic components.
  - Created `.preset-bordered` (structure) and `.bordered` (color) utilities.
- **Verification**:
  - Updated `surface-lightness.config.json` with the new preset configuration.
  - Verified the generated CSS contains the correct values.

## Epoch 22: Phase 2 - Luminance Spectrum UI (2025-12-02)

**Goal**: Replace the disconnected "Page Anchors" sliders with a unified **Luminance Spectrum** visualization to improve the mental model of lightness and contrast.

**Completed Work**:

- **New Components**:
  - **`RangeSlider.svelte`**: Created a reusable dual-handle slider component with drag support and accessibility attributes.
  - **`LuminanceSpectrum.svelte`**: Implemented the main visualization component that composes two range sliders on a single 0-100% lightness track.
- **Integration**:
  - Replaced the legacy "Page Context" section in `AnchorsEditor.svelte` with the new `LuminanceSpectrum`.
  - Updated `ContextGraph.svelte` to allow selective rendering of the "Inverted Context" section.
- **Features**:
  - **Unified Axis**: Visualizes Light and Dark modes on the same physical track.
  - **Contrast Feedback**: Displays real-time APCA contrast badges (Lc) with color-coded compliance indicators (Green/Yellow/Red).
  - **Constraints**: Enforces logical constraints (Surface < Ink) via the UI interaction model.

## Epoch 25: The Grand Simulation (2025-12-03)

**Goal**: Validate the system's robustness by simulating the workflows of four key personas (Alex, Jordan, Dr. Chen, Marcus) in a realistic, isolated environment.

**Completed Work**:

- **Simulation Environment**:
  - Created `examples/grand-simulation` as a standalone project.
  - Initialized with a local build of `@axiomatic-design/color` (v0.1.0).
- **CLI Fixes**:
  - **Critical Bug Fix**: Patched `src/cli/index.ts` to correctly detect CLI arguments when running via `npx` or direct execution, resolving a silent failure in `axiomatic init`.
- **Persona Validation**:
  - **Alex (Tinkerer)**: Successfully configured an extreme "Cyberpunk" theme (Neon Pink/Green, High Chroma) to verify system flexibility.
  - **Jordan (Audit)**: Verified `axiomatic audit` passes and confirmed `prefers-contrast: more` media queries generate maximized contrast (0/1 lightness).
  - **Dr. Chen (Scientist)**: Confirmed P3 Gamut support by verifying `oklch` chroma values (> 0.3) are preserved in the generated CSS.
  - **Marcus (Architect)**: Verified `axiomatic export` generates valid Tailwind presets and DTCG tokens.

## Epoch 26: The Hard Flip (2025-12-03)

**Goal**: Implement a "Hard Flip" mechanism to ensure native UI elements (scrollbars, checkboxes) invert correctly inside inverted surfaces.

**Completed Work**:

- **CSS Beacon**:
  - Updated `src/lib/generator.ts` to emit `--axm-inverted-surfaces` in the `:root` block.
  - This variable contains a comma-separated list of all inverted surface selectors.
- **Runtime Observer**:
  - Updated `ThemeManager` in `src/lib/browser.ts` to read the beacon and set up a `MutationObserver`.
  - Implemented logic to force `style="color-scheme: dark/light"` on inverted surfaces based on the global mode.
- **Cleanup**:
  - Removed obsolete `constants.ts` generation logic from the CLI.

## Epoch 27: Documentation Polish & MathML (2025-12-03)

**Goal**: Refine the documentation's visual presentation and harden the project infrastructure.

**Completed Work**:

- **Native MathML**:
  - Enabled native MathML rendering in Starlight.
  - Implemented custom CSS overrides in `site/src/styles/starlight-custom.css` for consistent font stack and spacing.
- **Content Restructuring**:
  - Refined `composition-algebra.mdx` by removing redundant grids and adding "In Plain English" callouts.
  - Moved the "Font Comparison Lab" to a dedicated test page.
- **Infrastructure Hardening**:
  - **Verification Script**: Fixed `scripts/agent/verify-phase.sh` to correctly locate the workspace root.
  - **Linting**: Resolved 50+ ESLint errors across Svelte components and test files, enforcing strict type safety.
  - **Testing**: Updated `src/lib/__tests__/browser.test.ts` to mock `getComputedStyle` correctly.
  - **Configuration**: Updated `tsconfig.json` and `eslint.config.js` to properly handle test files and ignores.

## Epoch 28: Code Review & Hardening (2025-12-03)

**Goal**: Address "Source of Truth" violations and performance risks identified during code review to ensure a stable and maintainable codebase.

**Completed Work**:

- **Source of Truth Remediation**:
  - **CSS**: Refactored `site/src/styles/starlight-custom.css` to remove hardcoded color tokens. It now maps Starlight's semantic variables (e.g., `--sl-color-bg`) directly to Axiomatic system variables (e.g., `--bg-surface-sunken`).
  - **Configuration**: Updated `site/astro.config.mjs` to import the authoritative `../css/theme.css` instead of relying on implicit or duplicate styles.
- **Performance Optimization**:
  - **Runtime**: Optimized `ThemeManager` in `src/lib/browser.ts`. The `MutationObserver` now checks only `addedNodes` for inverted surfaces instead of re-scanning the entire document tree on every mutation.
- **Verification**:
  - Verified the build (`pnpm --filter site build`) passes with the new configuration.
  - Confirmed that the documentation site renders correctly with the refactored styles.

## Epoch 30: Developer Tooling (2025-12-04)

**Goal**: Create a world-class developer experience for users of the Axiomatic Color system.

**Completed Work**:

- **Phase 1: AI Context (llms.txt)**:
  - Implemented `scripts/generate-llms-txt.ts` to generate a standardized `llms.txt` file from the documentation.
  - Integrated the generation into the build pipeline (`scripts/build-site.ts`).
  - Verified the output via `tests/llm-context.spec.ts`.
- **Phase 2: CI Gatekeeper (Audit Hardening)**:
  - Hardened the `axiomatic audit` command (`src/cli/commands/audit.ts`) with robust JSON Schema validation.
  - Integrated `ajv` for runtime validation of `color-config.json`.
  - Implemented logic to patch the schema to allow `$schema` property, ensuring compatibility with editor tooling.
  - Verified the audit command correctly identifies schema violations and logic errors.
- **Phase 3: The Editor Companion (VS Code Extension)**:
  - **Scaffold**: Initialized `@axiomatic-design/vscode-extension` in `packages/vscode-extension`.
  - **Grammar**: Defined Tree-sitter queries for detecting class names in HTML, JSX, Svelte, and Vue.
  - **Infrastructure**: Set up `web-tree-sitter` and WASM grammar loading.
  - **Features**: Implemented Autocomplete (`CompletionItemProvider`) and Color Decorators (`AxiomaticDecorator`) for system tokens.

- **Phase 4: The Runtime Debugger**:
  - **Core Logic**: Implemented headless DOM traversal (`walker.ts`) and variable resolution (`resolver.ts`) to identify surface context and resolve late-binding variables.
  - **Web Component**: Created `<axiomatic-debugger>`, a vanilla Web Component with Shadow DOM for style-isolated visualization.
  - **Tree-Shaking**: Exported the debugger as a separate entry point (`@axiomatic-design/color/inspector`) to ensure it can be excluded from production bundles.
  - **Integration**: Integrated the debugger into the documentation site for "dogfooding" and verification.

## Epoch 31: Phase 1 - Golden Master Tests (2025-12-04)

**Goal**: Implement full-system snapshot testing to guarantee bit-for-bit determinism across releases.

**Completed Work**:

- **Infrastructure**:
  - Created `tests/golden-masters/` to store canonical outputs.
  - Configured `vitest` to run snapshot tests.
- **Snapshot Generation**:
  - Implemented tests to snapshot CSS (`theme.css`), DTCG (`tokens.json`), Tailwind (`tailwind.preset.js`), and TypeScript (`theme.ts`) outputs.
- **Determinism**:
  - Verified that the core logic is deterministic and free of random seeds or environment dependencies.
  - Confirmed that tests pass reliably in CI.

## Epoch 31: Phase 2 - Usage Linter (2025-12-04)

**Goal**: Create `eslint-plugin-axiomatic` to flag "Magic Numbers" and enforce semantic token usage.

**Completed Work**:

- **Plugin Scaffolding**:
  - Initialized `@axiomatic-design/eslint-plugin` in `packages/eslint-plugin`.
  - Configured `tsup` for bundling and `vitest` for testing.
- **Rule Implementation**:
  - **`no-hardcoded-colors`**: Detects hex, rgb, hsl, and named colors in style attributes (JSX, Svelte, Vue, Glimmer). Suggests semantic tokens based on property context (e.g., `background` -> `surface`).
  - **`no-raw-tokens`**: Detects usage of internal tokens (`--color-sys-*`) and suggests semantic tokens. Enforces utility class usage for surfaces.
- **Dynamic Context**:
  - Implemented dynamic loading of `theme.css` and `utilities.css` from the user's project to ensure suggestions are always up-to-date with the generated system.
- **Verification**:
  - Verified rules against React (JSX), Svelte, Vue, and Ember (GTS) test cases.
  - Added smoke tests to ensure integration works in real-world scenarios.
  - Achieved 100% pass rate on strict linting of the plugin codebase itself.

## Epoch 32: Phase 2 - Token Reorganization (2025-12-05)

**Goal**: Align the DTCG export structure with ecosystem standards (Tokens Studio) by splitting tokens into Primitives, Light Mode, and Dark Mode sets.

**Completed Work**:

- **Exporter Refactor**:
  - Updated `src/lib/exporters/dtcg.ts` to return a `DTCGExport` object containing a map of filenames to content.
  - Split generation logic into `generatePrimitives` (Global) and `generateMode` (Light/Dark).
- **CLI Update**:
  - Updated `axiomatic export` to support directory output (`--out tokens/`).
  - Implemented logic to write `primitives.json`, `light.json`, and `dark.json` when a directory is specified.
  - Maintained backward compatibility for single-file export (`--out tokens.json`).
- **Verification**:
  - Verified the output structure matches the "Token Sets" model.
  - Confirmed that `primitives.json` contains key colors and `light.json`/`dark.json` contain semantic tokens.

## Epoch 32: Phase 3 - High-Level Presets ("Vibes") (2025-12-05)

**Goal**: Introduce a high-level configuration layer ("Vibes") to allow users to quickly apply opinionated defaults (e.g., "Vibrant", "Corporate", "Academic") without manual tuning.

**Completed Work**:

- **Vibe Registry**:
  - Created `src/lib/vibes.ts` defining the `Vibe` interface and `VibeConfig` (Deep Partial SolverConfig).
  - Implemented initial vibes: **Default**, **Academic** (Serif, Low Chroma), **Vibrant** (High Chroma, Hue Shift), and **Corporate** (Safe, Standard).
- **Resolution Logic**:
  - Implemented `resolveConfig` in `src/lib/resolve.ts` to handle the 3-layer merge strategy: `System Defaults` < `Vibe Defaults` < `User Config`.
  - Implemented a robust `deepMerge` utility to handle nested configuration overrides correctly.
- **CLI Integration**:
  - Updated `build`, `export`, and `audit` commands to use `resolveConfig`, ensuring all CLI operations respect the selected vibe.
  - Updated `audit` command to validate against a `UserConfig` schema (where `anchors` and `groups` are optional), allowing minimal config files.
- **UI Integration**:
  - Updated `ConfigState` in the Theme Builder to support loading vibes.
  - Implemented `VibePicker` component in the sidebar to allow users to switch vibes instantly.
- **Fixes**:
  - Corrected anchor value ranges in `vibes.ts` (switched from 0-100 to 0-1 to match system internals).
  - Resolved TypeScript circular dependencies and type inference issues with `DeepPartial`.

## Epoch 33: Phase 3 - Remediation Plan (2025-12-06)

**Goal**: Analyze the root causes of the "Epoch 33" failures and create a concrete plan for remediation in Epoch 34.

**Completed Work**:

- **Analysis**: Identified key issues:
  - **Build Tooling**: The `cat`-based build script is fragile and lacks minification/optimization.
  - **Token Complexity**: The token surface area is too large, confusing users.
  - **Documentation Gaps**: Tutorials are missing or outdated.
- **Planning**: Created `docs/agent-context/remediation-plan.md` outlining the roadmap for Epoch 34:
  - **Phase 1**: Infrastructure (Lightning CSS).
  - **Phase 2**: Token Simplification.
  - **Phase 3**: Interactive Tutorials.

## Epoch 34: Phase 0 - Axiom Update (2025-12-06)

**Goal**: Formalize the architectural decision to prioritize Standard CSS over proprietary extensions.

**Completed Work**:

- **Axiom 10**: Added "Standard CSS First" to the Constitution (`docs/design/axioms/04-integration.md`).
- **Constraint**: Explicitly forbade the use of Sass, Less, or non-standard CSS extensions. Build tools (like Lightning CSS) are restricted to bundling, minification, and polyfilling future standards.
- **Verification**: Updated Golden Master snapshots to reflect the current state of the system.

## Epoch 34: Phase 1 - Infrastructure (2025-12-06)

**Goal**: Replace the fragile, ad-hoc CSS build scripts with a robust, standard-compliant toolchain using Lightning CSS.

**Completed Work**:

- **Lightning CSS Integration**:
  - Replaced `cat`-based concatenation with `lightningcss` for bundling and minification.
  - Configured strict `@property` syntax validation (enforcing `initial-value`).
  - Enabled automatic vendor prefixing and syntax lowering for broader browser support.
- **Build Pipeline**:
  - Created `scripts/build-css.ts` to orchestrate the build process.
  - Updated `package.json` to include `build:css` and export `./style.css`.
- **Codebase Hardening**:
  - Fixed invalid `@property` definitions in `css/engine.css` (added `initial-value: transparent`).
  - Cleaned up unused TypeScript directives in `src/lib/resolve.ts`.
- **Verification**:
  - Updated Golden Master snapshots to reflect the optimized CSS output.
  - Verified that the build produces a valid, minified CSS bundle.

## Epoch 34: Phase 2 - Token Simplification (2025-12-06)

**Goal**: Reduce cognitive load by hiding internal "plumbing" tokens from the public API and exports.

**Completed Work**:

- **Token Classification**:
  - Defined strict schema: Public (`--axm-*`) vs. Private (`--_axm-*`).
  - Documented in `docs/agent-context/current/token-classification.md`.
- **Exporter Updates**:
  - Updated Tailwind, TypeScript, and DTCG exporters to filter out private tokens.
  - Verified exports are clean via grep tests.
- **Inspector Updates**:
  - Updated `<axiomatic-debugger>` to hide private tokens by default.
  - Added a "Show Internals" toggle for advanced debugging.
  - Updated resolver logic to flag private tokens.
- **Verification**:
  - Ran visual regression tests (`pnpm test:visual`) to ensure no regressions.

## Epoch 34: Phase 3 - Export & Validation

**Goal**: Ensure the system is "Beta-Ready" by enabling live export previews in the Theme Builder and enforcing configuration validity.

**Completed Work**:

- **Theme Builder Export Preview**: Implemented a live preview of generated tokens in CSS, JSON (DTCG), Tailwind, and TypeScript formats.
- **Quality Assurance**: Fixed test regressions caused by token simplification (renaming internal tokens to `_axm-`).
- **Tooling**: Tuned `knip` configuration to reduce noise.

**Deferred Work**:

- **Real-time Validation**: Schema validation in the UI was deferred.
- **ESLint Svelte Support**: Deferred full implementation/verification beyond basic smoke tests.

## Epoch 37: Phase 1 - Deep Visual & Semantic Audit (2025-12-08)

**Goal**: Verify that the site renders correctly and faithfully represents the system's axioms with a "premium" design aesthetic.

**Completed Work**:

- **Audit Strategy**: Adopted an "Audit First, Fix Later" approach.
- **Programmatic Analysis**:
  - Created `scripts/debug-hero.ts` to verify computed styles of invisible elements.
  - Created `scripts/check-violations.ts` to detect semantic surface mismatches.
  - Created `scripts/qa-screenshots.ts` to automate multi-viewport/theme capture.
- **Visual Inspection**:
  - Audited Home, Concepts, and Tokens pages across Desktop/Mobile and Light/Dark modes.
  - Identified critical issues:
    - **Global**: Code block contrast mismatch in Dark Mode, Sidebar active color mismatch.
    - **Concepts**: "Ghost Text" in inverted surfaces (Light Mode), cramped mobile layout.
    - **Tokens**: Unreadable tables on mobile.
    - **Design**: "Packed" button layouts, unstyled lists, repetitive examples.
- **Deliverables**:
  - `qa-audit/audit-results.md`: Master remediation plan.
  - `qa-audit/`: Comprehensive screenshot library and detailed description logs.

## Epoch 36: Phase 1 - Feedback Implementation (2025-12-06)

**Goal**: Address specific user feedback items regarding the Theme Builder layout and default colors.

**Completed Work**:

- **Layout Fixes**:
  - **Context Tree**: Reduced indentation and increased sidebar width to prevent text truncation.
  - **Inspector**: Added padding to `LuminanceSpectrum` to prevent slider handle clipping.
- **Color Tuning**:
  - **Action Surface**: Updated library defaults to use "Brand" hue and `0.12` chroma, fixing the "washed out" appearance.
  - **Spotlight Surface**: Clamped inverted surface lightness to `0.45` in light mode to ensure white text remains legible (fixing "white on white" issue).
- **Data Investigation**:
  - Confirmed that the "Spotlight" delta of 108 is mathematically correct for an inverted surface.

## Epoch 35: Deployment & Release (Completed)

**Goal**: Deploy the updated system to production and verify the live site.

**Completed Work**:

- **Phase 1: Pre-Flight Verification**:
  - Verified local builds for both the library and the documentation site.
  - Fixed critical build issues (missing CSS, broken imports).
  - Resolved linting and security warnings.
  - Updated test snapshots and verified all tests pass.
- **Phase 2: Deployment**:
  - **CI Fixes**: Resolved Svelte check errors, fixed CI workflow ordering, and implemented deterministic snapshot testing using Prettier.
  - **Release**: Merged `fix/svelte-check-errors` into `main`, triggering the "Plan Release" workflow.
  - **Verification**: Confirmed successful deployment workflow run.

## Epoch 36: Website Polish (Active)

**Goal**: Polish the website based on user feedback to improve usability and aesthetics.

**Phases**:

- **Phase 1: Feedback Implementation (Completed)**: Addressing specific user feedback items.
- **Phase 2: Proactive Polish (Active)**: Auditing and fixing layout/visual issues.

## Phase 3: Build & Test Repair (Epoch 36)

**Goal**: Stabilize the build and test suite following the "Grand Unified Algebra" refactor.

**Completed Work**:

- **ELOOP Fix**:
  - Identified `vitest` traversing symlinks in `.locald` causing infinite loops.
  - Updated `vitest.config.ts` to exclude `.locald/**`.
- **Snapshot Updates**:
  - Updated Golden Master snapshots to reflect the new "Late Binding" architecture (CSS variables instead of hardcoded values).
  - Verified that the changes are intentional and correct.
- **Tool Conflict Resolution**:
  - Excluded `tests/brand-button.spec.ts` (Playwright) from the Vitest runner to prevent conflicts.
- **Documentation Generation**:
  - Regenerated `css/theme.css` via `pnpm solve` to ensure `scripts/generate-llms-txt.ts` has the necessary artifacts.
- **Verification**:
  - Confirmed all 17 test files pass.
  - Verified the build pipeline is functional.

## Epoch 37: Phase 2 - Remediation (2025-12-08)

**Goal**: Execute the remediation plan derived from the "Deep Visual & Semantic Audit" to fix visual defects and improve design quality.

**Completed Work**:

- **Global Fixes**:
  - **Sidebar**: Fixed active link color in Dark Mode to match the brand theme.
  - **Code Blocks**: Forced `.astro-code` to use semantic surface tokens, fixing the "cutout" effect in Dark Mode.
  - **Hero**: Added `z-index` and `color-scheme` safeguards to prevent invisible text in Dark Mode.
- **Page-Specific Fixes**:
  - **Concepts**: Fixed "Ghost Text" in `ContextVisualizer` by replacing hardcoded colors with semantic tokens (`.text-strong`).
  - **Tokens**: Renamed `tokens.md` to `tokens.mdx` and wrapped tables in `.surface-card` containers for better hierarchy.
  - **Mobile**: Added global responsive table styles (`overflow-x: auto`) to prevent layout breakage.
- **Design Polish**:
  - **Visual Density**: Increased grid gaps in `thinking-in-surfaces.mdx` to reduce clutter.
  - **Example Differentiation**: Updated `SurfacePreview` usage in `thinking-in-surfaces.mdx` to include distinct content (buttons, placeholders) for different surface types.
- **Verification**:
  - Ran `scripts/qa-screenshots.ts` to verify fixes across all viewports and themes.
  - Hardened QA scripts (`check-violations.ts`, `qa-semantic.ts`) with strict TypeScript types to pass linting.

## Epoch 37: Phase 5 - Manual QA & Iteration (2025-12-09)

**Goal**: Final manual verification and iterative polish with the user to ensure the system meets all quality standards before the major interoperability push.

**Completed Work**:

- **Visual Polish**:
  - **Hue Shift Visualizer**: Refactored to use HTML overlays for handles (fixing aspect ratio distortion) and centered thumbs.
  - **Documentation**: Redesigned `hue-shifting.mdx` with a clearer "Linear vs. Bezier" comparison and improved narrative flow.
  - **Shadows**: Fixed invalid `light-dark()` syntax in shadow generation, restoring visible elevation.
  - **Layout**: Added spacing to "Action Surfaces" catalog to prevent button jamming.
- **Reactive Chart Algebra**:
  - Implemented a new reactive algebra for charts: $L_{chart} = L_{mid} - (k \times \tau)$.
  - Ensures charts automatically flip lightness in dark mode and respond to "Vibrancy" injection.
  - Fixed a bug where the theme toggle didn't update `--tau` correctly by syncing it in `starlight-custom.css`.
- **Infrastructure**:
  - **Linting**: Resolved all ESLint errors, including strict `no-unnecessary-condition` checks in the overlay and Svelte a11y issues.
  - **Testing**: Updated Golden Master snapshots and fixed generator tests to match the new architecture.
  - **Cleanup**: Removed iteration artifacts and organized debug scripts into `scripts/debug/`.

## Epoch 37: Phase 6 - Deployment & Final Review (2025-12-09)

**Goal**: Deploy the polished site to Vercel and conduct a final review of the live environment.

**Completed Work**:

- **Deployment**:
  - Merged `fix/website-polish` into `main`.
  - Triggered Vercel deployment and verified the live URL.
- **Infrastructure**:
  - **Vercel CLI**: Created `scripts/check-deploy.ts` to inspect deployments and fetch logs directly from the terminal.
  - **Dependency Management**: Pinned `vite` to `^6.0.0` to resolve a version conflict between `astro` and `vitest`.
  - **Linting**: Updated `knip.ts` to ignore build-time dependencies (`vercel`, `vite`) to pass pre-push checks.

## Epoch 37: Phase 7 - Algebra Page Polish (2025-12-09)

**Goal**: Refine the visual presentation of the "Algebra of Color Design" page to match its academic nature and address specific formatting issues.

**Completed Work**:

- **Visual Polish**:
  - **"In Plain English" Callout**: Replaced the standard Starlight `<Aside>` with a custom `PlainEnglish` component featuring a serif font and subtle styling to reduce visual noise.
  - **Academic Typography**: Applied page-specific CSS overrides to `algebra.mdx` to use a serif font stack (`Erewhon Math`, `Libertinus Math`) for body text and headings.
  - **Math Formatting**:
    - Centered block formulas (`2577352`) using custom CSS for `.katex-display`.
    - Replaced LaTeX math in headers (e.g., `$\Sigma$`) with Unicode equivalents to fix Table of Contents rendering issues.
- **Infrastructure**:
  - **Linting**: Fixed invalid TeX syntax in `docs/rfcs/001-reactive-charts.md` that was blocking the pre-commit hook.
- **Verification**:
  - Verified the build (`pnpm build`) passes.
  - Confirmed the visual changes match the "academic" aesthetic goal.

## Epoch 37: Phase 7.1 - Algebra Page Polish (Round 2) (2025-12-09)

**Goal**: Address user feedback regarding the "Algebra of Color Design" page: fix broken links, ensure math blocks are centered, and refine the academic typography.

**Completed Work**:

- **Visual Polish**:
  - **Typography**: Switched the font stack to `Charter`, `Bitstream Charter`, `Sitka Text`, `Cambria`, `serif` for a more authentic academic paper aesthetic.
  - **Math Alignment**:
    - Enforced centering of block equations using `display: block; text-align: center` on the container and `display: inline-block` on the inner KaTeX element.
    - Combined split equations in the "Genesis" section into a single `aligned` block for better readability.
- **Fixes**:
  - **Broken Link**: Removed the dead link to the changelog in `algebra.mdx`.
  - **Linting**: Fixed remaining invalid TeX syntax in `docs/rfcs/001-reactive-charts.md` (replaced `* {` with `_{`).
- **Verification**:
  - Verified the build passes.

## Epoch 37: Phase 7.2 - Algebra Page Polish (Round 3) (2025-12-09)

**Goal**: Finalize the "Academic Paper" aesthetic for the Algebra page by switching to EB Garamond and enabling full text justification.

**Completed Work**:

- **Typography Overhaul**:
  - **Font**: Switched from `Charter` to **EB Garamond** (via `@fontsource-variable/eb-garamond`) for a classic, high-quality serif look.
  - **Justification**: Enabled `text-align: justify` and `hyphens: auto` to mimic printed academic journals.
  - **Leading**: Reduced `line-height` to `1.6` for a denser, more formal reading experience.
- **Math Alignment**:
  - Enforced strict centering of KaTeX block equations using `display: block; text-align: center` overrides.
- **Infrastructure**:
  - **Dependencies**: Added `@fontsource-variable/eb-garamond` to `site/package.json`.
  - **Linting**: Resolved persistent TeX syntax errors in RFC documents to unblock the commit.

## Epoch 37: Phase 7.3 - Algebra Page Polish (Round 4) (2025-12-09)

**Goal**: Add final "Academic Flair" to the Algebra page and ensure robust math alignment.

**Completed Work**:

- **Visual Polish**:
  - **Plain English Component**: Updated `PlainEnglish.svelte` with a double-border design, "floral heart" (❧) bullets, and deep-linking support.
  - **Math Alignment**: Implemented `p:has(> .katex:only-child)` selector to reliably center paragraph-wrapped math equations.
- **Infrastructure**:
  - **Linting**: Fixed linting errors in `scripts/scaffold-doc-site.ts` and TeX syntax in `docs/rfcs/001-reactive-charts.md` to pass strict pre-commit hooks.

## Epoch 37: Phase 8 - Tufte Sidenotes (2025-12-09)

**Goal**: Implement a robust, CSS-native "Tufte Layout" for the Algebra page, replacing standard footnotes with semantic sidenotes using the CSS Anchor Positioning API.

**Completed Work**:

- **CSS Architecture**:
  - Implemented a pure CSS "Anchor Chain" strategy in `site/src/styles/tufte.css`.
  - Uses `position-anchor` to link sidenotes to paragraphs.
  - Uses `top: max(anchor(top), anchor(--prev-note bottom))` to prevent overlap.
- **Rehype Plugin**:
  - Created `site/src/lib/rehype-anchor-chain.ts` to transform Markdown footnotes into `<aside class="sidenote">` elements.
  - Handles HAST property normalization and injects unique `anchor-name` styles.
- **Verification**:
  - Verified the build output confirms correct HTML structure and style injection.
  - Confirmed the plugin correctly extracts and positions footnotes.

## Epoch 37: Phase 9 - Tufte Polish (2025-12-09)

**Goal**: Refine the "Sophisticated Preprint" layout based on user feedback to achieve a cleaner, more readable aesthetic.

**Completed Work**:

- **Visual Polish**:
  - **Sidebar Width**: Increased from `22ch` to `26ch` to improve line length and readability.
  - **Typography**: Increased sidenote font size to `0.9rem` (from `0.85rem`) for better legibility.
  - **Content Cleanup**: Removed complex mathematical notation ($\LaTeX$) from the sidebar to strictly enforce the "Plain English" narrative separation.
- **Feature**:
  - **Reference Tracking**: Updated the Rehype plugin to inject the footnote number (`<sup>1</sup>`) at the start of the sidenote content, ensuring clear visual linkage.
- **Documentation**:
  - **RFC Update**: Updated `RFC 008` to codify the new width, font size, and content rules.

## Epoch 38: Fresh Eyes & 0-to-1

### Phase 1: Fresh Eyes Audit & 0-to-1 Test (Completed)

**Summary**:
Simulated a "Zero to One" adoption journey to validate usability. The core flow (Install -> Init -> Build -> Import) was verified as functional in a modern Vite environment.

**Key Achievements**:

- **Simulation**: Created to verify the "Happy Path".
- **Standalone Mode**: Implemented in the CLI to support vanilla HTML/CSS workflows without a bundler.
- **Physics Tuner**: Implemented a "HUD" ( and ) to allow real-time parameter tuning, solving specificity issues with a brute-force override strategy.
- **Documentation**: Identified and noted minor inconsistencies in CLI output vs. README.

## Epoch 38: Fresh Eyes & 0-to-1

### Phase 1: Fresh Eyes Audit & 0-to-1 Test (Completed)

**Summary**:
Simulated a "Zero to One" adoption journey to validate usability. The core flow (Install -> Init -> Build -> Import) was verified as functional in a modern Vite environment.

**Key Achievements**:

- **Simulation**: Created `examples/zero-to-one-simulation` to verify the "Happy Path".
- **Standalone Mode**: Implemented `--copy-engine` in the CLI to support vanilla HTML/CSS workflows without a bundler.
- **Physics Tuner**: Implemented a "HUD" (`DebugVisualizer.svelte` and `AxiomaticTuner`) to allow real-time parameter tuning, solving specificity issues with a brute-force override strategy.
- **Documentation**: Identified and noted minor inconsistencies in CLI output vs. README.

## Epoch 39: Consolidation & Optimization (2025-12-10)

**Goal**: Optimize the development loop (linting speed) and reduce codebase complexity ("Diet Mode") by consolidating legacy components.

**Completed Work**:

- **Performance Optimization**:
  - **ESLint**: Adopted a tiered linting strategy. Disabled `projectService` for the `site` directory, reducing linting time from ~42s to ~11s.
  - **Strictness**: Maintained strict type-checking for `src/lib` (core logic) while relaxing it for `site` (UI) to improve iteration speed.
- **Code Cleanup ("Diet Mode")**:
  - **Knip Audit**: Used `knip` to scientifically identify and remove unused exports.
  - **Deletions**: Removed ~15 unused files, including the entire `tufte` and `inspector` directories, and legacy components like `ThemeBuilder.svelte` and `Visualizer.svelte`.
- **Refactoring**:
  - **Builder Consolidation**: Merged `site/src/components/builder/` into `site/src/components/builder-v2/`.
  - **Component Migration**: Moved `ContrastBadge`, `LuminanceSpectrum`, and `RangeSlider` to the new directory.
  - **Import Updates**: Updated all references in `ContextTreeNode`, `GlobalInspector`, and `SurfaceInspector` to point to the new locations.

## Epoch 39: Phase 2 - Diet & Canonicalization (2025-12-11)

**Goal**: Continue the "Diet Mode" cleanup by removing sediment and canonicalizing directory structures.

**Completed Work**:

- **Canonicalization**:
  - **Renamed**: `site/src/components/builder-v2` -> `site/src/components/builder`. The "v2" suffix is no longer needed as the legacy builder is gone.
  - **Updated**: References in `studio.astro` and `lefthook.yml` to point to the canonical path.
- **Sediment Removal**:
  - **Deleted**: `temp-math/` (Unused scratchpad).
  - **Deleted**: `examples/axiomatic-design-color-0.1.0.tgz` (Stale build artifact).
  - **Cleaned**: Removed commented-out legacy CSS from `ContextTreeNode.svelte`.
- **Verification**:
  - **Knip**: Confirmed zero unused exports after the restructure.

## Epoch 39: Phase 3 - Generator Refactor (2025-12-11)

**Goal**: Refactor the monolithic `generator.ts` into a modular pipeline to improve maintainability and separation of concerns.

**Completed Work**:

- **Refactoring**:
  - **Split**: Decomposed `src/lib/generator.ts` (God Object) into:
    - `src/lib/generator/primitives.ts`: Handles Shadows, Focus, Highlight, Key Colors.
    - `src/lib/generator/surfaces.ts`: Handles Surface token generation and state modifiers.
    - `src/lib/generator/core-utilities.ts`: Handles reactive utility classes (`.text-*`, `.hue-*`).
    - `src/lib/generator/index.ts`: Orchestrates the pipeline.
  - **Updated Consumers**: Updated `src/cli/commands/build.ts`, `src/lib/runtime.ts`, and tests to use the new module structure.
- **Verification**:
  - **Tests**: Verified all tests pass, including snapshot tests (after fixing a minor whitespace regression).
  - **Behavior**: Confirmed that the refactoring is purely structural and preserves existing functionality.

## Epoch 39: Phase 4 - Anchor Chain Refactor (2025-12-11)

**Goal**: Modularize the `rehype-anchor-chain` plugin to separate the distinct phases of the layout engine.

**Completed Work**:

- **Refactoring**:
  - **Split**: Decomposed `site/src/lib/rehype-anchor-chain.ts` into:
    - `phases/extraction.ts`: Footnote extraction logic.
    - `phases/injection.ts`: Sidenote injection logic.
    - `phases/anchoring.ts`: CSS Anchor Positioning ID generation and dependency graph.
    - `utils.ts`: Shared helpers.
    - `index.ts`: Main plugin entry point.
- **Verification**:
  - **Build**: Verified `pnpm --filter site build` passes successfully.
  - **Functionality**: Confirmed the site generates correctly with the new plugin structure.

## Epoch 39: Phase 5 - Lint Performance (2025-12-11)

**Goal**: Optimize the developer experience by significantly reducing linting time for the documentation site.

**Completed Work**:

- **Performance Investigation**:
  - Identified that `site/src` linting was taking ~3.3s despite being configured for "Fast Base".
  - Traced the bottleneck to `projectService: true` being implicitly enabled for `.svelte.ts` files via a global config block.
- **Optimization**:
  - **Config Update**: Modified `eslint.config.js` to explicitly disable `projectService` for `site/**/*.svelte.ts` files.
  - **Parser Override**: Forced `typescript-eslint/parser` for these files to ensure correct parsing without the overhead of the full type-aware service.
- **Results**:
  - **Site Linting**: Reduced from ~3.3s to ~1.5s (~55% improvement).
  - **Full Lint**: Reduced from ~11.5s to ~7.2s (~37% improvement).
- **Safety**:
  - Confirmed that type safety is still enforced via `pnpm check:site` (Astro Check), allowing ESLint to focus purely on speed and style.
