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

## Epoch 44: Architecture Clarity (Active)

- **Goal**: Establish clear boundaries between the pure color system, integration layer, and developer tools. Fix structural issues that cause downstream bugs and confusion.
- **Rationale**: Analysis revealed that Phase 2.1 tasks (snaps, inspector hardening) are fighting structural issues. Architecture work first saves 4-10 days and eliminates rework.
- **Key Deliverables**:
  - **Consolidated RFCs**: 9 coherent RFCs in `docs/rfcs/` (RFC-CONSUMER-CONTRACT, RFC-INTEGRATION, RFC-AUDITING, RFC-INSPECTOR, RFC-CHARTS, RFC-TOKENS, RFC-TUFTE-LAYOUT, RFC-TOOLING, RFC-CONFIGURATION)
  - **Silent Failures Inventory**: 37 failures cataloged in `docs/agent-context/current/silent-failures-inventory.md` (8 P0, 18 P1, 11 P2)
- **Phases**:
  - **Phase 1: ThemeManager Unification (Completed)**
    - **Goal**: Resolve the ThemeManager/AxiomaticTheme confusion. Establish a single, clear theme authority.
    - **Tasks**:
      - ✅ Audit `ThemeManager` (browser.ts) vs `AxiomaticTheme` (theme.ts) - clarify or merge
      - ✅ Fix the race condition in `initInvertedSurfaces` (single RAF is unreliable)
      - ✅ Ensure single semantic writer for theme state
      - ✅ Document the "replace your theme picker handler" pattern
    - **PRs**: #23, #24, #25, #26, #28, #29
  - **Phase 2: Starlight Extraction (Completed)**
    - **Goal**: Move Starlight-specific code out of core inspector into an adapter pattern.
    - **Tasks**:
      - ✅ Extract `starlight-chrome-contract.ts` from core inspector
      - ✅ Create adapter pattern for framework-specific contract checks (`FrameworkContractAdapter`)
      - ✅ Update tests to use adapter pattern
    - **PR**: #32

### Epoch 44.5: Alpha Polish (Active — Pivot)

- **Goal**: Address documentation gaps identified in fresh-eyes review. Focus on "Pragmatic Integrator" persona.
- **Rationale**: Subagent review identified P0 gaps: ThemeManager emphasis, framework integration docs, working examples. Pivoting before Phase 3/4 to ship user-facing value.
- **Phases**:
  - **Phase A: Quick Wins (Active)**
    - **Goal**: High-impact, low-effort documentation improvements.
    - **Tasks**:
      - ✅ Update integration guide with prominent ThemeManager section
      - ✅ Create `advanced/framework-integration.mdx` for framework authors
      - [ ] Update planning documents
  - **Phase B: Working Example**
    - **Goal**: Document `examples/vercel-demo` as a reference implementation.
    - **Tasks**:
      - Add README with "How It Works" walkthrough
      - Cross-link from integration guide
  - **Phase C: Troubleshooting**
    - **Goal**: Common issues and solutions.
    - **Tasks**:
      - Create troubleshooting section in docs
      - Error code reference (when explicit errors ship)

### Epoch 44 (Continued): Phase 3 & 4 (Deferred)

- **Phase 3: Layer Separation (Deferred)**
  - **Goal**: Restructure exports so consumers understand what layer they're in.
  - **Tasks**:
    - Audit current exports in `src/lib/index.ts`
    - Define clear layers: Pure System / Integration / Dev Tools
    - Consider separate entry points or clear documentation
    - Remove integration code (dom-wiring) from main export barrel
- **Phase 4: Silent Failures → Explicit Errors (Deferred)**
  - **Goal**: Replace silent failures with helpful error messages.
  - **Tasks**:
    - Missing backgrounds → throw with helpful message (not default to black)
    - Invalid config → validation errors (not `@ts-expect-error`)
    - Solver errors → actionable suggestions
    - Add input validation to math functions (dev-mode warnings)

## Epoch 45: Alpha Readiness (Completed)

- **Goal**: Prepare for alpha release by ensuring a clearly identified target persona can pick up the library, use it immediately, and feel the benefits.
- **Outcome**: All alpha release criteria met. Documentation polish complete, known limitations documented, troubleshooting guide created, inspector container query evaluation refactored to sentinel probe technique.
- **PRs**: #33, #35, #36

## Epoch 46: Alpha Release & Stabilization (Active)

- **Goal**: Ship the alpha release (1.0.0-alpha.1) with a clean API, proper dependency injection, and verified stability.
- **Rationale**: The codebase is in excellent shape (133 tests pass, all P0 silent failures resolved). Breaking changes must happen now before external users adopt deprecated patterns. The singleton pattern is a testing/DI obstacle that should be fixed before release.

### Phase 1: Breaking Changes & Cleanup

- **Goal**: Remove deprecated APIs and refactor architecture for clean DI before any users adopt the alpha.
- **Tasks**:
  - [ ] **Remove `lightClass`/`darkClass` from ThemeManager**
    - Delete options from `ThemeManagerOptions` in `src/lib/browser.ts`
    - Remove private fields, constructor assignments, and deprecation warnings
    - Remove backwards-compatibility class manipulation in `apply()`
    - Delete `warnDeprecationOnce` helper if no longer needed
    - Update `site/src/content/docs/reference/javascript-api.md` to remove deprecated options
    - Regenerate llms.txt files via `pnpm generate-llms`
  - [ ] **Refactor ThemeManager to use Dependency Injection**
    - Remove the singleton pattern from `AxiomaticTheme` (static `instance` and `get()`)
    - Make `AxiomaticTheme` instantiable normally (constructor becomes public)
    - Add `theme?: AxiomaticTheme` option to `ThemeManagerOptions`
    - Update `ThemeManager` to accept an injected instance or create one internally
    - Update all direct `AxiomaticTheme.get()` usages in browser.ts, inspector/overlay.ts, inspector/tuner.ts
    - Update tests to use injected instances
  - [ ] **Run knip to identify unused exports**
    - Execute `pnpm exec knip` and review output
    - Remove any dead exports/files identified
  - [ ] **Audit PRESETS system**
    - Verify `PRESETS` in `src/lib/presets.ts` has usages beyond the export
    - If unused: remove the file and export from `src/lib/index.ts`
- **Success Criteria**:
  - No `lightClass`/`darkClass` in codebase
  - `AxiomaticTheme` is injectable (no global singleton access required)
  - All tests pass after refactoring
  - knip reports no unused exports

### Phase 2: Pre-Release Verification

- **Goal**: Ensure the codebase is stable and documentation is current after breaking changes.
- **Tasks**:
  - [ ] Full test suite verification (`pnpm test`, `pnpm playwright test`)
  - [ ] Build verification (`pnpm build`, `pnpm typecheck`, `pnpm lint`)
  - [ ] Documentation audit (search for stale references to removed APIs)
  - [ ] RFC updates if API surface changed
- **Success Criteria**:
  - All tests, build, typecheck, and lint pass
  - No stale references to removed APIs in docs
  - RFCs reflect current architecture

### Phase 3: Release Engineering

- **Goal**: Execute the release process to publish 1.0.0-alpha.1 to npm.
- **Tasks**:
  - [ ] Version bump to `1.0.0-alpha.1` in package.json
  - [ ] Generate CHANGELOG via `pnpm exec release-plan prepare`
  - [ ] npm publish dry-run to verify package contents
  - [ ] Actual npm publish with `--tag alpha`
  - [ ] Git tag `v1.0.0-alpha.1`
- **Success Criteria**:
  - Package published to npm with `alpha` tag
  - Git tag exists on origin
  - CHANGELOG includes all Phase 1 breaking changes

### Phase 4: Community Launch

- **Goal**: Announce the alpha and establish feedback channels.
- **Tasks**:
  - [ ] Draft and publish GitHub Release with release notes
  - [ ] Create GitHub issue template for alpha feedback
  - [ ] Share announcement on appropriate channels
  - [ ] Monitor for initial feedback (48 hour window)
- **Success Criteria**:
  - GitHub Release published
  - Feedback channel exists and is documented
  - No blocking issues reported (or resolved)

## Epoch 47: Interoperability & Ecosystem (Planned)

- **Goal**: Expand the system's reach by ensuring lossless interoperability with the broader design ecosystem.
- **Phases**:
  - **Phase 1: Round-Trip DTCG**
    - **Goal**: Implement the ability to _import_ DTCG tokens, allowing the system to be hydrated from external tools like Figma.
  - **Phase 2: Native Tailwind Preset**
    - **Goal**: Upgrade the Tailwind export to map semantic concepts to reactive CSS variables, preserving "Late Binding" in the export.

## Epoch 48: Beta Release (Planned)

- **Goal**: Ship beta with expanded feature set based on alpha feedback.

---

## Archived Epochs

The following epochs have been moved to the Exosuit project and are no longer part of this plan:

- **Epoch 40-42**: Agent Brain, Dynamic Planning, Governance & Rigor
- See `docs/agent-context/future/exosuit-migration-summary.md` for details.

---

## Historical Reference: Original Epoch 44 (The Perfect Demo)

_Archived 2026-01-05. The Vercel demo goal is no longer immediate priority; pivoting to alpha readiness._

- **Original Goal**: Create a polished, high-impact demo to showcase the system's capabilities to Vercel leadership.
- **Status at Archive**: Phase 1 (Vercel Preset) completed. Phase 2.1 tasks deferred pending architecture work.
- **Outcome**: Demo served its purpose (Yehuda got the job!). Demo artifacts remain useful for future Vercel integration.
