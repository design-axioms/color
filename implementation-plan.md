# Implementation Plan - Epoch 37: Website Quality Assurance

## Goal

Ensure the documentation site is robust, responsive, and error-free before the major interoperability push. This epoch focuses on "polishing the lens" through which users view the system.

## Addendum: Continuity Auditing v2 (RFC 011)

This plan now includes the implementation of **Continuity Auditing v2** as defined in [docs/rfcs/011-continuity-auditing-v2.md](docs/rfcs/011-continuity-auditing-v2.md).

The architectural direction is explicit:

- **Trace-first**: record an append-only **ObservationLog** artifact that captures control events and measurements.
- **Capability harness**: checks do not import or touch Playwright; scenarios receive only narrow session capabilities.
- **Spec-compiled probes**: measurement is driven by a finite spec compiled into browser-side probes; normalization lives in one place.

### Implementation Phases (Green at Each Step)

1. **ObservationLog schema + artifacts** ✅

- Defined ObservationLog types and a writer.
- Added optional CLI flag to write logs (default off).
- Records: run config, navigation, theme/tau control events.

2. **Session wrapper (capabilities, no `page` leakage)** ✅

- Wrapped Playwright in `CheckViolationsSession`.
- Preserves current behavior (headed/headless, dialog suppression, retries).
- Exposes a narrow `evaluate(...)` capability for probes.

3. **Finite spec + compiled probes (measurement plane)** 🚧

- Centralized selectors + property families + caps in a spec object (`MeasurementSpec`).
- Implemented first compiled probe:
  - `SnapsProbe` produces a transition `Timeline` of sampled frames.
  - `Timeline.findTauStableSnaps(...)` runs analysis outside the browser.
  - `Rgba` centralizes parsing/formatting + delta math.

Still needed to complete this phase:

- Add `Snapshot` probe/object (element-scoped, reusable by continuity/palette-flips).
- Extend ObservationLog to persist measurement events (e.g. `snapshot`, `timelineFrame`) so analyzers can replay without a browser.
- (Optional) generalize `SnapsProbe` into a unified `CompiledProbe` abstraction once we have 2+ probes.

4. **Port one check end-to-end (scenario + analyze)** (next)

- Make `snaps` fully “trace-first”: scenario records timeline into ObservationLog; analyzer re-runs snap detection from the log only.
- Add a fixture-based analyzer test (no browser required).

5. **Port remaining checks + add `palette-flips`**

- Convert remaining checks into scenario+analyze modules.
- Introduce `palette-flips` with pinned-tau sampling and attribution.

6. **Regression registry**

- Record known URLs + selectors/properties as a small suite.
- Add a CI-friendly smoke run.

### Ready To Proceed (next concrete tasks)

1. Implement a `SnapshotProbe` + `Snapshot` domain object (target: reuse by continuity + palette-flips).
2. Add ObservationLog measurement event(s) for `snaps` (timeline frames) and wire a log-only analyzer path.
3. Add a tiny analyzer unit test that consumes a saved ObservationLog fixture.

## Regression Addendum: Theme Boot + Chrome Snaps + Inspector Controls

This addendum records a regression triage loop that emerged after the initial ThemeManager integration work:

- Boot animates into dark on initial load even when the user is already in dark mode.
- Borders “snap” (brief mismatched chrome/border paint during init/toggle).
- Inspector overlay control cluster misaligns, and Reset appears when it should be dormant.

### Reproduction Notes

- **Boot animation**: load a page with Starlight set to dark (persisted), observe a brief “light → dark” animate-in.
- **Border snaps**: toggle theme a few times or hard refresh; watch header/sidebar dividers and other hairlines.
- **Inspector UI**: open the overlay controls; observe fixed-position cluster overlap/misalignment; Reset shows when no fixes exist.

### Root Causes (as discovered)

- **Boot animation**: `css/engine.css` had `transition: --tau ...` on `:root` while `--tau` has an `@property` initial-value of `1`. When CSS loads and the effective tau becomes dark (`-1`), the browser animates the variable even on first paint.
- **Border snaps**: chrome dividers used `currentColor` in the Starlight adapter and could race with late Starlight-constructed style injection.
- **Reset always visible**: `#reset-btn:disabled { opacity: 0.4 }` overrides the hidden-state `opacity: 0`, making the button visible even when not `.visible`.

### Implicated Files

- Theme boot + init gate: `css/engine.css`, `src/lib/browser.ts`, `site/src/components/StarlightHead.astro`, `site/src/styles/starlight-custom.css`
- Chrome borders: `site/src/styles/starlight-custom.css`
- Inspector UI: `src/lib/inspector/overlay.ts`, `src/lib/inspector/styles.ts`

### Acceptance Criteria

- **No boot animate-in**: first paint should match resolved mode; no visible transition into dark.
- **Chrome stability**: no single-frame divider/hairline mismatch during boot/toggle.
- **Inspector UX**:
  - Control cluster stays aligned as a single anchored unit.
  - Reset is hidden/dormant unless overlay-applied fixes exist.

### Ratchets / Tests

- Add a Playwright “first paint invariant” check: assert `--tau` (or `data-axm-resolved-mode`) is already correct before transitions are enabled.
- Add a snaps timeline focused on chrome borders (header/sidebar) while toggling theme.
- Add an inspector UI test: Reset is not visible when `modifiedElements.size === 0`; becomes visible only after applying a fix.

## Phases

### Phase 1: Deep Visual & Semantic Audit

- **Goal**: Verify that the implementation faithfully and beautifully renders the system's axioms. It's not just about "no bugs"; it's about "high design fidelity" and "premium feel".

- **1. Infrastructure & Tooling**
  - [ ] **Enhanced Screenshot Script**:
    - Update `scripts/qa-screenshots.ts` to output to `qa-audit/<page-name>/`.
    - Ensure it captures Mobile, Tablet, and Desktop for both Light and Dark modes.
  - [ ] **Audit Structure Setup**:
    - Create the `qa-audit/` directory structure.

- **2. The Audit Loop (Iterative per Page)**
  - _Target Pages_: `index` (Home), `concepts` (Core Theory), `reference/tokens` (API), `components/buttons` (or equivalent).
  - [x] **Step A: Code Analysis & Expectation Setting**:
    - For each target page, read the source code (`.mdx`, `.astro`).
    - Identify key axiomatic components (Surfaces, Buttons, Tokens).
    - Create `qa-audit/<page>/expectations.md`: Describe exactly how these concepts _should_ look (e.g., "Inline tokens should be badges, not text").
  - [x] **Step B: Visual Capture**:
    - Run the screenshot script for the specific page. - **Action**: Ask the user to upload/paste the generated screenshots into the chat for analysis (since the agent cannot view local files directly). - [ ] **Step B.1: Visual Description**:
    - **Action**: For each screenshot (`mobile-light.png`, `desktop-light.png`, `desktop-dark.png`), create a corresponding `qa-audit/index/<view>-description.md` file.
    - **Prompt**: "Perform a forensic visual analysis of the screenshot.
      1.  **Geometry**: Estimate padding, margins, and gaps (e.g., 'The gap between buttons is tight, approx 4px'). Check alignment.
      2.  **Typography**: Note hierarchy, readability, and line-height.
      3.  **Generative Spec**: Describe the UI as a technical specification (e.g., 'A vertical stack of 3 buttons, centered, with 16px vertical gap').
      4.  **Reality Check**: Explicitly note any elements that look 'broken', 'jammed', or 'default HTML'."
  - [x] **Step C: Semantic Review**:
    - Compare `description.md` + Screenshot vs. `expectations.md`.
    - **Critique**: Look for "jammed" elements, lack of padding, and "non-premium" inline representations.
    - Generate `qa-audit/<page>/audit-report.md` with findings and specific recommendations.
  - [ ] **Step D: Remediation**:
    - **Task 1**: Fix Hero Actions visibility on Desktop (restore StackBlitz/Philosophy buttons).
    - **Task 2**: Fix Hero Title visibility on Desktop.
    - **Task 3**: Improve Dark Mode Code Block contrast.

- **3. Remediation**
  - [ ] **Systemic Fixes**: Address issues that appear across multiple pages (e.g., global CSS for spacing, component defaults).
  - [ ] **Local Polish**: Fix specific layout issues in individual MDX files.
  - [ ] **Verification**: Re-run screenshots to confirm the "Premium" look is achieved.

### Phase 4: Systematic Remediation

- **Goal**: Systematically identify and fix axiomatic violations across the entire site using automated tooling.

- **Workflow**:
  1.  **Identify**: Run `node scripts/check-violations.ts /path/to/page` to generate a violation report.
  2.  **Document**: Record the violations in `docs/agent-context/task-list.md`.
  3.  **Fix**: Apply fixes (CSS overrides, component updates, or axiom refinements).
  4.  **Verify**: Re-run the script to confirm zero violations.

- **Target Pages**:
  - `/` (Home)
  - `/studio/`
  - `/concepts/thinking-in-surfaces/`
  - `/reference/tokens/`
  - `/components/buttons/` (if exists)

### Phase 4.2: Inspector Overlay Coherence (No-Panel, Element-Scoped)

- **Goal**: Make the in-page inspector overlay feel like a single instrument that explains the algebra, not a grab-bag of tools.

- **Product Truths (Hard Constraints)**
  - **Theme toggle always animates `--tau`** (theme ≡ time animation). There is no supported “mode changes without tau motion”.
  - **The overlay must not set `data-theme` directly**. It must call into the theme system API so that the theme system drives `data-theme` + `--tau` consistently.
  - **Reset restores only defensive patches (“fixes”)** applied by the overlay (e.g. injected styles, temporary overrides). It must _not_ revert the user’s chosen theme/mode.
  - **No violations popup panel**: the red overlay is the primary visualization.
  - **Violation reporting is element-scoped**: the element overlay may log a grouped summary to the console.
  - **Alt-click violations behavior**: keep the existing “alt-click violations button dumps full list” affordance (good enough for whole-page diagnostics for now).

- **Implementation Tasks**
  1. **Unify Theme + Time in the UI**
     - Replace any “Theme toggle” controls that set attributes directly with calls to the theme system API.
     - Present Light/Dark and a read-only tau indicator as a single cluster.

  2. **Reset becomes stateful and semantic**
     - Track a concrete list of “fixes” applied by the overlay (e.g. injected style elements, temporary inline overrides) so Reset can:
       - be disabled when there is nothing to reset,
       - accurately remove/revert only those changes.

  3. **Remove unfinished or misplaced global tools**
     - Remove the **Physics Tuner** UI (currently reads as unfinished).
     - Remove global **Show internal plumbing** toggle (plumbing is per-element).

  4. **Move plumbing into the element overlay**
     - Add an element-scoped “Plumbing / Provenance” section where it belongs (winning rule, var refs, resolved token source, etc.).

  5. **Replace the violations panel with an element-scoped console summary**
     - Keep the red overlay visualization.
     - In the element overlay, add a button to `console.log()` a grouped summary for the currently selected element:
       - `{ continuity: { count, hints }, axioms: { count, hints } }`
     - Maintain stable labels/ARIA for Playwright interaction.

- **Verification**
  - Update any Playwright tests that rely on removed panel controls.
  - Ensure `pnpm run build` and the relevant inspector/UI tests still pass.

### Phase 4.1: Strategy for Foreign Elements (RFC)

- **Problem**: Third-party frameworks (like Starlight) use their own classes and hardcoded colors, violating the "Axiomatic" contract.
- **Goal**: A systematic way to "bless" foreign selectors as Axiomatic surfaces without manual CSS hacking.
- **Proposal**: See [RFC 001: Foreign Element Adapters](docs/design/rfcs/001-foreign-element-adapters.md).
  - **Configuration**: Allow users to map selectors to roles in `color-config.json` (e.g., `".sl-link-button.primary": "surface-action"`).
  - **Generation**: The build system generates a CSS "Adapter" that injects the Reactive Pipeline variables and logic into those selectors.
  - **Benefit**: Users don't need to copy-paste the complex `oklch` math; they just declare intent.

### Phase 5: Content Review

- [ ] **Link Checking**:
  - Run `pnpm check:links` (or equivalent) to find broken internal/external links.
- [ ] **Spelling & Grammar**:
  - Perform a pass over key guides (`quick-start.mdx`, `concepts.md`) for clarity.
- [ ] **Code Snippet Verification**:
  - Ensure all code snippets in the docs are valid and up-to-date with the latest API.

### Phase 3: Performance & Accessibility

- [ ] **Lighthouse Audit**:
  - Run Lighthouse on the homepage and a documentation page.
  - Address any "Red" scores (Performance, Accessibility, SEO).
- [ ] **Axe Audit**:
  - Run an accessibility scan to catch low-hanging fruit (contrast, labels).
