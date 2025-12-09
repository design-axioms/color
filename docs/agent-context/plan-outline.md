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

## Epoch 36: Website Polish (Active)

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

## Epoch 37: Website Quality Assurance (Active)

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
  - **Phase 7: Final Review: Algebra Page Polish (Active)**
    - **Goal**: Refine the visual presentation of the "Algebra of Color Design" page to match its academic nature, as part of the final review process.
    - **Strategy**: Execute the plan defined in `docs/agent-context/current/task-list.md`.

## Epoch 38: Interoperability & Ecosystem (Planned)

- **Goal**: Expand the system's reach by ensuring lossless interoperability with the broader design ecosystem.
- **Phases**:
  - **Phase 1: Round-Trip DTCG**
    - **Goal**: Implement the ability to _import_ DTCG tokens, allowing the system to be hydrated from external tools like Figma.
  - **Phase 2: Native Tailwind Preset**
    - **Goal**: Upgrade the Tailwind export to map semantic concepts to reactive CSS variables, preserving "Late Binding" in the export.
