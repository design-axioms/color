# RFC 011: Continuity Auditing v2 (Finite CSS Coverage, Palette-Flip Detection, and Modular Checks)

**Status**: In Progress  
**Date**: 2025-12-14  
**Author**: GitHub Copilot (GPT-5.2 Preview)

## Summary

This RFC upgrades our theming verification from “mostly correct, sometimes surprising” to a **systematic, finite-coverage auditing program** that catches:

- **Discrete palette flips** caused by mode toggles (e.g. Starlight `--sl-color-hairline` swapping instantly on `data-theme` change).
- **Time-zero pops** (changes that happen synchronously at toggle time, before the first `requestAnimationFrame`).
- **Transition-time snaps** (paint changes while the driver variable `--tau` is stable).

It also refactors the current monolithic tooling into a small set of composable modules so we can add new checks without ballooning `scripts/check-violations.ts` or `src/lib/inspector/continuity.ts`.

Deliverables:

1. A **coverage matrix** over contexts × element sets × property families.
2. A set of **pluggable checks** (`violations`, `continuity`, `snaps`, and a new `palette-flips` check).
3. A **trace-first ObservationLog** artifact (the “what happened” record) so new analyzers can be added without re-running the browser.
4. A refactored **measurement layer** built from a finite spec and **compiled probes** (snapshot/timeline collection + normalization) shared across checks.
5. A phase plan that maps directly into `docs/agent-context/brain/state/active_tasks.md`.

## Implementation Status (as of 2025-12-14)

- ✅ ObservationLog + session wrapper landed.
- ✅ Trace-first modular checks landed (`scenario` + `analyze`) with a small registry.
- ✅ `snaps` is replayable from ObservationLog (no browser needed for analysis).
- ✅ `Snapshot` probe exists and endpoint snapshots are logged (bounded payload) to support “measure once, analyze many.”
- 🚧 Not yet done: generalized `CompiledProbe` abstraction, structured report schemas for all checks, typed registry boundary cleanup, and golden log fixtures that ratchet replay behavior.

## Motivation

We recently observed a perceptual “hairline pop” during theme transitions on the docs site.

- Root cause: Starlight’s hairline borders were painted using **mode-swapped palette variables** (`--sl-color-hairline` → `--sl-color-gray-6`) which changed **immediately** when `data-theme` toggled.
- Meanwhile, Axiomatic surfaces and text were animating continuously via `--tau`.
- Result: borders jumped to their final color early (“pop”), even though most of the UI was smooth.

Why we did not catch it earlier:

- The existing “continuity audit” is a **frozen-`--tau`** snapshot comparison across a `data-theme` toggle. It is not designed to prove “no mid-transition pops.”
- Transition-time sampling must include **time-zero** evidence (immediately after toggle) and must cover the **actual painted properties** used by the chrome (`border-right-color`, `border-bottom-color`, etc.).

This RFC makes those proof obligations explicit and codifies tooling to meet them.

## Invariants (Why We Missed It)

These are the invariants that fell out of the debugging work and should remain “obvious truths” when we evolve the tooling:

- **Invariant A (Scope):** Frozen-`--tau` continuity can only catch **theme-dependent changes at a fixed `--tau`**. It cannot prove “no pops during an actual transition timeline.”
- **Invariant B (Timing):** Any variable that flips synchronously on `data-theme` can produce a **time-zero pop** even if the rest of the system animates smoothly. If we don’t sample immediately after the toggle (before the next rAF), we can miss it.
- **Invariant C (Surface area):** If we don’t explicitly include the _actual painted property_ (e.g. `border-right-color` on Starlight chrome), we can’t detect the pop even with perfect timing.

## Goals

- **G1 — Finite coverage, explicit scope**: Define what we test and why, using a finite list of paint-relevant CSS properties.
- **G2 — Catch discrete palette flips**: Detect variables and computed paint that change on `data-theme` toggle while `--tau` is pinned.
- **G3 — Catch time-zero pops**: Sample before toggle and immediately after toggle (same task) to capture synchronous changes.
- **G4 — Catch transition-time snaps**: During real transitions, detect paint changes that occur while `--tau` is stable.
- **G5 — Attribution**: For any detected problem, report likely cause (winning rule + variable references).
- **G6 — Maintainability**: Make adding a new check a new module, not edits to a giant `main()`.
- **G7 — Bounded runtime**: Run deterministically and within a predictable budget (caps on sampled elements/frames).

## Non-goals

- Simulating every browser’s native UI chrome (e.g. OS-level select dropdown popups).
- Proving “no visible change whatsoever” during a transition; **continuous** changes are expected when `--tau` moves.
- Full cross-browser parity for every modern color serialization (we normalize for measurement, not for rendering parity).

## Glossary

- **Driver variable**: `--tau`, the Axiomatic “time” parameter.
- **Pinned tau**: setting `--tau` to a specific numeric value with `!important` so it cannot transition.
- **Palette flip**: a mode toggle changes a palette variable (e.g. `--sl-color-*`) while `--tau` is pinned.
- **Time-zero sample**: a measurement taken immediately after a toggle, before waiting for `requestAnimationFrame`.
- **Tau-stable snap**: paint changes that occur while `|tau(t) - tau(t-1)| ≤ ε`.

## Axioms (Hard Constraints)

### Axiom 1: Checks must be explicit about what they prove

Each check documents:

- its scope (static vs transition-time),
- its sampling strategy,
- and its failure semantics.

### Axiom 2: A “snap” is defined relative to `--tau`

A change is a **snap** only when:

- the measured paint delta is large **and**
- `--tau` is stable (within an epsilon).

This avoids mislabeling normal continuous transitions as “snaps.”

### Axiom 3: Time-zero sampling is mandatory for mode toggles

Any check that toggles `data-theme` MUST capture:

1. before state,
2. immediately-after-toggle state,
3. (optional) subsequent frames.

### Axiom 4: Measurement uses normalized values

Computed colors may be serialized as `rgb(...)`, `oklch(...)`, `oklab(...)`, or `color(srgb ...)`. The measurement layer MUST normalize to a canonical representation (e.g. `rgba(r,g,b,a)`) for stable delta computation and reporting.

### Axiom 5: Checks do not touch Playwright

Checks (the units we want to evolve quickly) MUST be written against:

- a recorded **ObservationLog** (pure analyzers), and/or
- a narrow **capability surface** (impure scenarios) that the runner provides.

No check module is allowed to depend on Playwright types or hold a `page` reference. This is a design-level guardrail to prevent re-growing a monolith.

### Axiom 6: Keep the spine branch-free (anti-glue)

The runner/orchestrator must not accrete check-specific branching or duplicated “plumbing” logic.

- Scenario configuration is derived via module hooks (builders).
- Analysis is pure over artifacts.
- Output formatting is owned by modules, not duplicated by the runner.

This RFC’s “anti-glue” rule is a local application of the project-wide Law of the Stable Spine in docs/design/theory/axioms/11-stable-spine.md.

## Coverage Matrix (Finite CSS Spec Framing)

We treat the CSS surface as finite by focusing on **paint-relevant property families** and a bounded element set.

### Context grid

We cover these contexts:

1. **Static modes**: `data-theme ∈ {light, dark}`
2. **Pinned tau snapshots**: `--tau ∈ {+1, 0, -1}` (or configurable)
3. **Transition timeline**: real transition from `--tau: +1 → -1` (or reverse) while toggling `data-theme` as the site expects

### Element sets

We use a tiered approach:

- **Primary chrome selectors**: a small canonical list that covers the docs site chrome (body/page/header/sidebar/theme toggle, etc.).
- **Representative content selectors**: markdown content root + code block title chip, etc.
- **Bounded visible sample**: up to N visible elements with non-trivial paint (e.g. alpha ≥ 0.02 on background) for broad detection.

### Painted hairlines contract (Docs chrome)

For Starlight chrome (and any other “site shell” UI), we explicitly treat these as first-class, non-optional signals:

- `border-*-color` (all sides)
- `outline-*`
- `box-shadow`

The primary purpose is to avoid a repeat of “hairlines pop but everything else is smooth” failures.

### Property families (finite list)

We audit the following families:

**Color paint** (continuous):

- `color`
- `background-color`
- `border-top-color`, `border-right-color`, `border-bottom-color`, `border-left-color`
- `outline-color`
- `text-decoration-color` (future; not required for v2 MVP)

**Geometry / visibility** (can “snap” perceptually):

- `border-*-width`
- `outline-width`, `outline-style`, `outline-offset`

**Discrete paint**:

- `box-shadow`

**Optional future families** (explicitly deferred):

- `filter`, `backdrop-filter`, `opacity` (for fades)
- SVG `fill`/`stroke`

## Proposed Checks

All checks share a common measurement layer (“snapshot”), but the architecture is **trace-first**:

- A check defines a **scenario** (what to do / when to sample).
- The runner executes the scenario via a capability-based session and records an **ObservationLog**.
- A check then analyzes the ObservationLog (pure) to produce failures.

This makes checks easier to reason about (most logic becomes pure analysis) and enables retroactive analysis of historical runs.

## Engineering Guardrails (Anti-Glue / Trace-First)

This section captures the adjacent improvements implied by the RFC goals. Some are already implemented; the rest are explicit follow-ups.

### 1) Builders instead of runner branching (implemented)

Each check provides typed builders to derive:

- `scenarioOptions` (how to measure)
- `analyzeOptions` (how to interpret)

This keeps the runner generic and avoids check-name conditionals.

### 2) Pure analysis + module-owned printing (implemented)

Analysis is pure over `ObservationLog`, and checks own the human-facing output contract (`print(...)`). The runner sequences and sets exit codes.

### 3) Reports become first-class (partially implemented)

Checks should return a stable, structured `Report` shape (even on failure) that can be tested and replayed without relying on console JSON blobs. We have the shape in place; the remaining work is to:

- eliminate “escape hatch” `unknown` where practical,
- version report schemas when needed.

### 4) Centralize output policy without centralizing content (planned)

To prevent output drift across checks, introduce a tiny shared printing helper (header/json/table blocks) while keeping check-specific content in the module.

### 5) Expose analyzer knobs through CLI via builders (planned)

Move thresholds/epsilons/debug toggles into the CLI surface so tuning doesn’t require code edits, but still flows through module-owned option builders.

### 6) Log capabilities + better replay errors (planned)

Make “what this log contains” explicit (or derived consistently) so replay failures can say:

> this log contains continuity only; re-run with `--snaps` to collect `measure:snaps`

### 7) Golden log fixtures (planned)

Add fixture logs and unit tests that ratchet replay behavior (analysis + report + printing conventions where feasible). This enforces “measure once, analyze many” as a deterministic contract.

### 8) Shared log helpers (planned)

Deduplicate common log parsing/search patterns (`asObservationLog`, `findLastEvent`, measurement type listings) to avoid subtle divergence between checks.

## Systematic Method (Algorithmic Stages)

This is the “finite-spec” workflow we use to find remaining problems in a bounded, repeatable way.

### Stage 1: Static swap detector (tau locked)

Goal: Find **discrete flips** that occur when `data-theme` changes, regardless of transition behavior.

Method:

- Pin `--tau` (recommended default: `--tau: 0 !important`, optionally also sample `+1` and `-1`).
- Toggle `data-theme`.
- Flag any changes in:
  - the audited property families on the canonical chrome selectors and representative content selectors, and
  - a watched variable set (e.g. `--sl-color-*`).

This stage is where `palette-flips` lives.

### Stage 2: Transition snap detector (tau moving)

Goal: Catch **paint snaps** that occur during the transition timeline.

Method:

- Run a real transition (the same toggle path the site uses).
- Always include a time-zero snapshot (immediately after toggle).
- Sample per frame up to caps.
- Only flag “snap” events when the paint delta is large AND `--tau` is stable (within epsilon).

This stage is where `snaps` lives.

### Stage 3: Attribution

Goal: Turn failures into actionable fixes quickly.

Method:

- For each flagged element/property, record:
  - the winning CSS rule (selector + importance + stylesheet hint),
  - any relevant variable references (especially theme palette vars like `--sl-color-*`), and
  - raw computed values alongside normalized values when helpful for debugging.

### Check: `violations` (existing)

Purpose: Validate Axiomatic “surface/text correctness” per the existing inspector-derived rules.

Scope: static, deterministic.

### Check: `continuity` (existing, clarified)

Purpose: With `--tau` pinned, toggle `data-theme` and detect any **discrete paint changes** that are not permitted.

This check is designed to catch:

- palette flips that affect computed paint at a fixed tau,
- rule-driven discontinuities at mode toggle.

It is NOT designed to prove smoothness over time.

### Check: `snaps` (existing, formalized)

Purpose: During an actual theme transition, detect **tau-stable snaps**.

Minimum algorithm:

1. Capture before state.
2. Toggle mode and set up a real transition.
3. Capture time-zero state (immediate after toggle).
4. Capture per-frame states for up to a cap.
5. For each consecutive pair, compute paint deltas and flag events where:

- delta > threshold AND
- tauStable (|Δtau| ≤ ε)

### Check: `palette-flips` (NEW)

Purpose: Prove that the “bridge boundary” variables do not swap discretely in ways that can cause perceptual pops.

Behavior:

- Pin `--tau` at a set of sample values (default: +1, 0, -1).
- Toggle `data-theme`.
- For each pinned tau, record:
  - watched variable values (e.g. `--sl-color-hairline`, `--sl-color-gray-*`),
  - key computed paint properties on chrome elements.

Fail when:

- any watched var changes **and** it is part of a “must-be-continuous” set, OR
- computed paint changes in a way that violates the continuity contract.

Notes:

- This check is the systematic form of the debugging we did manually for hairlines.

Output contract:

- Report watched variables that changed at pinned tau.
- Classify each changed variable as either:
  - **must-remap** (should be driven by Axiomatic computed vars / `--tau`), or
  - **explicitly-exempt** (documented reason it is allowed to be discrete).

## Attribution (Required Output)

When a check fails for an element/property, the report MUST include:

- selector (stable-ish)
- property
- before/after (normalized values where applicable)
- the winning CSS rule (selector, importance, stylesheet hint)
- a variable reference trace when possible (e.g. `var(--sl-color-hairline)` ultimately depends on `--sl-color-gray-6`)

## Tooling Architecture (Refactor)

### Problem statement

`scripts/check-violations.ts` has grown into a multi-check CLI, browser injector, sampler, normalizer, reporter, and dispatcher. `src/lib/inspector/continuity.ts` has similarly accumulated responsibilities.

### Solution: trace-first + capability harness + spec-compiled probes

We explicitly separate:

- **Control plane** (navigation / theme & tau control / timing),
- **Measurement plane** (probes + normalization),
- **ObservationLog** (the durable record),
- **Analyzers** (pure check logic),
- **Reporting** (format + artifact IO).

This is not “split the file into smaller files.” It is an architectural constraint that prevents accidental coupling between checks and Playwright.

#### Object model (encapsulation-first, no inheritance)

To keep the refactor stable over time, we bias toward **small self-contained data structures** and **simple classes with methods** rather than a large amount of free-floating glue code.

The goal is not “OOP everywhere.” The goal is:

- invariants are enforced by objects,
- data is serializable and replayable,
- browser/Playwright knowledge is encapsulated.

Core objects:

- `ObservationLog` (data): the durable record of what happened.
- `ObservationLogRecorder` (class): append-only writer with a stable schema.
- `CheckViolationsSession` (class): owns Playwright lifecycle + hardening; exposes control-plane methods.
- `MeasurementHost` (interface): environment adapter for “run this probe” + timing primitives.
- `ThemeTimeController` (interface): environment adapter for theme/time mutations (must call the theme system API in the overlay).
- `MeasurementSpec` (class): the finite “what to measure” spec; validates itself and compiles into probes.
- `SnapsProbe` (class): the executable measurement program for transition timelines (today’s first “compiled probe”).
- `CompiledProbe` (future): generalized probe abstraction for snapshot + timeline programs.
- `Snapshot` (future) / `Timeline` (data + methods): measured outputs with domain operations (diffing, snap detection).
- `Rgba` (value object): canonical color parsing/formatting + distance.
- `CheckModule` (object): `{ id, description, scenario(), analyze() }` where `analyze()` is pure.

Host adapters (two supported environments):

- **CLI runner** (Node + Playwright)
  - `PlaywrightHost`: implements `MeasurementHost` via `page.evaluate`, `performance.now`, `requestAnimationFrame` utilities.
  - `PlaywrightThemeTimeController`: drives theme/tau deterministically (clicking the toggle or calling site APIs).

- **Debugging overlay** (in-page, user-driven)
  - `DomHost`: implements `MeasurementHost` by directly running probe functions in-page (no Playwright).
  - `OverlayThemeTimeController`: calls the theme system API (never sets `data-theme` directly).

This keeps the domain objects (`MeasurementSpec`, probe layer (e.g. `SnapsProbe` today), `Snapshot`/`Timeline`, `Rgba`, analyzers) reusable across CLI and overlay.

Architectural guardrails:

- **Only** `CheckViolationsSession` may import Playwright.
- **Only** probe modules (`SnapsProbe` today; generalized `CompiledProbe` later) may run browser-side measurement code (e.g. `evaluate`/in-page probe execution) via a `MeasurementHost`.
- Checks may not invent ad-hoc measurement logic; they must request measurements via probes.

Overlay-specific guardrails:

- Overlay measurement is **read-only by default**. Any mutation (freeze animations, pin tau, forced focus) must be an explicit user action in the overlay UI.
- Overlay theme changes must go through `ThemeTimeController` and thereby the site’s theme system API.

#### 1) Runner: CLI + orchestration (Node)

Create a directory: `scripts/check-violations/`

- `scripts/check-violations/cli.ts` — parse args, choose check, build options
- `scripts/check-violations/run.ts` — launch session, execute scenario(s), write logs/artifacts, run analyzers, print results
- `scripts/check-violations/index.ts` — registry of checks (map `id → module`)

`node scripts/check-violations.ts` remains as a thin entry point that delegates to `run.ts`.

Key rule: `run.ts` owns Playwright.

#### 2) Session: capability-based browser harness (impure)

Introduce a session wrapper (a small class) that exposes **capabilities**, not Playwright objects. Example capabilities:

- Theme control: `getTheme()`, `setTheme()` / `toggleTheme()`
- Tau control: `pinTau(value)`, `unpinTau()`
- Motion control: `reduceMotion()` / `freezeAnimations()`
- Sampling: `sampleSnapshot(spec)` and `sampleTimeline(plan)`

The runner passes only the minimum required capabilities to a scenario.

Session responsibilities:

- dialog/beforeunload hardening (cannot hang CI)
- headless-by-default launch behavior
- deterministic waiting utilities
- recording ObservationLog events

Note: The debugging overlay uses a different “session” concept. In the overlay, `DomHost` + `OverlayThemeTimeController` replace Playwright session capabilities while still producing the same ObservationLog schema.

#### 3) Probes: spec-compiled measurement (measurement plane)

Instead of ad-hoc `page.evaluate` blocks scattered across checks, we define a **finite measurement spec** and compile it into a small number of browser-side probe programs.

Key refactor principle:

- checks do not “measure”; checks request measurements.
- measurement is a program object (a probe) derived from a spec object (`MeasurementSpec`).

Proposed modules:

- `scripts/check-violations/browser/spec.ts`
  - `MeasurementSpec` (selectors, property families, caps) + validation + defaults
- `scripts/check-violations/browser/probes.ts`
  - `MeasurementHost` interface + `SnapsProbe` (timeline capture) + `Timeline` domain methods
- `scripts/check-violations/browser/normalize.ts`
  - `Rgba` value object + canonical normalization and numeric parsing helpers

Note: In the current implementation, “selectors + bounded sampling strategy” are encoded in the `MeasurementSpec` defaults rather than a separate `selectors.ts` module.

Recommended outputs:

- `Snapshot` object that stores both raw computed values and normalized values (future)
- `Timeline` object that stores ordered frames, plus helper methods like `findTauStableSnaps({ epsilon, threshold })`

#### 4) Checks as plugins (scenario + analyzer)

`scripts/check-violations/checks/`:

- `violations.ts`
- `continuity.ts`
- `snaps.ts`
- `palette-flips.ts`

Each exports a `CheckModule` object with:

- `id: string`
- `description: string`
- `scenario(session, options) => Promise<void>`
  - impure, but only uses `CheckViolationsSession` methods + probes
  - records measurements/events into the `ObservationLogRecorder`
- `analyze(log, options) => CheckResult`
  - pure and deterministic; operates on saved logs

Notes:

- `scenario` is allowed to be impure, but must only use the provided capabilities.
- `analyze` must be pure and deterministic.
- Both must be small and cohesive; complex logic belongs in `Snapshot`/`Timeline` domain methods.

#### 5) ObservationLog (shared schema)

Define a stable schema used by continuity + snaps + palette-flips.

At minimum:

- `RunConfig` (URL, selectors strategy, caps, thresholds, initial theme, headed/headless)
- `Event[]` (append-only)
  - control events: `theme:set`, `tau:pin`, `tau:unpin`, `motion:reduce`, `nav:goto`
  - measurement events: `snapshot`, `timelineFrame`

Each `snapshot` contains:

- `tau` (as read from the page)
- per-element paint properties (raw computed + normalized)
- optional watched variable values

The ObservationLog is written as a JSON artifact so we can re-run analyzers without a browser.

### Acceptance criteria

- The top-level entry point stays small (roughly “parse args → dispatch check → print result”).
- Adding a new check is: add one file in `scripts/check-violations/checks/` + one registry entry.
- Property-family capture lists live in one place and are reused by both continuity + snaps.
- Check modules do not import Playwright and cannot access `page`.
- Check modules do not contain ad-hoc browser measurement code; measurement code lives behind the probe layer.
- A run can optionally emit a standalone ObservationLog JSON artifact that is sufficient to re-run analyzers.
- The same `MeasurementSpec`/probe layer/`Snapshot`/`Timeline`/`Rgba` objects can run in two environments:
  - CLI runner (Playwright-backed)
  - debugging overlay (in-page host, API-driven theme/time control)

## Debugging Overlay Integration (Axiomatic Inspector)

The in-page debugging overlay (“inspector overlay”) has different operational constraints than the CLI runner. This RFC explicitly supports both.

### Overlay constraints (hard requirements)

- **Theme/time is API-driven**: the overlay must not set `data-theme` directly; it must call into the theme system API.
- **Read-only by default**: measurement should not change site behavior unless the user explicitly toggles an audit mode.
- **Element-scoped UX**: the overlay primarily inspects a selected element and its local chrome context; full-page sampling is an explicit “scan mode.”

### Overlay workflows enabled by this architecture

1. **Element snapshot**

- Run a snapshot probe (future: `CompiledProbe.snapshot(...)`) for the selected element (and mandatory chrome selectors) and show:
  - normalized paint values,
  - winning rule,
  - var ref trace.

2. **User-driven timeline**

- Record a short timeline while the user toggles theme.
- Analyze with `Timeline.findTauStableSnaps(...)` and render actionable attribution inline.

3. **Export / repro bridge**

- Overlay can export an `ObservationLog` artifact (copy/paste JSON or download) so the CLI analyzers can re-run on the exact same observations.

### Refactor of `src/lib/inspector/continuity.ts`

- Keep “inspector continuity” as a library capability, but:
  - extract property capture lists to a shared module (if used in multiple places),
  - separate **measurement** (collect computed values) from **policy** (what is a violation).

## CLI / UX

We standardize on:

- `pnpm check:violations -- --violations <url>`
- `pnpm check:violations -- --continuity <url>`
- `pnpm check:violations -- --snaps <url>`
- `pnpm check:violations -- --palette-flips <url>`

Shared options:

- `--headed`
- `--screenshot-dir <dir>`
- `--snaps-theme <light|dark>` (force initial theme)
- `--snaps-focus` (ensure outline presence)

New options (proposed):

- `--tau-samples "+1,0,-1"`
- `--watch-vars "--sl-color-hairline,--sl-color-gray-6"`

## Testing Strategy

### Unit tests (fast)

- normalization functions (parse + canonicalize)
- delta computation
- tau-stability gating logic

Additional (trace-first):

- analyzers operate on saved ObservationLog fixtures (no browser)

### Playwright smoke tests

- one representative page per check mode
- one “known-past-pop” regression case

### Regression registry

Maintain a small list of URLs + selectors/properties representing past failures.

The registry is used to:

- prevent regressions,
- ensure we don’t accidentally narrow coverage.

## Performance / Determinism

### Default parameters (v2)

These defaults are intentionally conservative and are designed to be stable across runs. All values MUST be overrideable via CLI options.

| Parameter                     |      Default | Used by                                    | Notes                                                                                |
| ----------------------------- | -----------: | ------------------------------------------ | ------------------------------------------------------------------------------------ | ---- | ----- |
| Tau samples (`--tau-samples`) |    `+1,0,-1` | `palette-flips`, (optionally) `continuity` | Covers endpoints + midpoint.                                                         |
| Tau-stable epsilon (`ε`)      |       `0.02` | `snaps`                                    | Tau stable means `                                                                   | Δtau | ≤ ε`. |
| Color delta threshold         |         `35` | `snaps`                                    | Threshold on normalized RGBA distance; tune only with regressions.                   |
| Frame cap (`--frame-cap`)     |        `180` | `snaps`                                    | Upper bound on samples; also cap by transition duration when known.                  |
| Element cap (`--element-cap`) |        `180` | all checks using bounded visible sampling  | Keeps runtime bounded; chrome selectors are always included in addition to this cap. |
| Visible sample alpha cutoff   |       `0.02` | bounded visible sampling                   | Skip near-transparent backgrounds to reduce noise.                                   |
| Time-zero sample              | **required** | `snaps`, `palette-flips`, `continuity`     | Must measure immediately after toggle, before waiting for rAF.                       |

Rationale:

- The element + frame caps bias toward catching “chrome pops” quickly while preventing pathological runtimes on dense pages.
- The tau-stable gating is the core false-positive control: we only call something a “snap” when paint changes without the driver moving.

- Cap sampled elements (default N=180 for broad sample).
- Cap frames (default: enough frames to cover transition duration, with a hard max).
- Thresholds:
  - delta threshold (e.g. 35 in RGBA Euclidean distance)
  - tauStable epsilon (e.g. 0.02)

These values are part of the check contract and are configurable, but defaults should be stable and conservative.

## Migration Plan (Stepwise, Green at Each Step)

1. **Introduce ObservationLog (no behavior change)**

- define schema + write as optional JSON artifact
- keep existing console output identical

2. **Wrap Playwright in a capability session (no behavior change)**

- runner owns Playwright
- checks/scenarios receive only capabilities
- add hard requirement: dialogs/beforeunload cannot block

3. **Introduce encapsulated measurement objects**

- implement `MeasurementSpec`, `Rgba`, and the first compiled probe(s) (`SnapsProbe` + `Timeline`)
- centralize selector sets, property families, normalization and delta logic
- migrate existing sampling code to call probe methods (no ad-hoc evaluate)

4. **Port one check end-to-end as “scenario + analyze”**

- pick either `continuity` or `snaps`
- ensure analyzer can re-run on saved logs

Status note:

- `snaps` now uses `MeasurementSpec` + `SnapsProbe` + `Timeline.findTauStableSnaps(...)`, but it still runs the measurement live (it is not yet replaying from ObservationLog-only).

5. **Port remaining checks + add `palette-flips`**

- start with Starlight watchlist (`--sl-color-*`)
- add clear failure output + attribution

6. **Add regression registry**

- include known hairline pop selectors and ensure it stays green

## Phase Plan (Mapping to `active_tasks.md`)

These items are intended to be copied into `docs/agent-context/brain/state/active_tasks.md` as the next phase’s checklist.

1. **RFC011: Coverage matrix codified**
   - Write a short `docs/agent-context/.../css-check-coverage.md` excerpted from this RFC (optional), or rely on this RFC directly.

2. **Refactor `check-violations` into modules (no behavior change)**
   - create `scripts/check-violations/{cli,run,index}.ts`
   - keep `scripts/check-violations.ts` as a thin entrypoint

3. **Introduce session + ObservationLog artifact**

- add a capability-based session wrapper (runner owns Playwright)
- add optional JSON ObservationLog output sufficient for re-running analyzers
- enforce non-blocking automation (dialogs/beforeunload)

4. **Extract finite spec + compiled probes (measurement plane)**

- create `scripts/check-violations/browser/{spec,probes,normalize}.ts`
- implement `MeasurementSpec` + probe entrypoints as the only measurement entrypoints
- implement `Snapshot`/`Timeline` domain objects with methods (diffing, snap detection)
- keep normalization + delta computation in one place (`Rgba`)

5. **Make checks pluggable (scenario + analyzer)**

- create `scripts/check-violations/checks/*` exporting a `CheckModule` object
- register checks in `scripts/check-violations/index.ts`
- ensure check modules do not import Playwright

6. **Add `palette-flips` check**
   - implement variable watchlist + pinned tau sampling
   - add attribution output

7. **Refactor `src/lib/inspector/continuity.ts` for maintainability**
   - separate measurement from policy
   - centralize property-family capture definitions

8. **Add regression registry + CI gate**
   - add a minimal set of known URLs
   - run in CI as part of `check` or a dedicated task

## Risks and Mitigations

- **Risk: false positives due to sampling gaps**
  - Mitigation: time-zero sampling + tau-stable snap definition; cap runtime but ensure early samples always happen.

- **Risk: selector drift in Starlight**
  - Mitigation: keep a minimal, well-chosen set of stable chrome selectors; fall back to bounded visible sample.

- **Risk: normalization differs from true display in some corner cases**
  - Mitigation: normalization is only for delta/reporting; failures should include raw computed values as optional debug fields.

## Alternatives Considered

- Expanding the continuity audit to “just do everything”: rejected due to scope confusion. Static continuity and transition-time snaps have different proof obligations.
- Relying purely on visual screenshot diffs: rejected as primary signal (useful adjunct, but slower and more brittle).
- “Just split `run.ts` into smaller files”: rejected as a primary strategy; file boundaries without capability/trace constraints do not prevent coupling or future monolith growth.

## Open Questions

1. Should `palette-flips` fail on _any_ watched var change, or only on vars in a “must-be-continuous” allowlist?
2. Do we want cross-browser runs (Chromium + WebKit) for the checks, or keep it Chromium-only for determinism?
3. Do we want to treat `text-decoration-color` and SVG paint as v2 scope or v3?
