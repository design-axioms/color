# RFC 018: Overlay Token Inspection Enhancements (Token-Variable View, `light-dark()` Awareness, and Prerequisite Refactors)

**Status**: Draft  
**Date**: 2025-12-16  
**Author**: GitHub Copilot (GPT-5.2 Preview)

## Summary

This RFC proposes an incremental enhancement to the **runtime inspector overlay** (the “X-Ray” debugger) to incorporate the most useful ideas from PR #12’s docs-only Token Inspector, without importing its implementation wholesale.

The core additions under consideration:

1. A **token-variable-by-name** view (e.g. `--text-subtle-token`, `--surface-token`, `--focus-ring-color`) alongside the overlay’s existing “resolved token pipeline” view.
2. First-class handling and display of **`light-dark()`** token definitions:
   - show Light/Dark values explicitly,
   - show resolved value given the current semantic mode,
   - render an “adaptive swatch” representation.

Critically, this RFC also defines **prerequisite refactors** to reduce complexity and improve maintainability of the overlay before we add more feature surface area.

This RFC is intentionally a design capture and discussion starter; it does **not** commit us to implementing anything until reviewed.

## Motivation

We have two overlapping debugging affordances:

- The runtime overlay (in `src/lib/inspector/*`), which is broadly capable: it can inspect any element, highlight sources, and explain mismatches.
- A docs-only inspector concept in PR #12, which experimented with:
  - `popover` UI anchored to a selected element,
  - grouping and displaying specific CSS custom properties by name,
  - `light-dark()` splitting and swatches.

We should not ship a second inspector system.

Instead, we should:

- **Capture the UX wins** from #12.
- Keep debugging capabilities aligned with our architecture and policy constraints (notably RFC010).
- Improve overlay code quality so future changes do not become fragile.

## Relationship to other RFCs

- RFC010: “Consumer Contract / No Engine Addressing”. The overlay is a tool, not a consumer styling surface, but it must still respect boundaries (e.g. avoid encouraging people to copy-paste plumbing variable usage into app code).
- RFC011: “Continuity Auditing v2”. The overlay is often used to diagnose issues that the audit detects; richer token-variable views may help root-cause palette flips and time-zero pops.
- RFC013: Integration adapters and bridge exports. Token-variable inspection should clearly delineate public bridge exports vs private plumbing.
- RFC014: ThemeManager integration surface. Overlay mode display must be consistent with semantic state.

## Terms

- **Overlay**: the runtime inspector UI rendered by `AxiomaticDebugger` in `src/lib/inspector/overlay.ts`.
- **Token pipeline view**: overlay’s current “ResolvedToken[]” presentation (intents, sources, computed values).
- **Token-variable view**: a targeted list of CSS custom properties read from computed style by explicit name.
- **Adaptive token**: a token expressed as `light-dark(light, dark)`.

## Goals

- **G1 — Single inspector**: keep one canonical debugging tool.
- **G2 — Improve debuggability**: make it easier to answer “what token variables are active here?”
- **G3 — `light-dark()` clarity**: expose the two branches and the resolved value.
- **G4 — Maintainability first**: refactor overlay internals before expanding UI.
- **G5 — Policy-safe UX**: avoid encouraging engine-variable usage in consumer code.

## Non-goals

- Replacing the builder (site) inspector panels; those are a separate surface.
- Turning the overlay into a full devtools replacement.
- Adding Tailwind-like utilities or new styling APIs.

## Current State (as observed)

The overlay already provides:

- Element highlighting + pinning
- Popover-like info card
- Token list with source tracing
- Violation mode & continuity mode
- Diagnostics (winning rule, specificity, variable references) in some paths

Implementation is currently concentrated in:

- `src/lib/inspector/overlay.ts` (UI orchestration, DOM, events)
- `src/lib/inspector/engine.ts` (inspection result assembly)
- `src/lib/inspector/view.ts` (rendering token rows + advice)
- `src/lib/inspector/styles.ts` (overlay styling)

The overlay already uses anchor positioning semantics (`anchor-name`) for a stable target anchor.

## What We Learned from #12 (keep, but do not adopt wholesale)

PR #12’s Token Inspector concept suggests these useful UX patterns:

1. **Explicit variable groups**: group by role (Surface / Text / Border & UI) rather than only by computed pipeline.
2. **Variable-by-name presentation**: show known variable names directly (helpful when debugging integration CSS).
3. **`light-dark()` parsing**: show both branches, not just the resolved computed color.
4. **Swatch UX**:
   - simple swatch for resolved color
   - split swatch for adaptive tokens
5. **Keyboard accessibility** for selection targets.

We should incorporate these ideas into the overlay to keep a single debugging surface.

## Proposed Design

### 1) Add a “Token Variables” tab/section in the overlay

Add a second view mode in the info card:

- **Tokens** (existing): resolved pipeline, sources, mismatch analysis.
- **Variables** (new): a fixed list of _named_ CSS variables read from `getComputedStyle(contextElement)`.

Key principle: the Variables view is a **diagnostic lens**, not a prescription for consumer code.

### 2) Define a small, explicit variable allowlist

The overlay should only display variables that are useful and stable to talk about.

Example groups (strawman):

- Surface:
  - `--axm-surface-token`
  - `--axm-surface-page-token`
- Text:
  - `--axm-text-high-token`
  - `--axm-text-strong-token`
  - `--axm-text-subtle-token`
  - `--axm-text-subtlest-token`
- Borders/UI:
  - `--axm-border-dec-token`
  - `--axm-border-int-token`
  - `--axm-focus-ring-color`

Notes:

- The exact names should match the project’s public surface (and be aligned with generator output). This RFC does not finalize naming.
- We should **not** display private `--_axm-*` by default.

### 3) `light-dark()` awareness

When a variable’s raw computed value begins with `light-dark(`, parse it and present:

- Light branch
- Dark branch
- Resolved value for current mode
- Swatch: split diagonal or side-by-side

Constraints:

- Parsing should be conservative and safe; assume values may contain nested parentheses.
- If parse fails, fall back to raw text.

### 4) Copy/UX policy guardrails

To stay coherent with RFC010:

- Copy actions should prioritize copying **class-token fixes** and diagnostics (existing overlay behavior).
- If we allow copying variable names/values, it should be clearly labeled as “diagnostic only” and should not encourage writing `var(--axm-...)` in consumer CSS.

Recommendation:

- Allow copying the variable _name_ and the computed value for bug reports, not as a styling suggestion.

## Prerequisite Refactors (before adding features)

The overlay is powerful but already complex. Before adding a new view, we should do the following cleanups.

### R1 — Separate “data collection” from “rendering”

- Keep `AxiomaticInspectorEngine.inspect()` as the canonical token pipeline source.
- Introduce a small “variable snapshot” structure produced by a dedicated function, e.g.
  - `collectNamedVariables(element, names[]) -> VariableSnapshot[]`

Keep rendering pure:

- `renderTokenList(tokens, ...)` stays about tokens.
- New `renderVariableList(variables, ...)` stays about variables.

### R2 — Normalize the overlay’s internal state model

Overlay currently mixes:

- inspection state
- UI state (tabs, toggles)
- persistence state (localStorage)

Introduce a single internal state object with explicit fields:

- active element / pinned element
- view mode (tokens vs variables)
- show internals
- violation mode
- continuity mode

### R3 — Reduce DOM/event churn

- Prefer event delegation where practical.
- Avoid rebuilding large DOM fragments on minor updates.
- Ensure the overlay remains performant when moving the mouse across the page.

### R4 — Make “token intent list” configurable/centralized

The overlay’s presentation depends on token intents (Surface Color, Actual Background, etc.). Those should be centralized in one place to avoid drift.

### R5 — Add tests at the right abstraction boundary

We should add minimal tests that do not require a full browser:

- unit test `light-dark()` parsing helper
- unit test variable collection (given a mocked `getComputedStyle`)

Browser tests remain in Playwright if needed, but the core logic should be unit-testable.

## Alternatives Considered

1. **Adopt #12 TokenInspector into the docs site**
   - Rejected: creates two inspector systems and duplicates responsibility.

2. **Add everything into overlay immediately**
   - Rejected: increases complexity without first stabilizing architecture.

3. **Expose token-variable view via the builder inspector**
   - Possibly useful, but the overlay is the right “inspect any page” tool.

## Risks

- Variable naming drift: the allowlist must stay in sync with public API.
- UX confusion: users might copy variable values into consumer CSS.
- Complexity growth: without refactors, feature additions become brittle.

## Open Questions

- Which variables are truly “public enough” to show by default?
- Should Variables view display values on the element, or on the context root, or both?
- Should adaptive tokens be displayed as `light-dark()` strings, or as normalized color formats?
- Do we want a “bug report snapshot” export that includes both token pipeline and variable snapshot?

## Rollout Plan (if/when implemented)

1. Land refactors R1–R3 behind no behavior change.
2. Add `light-dark()` parsing helper + tests.
3. Add Variables view behind a toggle.
4. Iterate on allowlist and presentation.

## Appendix: Why This Is Not PR #12

This RFC intentionally **does not** adopt PR #12 wholesale.

The purpose is to capture the strongest ideas (variable-by-name UI and `light-dark()` clarity) while avoiding codebase drift and preserving the single-inspector architecture.

### A1 — No second inspector implementation

PR #12 introduced docs-only inspector components (selection wrappers + popover panel).

We are **not** shipping a parallel inspector system in the docs site because:

- It duplicates responsibility with the runtime overlay.
- It splits feature development and bugfixes across two tools.
- It encourages drift in token naming/presentation.

### A2 — No docs-utility decisions in this RFC

PR #12 also moved some docs components away from inline styles toward “utility” class names.

That work (including naming, enforcement against undefined utilities, and ensuring utilities do not address engine plumbing) is deliberately out of scope here.

See RFC 019 (docs utilities) for that discussion.

### A3 — No engine/theme/export churn as part of overlay features

PR #12 included broad changes to engine/theme artifacts and related behavior.

This RFC explicitly avoids bundling overlay feature work with changes to:

- `css/theme.css` (tracked export artifact)
- engine transition semantics
- bridge exports/integration plumbing

Rationale: overlay UX improvements should not destabilize the core engine or exports, and mixing them makes review and regression attribution much harder.

### A4 — No regression of “theme.css safety” in tests

PR #12 included changes that (if adopted) would reintroduce the pattern of writing/deleting `css/theme.css` in the repo working directory during tests.

That class of behavior is explicitly rejected. Overlay work must not undermine the reliability of exported artifacts.
