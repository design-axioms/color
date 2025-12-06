# Completed Epochs

This file contains the history of completed epochs for the Color System project.

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

## Epoch 16: Visual Polish & Refinement (Completed)

- **Goal**: Elevate the visual quality of the documentation and enforce accessibility standards automatically.
- **Phases**:
  - **Phase 1: Documentation Styling & CI Integration (Completed)**
    - **Goal**: Refactor ad-hoc styles and ensure accessibility compliance in CI.
    - **Key Deliverables**:
      - Refactored MDX styles (utility classes).
      - Polished Concept diagrams.
      - CI workflow with `color-system audit`.
  - **Phase 2: Framework Guides & Visual Consistency (Completed)**
    - **Goal**: Complete the documentation styling refactor by addressing framework guides and ensuring zero inline styles remain.
    - **Key Deliverables**:
      - Refactored Framework Guides (`react.mdx`, `svelte.mdx`, `html.mdx`).
      - Global Style Audit.
      - Consistent Diagram Styling.

## Epoch 17: Theme Builder V2 (Completed)

- **Goal**: Create a UI that teaches the user how the system works while they use it, and fully integrate it into the Astro site architecture.
- **Phases**:
  - **Phase 1: Integration & Architecture (Completed)**
    - **Goal**: Move the Theme Builder from `demo/` into the Astro site and establish the new data flow.
  - **Phase 2: Visualization & Education (Completed)**
    - **Goal**: Enhance the builder with educational visualizations.
  - **Phase 3: Polish & Infrastructure (Completed)**
    - **Goal**: Refine the UI, improve typography, and ensure robust deployment.

## Epoch 18: Deployment & Sharing (Completed)

- **Goal**: Deploy the unified site to production and ensure it is ready for external sharing and collaboration.
- **Phases**:
  - **Phase 1: Production Build & Deploy (Completed)**
    - **Goal**: Verify the production build locally and deploy to GitHub Pages.
    - **Key Deliverables**:
      - Production URL verification.
      - Fix any production-only bugs (base path, asset loading).
  - **Phase 2: Sharing & Feedback (Completed)**
    - **Goal**: Prepare the project for colleague review.
    - **Key Deliverables**:
      - "Read Me First" guide for reviewers.
      - Known issues list.

## Epoch 19: Rebranding to Axiomatic Color (Completed)

- **Goal**: Rename and rebrand the project to "Axiomatic Color" (`@axiomatic-design/color`) to reflect its structural and deterministic nature.
- **Phases**:
  - **Phase 1: Package & CLI Updates (Completed)**
    - **Goal**: Update package metadata, CLI commands, and internal references.
  - **Phase 2: Documentation & Site Updates (Completed)**
    - **Goal**: Update README, Personas, Concepts, and Site branding.
  - **Phase 3: Verification & Publish (Completed)**
    - **Goal**: Verify the new package name and publish the rebranded version.

## Epoch 20: Linting & Quality Assurance (Completed)

- **Goal**: Tighten up lints to get better feedback and fix existing issues.
- **Phases**:
  - **Phase 1: Lint Configuration (Completed)**
    - **Goal**: Review and tighten ESLint and Prettier configurations.
  - **Phase 2: Fix Issues (Completed)**
    - **Goal**: Resolve all linting errors and warnings.

## Epoch 21: Theme Builder V2 (Completed)

- **Goal**: Reimagine the Theme Builder as a learning environment and design tool.
- **Phases**:
  - **Phase 1: Config State & Live Preview (Completed)**
    - **Goal**: Connect the Theme Builder UI to a reactive configuration state and enable live preview in the browser.
  - **Phase 2: Layout Polish (Completed)**
    - **Goal**: Refine the layout for responsiveness and isolation from documentation styles.
  - **Phase 3: Design & Concept (Completed)**
    - **Goal**: Audit the current design, explore new concepts, and review architecture.
  - **Phase 4: V2 Implementation (Completed)**
    - **Goal**: Implement the new "System Modeling" UI, including Context Tree, Gamut Visualization, and Direct Manipulation graphs.
  - **Phase 5: Cleanup & Consolidation (Completed)**
    - **Goal**: Refactor utility classes and consolidate CSS architecture for long-term maintainability.

## Epoch 22: Fresh Eyes Audit (Completed)

- **Goal**: Conduct a comprehensive "Fresh Eyes" audit of the entire project (CLI, Docs, Theme Builder, Codebase) to identify friction points, inconsistencies, and areas for improvement before starting the Developer Tooling epoch.
- **Phases**:
  - **Phase 1: Audit & Plan (Completed)**
    - **Goal**: systematic review of the project and creation of a prioritized remediation plan.
  - **Phase 2: Luminance Spectrum UI (Deferred)**
    - **Goal**: Implement the "Luminance Spectrum" visualization to replace the disconnected "Page Anchors" sliders, providing a unified view of the lightness axis.

## Epoch 23: Presets & Utilities (Completed)

- **Goal**: Implement a robust system for presets (Typography, Borders) and refactor the CSS engine to support reactive composition.
- **Phases**:
  - **Phase 1: Reactive Pipeline & Presets (Completed)**
    - **Goal**: Refactor `engine.css` to use late-binding variables and implement Bezier-based typography scaling.

## Epoch 24: Fresh Eyes Simulation (Completed)

- **Goal**: Validate the end-to-end user experience by simulating a new user adopting the system in a fresh environment, identifying friction points in the documentation and CLI.
- **Phases**:
  - **Phase 1: The "Zero to One" Simulation (Completed)**
    - **Goal**: Create a fresh, isolated project and attempt to install/configure the library using _only_ the public instructions.
  - **Phase 2: The "Integration" Simulation (Completed)**
    - **Goal**: Attempt to build a simple UI using the "Reactive Pipeline" features in this fresh project.
  - **Phase 3: Remediation (Completed)**
    - **Goal**: Fix the issues discovered in the Friction Log.
  - **Phase 4: LLM Context Strategy (Research) (Completed)**
    - **Goal**: Design the strategy for generating `llms.txt` from the now-verified documentation.

## Epoch 25: The Grand Simulation (Completed)

- **Goal**: Validate the system's advanced capabilities by simulating the specific workflows of key personas (Alex, Jordan, Dr. Chen, Marcus) in a real environment.
- **Phases**:
  - **Phase 1: The Tinkerer (Alex) (Completed)**
    - **Goal**: Simulate creating a "Cyberpunk" theme (High Chroma, Dark Mode) by manipulating the configuration to extremes.
  - **Phase 2: The Audit (Jordan) (Completed)**
    - **Goal**: Verify accessibility compliance of the extreme theme using the `audit` command and high-contrast generation.
  - **Phase 3: The Scientist (Dr. Chen) (Completed)**
    - **Goal**: Inspect the generated CSS for P3 gamut support (`oklch`) and verify interpolation logic.
  - **Phase 4: The Architect (Marcus) (Completed)**
    - **Goal**: Validate interoperability by exporting the theme to DTCG and Tailwind formats and inspecting the output.

## Epoch 26: The Hard Flip (Completed)

- **Goal**: Address the "Soft Flip" limitation where native UI elements inside inverted surfaces did not respect the inverted theme.
- **Phases**:
  - **Phase 1: CSS Variable Beacon (Completed)**
    - **Goal**: Emit `--axm-inverted-surfaces` in CSS to allow runtime discovery of inverted surfaces.
  - **Phase 2: Runtime Observer (Completed)**
    - **Goal**: Implement a `MutationObserver` in `ThemeManager` to force `color-scheme` on inverted surfaces.

## Epoch 27: Documentation Polish & MathML (Completed)

- **Goal**: Refine the documentation's visual presentation, specifically targeting mathematical formulas and infrastructure stability.
- **Phases**:
  - **Phase 1: Native MathML (Completed)**
    - **Goal**: Enable native MathML rendering with custom CSS overrides for consistent display.
  - **Phase 2: Content Restructuring (Completed)**
    - **Goal**: Improve clarity in `composition-algebra.mdx` by removing clutter and adding "In Plain English" callouts.
  - **Phase 3: Infrastructure Hardening (Completed)**
    - **Goal**: Fix verification scripts, resolve lint errors, and improve test coverage to ensure a stable codebase.

## Epoch 28: Code Review & Hardening (Completed)

- **Goal**: Perform a comprehensive context-aware code review to ensure alignment with Axioms and Decisions before proceeding to new features.
- **Phases**:
  - **Phase 1: Review Planning (Completed)**
    - **Goal**: Analyze recent changes against the "Constitution" (Axioms) and formulate a specific review checklist.
  - **Phase 2: Execution & Remediation (Completed)**
    - **Goal**: Execute the review checklist, identify violations, and implement fixes for critical issues (e.g., hardcoded tokens, performance risks).

## Epoch 29: Fresh Eyes & Zero-to-One Review (Completed)

- **Goal**: Validate the system's usability and "first hour" experience by simulating a new user's journey and conducting a holistic design review.
- **Phases**:
  - **Phase 1: Zero-to-One Review (Completed)**
    - **Goal**: Simulate a new user installing and configuring the library from scratch to identify friction in the "getting started" flow.
  - **Phase 2: Fresh Eyes Review (Completed)**
    - **Goal**: Conduct a comprehensive audit of the documentation, CLI, and Theme Builder with a focus on clarity, consistency, and "Axiomatic" alignment.
  - **Phase 3: Remediation (Completed)**
    - **Goal**: Address critical friction points and documentation gaps identified in the reviews.

## Epoch 30: Developer Tooling (Completed)

- **Goal**: Create a world-class developer experience for users of the Axiomatic Color system.
- **Phases**:
  - **Phase 1: AI Context (llms.txt) (Completed)**
    - **Goal**: Implement the strategy designed in Epoch 24 to generate a standardized `llms.txt` file.
  - **Phase 2: CI Gatekeeper (Audit Hardening) (Completed)**
    - **Goal**: Harden the `axiomatic audit` command with JSON Schema validation for CI safety.
  - **Phase 3: The Editor Companion (VS Code Extension) (Completed)**
    - **Goal**: Build a VS Code extension for autocompletion and visual feedback using `web-tree-sitter`.
  - **Phase 4: The Runtime Debugger (Completed)**
    - **Goal**: Provide a "X-Ray" view of the Axiomatic system in the browser, visualizing the invisible context (Polarity, Mode, Surface) that drives the reactive pipeline.

## Epoch 31: System Hardening (Determinism & Enforcement) (Completed)

- **Goal**: Ensure the system is robust, deterministic, and enforces its own rules in user code.
- **Phases**:
  - **Phase 1: Golden Master Tests (Completed)**
    - **Goal**: Implement full-system snapshot testing to guarantee bit-for-bit determinism across releases.
  - **Phase 2: Usage Linter (Completed)**
    - **Goal**: Create `eslint-plugin-axiomatic` to flag "Magic Numbers" and enforce semantic token usage.

## Epoch 32: Ecosystem Expansion (Completed)

- **Goal**: Expand the system's reach beyond the web and into the broader design ecosystem.
- **Phases**:
  - **Phase 1: Round-Trip DTCG (Completed)**
    - **Goal**: Enable importing configuration from standard DTCG token files, allowing interoperability with Figma and other tools.
  - **Phase 2: Token Reorganization (Completed)**
    - **Goal**: Reorganize the system's own token exports to align with ecosystem standards (Primitives vs. Semantic, Mode Splitting).
  - **Phase 3: High-Level Presets ("Vibes") (Completed)**
    - **Goal**: Reduce configuration complexity by providing curated "Vibe" presets that configure the physics engine for specific aesthetics.
