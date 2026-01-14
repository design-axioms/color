# RFC-INSPECTOR: Runtime Inspector ("X-Ray Debugger")

**Status**: Consolidated from RFC016 (inspector sections), RFC017, RFC018, design/005  
**Date**: 2026-01-05  
**Depends On**: RFC-CONSUMER-CONTRACT, RFC-AUDITING

## Summary

This RFC defines the **Axiomatic Inspector** — a runtime debugging tool that helps users diagnose and fix color system violations. The inspector is an "X-Ray" view into the invisible logic of the Axiomatic Color System, exposing token inheritance, surface nesting, mismatches, and continuity violations.

The inspector is implemented as a Web Component (`<axiomatic-debugger>`) that overlays the page with visual diagnostics and actionable remediation guidance.

## Motivation

Axiomatic Color operates on invisible primitives: surfaces establish context, tokens flow through the cascade, and polarity/continuity must be preserved. When something breaks, developers need visibility into:

- What surface context is active?
- Which tokens are resolved, and from where?
- Why does this element's color mismatch the expected token?
- Does my theme "snap" or "pop" during light/dark transitions?

The inspector provides this X-Ray vision without requiring deep knowledge of CSS variables or internal engine implementation.

## Goals

1. **Diagnose mismatches**: Identify elements where painted colors diverge from semantic tokens
2. **Export remediation recipes**: Provide deterministic, copy-able fix instructions
3. **Inspect token pipeline**: Show the resolved token cascade for any element
4. **Check continuity**: Detect "snaps" and "pops" during theme transitions
5. **Support automation**: Publish reports to `globalThis` for CI/enforcement scripts
6. **Maintain boundaries**: The inspector is a debug tool, not part of the consumer styling API

## Non-Goals

- This RFC does **not** define the audit framework (see RFC-AUDITING)
- The inspector does **not** write engine variables (`--axm-*`, `--_axm-*`) as remediation
- The inspector does **not** claim it can infer correct "new surface boundaries"

---

## Architecture

The inspector is structured in four layers:

### 1. Controller (`overlay.ts`)

**Responsibility**: Web Component lifecycle, event handling, state management, orchestration.

- Manages `<axiomatic-debugger>` custom element
- Handles mouse move, click, keyboard shortcuts
- Coordinates engine analysis and view rendering

**Key state**:

- `isEnabled`: Inspector active?
- `isPinned`: Element locked for inspection?
- `isViolationMode`: Scanning for mismatches?
- `isContinuityMode`: Checking for theme snaps?
- `interactionMode`: `"diagnose"` (read-only) or `"experiment"` (temp patches)

### 2. Engine (`engine.ts`)

**Responsibility**: Pure analysis logic.

- `inspect(element)`: Resolves token pipeline and context
- `scanForViolations()`: Scans DOM for mismatch violations
- `checkContinuity()`: Physics-like testing of theme transitions

**Output**: Data structures (no DOM, no HTML strings)

### 3. View (`view.ts`)

**Responsibility**: Pure rendering functions.

- `renderTokenList(tokens)`: Displays resolved token cascade
- `renderAdvice(result)`: Generates remediation UI and recipes
- `updateAdviceWithAnalysis()`: Enriches advice with winning rule attribution

### 4. Styles (`styles.ts`)

**Responsibility**: Shadow DOM CSS for the overlay itself.

---

## Interaction Modes

### Diagnose Mode (Default)

- **Read-only**: No DOM mutations
- **Purpose**: Produce remediation recipes for manual source edits
- **Actions**:
  - Hover/click to inspect elements
  - Scan for violations
  - Copy recipe (text or JSON)
  - Run continuity check

### Experiment Mode

- **Temporary patches**: Allows reversible DOM mutations for visual confirmation
- **Purpose**: Validate hypotheses before editing source
- **Actions**:
  - All Diagnose actions, plus:
  - "Apply Temp" button: removes conflicting utilities/inline styles
  - Tracked modifications can be reset

**Important**: Experiment mode does NOT write source fixes. It mutates live DOM to confirm "if I remove this, does the mismatch go away?"

Mode is **not persisted** across reloads.

---

## Violation Detection

The inspector flags two categories of violations:

### 1. Axiom Mismatch

**Definition**: Resolved surface token ≠ actual computed background, or final text token ≠ actual computed text.

**Attribution**:

- Find winning CSS rule via CSSOM traversal
- Extract referenced `var(--*)` names
- Flag forbidden variables (e.g., `--sl-*` in consumer code)
- Detect inline style overrides
- Identify conflicting utility classes (`bg-*`, `text-*`)

### 2. Internal Engine Variable Usage

**Definition**: An element uses an internal engine variable (`--_axm-*`) without a responsible class and not via inline style.

**Ignored regions**:

- `<html>` (UA defaults)
- Generated/foreign code (`.expressive-code`, `.astro-code`)
- Hidden elements (`display: none`, etc.)
- The inspector itself

---

## Remediation Recipes

A **recipe** is a deterministic checklist for fixing a violation via manual source edits.

### Recipe Workflow

1. **Inspect or scan** to locate a mismatch
2. **Diagnose** the likely cause (overlay shows winning rule / inline / utility)
3. **Copy Recipe** (text or JSON)
4. **Edit source** using the recipe instructions
5. **Reload + rescan** to confirm the fix

### Text Checklist Format

```
Axiomatic Inspector — remediation recipe v1
Target: <div>.card.bg-red-500
Property: background-color
Expected surface: surface-card

Edits:
1. Remove class: bg-red-500
2. Edit rule `.card` in `custom.css`: remove background-color

Confidence: high
```

### JSON Payload Format

```json
{
  "version": "1",
  "target": { "kind": "label", "label": "<div>.card.bg-red-500" },
  "violation": {
    "property": "background-color",
    "expectedSurfaceClass": "surface-card"
  },
  "edits": [
    { "kind": "remove-class", "className": "bg-red-500" },
    {
      "kind": "edit-css-rule",
      "file": "custom.css",
      "selector": ".card",
      "removeDeclarations": ["background-color"]
    }
  ],
  "confidence": "high"
}
```

### Edit Kinds

- `remove-class`: Remove a conflicting utility class
- `remove-inline-style`: Remove an inline style property
- `edit-css-rule`: Remove a declaration from a CSS rule (with file hint)

---

## Token Inspection

### Resolved Token Pipeline

The inspector displays the token cascade for any element:

| Intent            | Value             | Source Variable         | Provenance                 |
| ----------------- | ----------------- | ----------------------- | -------------------------- |
| Surface Color     | `oklch(0.95 0 0)` | `--axm-surface-token`   | `.surface-card` (ancestor) |
| Actual Background | `oklch(0.95 0 0)` | -                       | Computed                   |
| Final Text Color  | `oklch(0.2 0 0)`  | `--axm-text-body-token` | `.text-body` (ancestor)    |

**Key insights**:

- Shows inherited vs local tokens
- Flags internal engine variables (`--_axm-*`)
- Identifies responsible classes
- Highlights mismatches

### Token-by-Name View (Future)

RFC018 proposes an additional "Variables" tab displaying specific CSS variables:

**Surface**: `--axm-surface-token`, `--axm-surface-computed`  
**Text**: `--axm-text-body-token`, `--axm-text-heading-token`, etc.  
**Borders**: `--axm-border-int-token`, `--axm-border-dec-token`

### `light-dark()` Awareness (Future)

When a variable's value is `light-dark(...)`, the inspector can parse and display:

- Light branch value
- Dark branch value
- Resolved value for current mode
- Split swatch visualization

---

## Continuity Checking

**Purpose**: Detect "snaps" and "pops" during theme transitions.

### Algorithm

1. **Freeze Time**: Disable all transitions and animations
2. **Sample Tau**: For each τ value (e.g., `[-1, 0, 1]`):
   - Force `--tau` inline with `!important`
   - Set `data-theme="light"`, capture paint
   - Set `data-theme="dark"`, capture paint
   - Compare: if any property differs, emit violation
3. **Restore**: Remove overrides, restore original theme

### Checked Properties

- `background-color`
- `color`
- `border-*-color` (when width > 0)
- `outline-color` (when width > 0)

### Violation Output

```
Continuity Violation (tau=0) (Background): Snapped from oklch(0.95 0 0) to oklch(0.2 0 0).
Culprit: CSS Rule: .header (custom.css) [0,1,0]
```

---

## Conditional Rule Evaluation

**Purpose**: Distinguish between CSS rules that are _potentially applicable_ vs. _actively applied_ when wrapped in conditional at-rules (`@container`, `@media`, `@supports`).

### Problem Statement

The Inspector collects all CSS rules whose selectors match an element. For rules inside conditional blocks, we need to know:

1. **Applies**: The selector matches the element (always true for collected rules)
2. **Active**: The conditional block's condition currently evaluates to `true`

Without this distinction, the Inspector shows rules that _could_ affect an element but don't currently—creating noise in violation diagnosis.

### Data Model

Extend `CollectedRule` with optional conditional context:

```typescript
interface ConditionalContext {
  type: "container" | "media" | "supports";
  condition: string; // e.g., "(min-width: 400px)"
  active: boolean; // Did this condition evaluate to true?
  evaluated: boolean; // Were we able to evaluate it? (always true with probe technique)
}

interface CollectedRule {
  // ...existing fields (rule, specificity, layer, etc.)
  conditional?: ConditionalContext;
}
```

### Evaluation Algorithm: Sentinel Probe Technique

Instead of parsing and evaluating condition syntax ourselves, we use the browser's own evaluation engine via a "sentinel probe":

```typescript
function isConditionalRuleActive(element: Element, rule: CSSRule): boolean {
  // Generate a unique sentinel property
  const sentinel = `--_axm-probe-${Math.random().toString(36).slice(2, 10)}`;
  const sentinelValue = "active";

  // Find a style rule inside the conditional to inject into
  const styleRule = findFirstStyleRule(rule);
  if (!styleRule) return true; // No style rule = can't probe, assume active

  // Inject the sentinel property
  styleRule.style.setProperty(sentinel, sentinelValue);

  // Check if getComputedStyle sees it on the target element
  const computed = getComputedStyle(element).getPropertyValue(sentinel).trim();
  const isActive = computed === sentinelValue;

  // Clean up
  styleRule.style.removeProperty(sentinel);

  return isActive;
}
```

**Why this approach?**

- **100% accurate**: Uses browser's native CSS evaluation
- **Zero parsing**: Works with all condition syntax (and, or, not, style queries, future syntax)
- **Universal**: Same code handles `@container`, `@media`, `@supports`
- **Future-proof**: Automatically supports new CSS features we don't know about yet

### Supported Conditions

All conditions are supported—the probe technique doesn't parse the condition, it just asks the browser "does this rule apply?"

| Condition Type   | Example                                     | Supported |
| :--------------- | :------------------------------------------ | :-------- |
| `min-width`      | `(min-width: 400px)`                        | ✅        |
| `max-width`      | `(max-width: 800px)`                        | ✅        |
| `and` combinator | `(min-width: 400px) and (max-width: 800px)` | ✅        |
| `or` combinator  | `(min-width: 400px) or (min-height: 300px)` | ✅        |
| `not` operator   | `not (min-width: 400px)`                    | ✅        |
| Style queries    | `style(--theme: dark)`                      | ✅        |
| `@media`         | `@media (prefers-color-scheme: dark)`       | ✅        |
| `@supports`      | `@supports (display: grid)`                 | ✅        |

### UI Representation

In the overlay and rule list:

| Rule State | Visual Treatment           | Indicator               |
| :--------- | :------------------------- | :---------------------- |
| Active     | Normal                     | (none)                  |
| Inactive   | Strikethrough, 50% opacity | `@container (inactive)` |

Example rendering:

```
✓ .card { color: ... }                    [0,1,0]
✗ @container (min-width: 600px)          (inactive)
    .card { color: ... }                  [0,1,0]
```

### Cascade Implications

Rules with `active: false` are **excluded from winning rule determination**. They are still shown in the rule list for diagnostic purposes, but they cannot be the "culprit" in a violation.

---

## Automation Integration

The inspector publishes artifacts to `globalThis` for CI scripts.

### Published Globals

| Global                                | Type               | Purpose                        |
| ------------------------------------- | ------------------ | ------------------------------ |
| `__AXIOMATIC_INSPECTOR_RESULTS__`     | `Violation[]`      | Mismatch scan results          |
| `__AXIOMATIC_INSPECTOR_CONTINUITY__`  | `ContinuityResult` | Continuity check results       |
| `__AXIOMATIC_INSPECTOR_RECIPES__`     | `Recipe[]`         | Batch recipes (all violations) |
| `__AXIOMATIC_INSPECTOR_LAST_RECIPE__` | `Recipe`           | Last copied recipe             |

### Enforcement Example

`scripts/check-violations.ts` uses Playwright to:

1. Navigate to the site
2. Trigger a violation scan
3. Read `__AXIOMATIC_INSPECTOR_RESULTS__`
4. Fail the build if violations exist

---

## Inspector Theming (Future)

**Problem**: The overlay uses hardcoded colors that don't adapt to theme or high-contrast modes.

**Proposal** (design/005): Define semantic tokens for the inspector overlay:

```json
{
  "inspector": {
    "highlight": "color.semantic.inspector.highlight",
    "violation": "color.semantic.inspector.violation",
    "success": "color.semantic.inspector.success"
  }
}
```

**Trade-off**: Using axiomatic tokens increases visual consistency but adds coupling. Alternative: Keep the overlay in a separate "debug-only" visual language.

---

## Design Constraints

### The Inspector MUST NOT

1. **Write engine variables**: Never recommend `--axm-*` writes in consumer code
2. **Infer surface boundaries**: Do not auto-add `surface-*` classes
3. **Become a config editor**: The inspector diagnoses runtime; it is not Theme Builder

### The Inspector SHOULD

1. **Respect RFC-CONSUMER-CONTRACT**: Only class tokens in remediation advice
2. **Be deterministic**: Given stable DOM, produce identical reports
3. **Be abortable**: Long-running checks can be canceled cleanly
4. **Publish to globals**: Automation relies on these contracts

---

## Keyboard Shortcuts

| Shortcut                       | Action                          |
| ------------------------------ | ------------------------------- |
| `Ctrl+Shift+X` / `Cmd+Shift+X` | Toggle inspector                |
| `Alt+Click` (violation mode)   | Dump scan to console            |
| `Shift+Click` (violation mode) | Generate all recipes, copy JSON |

---

## Feature Maturity (2026-01-05)

### Alpha-Ready ✅

Features that are stable, tested, and production-ready:

| Feature                      | Description                                                            | Test Coverage                 |
| :--------------------------- | :--------------------------------------------------------------------- | :---------------------------- |
| **Violation Detection**      | Core axiom mismatch detection (surface vs. background, text overrides) | `inspector-diagnosis.spec.ts` |
| **Token Inspection**         | Element-level token resolution and provenance tracking                 | `inspector/` tests            |
| **Remediation Recipes**      | Structured fix suggestions (text and JSON formats)                     | `inspector-diagnosis.spec.ts` |
| **Continuity Checking**      | Theme transition snap detection via τ-freeze                           | `continuity.spec.ts`          |
| **CSS Cascade Engine**       | Modern cascade (`@layer`, `@scope`, specificity)                       | `css-utils.property.test.ts`  |
| **Winning Rule Attribution** | Identifies exact CSS rule causing violations                           | `inspector-diagnosis.spec.ts` |

### Preview ⚠️

Features that work but have known limitations:

| Feature                         | Status  | Known Issues                                                    |
| :------------------------------ | :------ | :-------------------------------------------------------------- |
| **Conditional Rule Evaluation** | Full    | See [Conditional Rule Evaluation](#conditional-rule-evaluation) |
| **Experiment Mode**             | Working | Changes reset on reload; no undo stack                          |
| **Continuity Performance**      | Working | Slow on 10,000+ element DOMs                                    |
| **Scan Stabilization**          | Working | Heuristic timeout may miss transition violations                |

### Planned 🔮

Features not yet implemented:

| Feature                    | RFC/Design   | Notes                                                        |
| :------------------------- | :----------- | :----------------------------------------------------------- |
| **Inspector Theming**      | design/005   | Overlay uses hardcoded colors; should use semantic tokens    |
| **`light-dark()` Parsing** | -            | Shows resolved values but can't explain `light-dark()` logic |
| **Continuity v2**          | RFC-AUDITING | Modular checks, golden fixtures not complete                 |

### Known Bugs 🐛

- **Motion Suppression**: Continuity checker applies `!important` inline styles; incomplete cleanup on abort
- **CORS Stylesheets**: Silently fails on cross-origin sheets without `crossorigin="anonymous"`

---

## Implementation Locations

**Inspector core**:

- `src/lib/inspector/overlay.ts` - Controller
- `src/lib/inspector/engine.ts` - Analysis engine
- `src/lib/inspector/view.ts` - Rendering
- `src/lib/inspector/styles.ts` - Shadow DOM CSS
- `src/lib/inspector/continuity.ts` - Continuity checker

**Supporting modules**:

- `src/lib/inspector/cssom.ts` - CSSOM traversal
- `src/lib/inspector/cascade.ts` - CSS cascade sorting
- `src/lib/inspector/specificity.ts` - Specificity calculation

**Integration**:

- `site/src/lib/inspector-integration.ts` - Docs site
- `scripts/check-violations.ts` - CI enforcement

---

## Related RFCs

- **RFC-CONSUMER-CONTRACT**: Defines the contract the inspector enforces
- **RFC-AUDITING**: Audit framework (separate from inspector)
- **RFC-INTEGRATION**: Integration patterns the inspector respects

## Appendix: Evolution Notes

This RFC consolidates:

- **RFC016** (inspector sections): Architecture, violations, continuity
- **RFC017**: Remediation recipes workflow
- **RFC018**: Token inspection enhancements
- **design/005**: Overlay theming proposal
