# RFC-INTEGRATION: Integration Architecture for Foreign Theme Systems

**Status**: Active  
**Date**: 2026-01-06  
**Depends On**: RFC-CONSUMER-CONTRACT

## Summary

This RFC defines how to integrate the Axiomatic Color System with foreign theme systems (Starlight, vendor component libraries, CMS chrome) while preserving the consumer contract.

It introduces four concepts:

1. **Integration Adapters**: Boundary-scoped CSS mapping layers that are the _only_ place foreign theme variables may be referenced
2. **Bridge Exports**: Stable, public CSS variables that adapters consume (not engine internals)
3. **ThemeManager**: The runtime integration surface for theme control
4. **Generated Metadata**: CLI-generated TypeScript files that provide configuration to ThemeManager at import time

The architecture ensures that foreign systems can use Axiomatic colors without consumers violating the "no engine addressing" contract.

## Motivation

We need integrations that:

- Remain **token-driven** (consumer intent via class tokens)
- Remain **auditable** (explicit boundaries, no ambient permissions)
- Remain **deterministic** (configuration via generated code, not runtime discovery)
- Remain **robust** against bundler behavior (ES module imports, not CSS variable reads)

A one-off "Starlight exception" does not scale. This RFC defines a reusable pattern that keeps RFC-CONSUMER-CONTRACT intact.

---

## Part 1: Integration Adapters

### Terminology

**Foreign paint system**: Any system that can affect paint in ways Axiomatic does not own (e.g., Starlight's `--sl-*`, a widget library's `--vendor-*`).

**Integration adapter**: A dedicated layer whose job is to map foreign theme interfaces to Axiomatic's integration interface.

Properties:

- **Boundary-scoped**: Lives in explicit, named files
- **Declarative**: Deterministic mapping table (no semantic heuristics)
- **One-way**: Adapters make foreign systems consume Axiomatic outputs

**Non-goal**: Adapters are not a general "override CSS" area. High-specificity selectors and `!important` indicate an unstable integration that should be redesigned.

### Axioms (Hard Constraints)

#### Axiom 1 — Consumers do not address the engine

Outside adapter boundaries, authored code MUST NOT reference `--axm-*` or `--_axm-*` as styling outputs, and MUST NOT reference foreign theme variables.

#### Axiom 2 — Adapters are explicit and few

Adapters MUST be enumerated by explicit file allowlists. If a new adapter is added, it must be named and added to the allowlist.

##### Axiom 2.1 — Single bridge file per adapter

Each adapter MUST designate exactly one CSS file as its **bridge file**.

- Foreign theme variables (e.g., `--sl-*`) MUST appear **only** in that file
- This includes variable names in strings and selectors targeting foreign markup
- JS/TS/Astro may do mechanical DOM wiring but MUST NOT reference foreign variables

**Additional tightening**: JS/TS/Astro used for integration wiring MUST NOT reference Axiomatic engine/bridge variables either. The only sanctioned runtime interface is the documented JS API surface (not CSS variables).

#### Axiom 3 — Adapters consume bridge exports only

Adapters MUST NOT use private plumbing (`--_axm-*`). Adapters MUST consume bridge exports or safe primitives like `inherit` / `currentColor`.

**Stronger form (target end-state)**: If a bridge export is missing for a required semantic role, add a bridge export; do not "reach into" the engine.

#### Axiom 4 — Locks are allowed, but dumb

If vendor systems can reassert palette variables late, an adapter MAY apply **locks** to guarantee continuity.

Locks MUST:

- Apply a predetermined mapping list
- Be idempotent
- Avoid semantic discovery
- Live in the adapter's bridge file (CSS)
- Be explicitly activated via a semantic marker (e.g., `data-axm-adapter-lock="starlight"`)

Do not lock foreign vars via JS.

### Bridge Exports

Bridge exports are Axiomatic-owned, stable CSS variables that represent "paint outputs suitable for adapters."

They exist so adapters never need to reference private engine plumbing and we don't weaken RFC-CONSUMER-CONTRACT for consumers.

**Surface export** (context-sensitive background):

```css
--axm-bridge-surface   /* Resolves based on active surface-* class */
```

**Foreground exports** (text colors):

```css
--axm-bridge-fg         /* Generic foreground */
--axm-bridge-fg-high    /* High-contrast text */
--axm-bridge-fg-body    /* Body text */
--axm-bridge-fg-subtle  /* Subtle/secondary text */
```

**Border exports**:

```css
--axm-bridge-border-int    /* interactive borders */
--axm-bridge-border-dec    /* decorative borders */
```

**Design note**: The surface export uses **context-sensitive resolution** — a single `--axm-bridge-surface` variable computes different values depending on which `surface-*` class is applied to the element. This is intentional; adapters apply `surface-card` to their container and reference `--axm-bridge-surface` for the background.

**Computation requirement**: Each bridge export MUST be computed directly from corresponding public tokens and ambient context (`--alpha-*`, `--tau`). Do not alias private `--_axm-*` variables directly.

**Usage in adapter**:

```css
/* site/src/styles/starlight-custom.css */
:root {
  --sl-color-bg: var(--axm-bridge-surface-page);
  --sl-color-text: var(--axm-bridge-fg-body);
  --sl-color-hairline: var(--axm-bridge-border-dec);
}
```

### Adapter File Structure

For Starlight (reference implementation):

```
site/src/styles/
├── starlight-custom.css    # The ONE adapter bridge file
│                           # Only file where --sl-* is allowed
└── ...

site/src/lib/
├── starlight-axiomatic.ts  # Runtime wiring (no variable refs)
└── theme-bridge.ts         # ThemeManager integration
```

---

## Part 2: Generated Metadata (ThemeManager Initialization)

### Problem: Inverted Surfaces

Certain surface tokens (e.g., `.surface-action`, `.surface-spotlight`) have **inverted polarity** — they use the opposite color scheme from the page. This matters because native form controls (checkboxes, selects, date pickers) inherit `color-scheme` from their ancestors. Without intervention, a light-themed checkbox on a dark surface looks wrong.

ThemeManager needs to know which selectors represent inverted surfaces so it can set the correct `color-scheme` on those elements.

### Solution: Generated TypeScript File

Since we control both the CSS generator (CLI) and the JS consumer (ThemeManager), we pass configuration via ES modules rather than CSS variables.

The CLI generates a TypeScript file alongside the CSS:

```typescript
// theme.generated.ts
/**
 * Auto-generated by @axiomatic-design/color
 * Source: color-config.json
 * @generated
 */

/** Selectors for surfaces with inverted polarity */
export const invertedSelectors = [
  ".surface-action",
  ".surface-spotlight",
] as const;

/** The theme polarity (-1 for dark default, 1 for light default) */
export const defaultTau = 1;
```

ThemeManager imports this at initialization:

```typescript
import { ThemeManager } from "@axiomatic-design/color";
import { invertedSelectors } from "./theme.generated";

const manager = new ThemeManager({ invertedSelectors });
```

### Why Generated Code?

| Aspect       | CSS Variable at Runtime         | Generated TypeScript      |
| ------------ | ------------------------------- | ------------------------- |
| Timing       | Race with bundler CSS injection | Available at import time  |
| HMR safe     | No (re-read may fail)           | Yes (module re-imports)   |
| Type safety  | None                            | Full (`as const` tuples)  |
| Bundling     | Requires CSS to load first      | Native ES module          |
| Tree-shaking | N/A                             | Unused exports eliminated |

### API

#### CLI Flag

```bash
npx axiomatic-color build --emit-ts
```

Generates `theme.generated.ts` in the same directory as the CSS output.

#### ThemeManagerOptions

```typescript
interface ThemeManagerOptions {
  /** The element to apply the theme to. Defaults to document.documentElement. */
  root?: HTMLElement;

  /** Selectors for surfaces with inverted polarity. Import from generated file. */
  invertedSelectors?: readonly string[];

  /** The class to apply when the theme is 'light'. */
  lightClass?: string;

  /** The class to apply when the theme is 'dark'. */
  darkClass?: string;

  /** A function to generate the favicon SVG based on the current theme color. */
  faviconGenerator?: (color: string) => string;
}
```

### Migration Path

**Existing projects** reading `--axm-inverted-surfaces` from CSS continue to work. The CSS variable remains for backwards compatibility but is no longer the primary mechanism.

**New projects** should use the generated TypeScript file. This is the recommended approach going forward.

---

## Part 3: ThemeManager (Runtime Integration Surface)

### Core Claim

The **only** sanctioned runtime mechanism for theme control is `ThemeManager`.

`ThemeManager` bridges one or more **mode sources** (system preference, app toggle, vendor toggles) into an **engine-owned semantic state** on a root element.

Consumers and integration code MUST NOT write engine plumbing variables and MUST NOT reference CSS variables from JS/TS/Astro.

### Normative Requirements

#### R1 — ThemeManager is the only runtime theme API

All runtime theme control MUST go through `ThemeManager`.

**Forbidden patterns**:

```javascript
// FORBIDDEN - writing engine variables
document.documentElement.style.setProperty("--tau", "0.5");

// FORBIDDEN - computing paint and reacting to it
const computed = getComputedStyle(el).backgroundColor;

// FORBIDDEN - writing foreign palette variables
root.style.setProperty("--sl-color-text", "#000");

// FORBIDDEN - reading/writing engine variables
root.style.setProperty("--axm-surface-token", "card");
```

#### R2 — Theme is represented semantically on a root element

`ThemeManager` MUST set engine-owned semantic state on its `root` element.

**Required attributes**:

```html
<html
  data-axm-mode="light|dark|system"
  data-axm-resolved-mode="light|dark"
></html>
```

The exact attribute names are part of the public runtime contract.

#### R3 — CSS derives plumbing from semantic state

Generated CSS MUST derive internal variables (including `--tau`) from the semantic state.

**Compatibility constraint**: The continuity audit may lock `--tau` via inline `!important`. CSS derivation MUST allow inline important override to win.

**CSS derivation contract**:

- After `ThemeManager` initialization, `data-axm-resolved-mode` MUST be present
- CSS that derives mode-dependent plumbing MUST be driven by `data-axm-resolved-mode` (not `prefers-color-scheme`)
- Before initialization, CSS MAY use `prefers-color-scheme` as fallback, but this MUST be superseded once ThemeManager publishes resolved mode

#### R4 — Mode sources are explicit and composable

`ThemeManager` MUST support explicit mode sources:

**Required sources**:

- **System preference**: `prefers-color-scheme`
- **Manual override**: `setMode("light"|"dark"|"system")`

**Optional sources**:

- **Attribute source**: observe a foreign theme attribute (e.g., `data-theme`)
- **Custom source**: callback/observable that publishes mode changes

#### R5 — Precedence is deterministic

Recommended default precedence:

1. Explicit manual override (`setMode(...)`) wins
2. If mode is `system`, resolved mode comes from system preference

For vendor integration sources (e.g., Starlight), the vendor attribute may be treated as the manual override source, but this must be explicitly configured.

#### R6 — Vendor integration does not require head scripts

Users should not need to author "observe vendor theme, write Axiomatic state" scripts.

The library provides documented helpers:

```javascript
import {
  ThemeManager,
  createAttributeModeSource,
} from "@axiomatic-design/color";

const manager = new ThemeManager();
manager.attachSource(
  createAttributeModeSource({
    root: document.documentElement,
    attribute: "data-theme",
    map: { dark: "dark", light: "light" },
    systemWhenMissing: true,
  }),
);
```

### Theme Switch Transactions

#### Axiom 5 — Theme intent has one writer

If a foreign paint system includes its own theme switcher, integrations MUST ensure there is a single canonical writer of theme intent.

**Requirements**:

- Integrations MUST NOT allow multiple "theme authorities" to write state in overlapping ways
- The theme switcher must either be replaced with Axiomatic-owned control, or wrapped to delegate to `ThemeManager`
- Vendor-observable state (`data-theme`, `color-scheme`) MAY be published for compatibility but MUST be derived output, not competing input

#### Axiom 5.1 — Theme switches are transactions

When theme intent changes, the integration MUST treat it as a single atomic **theme switch transaction**.

**Normative contract**:

1. Set a switching marker before publishing new state
   - Recommended: `data-axm-theme-switching="1"` on `<html>`
2. Publish all theme-affecting state synchronously in a single task
3. If vendor state must be published, include it in the same transaction
4. While marker is present, no additional async theme mutations

##### Axiom 5.1.1 — Suppress competing transitions during transaction

During a theme switch transaction, temporarily suppress competing CSS transitions/animations on paint output properties.

**Recommended CSS**:

```css
[data-axm-theme-switching="1"] * {
  transition: none !important;
}
```

**Rationale**: CSS cannot distinguish why a computed value changed. Existing `transition: color` will attempt to animate during theme switch, producing desynchronization.

##### Axiom 5.1.2 — Single sanctioned motion driver

If the integration wants smooth visual theme transition, designate a single sanctioned motion driver.

**Acceptable patterns**:

1. **Parameter-space motion** (preferred)
   - Animate input parameters (e.g., `--tau`) using `@property` typed custom properties
   - Forbid paint-output transitions in chrome

2. **View Transitions**
   - Wrap commit in `document.startViewTransition()`
   - Feature-detect and provide deterministic fallback
   - Respect `prefers-reduced-motion`

#### R7 — Chrome paint must be single-driver and bridge-routed

##### R7.1 — Single driver for mode transitions

The only sanctioned driver is `--tau` derived from `data-axm-resolved-mode`.

Integration code MUST NOT:

- Introduce independent transitions on bridge exports
- Add transitions on painted properties that compete with the driver
- Use `transition-property: all` with non-zero duration on chrome elements

**When `data-axm-motion="tau"` is active**:

- The engine MUST NOT apply `transition` rules to bridge/engine computed custom properties
- This prevents competing interpolation mechanisms between `--tau` animation and output transitions

##### R7.2 — currentColor constraints

`currentColor` is allowed for SVG iconography:

```css
svg {
  fill: currentColor;
}
```

But chrome borders MUST NOT be coupled to text:

```css
/* FORBIDDEN in adapter CSS */
.sidebar {
  border-color: currentColor;
}

/* ALLOWED - use bridge exports */
.sidebar {
  border-color: var(--axm-bridge-border-dec);
}
```

---

## Part 4: Declarative DOM Wiring

### Purpose

Integrations frequently need to apply class tokens and structural wrappers to vendor-owned markup. DOM wiring provides a declarative, reusable engine for this.

### API

**`DomWiringRule`**: A rule targets elements via selector and applies idempotent actions:

```typescript
interface DomWiringRule {
  selector: string;
  addClasses?: string[];
  ensureClassPrefix?: { prefix: string; fallbackClass: string };
  ensureDirectChildWrapper?: {
    wrapperClass: string;
    moveChildren?: boolean;
  };
  descendants?: DomWiringRule[];
}
```

**`applyDomWiring(root, rules)`**: Applies rules within the given root. Safe to call repeatedly. Purely synchronous.

**`observeDomWiring({ observeRoot, rules })`**: Uses MutationObserver to apply wiring to added subtrees. Returns `{ dispose() }`.

### Invariants

1. **Adapter purity**: Wiring code MUST NOT reference CSS variables or compute colors
2. **Idempotence**: Running wiring multiple times MUST NOT duplicate wrappers
3. **Efficiency**: Mutation handling avoids document-wide rescans; work is batched
4. **Single-writer separation**: Theme commits remain separate from wiring

### Example: Starlight Integration

```typescript
const starlightRules: DomWiringRule[] = [
  {
    selector: ".page.sl-flex",
    addClasses: ["surface-page"],
  },
  {
    selector: "header.header, .page > .header",
    addClasses: ["surface-page"],
    ensureClassPrefix: { prefix: "text-", fallbackClass: "text-body" },
  },
  {
    selector: "#starlight__sidebar",
    addClasses: ["axm-sidebar-host"],
    ensureDirectChildWrapper: {
      wrapperClass: "surface-workspace",
      moveChildren: true,
    },
  },
];

// At DOM ready
applyDomWiring(document, starlightRules);

// For SPA route changes
observeDomWiring({ observeRoot: document.body, rules: starlightRules });
```

---

## Part 5: Starlight Reference Implementation

Starlight is the first concrete adapter instance and serves as the reference implementation.

### Integration Summary

1. `ThemeManager` instantiated with Starlight mode source
2. Mode source observes `data-theme` changes
3. `ThemeManager` updates `data-axm-mode` / `data-axm-resolved-mode`
4. Generated CSS derives `--tau` from `data-axm-resolved-mode`
5. Adapter CSS maps `--sl-*` → bridge exports
6. DOM wiring applies surface classes to Starlight chrome

**Key properties**:

- No JS touches `--tau`
- No JS touches `--sl-*`
- No JS touches `--axm-*` / `--_axm-*`
- Vendor CSS loads whenever; still consumes Axiomatic palette via adapter

### Chrome Continuity Contract

The adapter MUST guarantee continuity for Starlight chrome elements.

**Contract definition** (shared spec):

```typescript
// src/lib/integrations/starlight/chrome-contract-spec.ts
export const STARLIGHT_CHROME_CONTRACT = {
  selectors: [
    ".sl-sidebar",
    ".page > header",
    ".content-panel",
    // ...
  ],
  forbiddenPatterns: {
    css: [/border.*currentColor/, /transition.*--axm-bridge/],
  },
};
```

### Testing Requirements

**Integration tests SHOULD**:

- Toggle foreign theme system (mutate `data-theme`)
- Assert Axiomatic semantic state updates
- Assert computed paint coherence

**Tests MUST NOT** assert CSS variable strings. Prefer computed-value equivalence.

**Sentinel tests (required for chrome continuity)**:

1. **Static contract check**: Fail CI if adapter bridge file contains disallowed patterns (e.g., `border: ... currentColor`, `transition` on `--axm-bridge-*`)

2. **CSSOM contract sentinel**: Fail CI if effective stylesheet rules violate chrome continuity contract. MUST scan:
   - `document.styleSheets`
   - `document.adoptedStyleSheets` (constructed stylesheets)
   - For every _open_ `shadowRoot`: `shadowRoot.styleSheets` + `shadowRoot.adoptedStyleSheets`
   - For closed shadow roots, use computed-style witnesses on the shadow host

3. **Runtime witness ratchet**: Sample canonical chrome borders during mode flips and assert:
   - Computed `border-*-color` matches expected bridge export at every sample frame
   - Never temporarily equals element's computed `color` (detects `currentColor` regressions)

**Sentinel tests (recommended)**:

1. **Static contract check**: Fail CI if adapter bridge file contains disallowed patterns
2. **CSSOM contract sentinel**: Fail CI if effective stylesheet rules violate chrome continuity contract

---

## ThemeManager Architecture

### Layered Design

The theme system uses a layered architecture with clear ownership boundaries:

#### Layer 1: AxiomaticTheme (Internal Core)

**Scope**: Low-level reactive observer and writer for CSS custom properties.

**Responsibilities**:

- Singleton observer for `--alpha-hue`, `--alpha-beta`, `--tau`
- Reactive subscriptions for dev tools (inspector, tuner)
- Framework synchronization (`.dark` class, `data-theme` attribute)
- **Exclusive writer** for: `--tau`, `--alpha-hue`, `--alpha-beta`, `color-scheme` (root only)

**Visibility**: Exported but marked `@internal`. Consumers should use `ThemeManager`.

#### Layer 2: ThemeManager (Public Integration API)

**Scope**: High-level theme mode management for consumer applications.

**Responsibilities**:

- Mode management: `light`, `dark`, `system`
- System preference observation (`prefers-color-scheme`)
- Inverted surfaces management (via `invertedSelectors` option)
- Semantic state publication: `data-axm-mode`, `data-axm-resolved-mode`, `data-axm-ready`
- **Delegates** all CSS variable writes to `AxiomaticTheme`

**API** (public):

```typescript
class ThemeManager {
  constructor(options?: ThemeManagerOptions);
  get mode(): ThemeMode;
  get resolvedMode(): "light" | "dark";
  setMode(mode: ThemeMode): void;
  dispose(): void;
}
```

### Single Writer Principle

Each DOM attribute or CSS variable has exactly one authoritative writer:

| Target                    | Writer         | Notes               |
| ------------------------- | -------------- | ------------------- |
| `--tau`                   | AxiomaticTheme | Via `set()`         |
| `--alpha-hue`             | AxiomaticTheme | Via `set()`         |
| `--alpha-beta`            | AxiomaticTheme | Via `set()`         |
| `color-scheme` (root)     | AxiomaticTheme | Synced with `--tau` |
| `color-scheme` (inverted) | ThemeManager   | Opposite of root    |
| `data-theme`              | AxiomaticTheme | Framework compat    |
| `.dark` class             | AxiomaticTheme | Tailwind compat     |
| `data-axm-mode`           | ThemeManager   | User preference     |
| `data-axm-resolved-mode`  | ThemeManager   | Computed mode       |
| `data-axm-ready`          | ThemeManager   | Init signal         |

---

## Implementation Checklist

### Generated Metadata

| Requirement                  | Status | Notes                                   |
| :--------------------------- | :----- | :-------------------------------------- |
| CLI `--emit-ts` flag         | ❌     | Generates `theme.generated.ts`          |
| `invertedSelectors` export   | ❌     | Array of inverted surface selectors     |
| `defaultTau` export          | ❌     | Default theme polarity                  |
| ThemeManager accepts option  | ✅     | `invertedSelectors` in constructor opts |
| Legacy CSS variable fallback | ✅     | `--axm-inverted-surfaces` still works   |

### Bridge Exports

| Export                    | Status         | Notes                                             |
| :------------------------ | :------------- | :------------------------------------------------ |
| `--axm-bridge-surface`    | ✅ Implemented | Context-sensitive; resolves per `surface-*` class |
| `--axm-bridge-fg`         | ✅ Implemented | Generic foreground                                |
| `--axm-bridge-fg-high`    | ✅ Implemented | High-contrast text                                |
| `--axm-bridge-fg-body`    | ✅ Implemented | Body text                                         |
| `--axm-bridge-fg-subtle`  | ✅ Implemented | Subtle/secondary text                             |
| `--axm-bridge-border-int` | ✅ Implemented | Interactive borders                               |
| `--axm-bridge-border-dec` | ✅ Implemented | Decorative borders                                |

### Starlight Adapter

| Requirement                     | Status | Notes                                                    |
| :------------------------------ | :----- | :------------------------------------------------------- |
| Bridge file exists              | ✅     | `site/src/styles/starlight-custom.css`                   |
| Consumes only bridge exports    | ✅     | No `--_axm-*` usage                                      |
| Runtime wiring exists           | ✅     | `site/src/lib/theme-bridge.ts`                           |
| CSSOM sentinel validates chrome | ✅     | `src/lib/integrations/starlight/chrome-contract-spec.ts` |

### Contract Enforcement

| Check                        | Status     | Notes                                          |
| :--------------------------- | :--------- | :--------------------------------------------- |
| Static adapter pattern check | ⚠️ Partial | `check-rfc010.ts` covers some patterns         |
| CSSOM contract sentinel      | ✅         | Validates `--axm-bridge-border-*` usage        |
| Runtime witness ratchet      | ⚠️ Partial | Border sampling implemented; full coverage TBD |

### ThemeManager

| Requirement                         | Status | Notes                                             |
| :---------------------------------- | :----- | :------------------------------------------------ |
| ThemeManager is public API          | ✅     | Exported from `src/lib/index.ts`                  |
| AxiomaticTheme marked internal      | ✅     | `AxiomaticTheme` marked `@internal` in `theme.ts` |
| ThemeManager delegates to AT        | ❌     | Pending: refactor `setMode()` to use AT           |
| `invertedSelectors` constructor opt | ✅     | Accepted via `ThemeManagerOptions` / generated TS |
| Single writer documented            | ✅     | Documented in RFC-021                             |

---

## Implementation Locations

**CLI / Generated Metadata**:

- `src/cli/build.ts` - CLI build command with `--emit-ts` flag
- Output: `theme.generated.ts` - Generated TypeScript metadata

**ThemeManager**:

- `src/lib/browser.ts` - ThemeManager class (public API)
- `src/lib/theme.ts` - AxiomaticTheme (internal observer)

**DOM Wiring**:

- `src/lib/integrations/dom-wiring.ts`

**Starlight Adapter**:

- `site/src/styles/starlight-custom.css` - bridge file
- `site/src/lib/starlight-axiomatic.ts` - runtime wiring
- `site/src/lib/theme-bridge.ts` - ThemeManager integration

**Bridge Exports**:

- Generated in `css/engine.css` or `css/theme.css`

**Contract Enforcement**:

- `src/lib/inspector/starlight-chrome-contract.ts`
- `scripts/check-starlight-chrome-cssom-sentinel.ts`

---

## Documentation Updates Required

The following documentation needs updating to reflect the generated metadata architecture:

### Consumer Contract (RFC-020)

- Add section on generated TypeScript as primary configuration mechanism
- Update initialization examples to show import pattern

### CLI Documentation

- Document `--emit-ts` flag
- Show example `theme.generated.ts` output
- Explain relationship between `color-config.json` and generated file

### Getting Started Guide

- Update ThemeManager initialization to use generated imports:

```typescript
// NEW recommended pattern
import { ThemeManager } from "@axiomatic-design/color";
import { invertedSelectors } from "./theme.generated";

const manager = new ThemeManager({ invertedSelectors });
```

### Integration Guides

- Update Starlight integration to use generated metadata
- Add migration notes for existing CSS-variable-based setups

---

## Related RFCs

- **RFC-CONSUMER-CONTRACT**: The foundational contract this RFC builds upon
- **RFC-AUDITING**: Continuity and provenance audits that validate integration correctness
- **RFC-INSPECTOR**: Debugging tools that help diagnose integration issues
- **RFC-TOOLING**: Docs utilities follow similar boundary principles for site-local styling
- **RFC-CONFIGURATION**: Configuration schema consumed by adapters and ThemeManager

## Appendix: Design Rationale

### Why Generated TypeScript Over CSS Variables?

The decision to use generated TypeScript for ThemeManager configuration rather than CSS custom properties reflects a key insight: **we control both sides of the interface**.

The CLI reads `color-config.json` and generates CSS. The CLI can just as easily generate a TypeScript file. By doing so:

1. **Configuration is available at import time** — no waiting for stylesheets to load
2. **TypeScript provides type safety** — `as const` tuples catch typos at compile time
3. **Bundlers understand ES modules** — tree-shaking, HMR, and code splitting work naturally
4. **No runtime parsing** — the data is already in the right shape

CSS variables remain the right tool for **runtime-varying values** (like `--tau` for dark/light mode). But static configuration like "which selectors are inverted surfaces" is better expressed as static code.

### Backwards Compatibility

The legacy `--axm-inverted-surfaces` CSS variable continues to work. If `invertedSelectors` is not passed to ThemeManager, it falls back to reading the CSS variable. This ensures existing integrations continue working during migration.
