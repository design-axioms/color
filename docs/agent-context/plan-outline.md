# Project Plan Outline

[View Completed Epochs (1-16)](history/completed-epochs.md)

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

## Epoch 29: Developer Tooling (Planned)

- **Goal**: Create a world-class developer experience for users of the Axiomatic Color system.
- **Phases**:
  - **Phase 1: AI Context (llms.txt)**
    - **Goal**: Implement the strategy designed in Epoch 24 to generate a standardized `llms.txt` file.
  - **Phase 2: VS Code Extension (Prototype)**
    - **Goal**: Scaffold a VS Code extension to visualize Axiomatic tokens inline.
  - **Phase 3: Custom Lints (CLI)**
    - **Goal**: Expose the internal `check-tokens.sh` logic as a public CLI command.
