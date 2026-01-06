# RFC-TOOLING: Developer Tools and Enforcement Infrastructure

**Status**: Draft (consolidated)  
**Date**: 2026-01-05  
**Source**: RFC019 (docs-utilities-and-enforcement.md), design/006-eslint-strategy.md

---

## Summary

This RFC consolidates the specifications for developer tooling that maintains system integrity:

1. **Docs Utilities**: A site-local utility layer for documentation that respects the consumer contract
2. **ESLint Strategy**: A systematic approach to linter configuration and suppression
3. **Enforcement Infrastructure**: Automated checks ensuring boundary compliance

---

## Part 1: Docs Utilities (Site-Local)

### Motivation

We want to:

1. Reduce inline-style noise in docs components (padding/radius/typography/transition declarations)
2. Keep docs styling deterministic and readable without importing Tailwind
3. Avoid introducing a "fake Tailwind" surface that encourages accidental usage of undefined classes
4. Maintain the hard boundary from RFC-CONSUMER-CONTRACT: consumer code must not address engine internals

### Design

#### 1.1. Dedicated Docs Utility Stylesheet

A single source of truth for docs utilities:

- Location: `site/src/styles/docs-utilities.css`
- Imported by the docs site's main styles entry

#### 1.2. Naming Conventions (Anti-Tailwind Drift)

Utilities MUST be namespaced with `docs-` prefix. Avoid "Tailwind-shaped" names.

**Recommended naming:**

| Category   | Pattern                                 | Examples                           |
| :--------- | :-------------------------------------- | :--------------------------------- |
| Spacing    | `docs-pad-{size}`, `docs-m{dir}-{size}` | `docs-pad-lg`, `docs-mb-sm`        |
| Radius     | `docs-radius-{size}`                    | `docs-radius-md`, `docs-radius-lg` |
| Typography | `docs-type-{size}`, `docs-weight-{w}`   | `docs-type-sm`, `docs-weight-bold` |
| Motion     | `docs-transition-{speed}`               | `docs-transition-fast`             |

**Rationale**: Numerals like `6` strongly imply Tailwind semantics and invite incorrect guesses.

#### 1.3. CSS Boundary Rule (No Axiomatic Plumbing)

**Docs utility CSS MUST NOT reference:**

- Any `--axm-*` variables
- Any `--_axm-*` variables

**Docs utilities MAY use:**

- Numeric values (`rem`, `px`, etc.)
- CSS system fonts and standard properties
- Public class tokens and utilities from the Axiomatic engine (applied in markup)

### Enforcement

**"Unknown Utility" and "Forbidden Var" Checks:**

In `site/src/**/*.{astro,svelte,md,mdx,ts,tsx,js,jsx}`:

- If a class starts with `docs-`, it must be present in `site/src/styles/docs-utilities.css`
- If a class does not start with `docs-`, it must be either:
  - An Axiomatic public token/utility (from the solver-emitted manifest / policy), or
  - A component-local class defined adjacent to that component

In `site/src/styles/docs-utilities.css`:

- Reject any occurrences of `--axm-` or `--_axm-`

### Migration Plan

1. Introduce `docs-utilities.css` with a small set of utilities used by one component
2. Convert one component at a time from inline styles to `docs-*` classes
3. Turn on enforcement for `docs-*` correctness first
4. Expand enforcement to cover broader "unknown class" checks once stable

---

## Part 2: ESLint Strategy

### Motivation

- **"Whac-A-Mole"**: We frequently fight the linter during commits, leading to frustration and "quick fix" disables
- **Safety vs. Purity**: The linter assumes perfect type safety, but runtime reality (DOM APIs, external inputs) often requires checks
- **Code Clarity**: Scattered `eslint-disable` comments clutter the code and hide potential real issues

### Strategy

#### 2.1. Categorize Suppressions

Every suppression should be categorized:

| Category        | Description                                         | Action           |
| :-------------- | :-------------------------------------------------- | :--------------- |
| Runtime Safety  | Type says defined, runtime might not (DOM elements) | Use type guards  |
| Legacy/Refactor | Code scheduled for rewrite                          | Track in backlog |
| False Positive  | Linter is objectively wrong about control flow      | Inline disable   |

#### 2.2. Centralized Configuration vs. Inline

**Global/Path-based overrides**: For directories like `scripts/` or `tests/` where loose typing is acceptable, configure overrides in `eslint.config.js`.

**Utility Wrappers**: Instead of disabling inline, create utility functions that encapsulate the "unsafe" check:

```typescript
// Instead of:
// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
if (foo) { ... }

// Use a utility:
import { isDefined } from '@lib/utils';
if (isDefined(foo)) { ... }
```

#### 2.3. Enforcement

Update custom lint scripts to enforce that every `eslint-disable` is accompanied by a comment explaining _why_, or track them in a central allowlist.

### Rules to Review

| Rule                                          | Issue                                | Recommendation              |
| :-------------------------------------------- | :----------------------------------- | :-------------------------- |
| `@typescript-eslint/no-unnecessary-condition` | Too aggressive for DOM-heavy code    | Warn in `src/lib/inspector` |
| `@typescript-eslint/no-floating-promises`     | Essential for Node, noisy in scripts | Configure per-directory     |

### Action Items

1. Audit current `eslint-disable` usages
2. Adjust severity of `no-unnecessary-condition` to `warn` for inspector directory
3. Implement branded types or type guards to satisfy the linter without disabling rules

---

## Part 3: Unified Enforcement Infrastructure

### Enforcement Layers

| Layer          | Scope          | Tool          | Trigger    |
| :------------- | :------------- | :------------ | :--------- |
| Type Safety    | All TypeScript | `tsc`         | Build      |
| Lint Rules     | All code       | ESLint        | Pre-commit |
| Docs Utilities | Site code      | Custom script | Pre-commit |
| Class Tokens   | Consumer code  | Custom script | CI         |
| Engine Vars    | Consumer CSS   | Custom script | CI         |

### Relationship to Other RFCs

- **RFC-CONSUMER-CONTRACT**: Docs utilities must not become a backdoor into engine variables
- **RFC-AUDITING**: Enforcement scripts are part of the overall audit framework
- **RFC-INTEGRATION**: ThemeManager integration surface is unrelated to layout utilities, but inherits the same "no plumbing from userland" boundary

---

## Future Work

### `@apply`-like Composition (Strawman)

A tiny composition feature may be desirable:

- Allow docs authors to define named bundles (e.g., `docs-card`) that expand to a safe set of declarations
- **Constraints**:
  - Must remain compatible with simple build pipelines
  - Must not create a new general-purpose DSL
  - Must not allow engine plumbing access

**Two approaches:**

1. **Pure CSS layering**: Define bundles as normal classes, compose via multiple classes in markup
2. **Build-time expansion**: Small script transforms `@apply docs-card;` into copied declarations

---

## Open Questions

1. Should enforcement be `docs-*` only (low risk), or validate all class usage (higher risk)?
2. How to accurately distinguish Axiomatic public tokens, docs utilities, component-local CSS, and vendor classes?
3. One shared spacing scale for docs, or semantic sizes?
