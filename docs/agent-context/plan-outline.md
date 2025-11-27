# Project Plan Outline

## Epoch 1: Packaging & Consumption (Completed)

- **Goal**: Make the system usable by others as an NPM package.
- **Key Deliverables**: `tsup` build, CLI `init` command, published package.

## Epoch 2: The Theme Builder (Completed)

- **Goal**: Create a visual editor for `color-config.json`.
- **Key Deliverables**:
  - Isomorphic Runtime (Live Solving).
  - Global Controls (Anchors, Key Colors).
  - Surface Management (CRUD).
  - Export (JSON/CSS).

## Epoch 3: Polish & Persistence (Completed)

- **Goal**: Refine the Theme Builder into a production-grade tool.
- **Key Deliverables**:
  - Persistence (localStorage).
  - Templates / Presets.
  - Contrast Validation.
  - Framework Integration (Deferred).

## Epoch 4: Documentation & Education (Completed)

- **Goal**: Create comprehensive, accessible documentation for the system.
- **Phases**:
  - **Phase 1: Setup & Structure (Completed)**
    - Initialize `mdbook`.
    - Define Table of Contents (`SUMMARY.md`).
    - Scaffold initial chapters.
  - **Phase 2: Content Migration (Completed)**
    - Migrate `concepts.md`, `intuition.md`, `implementation.md`.
    - Refine content for clarity and flow.
  - **Phase 3: Interactive Elements (Completed)**
    - Embed live demos or link to the Theme Builder.
    - Add visual diagrams for concepts (Anchors, Surfaces).
  - **Phase 4: Deployment (Completed)**
    - Set up GitHub Pages deployment.
  - **Phase 5: Review & Refine (Completed)**
    - Address user feedback.
    - Fix Mermaid rendering (Vendor JS).
    - Restructure "Deep Dive" content.
    - Add live CSS demos.
    - **Phase 6: Iterative Refinement (Completed)**
    - Small improvements based on further feedback.

## Epoch 5: System Completeness (Completed)

- **Goal**: Ensure the system behaves correctly in all browser environments and modes.
- **Key Deliverables**:
  - **Browser Integration (Phase 1) (Completed)**:
    - `meta theme-color` sync (Address bar).
    - `color-scheme` & `scrollbar-color`.
    - **Dynamic Favicons**: Real-time generation based on system state.
  - **Accessibility & High Contrast (Phase 2) (Completed)**:
    - **Forced Colors**: Verify and refine existing Windows High Contrast support.
    - **Prefers Contrast**: Support for `prefers-contrast: more`.
    - **Print Styles**: Graceful degradation for printing.
  - **P3 Gamut (Phase 3) (Completed)**:
    - Support for `oklch` output with chroma.
    - "Baseline Newly Available" policy.
  - **Demo & Documentation Alignment (Phase 4) (Completed)**:
    - Update Demo App to use `ThemeManager`.
    - Expose `targetChroma` in Theme Builder.
    - **Educational Components**: `ContextVisualizer`, `GamutComparator`, `LightnessScale`.
    - Simulate High Contrast in Demo.

## Epoch 6: Design System Primitives (Completed)

- **Goal**: Complete the "System" aspect by adding missing UI primitives.
- **Phases**:
  - **Phase 1: UI Primitives (Completed)**
    - **Shadows/Elevation**: Semantic shadow scale (`sm` to `xl`) with "White Glow" for Dark Mode.
    - **Focus Rings**: Universal focus indicators (`.focus-ring`).
  - **Phase 2: Data Visualization Palettes (Completed)**
    - **Goal**: Generate categorical color palettes for charts/graphs.
    - **Strategy**: Harmonized Fixed Hues (curated list solved against theme constraints).
    - **Deliverables**: `--chart-*` tokens, Demo visualization.
  - **Phase 3: Theme Builder UX/UI Polish (Completed)**
    - **Goal**: Refine the Theme Builder into a professional, ergonomic tool.
    - **Key Deliverables**:
      - **Layout**: Sticky Toolbar/Sidebar split.
      - **Navigation**: Fix nested scrolling.
      - **Presets**: Better persistence and selection UX.
      - **Visuals**: Lucide icons, shadow polish, compact controls.
      - **Features**: Expose Palette Config in UI.

## Epoch 7: Deployment & Infrastructure (Completed)

- **Goal**: Unify the Demo and Documentation into a single deployable site and automate the process.
- **Key Deliverables**:
  - **Unified Build**: Single command to build both Demo and Docs.
  - **Routing**: Seamless linking between Docs and Demo.
  - **CI/CD**: GitHub Actions workflow for automated deployment to GitHub Pages.

## Epoch 8: Architecture Migration (Completed)

- **Goal**: Modernize the documentation stack by migrating from `mdbook` to **Astro Starlight**.
- **Key Deliverables**:
  - **Unified Codebase**: React components directly in markdown (MDX).
  - **Interactive Docs**: Replace static HTML visualizations with live system components.
  - **Simplified DX**: Single Vite-based dev server (no proxying).
  - **Better Search**: Starlight's built-in search.

## Epoch 9: Ecosystem & Interoperability (Planned)

- **Goal**: Connect the Color System with the broader design tool ecosystem.
- **Key Deliverables**:
  - **DTCG Export**: Export tokens in the W3C Design Tokens Format Module (2025.10 Stable).
  - **Figma Sync**: Generate a token file compatible with Figma plugins (e.g., Tokens Studio).
  - **Style Dictionary**: Ensure compatibility with Style Dictionary for cross-platform code generation (iOS/Android).
