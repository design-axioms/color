# Phase Walkthrough: Epoch 44, Phase 2 (Completed)

## Current Continuation State (2025-12-16)

This repo is currently mid “ship the work as a PR” on branch `fix/website-polish`.

### What happened

- A push attempt triggered the repo’s pre-push gate (build + typecheck + site-check + publint). The gate failed primarily due to strict TypeScript / NodeNext ESM requirements in tests and a duplicate option property in `ThemeManagerOptions`.
- Targeted fixes were applied to unblock the compiler and bring the repository back to a deterministic state.

### Current status

- TypeScript is green: `pnpm -w exec tsc --noEmit` passes.
- The PR is not opened yet; next action is to rerun the full pre-push suite and push the branch.

### High-signal fixes applied (recent)

- Removed the duplicate `faviconGenerator` option in `src/lib/browser.ts`.
- Hardened regex capture indexing in scripts/CLI for `noUncheckedIndexedAccess`.
- Updated NodeNext test imports to include explicit `.js` extensions where required.
- Tightened a handful of tests to satisfy strict nullability and callback typing.

### Critical invariants (do not regress)

- `css/theme.css` is exported publicly (`package.json` `./theme.css`). Never delete it in tests or cleanup scripts.

### Next steps (next chat)

1. Re-run the same checks the push hook runs (or run the hook) until green:

- `pnpm build`
- `pnpm check:exports`
- `pnpm check:site`
- `pnpm test`

2. Push branch `fix/website-polish` and open a PR to `main`.
3. After the PR exists, resume “sediment pass” cleanup and then explicitly plan a refactor-focused follow-up phase.

### Prompt handoff constraint

The `cast-auto.prompt.md` referenced in chat appears to live outside the repo workspace; current agent tooling cannot read it. If strict compliance is required, copy it into the workspace (recommended: `docs/agent-context/brain/prompts/`).

## Goal

Continue RFC 011’s refactor (“measure once, analyze many”) while polishing the docs/devtools experience for the Hard Flip demo.

## Work Completed

- RFC 011 refactor: modular checks architecture for `check-violations` (scenario + pure analysis + module-owned printing) with log-only replay.
- Expanded ObservationLog support for snaps/continuity analysis, including shared log helpers to reduce repeated parsing/scanning patterns.
- Documentation governance: codified the “stable spine” approach as an axiom and updated RFC 011 to capture adjacent architectural guardrails.
- Inspector overlay UX fixes:
  - prevent continuity audits from running on page load when the overlay is closed,
  - make continuity audits abortable when the overlay is closed mid-run,
  - hide the reset button unless there are actual overlay fixes to revert.
- Added unit-level regression tests for the overlay behaviors (restore/no-autostart, reset visibility, abort-on-disable).

## Verification

- `./scripts/agent/verify-phase.sh` (Vitest + ESLint)

## Follow-up Scope

The next phase focuses on finishing the refactor thread (typed registry boundary cleanup) and eliminating the remaining real tau-stable snaps.

## Empirical Findings: Starlight Theme Toggle Timing (CSSOM + Motion)

We ran an observational Playwright probe against the docs site to understand why different chrome regions could appear to animate at different times during a theme flip.

### How it was measured

- Target page: `/concepts/thinking-in-surfaces/` on `https://color-system.localhost/`.
- Instrumentation:
  - `MutationObserver` on `document.documentElement` to timestamp attribute/class mutations.
  - `MutationObserver` on `<head>` to detect stylesheet insertions.
  - Per-frame sampling of `document.styleSheets.length` and `document.adoptedStyleSheets?.length` to detect late CSS attachment.
  - `transitionrun` / `transitionstart` / `transitionend` listeners (capture phase).
  - A 4× CPU throttle run to test load sensitivity.

Script:

- `tmp/diagnostics/theme-toggle-timeline.ts`
- Run: `node tmp/diagnostics/theme-toggle-timeline.ts`
- Optional env:
  - `AXM_DIAG_URL` (defaults to `https://color-system.localhost`)
  - `AXM_DIAG_PATH` (defaults to `/concepts/thinking-in-surfaces/`)
  - `AXM_DIAG_FULL=1` to dump full raw events

### Results (hypotheses H1–H6)

- **H1 (staged DOM writes): confirmed.**
  - Theme flips produce a burst of root mutations (`data-theme`, `color-scheme` style, `data-axm-mode`, `data-axm-resolved-mode`), then a later `class` mutation.
  - Baseline: last root mutation landed ~50–56ms after the toggle request.
  - Under 4× CPU throttle: that span widened to ~163ms.
- **H2 (late CSS insertion / sheet attachment): not supported.**
  - No `<head>` insertions observed during the flip.
  - `document.styleSheets` stayed constant (50 → 50).
  - `document.adoptedStyleSheets` stayed constant (0 → 0).
- **H3 (transition definition mismatch): confirmed.**
  - Header/page/sidebar-inner have non-zero transitions (0.2s) over Axiomatic/bridge custom properties.
  - Sidebar host + theme select show `transition-property: all` but with `transition-duration: 0s` (effectively snap).
  - This mixed policy is sufficient to create “some animates, some snaps” perception.
- **H4 (variable provenance differs by chrome region): confirmed.**
  - Bridge variables (e.g. `--axm-bridge-surface`) are defined at different chrome roots (header vs sidebar host), so staged wiring can affect regions on different ticks.
- **H5 (pipeline/load sensitivity): supported under throttle.**
  - Under CPU throttle, staged mutations and transition timing spreads widen.
- **H6 (View Transitions): not supported.**
  - `document.startViewTransition` is available but was not called in the observed toggle path.

### Implication

The dominant failure mode is “multi-authority + staged writes” combined with mixed transition policy across chrome. A durable fix is to ensure theme intent has a single writer (ThemeManager) and that chrome has a coherent, contract-enforced transition policy.
