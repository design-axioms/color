# RFC-CONSUMER-CONTRACT: The Axiomatic Consumer Contract

**Status**: Consolidated from RFC010  
**Date**: 2026-01-05  
**Authority**: Foundational - all other RFCs depend on this contract

## Summary

This RFC defines the fundamental contract between the Axiomatic Color System and its consumers. It is the law of the system that enables the algebra to remain enforceable.

**Core Axiom**: Consumer code must not address the color engine directly. Instead, consumers express intent only through the library's public semantic interface.

## Motivation

The Axiomatic Color System's algebraic guarantees (continuity, coherence, predictable paint provenance) only work if consumers follow the contract. Without enforcement, the system becomes un-auditable and non-deterministic.

This contract exists to:

- Make the algebra mechanically enforceable
- Prevent "addressing the engine" from being representable in consumer code
- Define a clear boundary between public API and private implementation

## The Contract

### Axiom: Consumer Code Must Not Address the Engine

Consumer code must express _intent_ only through the library's public semantic interface. The unit of styling is the policy token (class), not an ad-hoc property assignment.

**What "addressing the engine" means** (forbidden):

Any authored styling that uses the variable plumbing as a styling API:

```css
/* FORBIDDEN - using semantic tokens as direct outputs */
.my-component {
  background: var(--axm-surface-token);
}

/* FORBIDDEN - using private plumbing as direct outputs */
.my-component {
  color: var(--_axm-computed-fg-color);
}

/* FORBIDDEN - hardcoded colors as styling outputs */
.my-component {
  background-color: #0070f3;
  color: oklch(0.6 0.15 270);
}
```

```javascript
// FORBIDDEN - direct variable writes
element.style.setProperty("--axm-surface-token", "surface-card");
element.style.setProperty("--tau", "0.5");

// FORBIDDEN - computed color values as styling
element.style.backgroundColor = "rgb(0, 112, 243)";
```

**Rationale**: Once consumers read/write engine variables directly, the system becomes un-auditable. The solver cannot reason about paint provenance, and the algebra's guarantees are void.

### Public API Surface

Consumer code may use:

#### 1. Library-Provided Class Tokens

Class tokens are the primary interface. Each token expresses semantic intent that the solver resolves.

**Reserved prefixes** (per-config allowlisted):

- `surface-*` - surface intent (cards, overlays, containers)
- `text-*` - text/foreground intent
- `hue-*` - accent/brand intent
- `bg-*` - background utilities
- `border-*` - border utilities
- `shadow-*` - shadow utilities (if color-affecting)
- `preset-*` - preset combinations

```html
<!-- ALLOWED - class tokens express intent -->
<div class="surface-card">
  <h2 class="text-heading hue-brand">Title</h2>
  <p class="text-body">Content</p>
</div>
```

```javascript
// ALLOWED - runtime class token operations
element.classList.add("surface-card");
element.classList.toggle("hue-brand");
```

#### 2. Documented JavaScript APIs

Runtime integration must use documented APIs, never direct variable manipulation.

**ThemeManager** (runtime theme control — the primary integration API):

```javascript
import { ThemeManager } from "@axiomatic-design/color";

const manager = new ThemeManager();
manager.setMode("dark"); // or "light" or "system"

// React to system preference changes
// ThemeManager handles this automatically when mode is "system"
```

**Important**: `ThemeManager` is the **only** public API for theme switching. It manages:

- Mode selection (`light`/`dark`/`system`)
- System preference observation
- Inverted surfaces (elements that should have opposite color-scheme)
- Semantic state attributes (`data-axm-mode`, `data-axm-resolved-mode`)

**AxiomaticTheme** (internal — do not use directly):

`AxiomaticTheme` is an internal singleton used by the inspector and dev tools. It is exported for advanced tooling but marked `@internal`. Consumer applications should use `ThemeManager` instead.

```javascript
// ❌ FORBIDDEN in consumer code
import { AxiomaticTheme } from "@axiomatic-design/color";
AxiomaticTheme.get().toggle(); // Use ThemeManager.setMode() instead

// ✅ ALLOWED - ThemeManager is the public API
import { ThemeManager } from "@axiomatic-design/color";
const manager = new ThemeManager();
manager.setMode("dark");
```

**DOM Wiring** (applying tokens to vendor markup):

```javascript
import { wireThemeToElement } from "@axiomatic-design/color";

wireThemeToElement(element, { surface: "card" });
```

#### 3. Documented CLI Commands

Configuration and artifact generation:

```bash
# Generate theme CSS from config
axiomatic build

# Generate class-token manifests
node scripts/generate-class-tokens.ts
```

### Design Escalation: Variables Not Required

If implementing a feature appears to require reading/setting engine variables (`--axm-*`, `--_axm-*`) directly, implementation must **STOP** and escalate.

This indicates either:

- The feature is not aligned with the current algebra, or
- The algebra needs extension to express it via class tokens

There are no "escape hatches" for consumer variable access. The contract is absolute.

### Exception: Integration Adapters

Some markup is not controlled by consumers (e.g., Starlight internals, vendor component libraries). In narrow, explicit adapter boundaries, integration with foreign theme systems is permitted.

**Rules**:

- Foreign theme variables (e.g., `--sl-*`) are permitted **only** inside the explicit adapter boundary file
- Adapters consume **bridge exports** (`--axm-bridge-*`), not engine-private variables
- Runtime may do DOM wiring (applying tokens to vendor markup) via documented APIs
- Runtime must not reference foreign or engine variables
- Adapters MUST NOT implement theme integration by observing vendor theme attributes (e.g., `data-theme`) with `MutationObserver` and calling `ThemeManager` in response; theme intent must be single-writer (see RFC-INTEGRATION)

See RFC-INTEGRATION for the full integration adapter specification.

## Inspector Integration: Safe Fix Operations

The color inspector uses this contract to determine safe automatic fixes. Fixes must only use operations permitted by the consumer contract.

### Permitted Fix Operations

The inspector's "Apply fix" button may:

1. Add **validated library token classes** (must be in per-config allowlist)
2. Remove conflicting utility classes (e.g., `bg-*`)
3. Remove conflicting inline styles (e.g., inline `background-color`)

### Forbidden Fix Operations

The inspector must never:

- Set style properties to computed color values: `element.style.backgroundColor = 'oklch(...)'`
- Set style properties to engine variables: `background-color: var(--_axm-computed-surface)`
- Attempt to override stylesheet rules via runtime injection

### Rule-Driven Mismatches

When violations originate from authored stylesheet rules (not inline styles or utilities), the inspector must provide **copyable instructions** rather than automatic fixes:

```
❌ Cannot auto-fix: Remove `background-color` from selector `.my-component` in file.css, then add class `surface-card`
```

**Rationale**: Without modifying the authored stylesheet, there is no algebra-preserving way to guarantee the rule is neutralized.

### Data Model Requirements

Violations must separate:

- **Diagnostic values**: Expected/actual computed colors (for diagnosis only)
- **Recommended token class**: The class name expressing intent via the contract

The inspector must never attempt to apply computed values as class tokens.

**Historical note**: A failure occurred when expected surface value `oklch(1 0 0)` was treated as a class token, causing `InvalidCharacterError: Failed to execute 'add' on 'DOMTokenList'`. This architectural separation prevents that failure mode.

## Enforcement Mechanism

### Per-Config Strict Allowlisting

Enforcement is **per-config strict**. Each consumer surface is validated against the token set emitted by the solver for that surface's configuration.

**Solver-emitted manifests** (canonical authority):

- `policy/class-tokens.default.json` - DEFAULT_CONFIG tokens
- `policy/class-tokens.site.json` - docs site tokens
- `policy/class-tokens.vercel-demo.json` - demo tokens
- `policy/class-tokens.json` - union (back-compat; not primary enforcement)

**Structure**:

```json
{
  "schemaVersion": 1,
  "sources": ["css/engine.css", "color-config.json"],
  "reservedPrefixes": ["surface", "text", "hue", "bg", "border", "shadow", "fg", "preset"],
  "classTokens": ["surface-card", "surface-overlay", "text-body", "hue-brand", ...]
}
```

**Key principle**: A class token that _looks_ like an Axiomatic token (reserved prefix) but is not in the allowlist is an error. This prevents:

- The `oklch(...)` treated as a class token failure mode
- Drift where consumers invent pseudo-tokens
- Misalignment with the user model

### Static Checks (CI Enforcement)

**`scripts/check-rfc010.ts`** - primary compliance gate:

Scans consumer layers (site/src, examples) for violations:

1. **No engine variable usage**:
   - Rejects `var(--axm-*)` and `var(--_axm-*)`
   - Exception: `--axm-bridge-*` in allowlisted adapter files

2. **No hardcoded colors**:
   - Rejects `#[0-9a-f]{3,8}`
   - Rejects `rgb()`, `rgba()`, `hsl()`, `hsla()`, `oklch()`, `oklab()`, `color()`

3. **No foreign theme variables outside adapters**:
   - Rejects `--sl-*` outside `site/src/styles/starlight-custom.css`

4. **Class token allowlist validation**:
   - Validates static markup (`.astro`, `.svelte`, `.html`) against per-config manifests
   - Any reserved-prefix token not in the allowlist fails the build

**Run**: `pnpm check:rfc010` (fails CI on violations)

### ESLint Rules

**@axiomatic-design/eslint-plugin** provides lint-time feedback:

- `no-hardcoded-colors` - detects color literals in JS/TS
- `no-raw-tokens` - detects direct variable usage and suggests class alternatives

**Configuration**:

```json
{
  "plugins": ["@axiomatic-design/eslint-plugin"],
  "rules": {
    "@axiomatic-design/eslint-plugin/no-hardcoded-colors": "error",
    "@axiomatic-design/eslint-plugin/no-raw-tokens": "error"
  }
}
```

### Tooling Alignment

**VS Code Extension** consumes solver-emitted manifests, not hand-curated lists:

- Completion lists generated from `policy/class-tokens.json`
- Extension is not authoritative - the solver is
- Future: workspace-local completions from user's `color-config.json`

**Script**: `scripts/generate-class-tokens.ts` updates both policy manifests and extension completions.

## Violation Examples

### ❌ Forbidden: Direct Variable Usage

```css
/* Consumer CSS - FORBIDDEN */
.my-card {
  background: var(--axm-surface-card);
  color: var(--_axm-computed-fg);
}
```

**Why**: Consumers are reading plumbing variables as if they were styling API. The solver cannot audit this.

**Fix**: Use class tokens:

```html
<div class="my-card surface-card">...</div>
```

### ❌ Forbidden: Hardcoded Colors

```javascript
// Consumer JS - FORBIDDEN
element.style.backgroundColor = "#0070f3";
element.style.color = "oklch(0.6 0.15 270)";
```

**Why**: Hardcoded colors bypass the algebra. Paint provenance is lost.

**Fix**: Use class tokens and ThemeManager:

```javascript
element.classList.add("hue-brand");
```

### ❌ Forbidden: Unknown Class Token

```html
<!-- FORBIDDEN (if not in allowlist) -->
<div class="surface-custom-panel">...</div>
```

**Why**: `surface-custom-panel` has a reserved prefix (`surface-`) but is not in the solver-emitted allowlist. This indicates either:

- Typo (intended `surface-card`)
- Drift (consumer invented a pseudo-token)

**Fix**: Use an allowlisted token or extend the config to generate the desired token.

### ❌ Forbidden: Runtime Variable Write

```javascript
// Consumer JS - FORBIDDEN
document.documentElement.style.setProperty("--tau", "0.5");
```

**Why**: `--tau` is engine state. Consumers must use ThemeManager.

**Fix**:

```javascript
import { ThemeManager } from "@axiomatic-design/color";
const manager = new ThemeManager();
manager.setMode("dark"); // tau is derived from mode internally
```

**Note**: `--tau` is not directly settable via ThemeManager. Mode selection (`light`/`dark`/`system`) determines tau. For advanced use cases requiring continuous tau animation (e.g., dev tools), see the `@internal` AxiomaticTheme API.

### ✅ Allowed: Class Tokens + Documented APIs

```html
<!-- Consumer markup - ALLOWED -->
<div class="surface-card bordered shadow-md">
  <h2 class="text-heading hue-brand">Title</h2>
  <p class="text-body">Content</p>
</div>
```

```javascript
// Consumer JS - ALLOWED
import { ThemeManager } from "@axiomatic-design/color";

const manager = new ThemeManager();
manager.setMode("dark");

element.classList.add("surface-overlay");
element.classList.toggle("hue-success", isValid);
```

## Glossary

- **Authored code**: Application or demo code written by humans (JS/TS/TSX, CSS, Svelte, Astro, HTML). Excludes code generated by the Axiomatic toolchain.
- **Library-provided class token**: A class name whose semantics are defined by the library and whose effect is expressed through the algebra. Must appear in the solver-emitted allowlist for the consumer's config.
- **Addressing the engine**: Any direct read/write of engine variables (`--axm-*`, `--_axm-*`) or use of computed color values as styling outputs. Forbidden in consumer layers.
- **Consumer layer**: Any usage site (docs, demo, app) that consumes the library. Distinct from the engine layer (generated CSS internals).
- **Plumbing layer**: Generated CSS internals, including variables like `--axm-*` and `--_axm-*`. Private and unstable.
- **Reserved prefix**: A class name prefix (`surface-`, `text-`, `hue-`, etc.) that Axiomatic reserves for token namespacing. Any class with a reserved prefix must be in the allowlist.

## Testing Strategy

### Compliance Gate (CI)

- `scripts/check-rfc010.ts` runs in CI
- Fails on: engine variable usage, hardcoded colors, unknown class tokens
- Scopes: docs site, examples/vercel-demo

### ESLint (Development)

- Lint-time feedback on color literals and variable usage
- Suggestions for class token alternatives

### Policy Generation (Pre-commit)

- `scripts/generate-class-tokens.ts` runs to keep manifests in sync with solver
- Committed policy files enable deterministic enforcement

## Alpha Readiness Criteria

For the system to be **alpha-ready**, the following must be true:

### Core Contract (Required for Alpha)

| Criterion                            | Status | Notes                        |
| :----------------------------------- | :----- | :--------------------------- |
| Class tokens work in light/dark mode | ✅     | Verified via demos           |
| ThemeManager allows mode switching   | ✅     | `src/lib/browser.ts`         |
| Static checks (`check-rfc010`) pass  | ✅     | CI enforced                  |
| No engine variable usage in demos    | ✅     | Verified by static checks    |
| Public API is stable and documented  | ⚠️     | API stable; docs need polish |

### Integration (Required for Docs)

| Criterion                                     | Status | Notes                 |
| :-------------------------------------------- | :----- | :-------------------- |
| Starlight adapter works without engine access | ✅     | Bridge exports only   |
| DOM wiring applies tokens to vendor markup    | ✅     | `dom-wiring.ts`       |
| Theme transitions respect continuity          | ✅     | Tau-freeze tests pass |

### Inspection (Alpha-Ready Features)

| Criterion                       | Status | Notes                       |
| :------------------------------ | :----- | :-------------------------- |
| Violation detection works       | ✅     | Surface mismatches detected |
| Remediation recipes are correct | ✅     | Class-token fixes work      |
| Continuity checks detect snaps  | ✅     | Tau-freeze audit functional |

### Known Limitations (Documented for Alpha)

| Limitation                                   | Documented? | Notes                                             |
| :------------------------------------------- | :---------- | :------------------------------------------------ |
| Charts don't respect nested inversion        | ⚠️ TBD      | Dark cards on light pages                         |
| Container queries in inspector are "preview" | ⚠️ TBD      | May report false positives                        |
| No DTCG export                               | ⚠️ TBD      | Coming in Epoch 47                                |
| ThemeManager/AxiomaticTheme architecture     | ✅          | Documented in RFC-021; fix in progress (Epoch 44) |

### Definition of Alpha-Ready

The system is alpha-ready when:

1. All "Required for Alpha" items are ✅
2. All "Required for Docs" items are ✅
3. "Known Limitations" are documented in user-facing docs
4. A "Fresh Eyes Test" user can successfully integrate without hitting undocumented issues

---

## Acceptance Criteria

This contract is enforceable when:

1. **Static checks** fail CI on any violation (engine variables, hardcoded colors, unknown tokens)
2. **Per-config manifests** exist and are validated for each consumer surface
3. **Tooling** (ESLint, VS Code) consumes solver-emitted manifests, not hand-curated lists
4. **Demo** passes all checks (proving the contract is followable)
5. **Runtime APIs** (ThemeManager, DOM wiring) are documented and provide alternatives to direct variable manipulation

## Related RFCs

- **RFC010**: The source RFC defining class-token integrity and enforcement (this is a consolidation)
- **RFC-AUDITING**: Provenance audit - validates paint is traceable to allowed inputs
- **RFC-INTEGRATION**: Integration adapters - defines the narrow exception for foreign theme system boundaries
- **RFC-INSPECTOR**: Runtime debugging tool that enforces the consumer contract via violation detection
- **RFC-TOOLING**: ESLint rules and docs utilities that respect contract boundaries
- **RFC-CONFIGURATION**: Configuration schema that defines the solver inputs

## Non-Goals

- Preventing _all_ unknown classes (only reserved-prefix classes are validated)
- Providing a programmatic variable read API (consumers must use class tokens)
- Supporting "escape hatches" for consumer variable writes (if needed, extend the algebra)

## Appendix: Implementation Locations

**Enforcement**:

- `scripts/check-rfc010.ts` - primary compliance gate
- `packages/eslint-plugin/src/rules/` - lint rules

**Policy manifests** (solver-emitted):

- `policy/class-tokens.site.json`
- `policy/class-tokens.vercel-demo.json`
- `policy/class-tokens.default.json`

**Policy generation**:

- `scripts/generate-class-tokens.ts`

**Public API**:

- `src/lib/index.ts` - main export barrel
- `src/lib/browser.ts` - ThemeManager
- `src/lib/integrations/dom-wiring.ts`

**Tooling**:

- `packages/vscode-extension/` - editor completions
