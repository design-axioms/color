# RFC 012: Provenance Audit v2 (Token-Driven Paint, Manifest Authority, and Bridge Boundaries)

**Status**: In Progress  
**Date**: 2025-12-14  
**Author**: GitHub Copilot (GPT-5.2 Preview)

## Summary

This RFC specifies **Provenance Audit v2**: an automated audit that proves (within an explicit, finite scope) that **all visible paint is token-driven**.

It formalizes the contract implied by RFC010 (“Class-Token Integrity”) using the finite, paint-property framing introduced in RFC011 (“Continuity Auditing v2”):

- **Authority**: reserved-prefix class tokens must come from the **solver-emitted manifest** for the active config.
- **No bypass**: authored code must not produce painted color via literals or direct engine plumbing variables.
- **Causality**: visible paint must be **reproducible from the Axiomatic pipeline inputs**.
- **Bridge boundaries**: vendor/theme-system variables (e.g. Starlight `--sl-*`) are allowed only inside an explicit integration boundary.

The goal is not “no unexpected colors exist anywhere”; it is “the system’s _public interface_ (class tokens) is the only way consumers express color intent.”

## Motivation

We want an enforceable, CI-grade proof that the UI is styled through the system’s public contract:

- Consumers must express intent via **class tokens**.
- The solver emits both CSS and a **per-config manifest** of allowable class tokens.
- Painted output must be traceable to allowed inputs.

Previous audits that only checked “computed value ∈ known palette values” were insufficient:

- They can pass when a component bypasses the contract (e.g. `var(--_axm-*)` usage) but happens to evaluate to a familiar value.
- They cannot enforce the boundary rule (“don’t address the engine directly”).

## Relationship to other RFCs

- **RFC010** is the normative consumer contract (token authority + no engine addressing). This RFC specifies how we audit that contract in the browser.
- **RFC011** provides the measurement framing (finite paint properties, normalized values, alpha cutoff). This RFC adopts those constraints.
- **RFC013** defines the generalized “integration adapter + bridge exports” strategy, including how we define and enforce foreign-variable boundaries.

## Goals

- **G1 — Token authority**: Fail when reserved-prefix class tokens are used but not present in the solver-emitted manifest.
- **G2 — No bypass**: Fail when painted properties are authored via inline styles (or equivalent consumer-side bypass mechanisms).
- **G3 — Paint provenance (finite)**: For a finite set of paint properties, every visible paint is reproducible from the Axiomatic pipeline’s allowed source expressions.
- **G4 — Explicit boundaries**: Allow vendor variables only within an explicit “bridge boundary” region.
- **G5 — Deterministic + bounded**: The audit is deterministic and runtime-bounded (caps on scanned elements, sampled checks).

## Non-goals

- Full static analysis of all authored CSS in the repo.
- Proving that _every_ internal variable is used correctly.
- Proving “no invisible paint exists” (we explicitly ignore near-invisible paint).
- Covering all CSS paint vectors (e.g. SVG `fill`, `stroke`, `filter`, `backdrop-filter`) in v2.

## Definitions

### Reserved-prefix class token

A class token that participates in the styling contract, typically indicated by a reserved prefix (e.g. `surface-*`, `text-*`, etc.). The set of reserved prefixes is provided by the solver-emitted manifest.

### Manifest authority

The solver emits an allowlist of class tokens for the active config. For the docs site, the manifest is written next to the generated theme CSS.

The audit treats the manifest as the source of truth for what tokens exist.

### Painted properties (finite)

The audit scope is defined as the following finite property families:

- **Color paint**: `color`, `background-color`, `border-*-color`, `outline-color`
- **Discrete paint**: `box-shadow`

A property is only audited when it is actually painted (e.g. non-transparent background, non-zero border width with non-`none` style).

### Visible

An element is considered “visible” for auditing if:

- it is rendered (`display != none`, `visibility != hidden`, `opacity != 0`),
- it has a non-zero client rect,
- and its rect intersects the viewport.

### Alpha cutoff

To reduce noise and align with the perceptual framing in RFC011, paint with alpha below a cutoff is treated as effectively transparent for provenance purposes.

Default: `alpha < 0.02`.

## Provenance invariants

These are the proof obligations the audit is intended to enforce.

### Invariant 1 — Authority

If a DOM element uses a reserved-prefix class token, that token must appear in the solver-emitted manifest.

This prevents “invented tokens” and locks consumers to the solver’s published interface.

### Invariant 2 — No bypass (consumer contract)

Consumers must not style painted properties via inline styles.

At minimum, the audit fails when an element’s `style` attribute directly sets any of the audited paint properties.

Rationale: inline paint is a bypass of the manifest + class-token contract.

### Invariant 3 — Causality (token-driven paint)

For each audited painted property, the computed value must be reproducible from a narrow set of **allowed source expressions** representing the Axiomatic pipeline.

This is stricter than “value matches a palette”: it constrains the _cause_, not just the _result_.

### Invariant 4 — Bridge boundary

Variables from vendor/theme systems (notably Starlight `--sl-*`) are allowed only inside an explicit **integration adapter boundary** (RFC013).

Outside that boundary, `--sl-*` is treated as a provenance leak.

## Bridge boundary specification (Docs + Starlight)

This section is the Starlight-specific instantiation of RFC013.

The docs site is an integration of:

- Axiomatic’s engine + token classes
- Starlight’s UI shell + its `--sl-*` variable system

To prevent accidental “two theme systems at once,” we define a boundary:

- **Inside the boundary**: `--sl-*` variables may exist and may influence paint, but only as inputs to the bridge.
- **Outside the boundary**: content and components must be driven by Axiomatic class tokens and engine outputs.

Implementation note: the provenance audit enforces boundaries at the **source level** (file allowlist) to keep the rule deterministic and auditable.

In this repo, the Starlight adapter boundary is currently expressed as a **source-level allowlist**:

- `site/src/styles/starlight-custom.css`

Any other `--sl-*` usage in `site/src/**` is treated as a provenance leak.

Runtime integration is intentionally **not** part of the foreign-variable boundary:

- JS/TS/Astro may observe theme changes (e.g. `data-theme`) and perform DOM wiring.
- JS/TS/Astro must not reference foreign palette variables (e.g. `--sl-*`) and must not reference Axiomatic variables (e.g. `--axm-*`, `--_axm-*`).
- Theme changes should be bridged via a documented runtime API (e.g. `ThemeManager`) that sets an engine-owned semantic state (e.g. `data-axm-mode`) rather than writing engine variables like `--tau`.

## Audit algorithm (normative)

### Inputs

- Solver-emitted class-token manifest (reserved prefixes + allowlisted tokens).
- A target page (or set of pages) to audit.

### Steps

1. Navigate to the audited page.
2. Pin nondeterminism drivers:
   - Disable animations/transitions.
   - Pin `--tau` to a stable value.
3. Enumerate a bounded set of visible DOM elements.
4. For each element:
   - **Authority check**: all reserved-prefix class tokens must be allowlisted.
   - **No bypass check**: inline styles must not set audited paint properties.
   - **Paint provenance check**:
     - For each audited property family, if the element is actually painting that family:
       - compute the actual value,
       - compare against the set of allowed “expected” values derived from Axiomatic pipeline expressions.

### Allowed expected sources (initial set)

The allowed expected sources are a deliberately small set of **public, stable integration surfaces** that represent the Axiomatic paint pipeline.

Normative constraint:

- Tests MUST NOT assert internal/private CSS variable strings (e.g. `"var(--_axm-...)"`).
- The audit SHOULD validate paint via **computed equivalence** against reference probes that are styled through the public contract:
  - class tokens (RFC010), and
  - bridge exports when validating adapters (RFC013).

Recommended expected sources (conceptual):

- **Engine-owned paint** (surfaces/text): expected values are taken from a probe element that is painted by the same token path as the element under test.
- **Adapter paint** (foreign palettes): expected values are taken from a probe element painted via the intended bridge export (e.g. `color: var(--axm-bridge-fg-body)`) and compared to a probe painted via the foreign palette var (e.g. `color: var(--sl-color-text)`).
- **Borders/outlines**: expected values may be derived from `currentColor` or from the appropriate bridge export.
- **Shadows**: expected values must come from Axiomatic shadow tokens/exports.

Implementation note (non-normative): the audit implementation may use private engine plumbing variables internally as a convenience to compute reference values, but these are not part of the public contract and must not be treated as stable expected-source identifiers.

### Normalization

Computed color values may serialize as `rgb(...)`, `rgba(...)`, `oklab(...)`, `oklch(...)`, etc.

The audit must compare colors using a normalized numeric representation (e.g. sRGB RGBA) with a small tolerance, rather than relying on string equality.

## Reporting (normative)

A violation record must include:

- element identifier (stable selector or path)
- class list
- property family
- actual value
- expected value(s) or expected source
- failure reason

The audit should cap reported violations (top N) but must fail the test when any violations exist.

## Reference implementation

The current reference implementation lives in tests/provenance.spec.ts.

It is an executable version of this RFC and should be updated in lockstep with the RFC when semantics change.

## Open questions

- Should the bridge boundary be expressed as:
  - a selector allowlist,
  - a dedicated attribute (e.g. `data-axm-bridge="starlight"`),
  - or an explicit wrapper component?
- Should we add a repo-level static scan to catch authored `var(--axm-*)` / `var(--_axm-*)` usage in consumer CSS (in addition to runtime auditing)?
- Should we expand paint families to include SVG paint (`fill`, `stroke`) and text decorations?
