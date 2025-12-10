# Implementation Plan - Epoch 37: Website Quality Assurance

## Goal

Ensure the documentation site is robust, responsive, and error-free before the major interoperability push. This epoch focuses on "polishing the lens" through which users view the system.

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
