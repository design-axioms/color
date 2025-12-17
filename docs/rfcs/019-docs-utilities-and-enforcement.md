# RFC 019: Docs Utilities (Site-Local), Enforcement, and Future Utility Composition

**Status**: Draft  
**Date**: 2025-12-16  
**Author**: GitHub Copilot (GPT-5.2 Preview)

## Summary

This RFC defines a lightweight, **site-local utility layer** for the documentation site that:

- Lives **inside the Astro site codebase**.
- Is implemented as **normal CSS** (no special preprocessors required).
- Is explicitly **not** allowed to reference Axiomatic plumbing variables (`--axm-*`, `--_axm-*`).
- Is mechanically enforceable so “Tailwind hallucination” does not create a shadow styling system.

It also sketches a future direction for a tiny `@apply`-like composition mechanism that composes utilities using only the **public Axiomatic API**.

## Motivation

We want to:

1. Reduce inline-style noise in docs components (e.g. padding/radius/typography/transition declarations).
2. Keep docs styling deterministic and readable without importing Tailwind.
3. Avoid introducing a “fake Tailwind” surface that encourages accidental usage of undefined classes (e.g. `p-6`, `text-sm`, `duration-200`).
4. Maintain the hard boundary from RFC010: consumer code must not address engine internals.

## Relationship to other RFCs

- RFC010 (Class-Token Integrity): docs utilities must not become a backdoor into engine variables.
- RFC014 (ThemeManager integration surface): unrelated to layout utilities, but this RFC inherits the same “no plumbing from userland” boundary.

## Goals

- **G1 — Site-local utilities**: define a dedicated stylesheet for docs-only utilities.
- **G2 — Namespaced utilities**: utilities should be clearly distinguishable from Tailwind.
- **G3 — Enforceable correctness**: CI should fail when:
  - docs components use unknown utility classes, or
  - docs CSS tries to reference forbidden `--axm-*` / `--_axm-*` variables.
- **G4 — Simple pipeline**: no requirement for PostCSS/Tailwind; works with the existing Astro pipeline.

## Non-goals

- Re-creating Tailwind’s full surface area.
- Providing a general-purpose utility system for external consumers.
- Introducing a mandatory preprocessor step.

## Proposed Design

### 1) A dedicated docs utility stylesheet

Add a single source of truth for docs utilities:

- `site/src/styles/docs-utilities.css`

Imported by the docs site’s main styles entry (where other site CSS is already wired).

### 2) Naming conventions to avoid Tailwind drift

Utilities MUST be namespaced:

- Use the prefix `docs-`.
- Avoid “Tailwind-shaped” names (`p-6`, `text-sm`, `duration-200`, `rounded-lg`).

Recommended naming:

- Spacing: `docs-pad-lg`, `docs-pad-md`, `docs-mb-sm`, `docs-mt-md`
- Radius: `docs-radius-md`, `docs-radius-lg`
- Typography: `docs-type-sm`, `docs-type-lg`, `docs-weight-bold`
- Motion: `docs-transition-fast`, `docs-transition-med`

Rationale: numerals like `6` strongly imply Tailwind semantics and invite incorrect guesses.

### 3) CSS boundary rule (no Axiomatic plumbing)

Docs utility CSS MUST NOT reference:

- Any `--axm-*` variables
- Any `--_axm-*` variables

Docs utilities MAY use:

- numeric values (`rem`, `px`, etc.)
- CSS system fonts and standard properties
- public class tokens and utilities from the Axiomatic engine (e.g. `surface-*`, `text-*`, `bordered`, `shadow-*`) applied in markup

### 4) Enforcement: “unknown utility” and “forbidden var” checks

Add a docs check that enforces:

- In `site/src/**/*.{astro,svelte,md,mdx,ts,tsx,js,jsx}`:
  - If a class starts with `docs-`, it must be present in `site/src/styles/docs-utilities.css`.
  - If a class does not start with `docs-`, it must be either:
    - an Axiomatic public token/utility (from the solver-emitted manifest / policy), or
    - a component-local class defined adjacent to that component.

- In `site/src/styles/docs-utilities.css`:
  - Reject any occurrences of `--axm-` or `--_axm-`.

Notes:

- The “Axiomatic public token allowlist” should come from the existing per-config policy mechanism defined in RFC010 (solver-emitted manifest), not a hand-maintained list.
- The initial version can be pragmatic and limited in scope (e.g. enforce only `docs-*` correctness + forbid engine vars in docs utility CSS).

## Migration Plan (incremental)

1. Introduce `docs-utilities.css` with a small set of utilities used by one component.
2. Convert one component at a time from inline styles to `docs-*` classes.
3. Turn on enforcement for `docs-*` correctness first.
4. Expand enforcement to cover broader “unknown class” checks once the rule is stable.

## Future Work: `@apply`-like composition (strawman)

We may want a tiny composition feature:

- Allow docs authors to define named bundles (e.g. `docs-card`) that expand to a safe set of declarations.
- Constraints:
  - Must remain compatible with simple build pipelines.
  - Must not create a new general-purpose DSL that becomes more complex than the problem.
  - Must not allow engine plumbing access.

Two plausible approaches:

1. **Pure CSS layering**: define bundles as normal classes and compose via multiple classes in markup.
2. **Build-time expansion**: a small script transforms `@apply docs-card;` into copied declarations from a local registry file.

Open question: whether build-time expansion is worth the complexity versus “just add more classes”.

## Open Questions

- Should the enforcement rule be `docs-*` only (low risk), or also attempt to validate all class usage in docs code (higher risk)?
- If we validate all classes, how do we accurately distinguish:
  - Axiomatic public tokens,
  - docs utilities,
  - component-local CSS classes,
  - vendor/third-party classes?
- Do we want one shared spacing scale for docs, or a small number of semantic sizes?
