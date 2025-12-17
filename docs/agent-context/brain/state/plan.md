# Project Plan Outline

[View Completed Epochs (1-32)](history/completed-epochs.md)

## Epoch 33: Conceptual Integrity Review (Completed)

- **Goal**: Conduct a thorough review of the entire project for conceptual integrity, ensuring alignment with the core axioms and identifying any architectural drift.
- **Phases**:
  - **Phase 1: Architecture & Axiom Audit (Completed)**
    - **Goal**: Review the codebase and documentation against the "Constitution" (Axioms) to ensure strict adherence to principles like Late Binding and Determinism.
  - **Phase 2: Documentation Consistency (Completed)**
    - **Goal**: Verify that the documentation accurately reflects the current state of the system and that the "User Journey" is coherent.
  - **Phase 3: Remediation Plan (Completed)**
    - **Goal**: Create a prioritized plan to address any conceptual gaps or inconsistencies found during the audit.

## Epoch 34: Refinement & Education (Completed)

- **Goal**: Execute the remediation plan from Epoch 33, focusing on infrastructure robustness, token simplification, and interactive education.
- **Phases**:
  - **Phase 1: Infrastructure (Completed)**
    - **Goal**: Replace the fragile `cat` build script with **Lightning CSS** to enable robust bundling, minification, and standard CSS enforcement.
  - **Phase 2: Token Simplification (Completed)**
    - **Goal**: Reduce the API surface area by hiding internal tokens and exposing only semantic intents.
  - **Phase 3: Export & Validation (Completed)**
    - **Goal**: Ensure the system is "Beta-Ready" by enabling live export previews in the Theme Builder and enforcing configuration validity.
  - **Phase 4: Interactive Tutorials (Deferred)**
    - **Goal**: Create "Learn by Doing" tutorials to guide users through the system's concepts.

## Epoch 35: Deployment & Release (Completed)

- **Goal**: Deploy the updated system to production and verify the live site.
- **Phases**:
  - **Phase 1: Pre-Flight Verification (Completed)**
    - **Goal**: Verify that the build works locally and all checks pass before deployment.
  - **Phase 2: Deployment (Completed)**
    - **Goal**: Trigger the deployment and verify the live site.

## Epoch 36: Website Polish (Completed)

- **Goal**: Polish the website based on user feedback to improve usability and aesthetics.
- **Phases**:
  - **Phase 1: Feedback Implementation (Completed)**
    - **Goal**: Address specific user feedback items one by one.
  - **Phase 2: Proactive Polish (Completed)**
    - **Goal**: Self-audit the site using browser automation and static analysis to find and fix latent visual issues.
  - **Phase 3: Grand Unified Algebra v4.0 (Completed)**
    - **Goal**: Implement the "Baseline 2025" architecture, including Safe Bicone Physics, Unified State Tuple, and Reactive Accessibility (Gain/Hollow State).
  - **Phase 4: Build & Test Repair (Completed)**
    - **Goal**: Stabilize the build and test suite following the "Grand Unified Algebra" refactor.

## Epoch 37: Website Quality Assurance (Completed)

- **Goal**: Ensure the documentation site is robust, responsive, and error-free before the major interoperability push.
- **Phases**:
  - **Phase 1: Deep Visual & Semantic Audit (Completed)**
    - **Goal**: Verify that the site renders correctly and faithfully represents the system's axioms with a "premium" design aesthetic.
    - **Strategy**:
      1.  **Expectation**: Analyze source code to define how concepts _should_ look.
      2.  **Capture**: Generate screenshots for key pages.
      3.  **Critique**: Compare Reality vs. Expectation, specifically looking for "jammed" layouts, poor padding, and low-fidelity representations of concepts.
      4.  **Remediate**: Fix systemic and local design issues.
  - **Phase 2: Remediation (Completed)**
    - **Goal**: Fix the visual and semantic defects identified in the Phase 1 Audit.
    - **Strategy**: Execute the remediation plan defined in `qa-audit/audit-results.md`.
  - **Phase 3: Content Review (Planned)**
    - **Goal**: Audit the documentation for clarity, spelling, and broken links.
  - **Phase 4: Performance Audit (Planned)**
    - **Goal**: Ensure the site loads quickly and is accessible (Lighthouse/Axe).
  - **Phase 5: Manual QA & Iteration (Completed)**
    - **Goal**: Final manual verification and iterative polish with the user.
    - **Strategy**: Open-ended session to address any remaining visual, functional, or content issues identified by the user.
  - **Phase 6: Deployment & Final Review (Completed)**
    - **Goal**: Deploy the polished site to Vercel and conduct a final review of the live environment.
    - **Strategy**:
      1.  **Merge**: Merge `fix/website-polish` into `main`.
      2.  **Deploy**: Trigger Vercel deployment.
      3.  **Verify**: Check the live URL for any regression or environment-specific issues.
  - **Phase 7: Final Review: Algebra Page Polish (Completed)**
    - **Goal**: Refine the visual presentation of the "Algebra of Color Design" page to match its academic nature, as part of the final review process.
    - **Strategy**: Execute the plan defined in `docs/agent-context/brain/state/active_tasks.md`.
  - **Phase 8: Modern Tufte Layout Implementation (Completed)**
    - **Goal**: Implement the "Sophisticated Preprint" layout engine using CSS Grid, Subgrid, and Rehype, as defined in RFC 008.
    - **Strategy**:
      1.  **Rehype Plugin**: Create `rehype-tufte-segment` to wrap content blocks and sidenotes.
      2.  **CSS Engine**: Rewrite `tufte.css` to use the Global Grid and Subgrid.
      3.  **Components**: Update Svelte components to emit semantic HTML.
  - **Phase 9: Tufte Polish (Concluded)**
    - **Goal**: Refine the "Sophisticated Preprint" layout based on user feedback.
    - **Status**: Concluded early to re-evaluate strategy.
  - **Phase 10: Wrap Up & Re-evaluation (Completed)**
    - **Goal**: Wrap up the current work by hiding the pages in the sidebar and re-evaluating the remainder of the work.
    - **Strategy**:
      1.  **Hide Pages**: Remove `algebra.mdx` and related theory pages from the Starlight sidebar configuration.
      2.  **Re-evaluate**: Assess the state of the Tufte layout and decide on next steps (defer or iterate).

## Epoch 38: Fresh Eyes & 0-to-1 (Completed)

- **Goal**: Validate the system's usability and robustness by simulating a "Zero to One" adoption journey with fresh eyes.
- **Phases**:
  - **Phase 1: Fresh Eyes Audit & 0-to-1 Test (Completed)**
    - **Goal**: Simulate a new user adopting the system from scratch to identify friction points, documentation gaps, and "magic knowledge" requirements.
    - **Strategy**:
      1.  **Simulation**: Create a new project (or use a clean environment) and attempt to install/configure the system using _only_ the public documentation.
      2.  **Audit**: Note every stumble, error, or confusing instruction.
      3.  **Fix**: Immediately remediate identified issues in documentation or tooling.

## Epoch 39: Diet & Refactor (Completed)

- **Goal**: Optimize the codebase by removing unused code ("Diet Mode") and refactoring complex modules ("God Objects") into modular architectures.
- **Phases**:
  - **Phase 1: Diet Mode (Completed)**
    - **Goal**: Remove unused files, exports, and legacy components using `knip`.
  - **Phase 2: Canonicalization (Completed)**
    - **Goal**: Standardize directory structures and naming conventions.
  - **Phase 3: Generator Refactor (Completed)**
    - **Goal**: Refactor `src/lib/generator.ts` into a modular pipeline (`primitives`, `surfaces`, `utilities`).
  - **Phase 4: Anchor Chain Refactor (Completed)**
    - **Goal**: Modularize `rehype-anchor-chain` into distinct phases (`extraction`, `injection`, `anchoring`).
  - **Phase 5: Lint Performance (Completed)**
    - **Goal**: Optimize the developer experience by significantly reducing linting time for the documentation site.
  - **Phase 6: Infrastructure Audit & Polish (Completed)**
    - **Goal**: Audit the build infrastructure (CSS bundling) and project roadmap to ensure alignment and remove technical debt.
    - **Strategy**:
      1.  **CSS Audit**: Verify `scripts/build-css.ts` (Lightning CSS) output and investigate site integration.
      2.  **Roadmap Audit**: Review `ideas.md` and `deferred_work.md` to verify outstanding items and remove stale ones.
      3.  **Context Audit**: Review other agent context files (`remediation-plan.md`, `qa-report.md`, etc.) to archive or update stale content.
      4.  **Cleanup**: Update documentation to reflect the current state of the infrastructure.

## Epoch 40: The Agent Brain (Planned)

- **Goal**: Establish the "Exosuit" cognitive infrastructure, moving from scattered notes to a centralized, programmatic "Brain" that persists context and manages interaction.
- **Phases**:
  - **Phase 1: Context Persistence**
    - **Goal**: Migrate from ad-hoc markdown files to a structured `docs/agent-context/brain/` directory (The Brain) with clear schemas for "Memories", "Decisions", and "State".
  - **Phase 2: Structured IO**
    - **Goal**: Develop tools/scripts to read/write the plan and context programmatically, enabling the agent to update its own state without manual text editing.
  - **Phase 3: Prompt Management**
    - **Goal**: Systematize the "System Instructions" and "Spells" (like `/weave`) into a version-controlled library that can be dynamically loaded.

## Epoch 41: Dynamic Planning (Planned)

- **Goal**: Evolve the project plan from a static text file into a "Plan Object Model" that supports dynamic re-prioritization and workflow injection.
- **Phases**:
  - **Phase 1: Plan Object Model**
    - **Goal**: Define a schema (e.g., JSON/YAML) for Epochs, Phases, and Tasks, treating the plan as a data structure that can be queried and visualized.
  - **Phase 2: Dynamic Workflow**
    - **Goal**: Implement tools to "Insert Phase", "Split Phase", or "Defer Tasks" programmatically, allowing the plan to adapt to new discoveries without breaking the flow.

## Epoch 42: Governance & Rigor (Planned)

- **Goal**: Institutionalize the separation between "History" (what happened) and "Reality" (what is true), ensuring the documentation never drifts from the code.
- **Phases**:
  - **Phase 1: RFC Process**
    - **Goal**: Establish a formal workflow for "Laws" (Immutable Decisions) and architectural changes. Use RFCs as decision records for all changes, not just axioms.
  - **Phase 2: The Manual**
    - **Goal**: Create a "Living Document" (The Manual) that reflects the _current_ state of the system, distinct from the chronological "Changelog".
  - **Phase 3: Drift Detection**
    - **Goal**: Implement automated checks using both static analysis (AST parsing) and runtime verification (executing code blocks) to detect and prevent drift between the code and the manual.

## Epoch 43: Interoperability & Ecosystem (Planned)

- **Goal**: Expand the system's reach by ensuring lossless interoperability with the broader design ecosystem.
- **Phases**:
  - **Phase 1: Round-Trip DTCG**
    - **Goal**: Implement the ability to _import_ DTCG tokens, allowing the system to be hydrated from external tools like Figma.
  - **Phase 2: Native Tailwind Preset**
    - **Goal**: Upgrade the Tailwind export to map semantic concepts to reactive CSS variables, preserving "Late Binding" in the export.

## Epoch 44: The Perfect Demo (Active)

- **Goal**: Create a polished, high-impact demo to showcase the system's capabilities to Vercel leadership, focusing on "CSS-Native Physics" and "Zero Runtime".
- **Phases**:
  - **Phase 1: Vercel Preset (The Foundation) (Completed)**
    - **Goal**: Create a theme preset that mimics Vercel's design system to ensure the demo starts on familiar ground.
  - **Phase 2: Visual Polish (The Hard Flip & DevTools)**
    - **Goal**: Ensure the "Hard Flip" (nested inversion) is visually flawless and that DevTools variable names are clean and intentional.
    - **Immediate Focus**:
      - Finish RFC 011 groundwork (spec-compiled probes, trace-first logs, log-only replay).
      - Eliminate remaining transition-time snaps (borders/outlines/shadows) with regression coverage.
  - **Phase 2.1: RFC 011 Follow-up (Planned)**
    - **Goal**: Close the remaining refactor edges (typed registry boundary) and finish any remaining tau-stable snap fixes with regression coverage.
  - **Phase 3: Rehearsal & Recording (The Artifact)**
    - **Goal**: Record the 2-minute video demo following the script in `.plan/vercel-demo.md`.

## Epoch 45: User Model Contract Validation (Planned)

- **Goal**: Validate that the public documentation never relies on internal mechanics unless we explicitly intend those internals to be part of the user programming model.
- **Phases**:
  - **Phase 1: Intentional Internals Review (Planned)**
    - **Goal**: Decide whether each documented “internal” example is a deliberate teaching tool or evidence of a missing public abstraction.
    - **Strategy**:
      1. **Inventory**: Enumerate every `axm-docs:explanatory` span in docs and classify by purpose (diagnostic, conceptual, migration, deep-dive).
      2. **Test Against Personas**: For each span, answer “Which persona needs this?” and “Does it become a dependency in the golden path?”.
      3. **Decide**: Keep / replace with public contract / move to internal appendix.
      4. **Remediate**: If it’s a gap, define the missing public surface (docs/API/tooling) rather than teaching the internal.
      5. **Enforce**: Tighten or relax enforcement scope only after the above decisions are recorded.
