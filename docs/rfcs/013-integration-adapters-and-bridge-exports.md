# RFC 013: Integration Adapters & Bridge Exports (Foreign Paint Systems, Without Whack-a-Mole)

**Status**: Draft  
**Date**: 2025-12-15  
**Author**: GitHub Copilot (GPT-5.2 Preview)

## Summary

This RFC defines the project’s general mechanism for integrating with “foreign paint systems” (vendor themes, component libraries, embedded widgets, CMS chrome, etc.) without violating RFC010.

It introduces two concepts:

1. **Integration Adapter**: a boundary-scoped mapping layer that is the _only_ place foreign theme variables and selectors may be referenced.
2. **Bridge Exports**: a small, explicit, public set of Axiomatic-owned CSS variables that adapters may consume. These exports are **integration API**, not consumer styling API.

Starlight is the first concrete adapter instance, but the architecture is intended to generalize.

This RFC also codifies an additional tightening discovered during Starlight integration:

- **Foreign variables must be confined to a single “bridge file”** per adapter (a CSS file).
- Runtime JS/TS/Astro may do DOM wiring and observe theme changes, but MUST NOT reference:
  - foreign variables (e.g. `--sl-*`), or
  - Axiomatic engine/bridge variables (e.g. `--axm-*`, `--_axm-*`).

Theme changes must be bridged via a documented runtime API (`ThemeManager`) that sets an **engine-owned semantic mode** (e.g. `data-axm-mode`), not by writing engine variables like `--tau` from consumer code.

See RFC014 for the ThemeManager-in-integration details.

## Motivation

We need overrides that:

- remain **token-driven** (consumer intent via class tokens),
- remain **auditable** (explicit boundaries, no ambient permissions),
- remain **deterministic** (no heuristic runtime discovery that changes semantics), and
- remain **robust** against vendor behavior (e.g. late injected constructed stylesheets).

A one-off “Starlight exception” does not scale. We want a reusable pattern that keeps RFC010 intact.

## Relationship to other RFCs

- **RFC010** (Class-Token Integrity) is the consumer contract. This RFC defines the only sanctioned escape hatch: adapters + bridge exports.
- **RFC012** (Provenance Audit v2) uses this RFC’s boundary definitions to classify foreign vars as allowed (inside adapters) vs leaks (outside adapters).
- **RFC014** defines how theme changes (including vendor theme toggles) are bridged into Axiomatic via `ThemeManager`.

## Terminology

### Foreign paint system

Any system that can affect paint in ways Axiomatic does not own (e.g. Starlight’s `--sl-*`, a widget library’s `--vendor-*`, etc.).

### Integration adapter

A dedicated layer whose job is to map foreign theme interfaces to Axiomatic’s integration interface.

Properties:

- **Boundary-scoped**: the adapter lives in explicit, named files (and optionally a wrapper root).
- **Declarative**: it is a deterministic mapping table (no semantic heuristics).
- **One-way**: adapters primarily make the foreign system consume Axiomatic outputs (usually by mapping the foreign palette interface to bridge exports).

Non-goal (important): adapters are not a general “override CSS” area. If an integration is solved primarily through high-specificity selectors and `!important`, it is considered unstable and should be redesigned to flow through the foreign system’s palette interface.

### Bridge exports

Axiomatic-owned, stable CSS variables that represent “paint outputs suitable for adapters.”

Bridge exports exist specifically so adapters never need to reference private engine plumbing (`--_axm-*`) and so we don’t weaken RFC010 for consumers.

## Axioms (Hard constraints)

### Axiom 1 — Consumers do not address the engine

Outside adapter boundaries, authored code MUST NOT reference `--axm-*` or `--_axm-*` as styling outputs, and MUST NOT reference foreign theme variables.

### Axiom 2 — Adapters are explicit and few

Adapters MUST be enumerated by explicit file allowlists. If a new adapter is added, it must be named and added to the allowlist.

#### Axiom 2.1 — Single bridge file per adapter

Each adapter MUST designate exactly one CSS file as its **bridge file**.

- Foreign theme variables (e.g. `--sl-*`) MUST appear **only** in that file.
- This includes variable names in strings (e.g. `style.setProperty("--sl-color-text", ...)`) and selectors that target foreign markup.
- JS/TS/Astro may do mechanical DOM wiring (e.g. add classes, attach observers), but MUST NOT reference foreign variables.

Additional tightening (integration use-cases): JS/TS/Astro used for integration wiring MUST NOT reference Axiomatic engine/bridge variables either. The only sanctioned runtime interface is the documented JS API surface (not CSS variables).

### Axiom 3 — Adapters consume bridge exports only

Adapters MUST NOT use private plumbing (`--_axm-*`). Adapters MUST consume bridge exports (or safe primitives like `inherit` / `currentColor`).

Stronger form (target end-state):

- Adapters MUST NOT depend on _any_ engine-private computed plumbing (`--_axm-*`), even if currently stable.
- If a bridge export is missing for a required semantic role, add a bridge export; do not “reach into” the engine.

### Axiom 4 — Locks are allowed, but dumb

If vendor systems can reassert palette variables late, an adapter MAY apply **locks** to guarantee continuity.

Locks MUST:

- apply a predetermined mapping list,
- be idempotent,
- avoid semantic discovery.

Additional constraint (Starlight-learned):

- Locks MUST live in the adapter’s bridge file (CSS).
- Locks MUST be explicitly activated via a semantic marker (e.g. `data-axm-adapter-lock="starlight"`).
- Do not lock foreign vars via JS.

Enumerating variables to _target_ for locking is allowed only if bounded and used as a purely mechanical “apply mapping to this set” step (not “choose mapping based on observed values”).

### Axiom 5 — Theme intent has one writer

If a foreign paint system includes its own theme switcher (light/dark/system), an integration MUST ensure there is a single canonical writer of **theme intent**.

In Axiomatic integrations, that canonical writer is `ThemeManager`.

Normative guidance:

- Integrations MUST NOT allow multiple independent “theme authorities” to write theme state in overlapping ways (e.g. a vendor component writes `data-theme` while an adapter later writes other classes/attributes that affect paint).
- If the host application wants to use Axiomatic, it MUST ensure the theme switcher is either:
  - replaced with an Axiomatic-owned theme control, or
  - wrapped so it delegates to `ThemeManager`.
- Vendor-observable theme state (e.g. `data-theme`, `color-scheme`) MAY be published for compatibility, but MUST be treated as a derived output of the ThemeManager-selected intent, not a competing input.

Rationale: continuity failures frequently come from “staged” writes (theme flips now, adapter wiring later). Eliminating multi-writer theme intent turns theme changes into a single atomic transaction.

#### Axiom 5.1 — Theme switches are transactions

When theme intent changes (light/dark/system), the integration MUST treat it as a single atomic **theme switch transaction**.

This is the mechanism that prevents the empirically observed failure mode:
multiple regions reacting to the same theme change on different timelines due to competing transitions and/or staged DOM writes.

Definitions:

- **Theme switch transaction**: a bounded window where theme intent is updated and the UI is forced into a deterministic repaint policy.
- **Switching marker**: a DOM marker that communicates “a theme switch is in progress” to CSS.

Normative contract:

- There MUST be exactly one writer of theme intent (Axiom 5).
- The writer MUST set a switching marker before publishing the new theme state.
  - Recommended marker: set `data-axm-theme-switching="1"` on the document root (`<html>`).
- The writer MUST publish all theme-affecting state synchronously in a single task (no staged writes).
  - “Theme-affecting state” includes any attribute/class/inline style changes that can alter paint across chrome.
  - If the integration must also publish vendor-observable state (e.g. `data-theme`, `color-scheme`), it MUST be published inside the same transaction commit.
- While the switching marker is present, integrations MUST NOT introduce additional asynchronous theme-related DOM mutations that affect paint.
  - If a vendor system forces unavoidable late writes, the adapter MUST neutralize their paint effects via the bridge mapping (Axiom 4 locks), not by sequencing hacks.

##### Axiom 5.1.1 — Suppress competing paint-output transitions during the transaction

During a theme switch transaction, the integration SHOULD temporarily suppress competing CSS transitions/animations that act on **paint output properties**.

Rationale: CSS cannot distinguish why a computed value changed. Any existing `transition: color …` / `transition: all …` will attempt to animate when the theme changes, producing double-interpolation and desynchronization. The transaction boundary provides an explicit “cause channel” so CSS can behave differently during theme switches.

The suppression MUST be expressible as deterministic CSS keyed off the switching marker, so it can be audited and (where desired) enforced.

Recommended shape (illustrative, not mandatory syntax):

- When `[data-axm-theme-switching="1"]` is present, disable `transition` and `animation` for the chrome scope.
- If chrome scope markers exist (preferred), scope the suppression to chrome only.
- If chrome scope is not yet reliably marked, a broader suppression MAY be used, but it SHOULD be bounded to the shortest practical duration.

Notes:

- This suppression is a correctness mechanism, not a styling preference.
- It is allowed for this suppression to cancel in-flight hover/focus transitions; theme switching is treated as a higher-priority global state change.

##### Axiom 5.1.2 — Single sanctioned motion driver (optional)

If the integration wants a smooth visual theme transition, it MUST designate a single sanctioned motion driver and forbid other paint-output transitions in the relevant scope.

Two acceptable patterns:

1. **Parameter-space motion (preferred when available)**
   - Animate a small set of **input parameters** (e.g. `--tau`) and compute paint outputs from those parameters.
   - This requires the parameter to be animatable (e.g. a registered typed custom property via `@property`), otherwise the browser cannot interpolate.
   - Paint-output transitions (e.g. `color`, `background-color`, `border-color`) remain forbidden in chrome.

2. **View Transitions (snapshot-based atomicity)**
   - Wrap the synchronous commit in `document.startViewTransition(() => { ...commit... })` when supported.
   - View Transitions MAY be used purely for atomicity (with effectively no animation), or for a single constrained animation.
   - If View Transitions are used, integrations MUST feature-detect and provide a deterministic fallback.
   - Integrations MUST respect reduced motion preferences (e.g. disable the view transition animation when `prefers-reduced-motion` is set).

Non-goal: do not attempt to “allow other animations but not during theme switches” without a switching marker. Without an explicit marker, CSS has no mechanism to distinguish theme-driven changes from interaction-driven changes.

##### Axiom 5.1.3 — Motion policy is an engine-level switch (recommended)

If an integration requires “only $\tau$ animates” behavior, it SHOULD be expressed as an **engine-level motion policy**, not as adapter-local selector whack-a-mole.

Rationale: the Axiomatic engine can (optionally) apply `transition:` rules to internal/bridge typed custom properties (e.g. `--_axm-computed-*`, `--axm-bridge-*`) to smooth discrete surface/class changes. However, when the system’s mode is driven by a continuously animating input like `--tau`, those output transitions become a second, competing interpolation mechanism.

Normative guidance:

- The engine SHOULD support a root-level motion policy flag.
  - Recommended: `data-axm-motion="tau"` on the document root.
- When `data-axm-motion="tau"` is present:
  - The engine MUST NOT apply output transitions to bridge/engine computed custom properties.
  - Integrations SHOULD NOT need adapter-local suppression rules to prevent bridge exports from transitioning.
- When the motion policy is not `tau` (default / "outputs"):
  - Output transitions MAY be enabled to smooth discrete changes.

This mechanism keeps the “only $\tau$ animates” contract explicit, auditable, and reusable across integrations.

## Bridge exports (normative)

Bridge exports are Axiomatic’s integration API. Adapters depend on these.

The initial exports are aligned to paint families:

- `--axm-bridge-surface`
- `--axm-bridge-fg`
- `--axm-bridge-border-dec`
- `--axm-bridge-border-int`
- `--axm-bridge-shadow-sm`, `--axm-bridge-shadow-md`, `--axm-bridge-shadow-lg`

### Semantic bridge exports (required)

Foreign theme palettes often expose _multiple_ semantic text roles (e.g. “text”, “subtle text”, “high-contrast ink”). A single `--axm-bridge-fg` is insufficient as an adapter mapping target for those roles.

Therefore, the engine MUST expose semantic text-role bridge exports:

- `--axm-bridge-fg-high`
- `--axm-bridge-fg-body`
- `--axm-bridge-fg-subtle`

Each MUST be computed directly from the corresponding Axiomatic public tokens (e.g. `--axm-text-high-token`, `--axm-text-body-token`, `--axm-text-subtle-token`) and the ambient context (`--alpha-*`, `--tau`, etc.).

Rationale:

- Adapters must not reference `--_axm-*`.
- Adapters must not hardcode colors.
- Avoid aliasing private computed variables due to observed invalidation/refresh hazards; compute bridge exports from the same inputs.

## Adapter responsibilities (normative)

An adapter MAY:

- set foreign theme variables (e.g. `--sl-*`) to:
  - bridge exports,
  - `inherit`,
  - `currentColor`,
  - or other explicitly approved non-color primitives.

An adapter MUST NOT:

- set painted properties directly to Axiomatic plumbing vars (`--_axm-*`),
- introduce hardcoded colors,
- be used as a general styling layer for non-vendor markup.

An adapter SHOULD NOT:

- override painted properties on vendor chrome with `!important` as the primary integration mechanism.

Rationale: vendor styles (including late injected constructed stylesheets) are allowed to win, as long as they are consuming a palette and surface semantics provided through the bridge.

An adapter MUST:

- confine all foreign-variable mappings to its single bridge file,
- treat the mapping as a stable table (no runtime semantic inference).

## Enforcement

### Source-level boundary enforcement

Tools MUST enforce that foreign theme vars only appear inside adapter allowlist files.

#### Starlight adapter boundary (current)

Starlight is a “foreign paint system” whose palette is expressed via `--sl-*` variables.

The Starlight adapter boundary is:

- Bridge file: `site/src/styles/starlight-custom.css`

Everything else (including `site/src/components/StarlightHead.astro`) MUST NOT reference `--sl-*`.

### Provenance enforcement

The provenance audit treats foreign theme vars as:

- **Allowed** inside adapter boundaries.
- **Leaks** outside adapter boundaries.

Stronger goal: the provenance audit should additionally treat `--_axm-*` inside adapters as an error (once the required bridge exports exist).

## Current state and migration

Today, some Starlight integration code uses `--_axm-computed-*` internally to preserve continuity against Starlight reassertions.

This is treated as a stopgap. The target state is:

1. Introduce bridge exports.
2. Refactor adapters to consume bridge exports only.
3. Tighten enforcement to fail on `--_axm-*` even inside adapter boundaries.

Additional migration step (Starlight-learned):

4. Move _all_ `--sl-*` references out of runtime logic and into the single bridge file.

Next migration step (theme bridging):

5. Stop writing `--tau` from consumer integration code. Instead, bridge vendor theme toggles (e.g. Starlight `data-theme`) into `ThemeManager`, which sets an engine-owned semantic mode state (RFC014).

## Open questions

- Where should bridge exports live?
  - in generated theme CSS, or
  - in a separate generated `*-adapter.css` per integration target.
- Should adapter boundaries be expressed only as file allowlists, or also as runtime markers (e.g. `data-axm-adapter="starlight"`)?
- What is the minimal safe set of lock targets (which foreign vars are required to be locked)?

## Starlight chrome continuity contract (normative)

Starlight is a foreign paint system with late-injected constructed stylesheets.
This creates a unique failure mode: **border paint can briefly couple to text paint**
(e.g. via `currentColor`) or animate via a competing transition list, producing
"border popping" on first load or mode changes.

This RFC therefore defines a Starlight-specific **chrome continuity contract**.

### Contract obligations

For Starlight "chrome" (header, sidebar, right-sidebar, dialogs, search/theme controls):

- Chrome border/outline paint MUST NOT be coupled to text paint via `currentColor`.
- Chrome border/outline paint MUST be routed through the integration surface:
  - Prefer `--axm-bridge-border-int` / `--axm-bridge-border-dec`.
  - Starlight hairline vars (e.g. `--sl-color-hairline-*`) are permitted only when
    they are mapped to the bridge exports in the adapter bridge file.
- Chrome rules MUST NOT introduce competing transitions that animate:
  - `border*`, `outline*`, `box-shadow` (when used as borders), or
  - any `--axm-bridge-*` variable.

#### Contract obligations (paint transitions)

Chrome rules MUST NOT introduce paint transitions that can desynchronize theme changes.

Specifically, for Starlight chrome selectors:

- Chrome MUST NOT animate paint-bearing **real CSS properties** (not custom properties) during theme changes.
- Chrome MUST NOT use `transition-property: all` with a non-zero duration.

Paint-bearing properties include (non-exhaustive, but normative for enforcement):

- `color`
- `background`, `background-color`
- `border`, `border-color`, `border-*-color`, `border-inline-*-color`
- `outline`, `outline-color`
- `box-shadow`

Custom properties (names starting with `--`) are not classified as “real CSS properties” for this rule. They may participate in Axiomatic motion (via registered properties / `--tau`), but chrome must not add competing transitions on real paint properties.

Rationale: we want a single motion driver (`--tau`) and a single paint interface (bridge exports). Allowing ad-hoc paint transitions in chrome causes the exact failure mode we are trying to avoid: different regions update on different timelines.

Rationale: `--tau` is the system's single sanctioned motion driver for paint.
Independent transitions on border/bridge channels reintroduce timing-coupling
and make first-load behavior nondeterministic.

### Canonical contract spec (single source of truth)

The canonical spec object for the contract is maintained in:

- `src/lib/integrations/starlight/chrome-contract-spec.ts` (`STARLIGHT_CHROME_CONTRACT`)

This is intentionally shared so multiple consumers (CI and the in-page inspector)
cannot silently drift.

### Consumers (enforcement)

- CI MUST run a CSSOM rule sentinel that scans effective CSS rules (including
  `document.adoptedStyleSheets` and open Shadow DOM adopted stylesheets) and
  fails if the contract is violated.
- The in-page inspector SHOULD expose the same contract scan with the existing
  UX (highlight + Alt-click dump), to make violations debuggable during local work.

#### CSSOM detection requirements (normative)

The CSSOM sentinel and inspector scan MUST detect paint transitions structurally (not by substring heuristics alone).

For each CSS style rule whose selector matches the chrome scope:

1. Read `transition`, `transition-property`, `transition-duration`, and `transition-delay` from the rule (if present).
2. Determine whether the rule expresses a non-zero transition duration for any transition item.

- If duration is explicitly `0s`/`0ms` (or `transition: none`), it is not considered an animation source.
- If duration is non-zero, unknown (e.g. missing duration but shorthand implies default non-zero), or uses variables, treat it as potentially animated.

3. Determine the transitioned property list:

- If `transition-property` is present, split it on commas.
- Else, if `transition` is present, parse each comma-separated transition item and extract the property name.

4. For each transitioned property token:

- If the token is `all` and the transition is potentially animated, report a violation (`chrome-transition-all`).
- If the token starts with `--`, ignore it for the “paint transition” rule (it is a custom property).
- If the token matches any paint-bearing property name from the contract list above, report a violation (`chrome-transition-paint-prop`).

Notes:

- This rule is chrome-scoped on purpose: we want to support rich UI animations elsewhere (e.g. button hover states), but those should be driven by Axiomatic tokens/motion contracts within surfaces, not by ad-hoc theme-flip transitions inside vendor chrome.
- The sentinel is allowed to be conservative: if it cannot confidently prove the transition is `0s`, it should treat it as a risk and fail.

## Testing guidance (normative)

Tests MUST NOT assert private engine variable strings (e.g. `"var(--_axm-computed-fg-color)"`).

Preferred test style for adapters:

- Assert **computed equivalence**, not string equality.
- Example shape: a probe element painted via a foreign palette var (e.g. `color: var(--sl-color-text)`) must compute to the same color as a probe element painted via the intended bridge export (e.g. `color: var(--axm-bridge-fg-body)`).

This validates that the adapter truly routes foreign paint through the public integration API.
