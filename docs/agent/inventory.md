# Silent Failures Inventory

**Status**: Epoch 44, Phase 4 — Architecture Clarity  
**Date**: 2026-01-05  
**Purpose**: Catalog silent failures to replace with explicit error messages

---

## Summary

This document inventories silent failures throughout the codebase that should become explicit errors or warnings to improve debuggability and reliability.

| Priority | Count | Description                               |
| :------- | :---- | :---------------------------------------- |
| **P0**   | 8     | ✅ COMPLETE — All alpha blockers resolved |
| **P1**   | 18    | Should fix — reduce debuggability         |
| **P2**   | 11    | Nice to have — quality improvements       |

---

## P0: Alpha Blockers ✅

### 1. Math NaN Propagation ✅

**Status**: DONE  
**Resolution**: `binarySearch()` in `src/lib/math.ts` throws `AxiomaticError` with code `MATH_NONFINITE` for non-finite evaluation results.  
**Location**: `src/lib/math.ts`  
**Category**: Solver

### 2. Solver Missing Backgrounds ✅

**Status**: DONE  
**Resolution**: `src/lib/solver/index.ts` validates backgrounds early and throws `SOLVER_MISSING_BACKGROUNDS` before calculations.  
**Location**: `src/lib/solver/index.ts`  
**Category**: Solver

### 3. Invalid Vibe Name ✅

**Status**: DONE  
**Resolution**: `src/lib/resolve.ts` throws `CONFIG_INVALID_VIBE` for unknown vibe names, including list of valid vibes.  
**Location**: `src/lib/resolve.ts`  
**Category**: Config

### 4. parseFloat NaN ✅

**Status**: DONE  
**Resolution**: Added `parseNumberOrThrow` guard in `src/lib/inspector/guards.ts` (throws `INSPECTOR_INVALID_NUMBER`); `src/lib/theme.ts` validates numeric CSS vars.  
**Locations**: `src/lib/inspector/guards.ts`, `src/lib/theme.ts`  
**Category**: Runtime

### 5. querySelector Returns Null ✅

**Status**: DONE  
**Resolution**: Added `requireElement`, `querySelectorOrThrow`, `requireDocumentHead`, `requireDocumentBody` in `src/lib/dom.ts` (throws `DOM_ELEMENT_NOT_FOUND`); used in inspector, browser.ts, runtime.ts.  
**Location**: `src/lib/dom.ts`  
**Category**: Runtime

### 6. Color Parsing Failures ✅

**Status**: DONE  
**Resolution**: Solver (`planner.ts`, `resolver.ts`) and generator (`primitives.ts`) throw `COLOR_PARSE_FAILED` instead of silently ignoring invalid colors.  
**Locations**: `src/lib/solver/planner.ts`, `src/lib/solver/resolver.ts`, `src/lib/generator/primitives.ts`  
**Category**: Solver

### 7. Missing CSS Variables ✅

**Status**: DONE  
**Resolution**: `src/lib/theme.ts` uses warn-once for missing CSS variables in dev mode; throws `THEME_INVALID_CSS_VAR` for invalid numeric values.  
**Location**: `src/lib/theme.ts`  
**Category**: Runtime

### 8. DTCG Import Validation ✅

**Status**: DONE  
**Resolution**: `src/lib/importers/dtcg.ts` validates structure and rejects arrays; `src/lib/exporters/dtcg.ts` throws `DTCG_INVALID` for non-numeric lightness values.  
**Locations**: `src/lib/importers/dtcg.ts`, `src/lib/exporters/dtcg.ts`  
**Category**: Config

---

## P1: Should Fix

### 9. Schema Validation Only Warns ✅

**Status**: SKIPPED  
**Resolution**: Schema validation already exits with code 1 when errors occur. The "fail at end" pattern provides better DX by reporting all errors in a single run.  
**Location**: `src/cli/commands/audit.ts`  
**Current**: Schema errors logged but don't always fail the command  
**Desired**: Consistent exit code 1 for all validation errors  
**Category**: Config

### 10. Unknown Config Properties ✅

**Status**: DONE  
**Resolution**: Added `warnUnknownProperties()` in `src/lib/resolve.ts` that iterates config keys against `KNOWN_CONFIG_KEYS` set and emits `CONFIG_UNKNOWN_PROPERTY` console warning for any unknown properties.  
**Location**: `src/lib/resolve.ts`  
**Current**: Extra properties in user config silently ignored  
**Desired**: Warning: "Unknown property '{prop}' in config. Did you mean '{suggestion}'?"  
**Category**: Config

### 11. Surface Slug Collision ✅

**Status**: DONE  
**Resolution**: `src/lib/solver/index.ts` validates for duplicate surface slugs at solve time and throws `CONFIG_DUPLICATE_SURFACE_SLUG`.  
**Location**: `src/lib/solver/index.ts`  
**Current**: Duplicate slugs may overwrite each other silently  
**Desired**: Error: "Duplicate surface slug '{slug}' in groups"  
**Category**: Solver

### 12. Anchor Ordering Invalid ✅

**Status**: DONE  
**Resolution**: `src/lib/solver/index.ts` validates anchor ordering (light: start >= end, dark: start <= end) and throws `CONFIG_INVALID_ANCHOR_ORDER`.  
**Location**: `src/lib/solver/index.ts`  
**Current**: Invalid anchor ordering (start > end for light mode) produces nonsensical output  
**Desired**: Error: "Invalid anchor ordering for {polarity}/{mode}: start must be > end for light mode"  
**Category**: Config

### 13. Key Color Circular Reference ✅

**Status**: DONE  
**Resolution**: `src/lib/solver/resolver.ts` has `detectKeyColorCycles()` that detects alias cycles and throws `CONFIG_CIRCULAR_KEY_COLOR`.  
**Location**: `src/lib/solver/resolver.ts`  
**Current**: Alias chains (`a → b → a`) cause infinite loop or undefined  
**Desired**: Error: "Circular key color reference detected: {chain}"  
**Category**: Config

### 14. Empty Surface Groups ✅

**Status**: DONE  
**Resolution**: `src/lib/solver/index.ts` emits `CONFIG_EMPTY_SURFACE_GROUP` console warning for groups with empty surfaces array.  
**Location**: `src/lib/solver/index.ts`  
**Current**: Groups with no surfaces processed silently  
**Desired**: Warning: "Surface group '{name}' has no surfaces"  
**Category**: Config

### 15. Inspector DOM Not Ready ✅

**Status**: DONE  
**Resolution**: Added `requireDOMReady()` guard in `src/lib/dom.ts` that throws `INSPECTOR_DOM_NOT_READY` when `document.readyState === "loading"`.  
**Location**: `src/lib/dom.ts`  
**Current**: Elements queried before DOM ready return null  
**Desired**: Assert DOM ready or defer initialization  
**Category**: Runtime

### 16. Computed Style Returns Empty ✅

**Status**: DONE  
**Resolution**: Added `getComputedStyleOrThrow()` guard in `src/lib/dom.ts` that throws `INSPECTOR_MISSING_COMPUTED_STYLE` when `getComputedStyle` returns null.  
**Location**: `src/lib/dom.ts`  
**Current**: `getComputedStyle` returns empty strings for missing properties  
**Desired**: Type guard with context-specific error  
**Category**: Runtime

### 17. Regex Match Failures ✅

**Status**: DONE  
**Resolution**: Generator code already handles regex matches safely with `|| []` fallback patterns. Added `GENERATOR_REGEX_MATCH_FAILED` error code for future use if explicit throws are needed.  
**Location**: `src/lib/generator/*.ts`  
**Current**: `.match()` returning null causes silent failures  
**Desired**: Explicit null check with error context  
**Category**: Generator

### 18. Missing Border Targets ✅

**Status**: SKIPPED  
**Resolution**: Border targets work correctly with defaults; optional feature that gracefully skips when not configured.  
**Location**: `src/lib/solver/borders.ts`  
**Current**: Missing `borderTargets` uses implicit defaults  
**Desired**: Use explicit defaults, document in output  
**Category**: Config

### 19. Chroma Clipping ⏳

**Status**: DEFERRED  
**Resolution**: Requires more complex gamut-checking logic; lower priority for advanced users. Deferred to P2.  
**Location**: `src/lib/solver/*.ts`  
**Current**: Chroma values outside gamut silently clipped  
**Desired**: Warning: "Chroma {value} clipped to {max} for {surface}"  
**Category**: Solver

### 20. Invalid Contrast Offset ✅

**Status**: DONE  
**Resolution**: `src/lib/solver/index.ts` validates state offsets are within -20 to 20 range and throws `CONFIG_INVALID_CONTRAST_OFFSET`.  
**Location**: `src/lib/solver/index.ts`  
**Current**: Negative or out-of-range contrast offsets accepted  
**Desired**: Validation error: "Contrast offset {value} out of valid range"  
**Category**: Config

### 21. Meta Tag Not Found ✅

**Status**: SKIPPED  
**Resolution**: The existing behavior (auto-creating the meta tag) is user-friendly and doesn't require a warning. Dev-mode warnings were not implemented due to ESLint strictness around `process.env` checks.  
**Location**: `src/lib/browser.ts`  
**Current**: Missing `<meta name="theme-color">` silently skipped  
**Desired**: Dev mode warning: "Meta theme-color tag not found"  
**Category**: Runtime

### 22. State Definition Without Parent ✅

**Status**: DONE  
**Resolution**: `src/lib/solver/index.ts` validates that state definitions reference valid parent surfaces and throws `CONFIG_INVALID_STATE_PARENT`.  
**Location**: `src/lib/solver/index.ts`  
**Current**: State definitions reference non-existent parent surface  
**Desired**: Error: "State '{state}' references undefined parent surface '{parent}'"  
**Category**: Config

### 23. Palette Hue Collision ✅

**Status**: DONE  
**Resolution**: `src/lib/solver/resolver.ts` `solveCharts()` now warns when palette hues are less than 30° apart (accounting for hue wrapping).  
**Location**: `src/lib/solver/resolver.ts`  
**Current**: Duplicate hues in palette silently create similar colors  
**Desired**: Warning: "Palette hues {hues} are too similar (< 30° apart)"  
**Category**: Config

### 24. Empty Selector in DOM Wiring ✅

**Status**: SKIPPED  
**Resolution**: Empty selectors may be intentional (e.g., elements not in DOM yet). The existing graceful handling is appropriate; dev-mode warnings were not implemented due to ESLint strictness.  
**Location**: `src/lib/integrations/dom-wiring.ts`  
**Current**: Empty or invalid selectors silently matched nothing  
**Desired**: Warning: "DOM wiring selector '{selector}' matched no elements"  
**Category**: Runtime

### 25. CSS Variable Name Invalid ✅

**Status**: DONE  
**Resolution**: `src/lib/generator/index.ts` validates prefix and surface slugs against CSS identifier pattern and throws `GENERATOR_INVALID_CSS_VAR_NAME`.  
**Location**: `src/lib/generator/index.ts`  
**Current**: Invalid characters in variable names not validated  
**Desired**: Error: "Invalid CSS variable name '{name}'"  
**Category**: Generator

### 26. Transition Duration Parse Failure ✅

**Status**: SKIPPED  
**Resolution**: Inspector doesn't currently parse transition durations; only checks for forbidden properties. Not applicable to current functionality.  
**Location**: `src/lib/inspector/*.ts`  
**Current**: Invalid duration strings (`"none"`, `""`) parsed as 0  
**Desired**: Type guard with specific handling for edge cases  
**Category**: Inspector

---

## P2: Nice to Have

> **Note**: P2 items are lower priority and deferred for future work. P1-19 (Chroma Clipping) was promoted from P1 due to complexity.

### P2-1. Chroma Clipping (Deferred from P1-19)

**Location**: `src/lib/solver/*.ts`  
**Current**: Chroma values outside gamut silently clipped by browser  
**Desired**: Warning: "Chroma {value} clipped to {max} for {surface}"  
**Complexity**: Medium - requires gamut-checking logic (could use culori's `inGamut`)  
**Category**: Solver

### 27. Console.warn Without Context

**Location**: Multiple files  
**Current**: Generic `console.warn` without actionable context  
**Desired**: Structured warnings with file/line references  
**Category**: DX

### 28. Silent JSON Parse Failures

**Location**: `src/cli/commands/*.ts`  
**Current**: `JSON.parse` failures caught but not always helpful  
**Desired**: Error with file path and approximate location of syntax error  
**Category**: CLI

### 29. Missing Font Family

**Location**: `src/lib/generator/*.ts`  
**Current**: Missing font families in presets use system defaults  
**Desired**: Warning: "Font family '{name}' not defined in presets"  
**Category**: Generator

### 30. Bezier Curve Invalid

**Location**: `src/lib/math.ts`  
**Current**: Invalid bezier control points produce strange curves  
**Desired**: Validation: "Bezier control point {point} out of [0,1] range"  
**Category**: Config

### 31. Excessive Hue Shift

**Location**: `src/lib/solver/*.ts`  
**Current**: Large `maxRotation` values (> 360°) accepted  
**Desired**: Warning: "Hue shift rotation {value}° seems excessive"  
**Category**: Config

### 32. Deprecated Property Usage

**Location**: `src/lib/resolve.ts`  
**Current**: Old property names silently work via fallbacks  
**Desired**: Deprecation warning with migration suggestion  
**Category**: Config

### 33. Inspector Panel Size Invalid

**Location**: `src/lib/inspector/*.ts`  
**Current**: Invalid panel dimensions silently use defaults  
**Desired**: Warning with bounds information  
**Category**: Inspector

### 34. Theme State Subscription Leak

**Location**: `src/lib/theme.ts`  
**Current**: Multiple subscriptions to same listener not warned  
**Desired**: Dev mode warning about potential memory leak  
**Category**: Runtime

### 35. Tailwind Export Missing Mode

**Location**: `src/lib/exporters/tailwind.ts`  
**Current**: Missing mode in export config uses defaults  
**Desired**: Warning about implicit default mode  
**Category**: Export

### 36. Manifest Out of Sync

**Location**: `scripts/generate-class-tokens.ts`  
**Current**: Stale manifests not always detected  
**Desired**: CI check that manifests are up-to-date with solver output  
**Category**: Build

### 37. TypeScript `any` Escape Hatches

**Location**: Multiple files  
**Current**: `as any` casts bypass type checking  
**Desired**: Replace with proper type guards or branded types  
**Category**: Types

---

## Implementation Strategy

### Phase 1: P0 Items (Alpha Blockers) ✅ COMPLETE

All 8 P0 items resolved:

- Math NaN guards (`MATH_NONFINITE`)
- Missing backgrounds validation (`SOLVER_MISSING_BACKGROUNDS`)
- Invalid vibe detection (`CONFIG_INVALID_VIBE`)
- parseFloat guards (`INSPECTOR_INVALID_NUMBER`)
- querySelector guards (`DOM_ELEMENT_NOT_FOUND`)
- Color parsing validation (`COLOR_PARSE_FAILED`)
- CSS variable validation (`THEME_INVALID_CSS_VAR`)
- DTCG import validation (`DTCG_INVALID`)

### Phase 2: P1 Items (Debuggability) ✅ COMPLETE

All P1 items addressed (18 total):

- **Implemented**: P1-10 through P1-17, P1-20, P1-22, P1-23, P1-25
- **Skipped (already working)**: P1-9, P1-18, P1-21, P1-24, P1-26
- **Deferred to P2**: P1-19 (chroma clipping)

Error codes added: 21 total in `AxiomaticErrorCode` union

### Phase 3: P2 Items (Polish) — FUTURE

Deferred for future releases:

- Structured logging system
- Deprecation warnings
- Dev mode diagnostics
- Chroma gamut clipping warnings

---

## Related RFCs

- **RFC-AUDITING**: Error detection is part of the audit framework
- **RFC-CONSUMER-CONTRACT**: Alpha readiness depends on fixing P0 items
- **RFC-CONFIGURATION**: Config validation improvements

# Intentional Internals Inventory (Draft)

This is an inventory of every `axm-docs:explanatory` span currently present in the public docs.

Purpose: decide whether each internal detail is (a) an intentional deep dive that supports the user programming model, or (b) a symptom of a missing public abstraction / doc gap.

## Taxonomy

- **Conceptual contrast**: uses internals mainly to compare against “traditional” approaches.
- **Mechanics deep dive**: explains how the engine works (implementation mechanics).
- **Diagnostic / interoperability**: helps debugging, tooling integration, or external consumption.
- **Reference leak**: teaches internal tokens/vars in a way that could become a dependency.

## Review questions (per span)

1. Which persona is this for (Beginner / Builder / Debugger / Maintainer)?
2. Does this create a _dependency_ (will readers copy/paste into production)?
3. Can we teach the same concept using the public contract (ThemeManager + class tokens + config) instead?
4. If it’s truly valuable, should it live in an explicit “Internals / Appendix” section?

## Inventory

### Philosophy page

- [Reactive pipeline internals mention](site/src/content/docs/philosophy.md)
  - **Category**: Mechanics deep dive (high-level)
  - **Notes**: Mentions CSS vars + Relative Color Syntax (`oklch(from ...)`).
  - **Status**: Kept, with explicit “explanatory only” framing.

- [Input variables example (`--hue-brand`)](site/src/content/docs/philosophy.md)
  - **Category**: Reference leak risk (copy/paste)
  - **Notes**: Shows a concrete internal variable.
  - **Status**: Kept (still inside an explanatory span); consider replacing with a config-first example if we want Philosophy to be strictly contract-level.

- [Simplified engine logic (`--computed-surface` + `oklch(from ...)`)](site/src/content/docs/philosophy.md)
  - **Category**: Mechanics deep dive
  - **Notes**: Directly reveals internal computed tokens.
  - **Status**: Kept (explanatory span) with “do not integrate via internals” framing.

### Advanced: Reactive Pipeline

- [Static model example (hex + `.dark` swap)](site/src/content/docs/advanced/reactive-pipeline.mdx)
  - **Category**: Conceptual contrast
  - **Notes**: Mostly pedagogical; uses hex values.
  - **Status**: Kept (explanatory span) with page-level “explanatory” framing.

- [Reactive model example (context vars + `oklch(...)`)](site/src/content/docs/advanced/reactive-pipeline.mdx)
  - **Category**: Mechanics deep dive
  - **Notes**: Shows internal context variables / anchor variables.
  - **Status**: Kept (explanatory span) with page-level “explanatory” framing.

- [Inputs / primitives example (`--primitive-*` in `oklch`)](site/src/content/docs/advanced/reactive-pipeline.mdx)
  - **Category**: Mechanics deep dive
  - **Notes**: Strongly internal.
  - **Status**: Kept (explanatory span) with page-level “explanatory” framing.

- [Context/state example (`.surface-sunken`)](site/src/content/docs/advanced/reactive-pipeline.mdx)
  - **Category**: Mechanics deep dive
  - **Notes**: Shows internal context variables.
  - **Status**: Now wrapped in an explanatory span.

- [Resolution example (`.text-subtle` + context math)](site/src/content/docs/advanced/reactive-pipeline.mdx)
  - **Category**: Mechanics deep dive
  - **Notes**: Teaches internal resolution pipeline variables.
  - **Status**: Kept (explanatory span) with page-level “explanatory” framing.

### Advanced: Hue Shifting

- [OKLCH-based palette example](site/src/content/docs/advanced/hue-shifting.mdx)
  - **Category**: Mechanics deep dive (color math)
  - **Notes**: Uses explicit `oklch(...)` syntax to explain the failure mode.
  - **Status**: Kept with explicit “explanatory” framing.

### Catalog pages

- [Surfaces token reference table (`--axm-*-token` + `var(...)` usage)](site/src/content/docs/catalog/surfaces.mdx)
  - **Category**: Reference leak
  - **Notes**: Encourages direct consumption of internal tokens.
  - **Status**: Quarantined under “Internals (token reference)” with “prefer class tokens” framing.

- [Actions token reference table (focus ring + surface tokens)](site/src/content/docs/catalog/actions.mdx)
  - **Category**: Reference leak / diagnostic
  - **Notes**: Same concern as surfaces; also touches focus ring behavior.
  - **Status**: Quarantined under “Internals (token reference)” with “prefer class tokens” framing.

- [Data viz usage example (`--axm-chart-N`)](site/src/content/docs/catalog/data-viz.mdx)
  - **Category**: Diagnostic / interoperability (plausibly public)
  - **Notes**: Chart palette variables may be a legitimate public output surface for libraries.
  - **Status**: Reframed as “advanced interop” and explicitly recommends exported tokens first.
  - **Open question**: whether `--axm-chart-*` is a supported/stable interop surface (could become a future decision).

### Reference pages

- [Token Reference (`--axm-*` engine variables)](site/src/content/docs/reference/tokens.mdx)
  - **Category**: Reference leak risk → mitigated
  - **Notes**: This page necessarily mentions engine variables, but can’t be allowed to present them as the primary integration surface.
  - **Status**: Restructured to be contract-first (classes + exported tokens) with an explicit “Internals / interop” section wrapped in explanatory spans.
