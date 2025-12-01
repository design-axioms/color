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

## Epoch 9: Documentation Restructure (Completed)

- **Goal**: Realign the documentation structure with the "User Journey" and address "Fresh Eyes" feedback.
- **Phases**:
  - **Phase 1: Structural Reorganization (Completed)**
    - Implement new sidebar hierarchy in `astro.config.mjs`.
    - Move and rename files to `concepts/`, `guides/`, `catalog/`, `advanced/`.
  - **Phase 2: Content Rewrite (The User Journey) (Completed)**
    - **Welcome**: New `index.mdx` with "Quick Start".
    - **Mental Model**: Merge Surfaces/Context, move Anchors to Physics.
    - **Getting Started**: Expand Theme Builder guide, clarify Integration.
  - **Phase 3: Visual & Interactive Polish (Completed)**
    - **Data Viz**: Add `DataVizDemo` to visualize chart palettes.
    - **Visuals**: Fix alignment and spacing in grid layouts.
    - **Theme Sync**: Ensure Starlight theme picker syncs with internal context.
  - **Phase 4: Dogfooding & Robustness (Completed)**
    - **Strategy**: Define how the docs site consumes the system's own tokens.
    - **Refactor**: Replace hardcoded hex values in components (e.g., `DynamicRange`) with system tokens.
    - **Linting**: Explore tooling to forbid hardcoded colors in the `site/` directory.
  - **Phase 5: Holistic Review & Theme Builder Polish (Completed)**
    - **Holistic Review**: Audit the entire site and all demos for alignment with project goals.
    - **Theme Builder**: Deep dive into the Theme Builder UI and docs to ensure they are effective.
    - **Polish**: Implement improvements based on the review.
  - **Phase 6: Deep Content & Design Audit (Completed)**
    - **Goal**: A comprehensive critique of the documentation narrative, demo integration, and system design from a "Fresh Eyes" perspective.
    - **Scope**: Review all content, interactive elements, and underlying system concepts.
  - **Phase 7: Theme Builder Refinement (Completed)**
    - **Goal**: Polish the Theme Builder to be mobile-responsive and visually consistent with the rest of the application.
    - **Key Deliverables**:
      - **Layout Fix**: Resolve CSS conflict preventing full-width usage.
      - **Mobile Responsiveness**: Implement responsive layout for sidebar/preview.
      - **Refactor**: Replace inline styles with utility classes.

## Epoch 10: Ecosystem & Interoperability (In Progress)

- **Goal**: Connect the Color System with the broader design tool ecosystem.
- **Key Deliverables**:
  - **DTCG Export (Phase 1) (Completed)**:
    - Export tokens in the W3C Design Tokens Format Module (2025.10 Stable).
    - Implemented `color-system export --format dtcg`.
  - **Tailwind Integration (Phase 2) (Completed)**:
    - Generate a Tailwind CSS preset for seamless usage in modern stacks.
    - Implemented `color-system export --format tailwind`.
  - **DX Improvements (Phase 3) (Completed)**:
    - JSON Schema for config validation and Intellisense.
    - **Figma Sync**: Guide for using exported tokens with Figma plugins.

## Epoch 11: Refinement & Consolidation (In Progress)

- **Goal**: Solidify the project's foundation by consolidating design wisdom, refining personas, and unifying the product experience.
- **Phases**:
  - **Phase 1: The Constitution (Axioms) (Completed)**
    - **Goal**: Consolidate scattered design docs into a single authoritative `axioms.md`.
    - **Deliverables**: `docs/design/axioms.md`.
  - **Phase 2: Persona Refinement (Completed)**
    - **Goal**: Update personas based on recent learnings and feedback.
    - **Deliverables**: Updated `docs/design/personas.md`.
  - **Phase 3: Fresh Eyes Audit (Completed)**
    - **Goal**: Comprehensive review of the system using new personas and axioms.
    - **Deliverables**: Prioritized list of friction points.
  - **Phase 4: Audit Fixes (Completed)**
    - **Goal**: Address critical issues identified in the Fresh Eyes Audit (Package Name, Exports, Visualizers).
    - **Deliverables**:
      - Corrected `installation.md`.
      - Updated `solve()` to return full Theme.
      - Updated Exporters (DTCG, Tailwind).
      - Aligned Node versions.
      - **Hue Shift Visualizer**: Polished and integrated.
  - **Phase 3.5: Critical Fixes (Completed)**
    - **Goal**: Address critical friction points identified in the audit (CLI, Docs, Export).
    - **Deliverables**:
      - Updated CLI with `build` command and flags.
      - Corrected package name and installation docs.
      - Enhanced DTCG exporter (P3 support).
      - Restored Hue Shift documentation.
  - **Phase 4: Unification (Theme Builder Integration) (Completed)**
    - **Goal**: Move the Theme Builder from the standalone `demo` app into the Astro site.
    - **Deliverables**: `site/src/pages/builder`, integrated navigation.

## Epoch 12: Framework Migration (Completed)

- **Goal**: Migrate interactive components to Svelte 5 to align with other projects and improve developer experience.
- **Phases**:
  - **Phase 1: Infrastructure & Proof of Concept (Completed)**
    - **Goal**: Initialize Svelte 5 and port foundational components.
    - **Deliverables**: Svelte integration in Astro, `Stack.svelte`, `Cluster.svelte`, `ContrastBadge.svelte`.
  - **Phase 2: Visualizations (Completed)**
    - **Goal**: Port stateless visualization components to Svelte.
    - **Deliverables**: `ContextVisualizer.svelte`, `DynamicRange.svelte`, `HueShiftVisualizer.svelte`.
  - **Phase 3: State Architecture (Completed)**
    - **Goal**: Establish a robust state management pattern using Svelte 5 Runes and Context Injection.
    - **Deliverables**: `ThemeState.svelte.ts`, `ConfigState.svelte.ts`, `ThemeContext` migration.
  - **Phase 4: Theme Builder Migration (Completed)**
    - **Goal**: Migrate the core `ThemeBuilder` application to Svelte 5.
    - **Deliverables**: `ThemeBuilder.svelte`, `AnchorsEditor.svelte`, `SurfaceManager.svelte`, Live Injection.

## Epoch 13: User Experience & Integration (Completed)

- **Goal**: Address the "Missing Features" identified in Fresh Eyes Audit 4 by restructuring the documentation and tooling to create a seamless "Golden Path" for adoption.
- **Status**: Completed.
- **Phases**:
  - **Phase 1: The Golden Path (Onboarding) (Completed)**
    - **Goal**: Create a zero-friction path from "What is this?" to "I have a running app".
    - **Deliverables**:
      - **Quick Start Overhaul**: Rewrite the "Quick Start" as a step-by-step tutorial (HTML & React) rather than just installation instructions.
      - **Embedded Snippets**: Integrate the "Snippet Library" directly into the documentation flow, allowing users to copy-paste "Card", "Button", and "Layout" patterns immediately.
      - **Interactive "Try It"**: Add a "Open in StackBlitz/CodeSandbox" button to the docs that pre-loads the system.
  - **Phase 2: The Concept-to-Code Bridge (Mental Model) (Completed in Epoch 15)**
    - **Note**: This work was moved to Epoch 15 and completed there.
  - **Phase 3: Framework-Specific Integration (Implementation) (Completed)**
    - **Goal**: Provide specific, copy-pasteable implementation guides for major frameworks, removing the guesswork.
    - **Deliverables**:
      - **Framework Guides**: Dedicated pages for **React**, **Svelte**, and **Plain HTML**.
      - **Theme Toggle Component**: A drop-in component/script for each framework to handle Dark Mode (addressing Sarah's gap).
      - **TypeScript Export**: Implement `color-system export --format typescript` to support the "Typed CSS" workflow in React/Svelte.
      - **Real Quick Start**: A true "Zero to UI" tutorial that leads to a rendered component, not just a CSS file.
  - **Phase 4: Advanced Customization (Mastery) (Completed)**
    - **Goal**: Remove friction for advanced users integrating into complex environments.
    - **Deliverables**:
      - **Configuration Options**: Add `prefix` and `selector` options to support existing codebases (Marcus's gap).
      - **Audit Command**: Implement `color-system audit` as a "Verify" step in the documentation flow.
      - **Override Capability**: Allow "breaking the rules" in the Theme Builder with appropriate warnings (Alex's gap).

## Epoch 14: Svelte 5 + Astro Hydration Research (Completed)

- **Goal**: Create a reliable "Playbook" for integrating Svelte 5 interactive components into Astro Starlight, resolving persistent hydration issues.
- **Outcome**: The "hydration issues" were largely attributed to visual bugs (missing CSS variables) and suboptimal SVG rendering. The components are now working correctly.
- **Phases**:
  - **Phase 1: Isolated Reproduction (Completed)**
    - **Goal**: Create a minimal, deterministic reproduction of the hydration error.
    - **Deliverables**: Minimal reproduction case, confirmation of failure scope (Runes vs Legacy, SSR vs Client).
  - **Phase 2: Reproduction via Isolation (Completed)**
    - **Goal**: Isolate the specific factor causing the failure.
    - **Outcome**: Identified that the "failure" was visual/CSS-related, not architectural.
  - **Phase 3: Deep Research (Skipped)**
    - **Reason**: Root cause was identified as non-architectural.
  - **Phase 4: The Playbook (Skipped)**
    - **Reason**: Standard Svelte 5 + Astro integration works as expected.
  - **Phase 5: Remediation (Completed)**
    - **Goal**: Fix the production components (`HueShiftVisualizer`, etc.).
    - **Deliverables**: Working visualizers.

## Epoch 15: Concept-to-Code Bridge (Phase 1) (Completed)

- **Goal**: Connect abstract concepts (Surfaces, Context) directly to implementation details within the documentation.
- **Key Deliverables**:
  - **Inline Token Inspector**: Interactive tool to inspect CSS variables on surfaces.
  - **Documentation Integration**: Integrated into `thinking-in-surfaces.mdx`.

## Epoch 16: Future Work (Planned)

- **Goal**: Continue with the deferred tasks from Epoch 13 (Framework Integration, Advanced Customization).
