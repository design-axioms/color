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
