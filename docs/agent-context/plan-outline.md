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

## Epoch 21: Theme Builder V2 (In Progress)

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

## Epoch 22: Developer Tooling (Planned)

- **Goal**: Create a world-class developer experience for users of the Axiomatic Color system.
- **Phases**:
  - **Phase 1: VS Code Extension**
    - **Goal**: Visualize tokens inline, provide hover information, and autocomplete.
  - **Phase 2: Custom Lints**
    - **Goal**: Create ESLint or Stylelint rules to enforce system constraints (e.g., "No hardcoded colors", "Use semantic tokens").
  - **Phase 3: AI Context (llms.txt)**
    - **Goal**: Provide a standardized context file for LLMs to understand the system's architecture and tokens.
