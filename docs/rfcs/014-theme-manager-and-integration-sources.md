# RFC 014: ThemeManager as the Integration Surface (Mode Sources, Semantic State, No Plumbing)

**Status**: Draft  
**Date**: 2025-12-15  
**Author**: GitHub Copilot (GPT-5.2 Preview)

## Summary

This RFC defines the **runtime integration contract** for theme mode (light/dark/system) in the presence of foreign theme systems (e.g. Starlight).

Core claim:

- The **only** sanctioned runtime mechanism for theme control is `ThemeManager`.
- `ThemeManager` bridges one or more **mode sources** (system preference, app toggle, vendor toggles) into an **engine-owned semantic state** on a root element.
- Consumers and integration code MUST NOT write engine plumbing variables (e.g. `--tau`) and MUST NOT reference CSS variables (`--axm-*`, `--_axm-*`, `--sl-*`) from JS/TS/Astro.

This replaces ad-hoc “head scripts” that observe vendor attributes and write CSS variables.

## Motivation

We want integrations that are:

- **Consumer-axiom compliant** (RFC010): consumers do not address the engine.
- **Deterministic** and **auditable**: mode changes flow through a single, documented API surface.
- **Robust** against vendor CSS behavior: theme toggles should not depend on stylesheet timing or specificity wars.
- **Composable**: multiple sources of truth (system, user preference, vendor UI) can coexist with clear precedence.

## Relationship to other RFCs

- RFC010: consumer contract (no engine addressing).
- RFC012: audits should treat mode bridging via `ThemeManager` as valid; direct `--tau` writes are not a consumer operation.
- RFC013: adapters/bridge exports handle foreign palette variables in CSS; this RFC handles runtime mode bridging.

## Terms

### Mode

The semantic theme state: `light`, `dark`, or `system`.

### Resolved mode

The actual appearance at a given time: `light` or `dark`.

### Mode source

An input that can provide a mode or resolved mode (system preference, app state, vendor attribute like `data-theme`).

### Engine-owned semantic state

Axiomatic’s public, stable representation of mode on a root element. It is **not** expressed as a CSS variable.

## Normative requirements

### R1 — ThemeManager is the only runtime theme API

All runtime theme control MUST go through `ThemeManager`.

Forbidden patterns include:

- writing `--tau` from JS/TS
- computing paint and reacting to it ("read computed style, infer theme")
- writing foreign palette variables (e.g. `--sl-*`) from JS/TS
- reading/writing `--axm-*` / `--_axm-*` from JS/TS

### R2 — Theme is represented semantically on a root element

`ThemeManager` MUST set an engine-owned semantic state on its `root` element.

Recommended representation:

- `data-axm-mode="light" | "dark" | "system"`
- `data-axm-resolved-mode="light" | "dark"` (optional but useful)

The exact attribute names are part of the public runtime contract.

### R3 — CSS derives plumbing from semantic state

Generated CSS MUST derive internal variables (including `--tau`) from the semantic state.

Important compatibility constraint:

- The continuity audit may lock `--tau` via inline `!important`.
- Therefore, the CSS derivation of `--tau` MUST not use `!important` and must allow an inline important override to win.

#### CSS derivation contract (clarification)

To avoid mixed-mode transient states (e.g. “white canvas + dark cards”), the system MUST converge on a single authoritative driver for mode-dependent CSS.

- After `ThemeManager` initialization, `data-axm-resolved-mode` MUST be present and MUST be either `light` or `dark`.
- After initialization, generated CSS that derives mode-dependent plumbing (including `--tau`) MUST be driven by `data-axm-resolved-mode` (not by `prefers-color-scheme`).
- Before initialization, generated CSS MAY use `prefers-color-scheme` as a fallback for initial paint, but this fallback MUST be superseded once `ThemeManager` publishes `data-axm-resolved-mode`.

This keeps “system” as a semantic preference (`data-axm-mode="system"`) while ensuring the CSS engine only has one active switch for paint at steady state.

### R4 — Mode sources are explicit and composable

`ThemeManager` MUST support one or more explicit mode sources.

Required sources:

- **System preference**: `prefers-color-scheme`
- **Manual override**: `setMode("light"|"dark"|"system")`

Optional sources:

- **Attribute source**: observe a foreign theme attribute (e.g. `data-theme`) and translate it into Axiomatic mode.
- **Custom source**: a callback/observable that publishes mode changes.

### R5 — Precedence is deterministic

`ThemeManager` MUST define deterministic precedence between sources.

Recommended default precedence:

1. Explicit manual override (`setMode(...)`) wins.
2. If mode is `system`, resolved mode comes from system preference, unless an integration source explicitly declares it is authoritative.

For vendor integration sources (e.g. Starlight):

- If the vendor is the UI the user is interacting with, it is acceptable for the vendor attribute to be treated as the manual override source.
- This must be expressed explicitly in the configuration (no auto-detection).

### R6 — Vendor integration does not require head scripts

Users should not need to author bespoke “observe vendor theme, write Axiomatic state” scripts.

The library should provide a small, documented helper for common integrations.

Example (conceptual API, not yet implemented):

- `createAttributeModeSource({ root, attribute: "data-theme", map: { dark: "dark", light: "light" }, systemWhenMissing: true })`

### R7 — Chrome paint must be single-driver and bridge-routed

This requirement codifies the stability constraints discovered during Starlight integration.

#### R7.1 — Single driver for mode transitions

For integrations that animate between modes, the system MUST have a single authoritative driver for motion.

- The only sanctioned driver is the engine’s mode driver (`--tau`) derived from `data-axm-resolved-mode`.
- Integration code MUST NOT introduce independent transitions on bridge exports (e.g. `--axm-bridge-*`).
- Integration code MUST NOT introduce transitions on painted properties in a way that competes with the driver (e.g. `transition: border-color ...` while borders are derived from bridge exports).

Rationale: if a bridge export transitions independently from `--tau`, computed paint becomes timing-dependent and can temporarily violate continuity/axiom checks (“popping”).

#### R7.2 — `currentColor` is allowed for SVG, not for chrome borders

`currentColor` is a valid and encouraged mechanism for iconography:

- SVG primitives SHOULD use `fill: currentColor` and/or `stroke: currentColor`.

However, docs chrome borders MUST NOT be coupled to text color:

- Adapter CSS MUST NOT use `border-color: currentColor` (or `border: ... currentColor`) for Starlight chrome primitives.
- Chrome borders MUST be routed through explicit, stable inputs (bridge exports such as `--axm-bridge-border-int` / `--axm-bridge-border-dec`, or a foreign palette var that the adapter maps to those exports).

If a border is intentionally designed to match text color, it MAY use `currentColor`, but this MUST be treated as an explicit design choice and should be confined to non-chrome elements.

## Starlight integration (informative but concrete)

Starlight uses `data-theme` on the document root as its mode signal.

The recommended integration is:

1. Instantiate `ThemeManager({ root: document.documentElement, ... })`.
2. Attach a Starlight mode source that observes `data-theme` changes.
3. `ThemeManager` updates `data-axm-mode` / `data-axm-resolved-mode` accordingly.
4. Generated Axiomatic CSS derives `--tau` and other internal behavior from `data-axm-*`.
5. The Starlight adapter (RFC013) maps Starlight palette variables (`--sl-*`) to Axiomatic bridge exports in CSS.

Key properties:

- No JS touches `--tau`.
- No JS touches `--sl-*`.
- No JS touches `--axm-*` / `--_axm-*`.
- Vendor CSS can load/override whenever it likes; it will still consume Axiomatic’s palette via the adapter mapping.

## Testing guidance

Tests for integrations SHOULD:

- toggle the foreign theme system (e.g. mutate `data-theme`),
- assert that Axiomatic semantic state updates (e.g. `data-axm-resolved-mode` changes), and
- assert that key computed paint is coherent (body background + text remain a valid pair).

Tests MUST NOT assert CSS variable strings (e.g. `"var(--tau)"` or `"var(--sl-color-text)"`). Prefer computed-value equivalence and behavior.

### Sentinel tests (recommended)

To prevent “whack-a-mole” regressions, integrations SHOULD include two sentinels:

1. **Static contract check**: fail CI if the Starlight adapter bridge file contains disallowed patterns that reintroduce timing coupling (e.g. `border: ... currentColor` for chrome, or `transition` entries that animate `--axm-bridge-*`).
2. **CSSOM contract sentinel (Playwright, CSSOM scan)**: fail CI if the _effective_ stylesheet rules for Starlight chrome violate the **chrome continuity contract** defined in RFC013.

This sentinel MUST be rule-focused (CSSOM scan), not a DOM-wide computed-style scan.
It SHOULD share a single contract spec with other consumers (notably the in-page inspector):

- `src/lib/integrations/starlight/chrome-contract-spec.ts` (`STARLIGHT_CHROME_CONTRACT`)

  **Shadow DOM coverage**:

- A build-time CSS file scan trivially covers Shadow DOM because it is source-based.
- A CSSOM scan MUST explicitly include:
  - `document.styleSheets`,
  - `document.adoptedStyleSheets` (constructed stylesheets), and
  - for every _open_ `shadowRoot`: both `shadowRoot.styleSheets` (inline `<style>`) and `shadowRoot.adoptedStyleSheets`.

If a third-party uses **closed** shadow roots, the CSSOM sentinel cannot introspect those styles; the fallback is computed-style witnesses on the shadow host.

3. **Runtime witness ratchet (Playwright)**: on a representative docs page, sample one canonical chrome border (e.g. header divider) across a mode flip and assert that:

- its computed `border-*-color` matches the resolved value of the expected bridge export at every sample frame, and
- it never temporarily equals the element’s computed `color` (a common failure mode when `currentColor` is reintroduced).

## Acceptance criteria

This RFC is considered implemented when:

1. A consumer can integrate theme toggling via `ThemeManager` without writing CSS-variable plumbing.
2. Vendor theme toggles (e.g. Starlight `data-theme`) can be bridged into Axiomatic mode via a small documented configuration.
3. The docs site does not rely on large head scripts to synchronize themes.
4. Provenance/continuity/violations audits remain green without brittle `!important` overrides on core painted properties.

## Appendix A — Migration Plan (Docs Site / Starlight)

This appendix is deliberately **not** “port the current integration forward.” The current docs-site wiring contains whack-a-mole mechanisms (runtime `--tau` writes, initialization gates, and CSS `!important` overrides) that were useful as diagnostics, but are not a stable integration architecture.

### A.0 Goals and stop conditions

Goals:

- Theme changes are bridged via `ThemeManager` into an **engine-owned semantic state** (`data-axm-*`).
- Starlight consumes Axiomatic’s palette via the adapter (RFC013) by mapping `--sl-*` → `--axm-bridge-*` in CSS.
- The integration remains audit-friendly: no JS touches CSS variables (`--tau`, `--sl-*`, `--axm-*`, `--_axm-*`).

Stop conditions (do not paper over with `!important`):

- If Starlight chrome paints via **literal colors** (or properties not routed through `--sl-*`), do not add ad-hoc overrides; instead, introduce an explicit adapter “lock mode” (RFC013 Axiom 4) that is:
  - explicitly activated (e.g. `data-axm-adapter-lock="starlight"`),
  - narrowly scoped,
  - treated as an integration feature with tests.

### A.1 Baseline audit (prove the integration surface)

Before changing anything, prove what Starlight actually consumes:

- Confirm which painted properties in Starlight chrome are derived from `--sl-*` (foreground, background, borders).
- Confirm which Starlight theme signals exist and how they change (`data-theme` toggling behavior, missing attribute in “system” mode).
- Confirm how many places currently bypass the palette mapping (constructed stylesheets applying colors directly).

The output of this step should be a short “surface map”: which Starlight vars correspond to which semantic roles and which chrome elements are not palette-driven.

### A.2 Current state inventory (diagnostic only)

As of today, the docs integration uses two main mechanisms:

- [site/src/components/StarlightHead.astro](site/src/components/StarlightHead.astro)
  - `initAxiomaticStarlightChrome()`: DOM wiring (apply `surface-*`/`text-*` classes; wrap sidebar)
  - `initAxiomaticThemeBridge()`: observes `data-theme` and writes `--tau` inline
  - Inspector/debugger injection

- [site/src/styles/starlight-custom.css](site/src/styles/starlight-custom.css)
  - Many `!important` rules forcing `color: inherit` / `background-color: transparent` on Starlight-owned chrome and markdown elements

Treat this inventory as “what we must delete or replace,” not as design precedent.

### A.3 Delete/replace list (the de-whack-a-mole step)

Delete (or reduce to near-zero):

- Runtime `--tau` bridging in the docs head script (`data-theme` → `--tau`).
- Any runtime logic that exists solely to fight timing (e.g. repeated re-wiring on every theme mutation unless proven necessary).
- Broad `!important` paint overrides whose purpose is “win against Starlight.”

Replace with:

- A `ThemeManager` configuration that treats Starlight’s theme signal as an explicit mode source and updates `data-axm-mode` / `data-axm-resolved-mode`.
- Generated CSS mapping `data-axm-*` → internal plumbing (`--tau`) (no `!important`).
- Adapter CSS mapping `--sl-*` → `--axm-bridge-*` so Starlight’s own rules continue to win, but consume our palette.

Keep:

- Minimal DOM wiring that applies **class tokens** to vendor-owned markup (`surface-*`, `text-*`) and structural wrappers where needed.
- The inspector injection (as a dev-only tool), provided it does not become required for correctness.

### A.4 Target architecture (what the docs site should look like)

At steady state:

- The docs site head contains _only_ calls to documented integration helpers.
- The Starlight bridge file is a mapping table:
  - `--sl-*` inputs/exports exist only there,
  - and point to Axiomatic bridge exports.
- Theme changes move through `ThemeManager`:
  - Starlight toggles `data-theme`
  - ThemeManager observes it (as a mode source)
  - ThemeManager updates `data-axm-*`
  - CSS derives `--tau` and other behavior

### A.5 Validation checkpoints (must stay green)

After each migration step, verify:

- Theme toggle does not enter mixed-state “white canvas + dark cards” behavior (coherent body foreground/background pairs).
- RFC010 boundary checks remain satisfied (no `--sl-*` outside the bridge stylesheet; no CSS-variable plumbing in runtime code).
- Provenance/continuity/violations audits remain green without expanding `!important` usage.

If any checkpoint fails, do not add more overrides; instead revisit A.1 and tighten the adapter mapping or introduce an explicit lock mode per RFC013.
