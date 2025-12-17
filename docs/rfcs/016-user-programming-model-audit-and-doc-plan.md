# RFC 016: User Programming Model Audit and Doc Plan

- **Author**: (audit agent)
- **Status**: Draft (living audit)
- **Audit mode**: User Simulator + Sentinel
- **Constraint (preferred)**: Keep this RFC as the primary accumulating artifact.
- **Exception (explicit)**: The Inspector overlay remediation behavior was updated to match the user programming model (`src/lib/inspector/overlay.ts`, `src/lib/inspector/view.ts`).
- **Tooling note**: `exo rfc` is currently unusable in this repo due to missing `docs/agent-context/plan.toml`; RFC created manually with the agreed numbering.

## 1. Summary

This RFC is a single, accumulating audit artifact that compares the _stated_ user programming model (vision/personas/axioms/RFCs + user-facing docs) to the _observed_ implementation (CLI, runtime API, integration glue, enforcement scripts, Theme Builder, Inspector).

It produces:

- A claim ledger (docs → code verification)
- An undocumented capability ledger (code → doc proposal)
- Persona-aligned “golden path” toolchains
- A STOP list of conflicts requiring explicit decisions

## 2. Motivation

Axiomatic Color’s value depends on users having a coherent mental model: what to install, which entry points exist, what outputs are deterministic, how integrations are supposed to work, and what constraints are enforced.

This audit aims to make the taught model and the required model converge, without prematurely refactoring the system.

## 3. Scope

### In scope

- Normative sources: vision, personas, axioms, integration RFCs (and transitive normative references).
- User-facing docs: CLI docs, JavaScript API docs, integration guide.
- Implementation reality:
  - CLI (`axiomatic`) behavior and outputs
  - Runtime JS API exports/import paths
  - ThemeManager / integration sources contract
  - Adapters / bridge exports / boundaries enforcement
  - Theme Builder behaviors and implied contracts
  - Inspector / debug overlay behaviors and implied contracts
  - Enforcement scripts and “tripwires” that affect user workflows

### Out of scope

- Implementation changes of any kind (refactors, behavior changes, “quick cleanups”).

### Audit epochs

- Epoch 0 — Orient: read normative sources + user docs; populate “Stated model” + initial claim ledger.
- Epoch 1 — CLI contract: verify docs vs implementation.
- Epoch 2 — Runtime theme contract: verify ThemeManager + helpers vs exports/behavior.
- Epoch 3 — Integration boundaries: adapters + “no plumbing,” plus enforcement mechanisms.
- Epoch 4 — Theme Builder: inventory major behaviors; produce doc proposals aligned to personas.
- Epoch 5 — Inspector/debug overlay: inventory behaviors and contracts; propose coherent docs.
- Epoch 6 — Composition audit: unify into persona workflows; flag feature islands and conflicts.

## 4. User Programming Model (Stated)

This section is built from extracted claims from:

- Normative: `docs/vision.md`, `personas.md`, axioms index + `04-integration.md`, and RFCs 010/013/014 (+ referenced RFCs).
- User-facing: CLI docs, JS API docs, integration guide.

### 4.1 Key primitives (as stated)

#### Deterministic physics engine

- The system is a deterministic solver: given the same configuration, outputs are stable/identical.
- Color is expressed as $\text{Color} = f(\text{Context}, \text{Intent})$ (not a static palette).

#### Context + intent via surfaces and semantic tokens

- “Surfaces are containers” that establish context; context flows down.
- Users author _intent_ via semantic class tokens (`surface-*`, `text-*`, `hue-*`, etc.), not by choosing hex colors.

#### Integration boundary model (no plumbing)

- Consumer code must not “address the engine” by reading/writing CSS variables like `--axm-*` / `--_axm-*`.
- Foreign paint systems (e.g. Starlight’s `--sl-*`) are integrated via _adapters_ and _bridge exports_, not scattered overrides.
- Theme mode changes are bridged through a runtime API (`ThemeManager`) that writes _semantic state_ on a root element, not CSS variables.

### 4.2 Supported user intents (as stated)

- Generate theme tokens from a JSON configuration via CLI (`axiomatic`).
- Integrate generated CSS into any framework by loading CSS + placing a root surface class.
- Use semantic classes in markup for UI composition (card/button patterns).
- Support dark mode automatically by default (system preference), optionally with manual toggle.
- Optional runtime control through `ThemeManager` for toggles, favicon/meta syncing.

### 4.3 Contracts and boundaries (as stated)

#### Normative integration/consumer contracts

- RFC010: authored code must not hardcode colors and must not reference engine variables; must use library-provided class tokens.
- RFC013: foreign variables must be confined to a single bridge file per adapter; adapters consume bridge exports (not engine-private variables).
- RFC014: `ThemeManager` is the runtime integration surface; no JS/TS writes to `--tau` or any `--axm-*`/`--_axm-*`/`--sl-*` variables.

#### Doc-level integration contract (as taught)

- CLI is the primary tool for generating tokens.
- Integration is “standard CSS first”: import the generated CSS; apply `surface-page` on `<body>`.
- Manual toggle strategy in docs: add `force-dark` / `force-light` classes.
- Runtime docs teach `ThemeManager` import path: `@axiomatic-design/color/browser`.

### 4.4 Determinism / provenance / auditing (as stated)

- Determinism is a governing axiom (“bit-for-bit identical outputs”).
- “Auditing” exists as a user concept (CLI `audit` command in docs), and as a broader project practice (golden masters, sentinels, provenance).

### 4.5 Epoch 0 extracted claims (seed list)

These are _claims_ stated in docs/axioms/RFCs that must be verified against implementation in later epochs.

- CLI supports: `init`, `build` (default), `export`, `audit`.
- CLI usage uses `npx axiomatic ...` and supports `pnpm add -D` and `npm install -D` installation.
- `build` defaults: `--config ./color-config.json`, `--out ./theme.css`; supports `--watch`.
- `export` supports formats: `dtcg`, `tailwind`, `typescript`, with specified default output locations.
- `audit` performs schema validation + contrast compliance + polarity logic checks.
- Runtime JS API exports `ThemeManager`, `updateThemeColor`, `updateFavicon` from `@axiomatic-design/color/browser`.
- `ThemeManager` default behavior: if `lightClass`/`darkClass` omitted, it sets `style="color-scheme: ..."` on the root.
- Integration guide: default dark mode uses `light-dark()` + media queries; manual toggle uses `force-dark`/`force-light` classes.
- Integration + runtime axioms: runtime must not write/read CSS variables as integration; mode must be represented as engine-owned semantic state on the root.

## 5. User Programming Model (Observed)

### 5.1 CLI contract (observed; Epoch 1)

Entry points:

- Package exposes bin `axiomatic` via `package.json#bin` → `bin/axiomatic.js` → `dist/cli/index.js`.
- Source CLI implementation is in `src/cli/index.ts` and delegates to per-command modules in `src/cli/commands/*`.

Commands (observed):

- `axiomatic init`
  - Creates `color-config.json` in CWD.
  - Writes `$schema: "node_modules/@axiomatic-design/color/color-config.schema.json"` plus the library default config.
  - Errors if `color-config.json` already exists.
- `axiomatic build [--config <path>] [--out <path>] [--watch] [--copy-engine]`
  - Defaults: `configPath = "color-config.json"`, `outPath = "theme.css"`.
  - Writes CSS output to `--out`.
  - Also emits a solver-derived class-token manifest alongside the output: `theme.class-tokens.json` (or `<out>.class-tokens.json`).
  - Optional: `--copy-engine` copies `engine.css` next to the theme output.
- `axiomatic export [--config <path>] [--out <path>] [--format dtcg|tailwind|typescript]`
  - Defaults: `configPath = "color-config.json"`, `format = "dtcg"`.
  - Default `--out` depends on format:
    - `dtcg`: `tokens` (directory)
    - `tailwind`: `tailwind.preset.js`
    - `typescript`: `theme.ts`
  - `dtcg` supports a “single JSON file” mode when `--out` ends with `.json`.
- `axiomatic audit [--config <path>]`
  - Runs JSON schema validation (if schema is discoverable) and a logic audit.
  - Contrast/polarity findings are reported as warnings in the current implementation (errors are used for schema/solver failures).
- `axiomatic import <file> [--out <file>] [--dry-run]`
  - Imports DTCG tokens into a solver config.
  - Default output is `color-config.json`.

Default behavior:

- If invoked with no command (or only flags), it runs `build`.
- It also supports a legacy invocation form: `axiomatic <config> <out>` which is treated as `build --config <config> --out <out>`.

### 5.2 Integration boundaries & enforcement (observed; Epoch 3)

The repo contains several enforcement mechanisms that operationalize RFC010/RFC013 constraints.

#### RFC010 compliance gate (consumer layers)

- Script: `scripts/check-rfc010.ts`
- Scope (as implemented): scans `site/src/**/*.{css,astro,svelte,ts,tsx,js,jsx}` and `examples/**/src/**/*.{css,ts,tsx,js,jsx,html,astro,svelte}`.
- Explicit exclusions (not exhaustive): generated theme CSS (`css/theme.css`, `site/src/styles/theme.css`), engine CSS (`css/engine.css`), `dist/**`, `vendor/**`.
- Key enforced boundaries:
  - No `var(--_axm-*)` anywhere in scanned files.
  - No `var(--axm-*)` anywhere in scanned files.
    - Exception: `var(--axm-bridge-*)` is allowed only in `site/src/styles/starlight-custom.css` (adapter bridge file).
  - No raw color literals and no common color functions in scanned files.
  - `--sl-*` variables are permitted only inside `site/src/styles/starlight-custom.css`.
  - Class-token usage in static markup (`.astro`/`.svelte`/`.html`) is validated against policy allowlists.

Implication for user programming model:

- The project treats “engine addressing” and “foreign paint variables” as a hard boundary in consumer layers, with file-level allowlists.

#### Starlight chrome continuity contract (enforced)

There are multiple layers of enforcement preventing “border popping” regressions in Starlight chrome:

- Static, source-level sentinel: `scripts/check-starlight-adapter-contract.ts`
  - Requires a marker block in `site/src/styles/starlight-custom.css`.
  - Denies `border*: currentColor` in the chrome contract block.
  - Denies transitions involving `--axm-bridge-*` or `border-color`.

- Runtime CSSOM sentinel: `scripts/check-starlight-chrome-cssom-sentinel.ts`
  - Uses Playwright to navigate to the docs site and scans effective CSS rules via CSSOM.
  - Includes `document.adoptedStyleSheets` and open Shadow DOM sheets.
  - Shares a single spec object with other consumers: `src/lib/integrations/starlight/chrome-contract-spec.ts` (`STARLIGHT_CHROME_CONTRACT`).

- Contract test: `tests/starlight-chrome-border.contract.spec.ts`
  - Flips theme and samples multiple animation frames to assert the header border stays bridge-routed at every frame.

#### Inspector-driven audits

- The `check:violations` system (entry `scripts/check-violations.ts` → `scripts/check-violations/run.ts`) integrates browser automation with the in-page inspector/debugger.
- It supports multiple scan modes (e.g. a “forced” mode that sets `--tau` inline `!important` to isolate continuity risks).

### 5.3 Theme Studio / Theme Builder (observed; Epoch 4)

Theme Studio is a first-party, browser-only tool hosted inside the Starlight docs site.

Entry / runtime shape:

- Route: `site/src/pages/studio.astro` renders `StudioWrapper` as `client:only="svelte"`.
- The UI is an overlay mounted over a normal Starlight page shell (`StarlightPage`), with fixed positioning.

State model (singletons; persisted to localStorage):

- `ConfigState` (`site/src/lib/state/ConfigState.svelte.ts`)
  - Owns a mutable solver config: `config = DEFAULT_CONFIG`.
  - Persists `config`, `vibeId`, and `syncDark` to localStorage.
  - Provides derived outputs:
    - `solved`: deep-clones config and calls `solve(configClone)`.
    - `css`: deep-clones config and calls `generateTheme(configClone)`.
  - Supports “Vibes” presets: `loadVibe(newVibeId)` uses `resolveConfig({ vibe })` when `newVibeId in VIBES`.
  - Supports importing a JSON config from file (`loadConfigFromFile`).
  - Includes a “sync dark to light” behavior: when `syncDark` is enabled and a light anchor changes, it calls `syncDarkToLight(...)`.
  - Mutates anchors and surface overrides directly (state-manager-as-authoritative mutator).

- `BuilderState` (`site/src/lib/state/BuilderState.svelte.ts`)
  - Owns UI state: selected/hovered surface, view/inspector modes, pane widths, panel open/close.
  - Persists this UI state to localStorage.

- `ThemeState` (`site/src/lib/state/ThemeState.svelte.ts`)
  - Tracks `mode` by reading `document.documentElement.getAttribute("data-theme")`.
  - Observes changes to `data-theme` via `MutationObserver` (explicitly to stay in sync with Starlight’s theme picker).
  - Toggles by writing `data-theme` back to `document.documentElement`.

Dependency injection:

- `StateProvider` (`site/src/components/StateProvider.svelte`) sets Svelte context keys:
  - `theme` → `themeState`
  - `config` → `configState`
  - `builder` → `builderState`

Live CSS application model:

- `StyleInjector` (`site/src/components/StyleInjector.svelte`) uses `injectTheme(configState.css, undefined, styleElement)`.
  - This suggests the Studio previews theme changes by injecting a `<style>` element (and reusing it across updates).
  - This is a separate delivery model from the “engine.css + theme.css render-blocking in <head>” contract used for production integration; Studio prioritizes responsiveness and iteration.

Additional config mutation utilities:

- `site/src/lib/engine/VibeEngine.ts` provides higher-level “knobs” that mutate a solver config:
  - `setContrast(config, value)` mutates page anchors to widen/narrow contrast ranges.
  - `setVibrancy(config, value)` re-parses key colors and adjusts OKLCH chroma.

Observed user programming model implied by Studio:

- Users can design interactively (browser) and produce:
  - a _solver config_ (persisted/imported/exported as JSON), and
  - a _theme CSS_ string (computed live via `generateTheme`).
- Studio treats the solver config as the authoritative editable artifact; the theme CSS is a derived preview.
- Studio currently uses Starlight’s `data-theme` attribute as its mode control plane (via `ThemeState`).

Export surface (built into Studio UI):

- `StagePanel` (`site/src/components/builder/StagePanel.svelte`) exposes two primary view modes:
  - `Preview` (component view + hover context trace)
  - `Export`
- `ExportView` (`site/src/components/builder/stage/ExportView.svelte`) can export four formats from the same in-memory solved theme:
  - `css`: the generated theme CSS string
  - `dtcg`: `toDTCG(solved, config)` serialized to JSON
  - `tailwind`: `toTailwind(solved)` serialized to JSON
  - `typescript`: `toTypeScript(solved)`
- Export UX supports “Copy” (clipboard) and “Download” (Blob → `URL.createObjectURL`).

Docs alignment note (observed gap):

- The Theme Studio guide claims there is an “Export Config” action and an “Import” tab for pasting an existing `color-config.json`.
- In the current Studio UI implementation, the export surface is `ExportView` (CSS/DTCG/Tailwind/TypeScript). There is no corresponding “export solver config JSON” view, and no visible import/paste flow wired up to `ConfigState.loadConfigFromFile(...)`.

Additional wiring gaps (confirmed by code search):

- None of the following `ConfigState` capabilities are currently invoked by Theme Studio UI components:
  - `loadConfigFromFile(file)`
  - `resetConfig()`
  - surface/group CRUD and reordering (`addGroup`, `addSurface`, `removeSurface`, `moveSurface`, etc.)
- Net: the in-memory config is editable via specific controls (anchors/key colors/contrast offsets), but Studio does not yet expose a full config editor surface despite having state methods for it.

Related (separate tool, not Theme Studio):

- A “Physics Tuner” HUD exists (`site/src/components/DebugVisualizer.svelte`, route `site/src/pages/hud.astro`) and includes an `Export Config` action that copies a **config snippet** to clipboard.
  - This is not a `SolverConfig` export and should not be conflated with the Theme Studio’s config-first contract.

Inspection surface (inside Studio UI):

- The Studio UI includes an inspector panel that reads both:
  - the configured surface model (config groups/surfaces), and
  - the solver’s computed values (from `configState.solved`).
- Example: `SurfaceInspector` (`site/src/components/builder/inspector/SurfaceInspector.svelte`)
  - Uses `themeState.mode` to choose the relevant solved values (light vs dark) and display per-surface metrics.
  - Writes overrides back into the solver config via `configState.updateSurfaceContrastOffset(...)`.

Implemented control surface inventory (what you can actually edit today):

- Anchors (page light/dark ranges) are editable via `LuminanceSpectrum` (`site/src/components/builder/LuminanceSpectrum.svelte`):
  - Uses `RangeSlider` to drive `configState.updateAnchor("page", mode, position, value)`.
  - Computes and displays APCA-derived “Lc spread” badges for each mode.
  - Notes an internal constraint tension: `RangeSlider` itself does not enforce min-range / non-crossing; that responsibility is currently in the parent (and is partially commented out).

- Key colors are editable via `GlobalInspector` (`site/src/components/builder/inspector/GlobalInspector.svelte`):
  - Updates in place via `configState.updateKeyColor(key, value)`.

- “Vibe” preset selection exists in the sidebar via `VibePicker` (`site/src/components/builder/VibePicker.svelte`):
  - Drives `configState.loadVibe(vibeId)` which either resolves a preset (`resolveConfig({ vibe })`) or restores “Custom”.

- High-level tuning knobs exist via `VibeControls` (`site/src/components/builder/inspector/VibeControls.svelte`) and mutate the config directly:
  - `setContrast(configState.config, contrast)` and `setVibrancy(configState.config, vibrancy)`.

- Per-surface contrast offsets are editable via `SurfaceInspector` (`site/src/components/builder/inspector/SurfaceInspector.svelte`):
  - Drives `configState.updateSurfaceContrastOffset(surfaceId, mode, offset)`.

Preview surface:

- `ComponentView` (`site/src/components/builder/stage/ComponentView.svelte`) is a UI “kitchen sink” for previewing tokens.
  - It currently contains a placeholder `color: var(--color-green-600);` on `.text-positive`, which is not part of the Axiomatic programming model and may confuse enforcement expectations.

Derived safety indicators:

- `ContrastBadge` (`site/src/components/builder/ContrastBadge.svelte`) computes:
  - a hierarchy delta (surface vs page background) via `contrastForPair(pageL, bgL)` and
  - a text contrast score (against a mode/polarity-derived text lightness).
  - This is a Studio-only diagnostic model and should not be treated as the full accessibility contract (it’s a useful heuristic for interactive tuning).

### 5.4 Inspector / Debug Overlay (observed; Epoch 5 — partial inventory)

The “Inspector” is a first-party, client-side debugging tool implemented as a Web Component: `<axiomatic-debugger>`.

High-level architecture (as documented internally):

- Controller: `src/lib/inspector/overlay.ts` (Web Component lifecycle + event wiring + orchestration)
- Engine: `src/lib/inspector/engine.ts` (inspect/scan/continuity logic)
- View: `src/lib/inspector/view.ts` (pure render functions)
- Styles: `src/lib/inspector/styles.ts` (shadow DOM CSS)

How it is activated (docs-site integration):

- The docs site integration module `site/src/lib/starlight-axiomatic.ts` imports `@axiomatic-design/color/inspector` and ensures a `<axiomatic-debugger>` element exists by appending one to `document.body`.
- The same module also bridges Starlight’s `data-theme` into the runtime `ThemeManager` and intercepts the Starlight theme picker (`starlight-theme-select`) to avoid competing theme writers.

Persistent user state (overlay):

- The overlay persists UI state in `localStorage["axiomatic-inspector-state"]`:
  - `isEnabled`, `isPinned`, `isViolationMode`, `isContinuityMode`, `showInternals`
- It also reads `localStorage["axiomatic-inspector-verbose"] === "true"` as a verbosity switch.

Primary behaviors (engine + overlay):

- **Element inspection**: hover/select yields a “token list” for the active element, based on resolved context + token resolution.
- **Violation scanning** (`AxiomaticInspectorEngine.scanForViolations`): walks the DOM and flags:
  - “Axiom Mismatch”: surface token vs actual computed background, and/or final text token vs actual computed text.
  - “Private Token”: a local/private token that has no responsible class and is not inline.
  - It intentionally ignores several regions (debugger itself, `HTML`, hidden nodes, and vendor/generated areas like `.expressive-code`, `.astro-code`, etc.).

Reports as user-visible artifacts (automation contract):

- Violations are published to `globalThis.__AXIOMATIC_INSPECTOR_VIOLATIONS__` as a list of rows containing element identity plus evidence like:
  - mismatch property (`color` or `background-color`), expected vs actual, and the winning CSS rule (selector/value/sheet/specificity/importance), plus `var(--*)` references extracted from the winning rule.
- Continuity results are published to `globalThis.__AXIOMATIC_INSPECTOR_CONTINUITY__` as a list of rows.
- The overlay also publishes per-element diagnostics payloads for copy/paste:
  - `globalThis.__AXIOMATIC_INSPECTOR_ACTIVE_ELEMENT__`
  - `globalThis.__AXIOMATIC_INSPECTOR_ELEMENT_DIAGNOSTICS__`

User actions and “overlay fix” semantics:

- The overlay has two explicit interaction modes:
  - **Diagnose** (default on every reload): read-only; produces remediation recipes.
  - **Experiment**: allows temporary DOM patches; always exportable; resets on reload.
- Violation mode supports:
  - `Alt+Click` → “diagnostics mode” (run scan and dump report to globals/console)
  - `Shift+Click` → generate **remediation recipes** for all violations and copy **JSON** to clipboard.
    - Also publishes `globalThis.__AXIOMATIC_INSPECTOR_RECIPES__`.
- The inspector UI also exposes per-element actions via the advice box:
  - **Copy Recipe**: copies a human checklist.
  - **Copy JSON**: copies a structured recipe (and publishes `globalThis.__AXIOMATIC_INSPECTOR_LAST_RECIPE__`).
  - **Apply Temp** (Experiment mode only): applies a reversible, local patch for visual confirmation.

Remediation steps (user workflow; see also `docs/rfcs/017-inspector-overlay-remediation-recipes.md`):

1. Inspect/scan to locate a mismatch.
2. In **Diagnose** mode, copy a recipe (text or JSON).
3. Apply the recipe as a manual source edit.
4. Reload + re-scan to confirm the mismatch is gone.
5. (Optional) Switch to **Experiment** mode and use **Apply Temp** first to validate the hypothesis before editing source.

- How the advice box decides “Cause” (and what gets copied/applied):
  - The view layer picks a mismatch target property (`background-color` if the surface token mismatches, else `color` if the final text token mismatches).
  - It tries to attribute the winning CSS rule for that property (selector + stylesheet file + specificity) via a CSSOM walk.
  - It extracts referenced `var(--*)` names from the winning rule value for diagnostics, and has a small “forbidden var” heuristic (currently flags `--sl-*` and `--computed-*` prefixes).
  - It stores rule details into `data-*` attributes on the advice box so overlay actions can use them (`data-rule-selector`, `data-rule-file`, `data-is-inline`, etc.).
- What **Apply Temp** actually does (as implemented in `src/lib/inspector/overlay.ts` + `src/lib/inspector/view.ts`):
  1. Saves the element’s original `className` and `style.cssText` (once) into an in-memory `modifiedElements` map.
  2. Removes conflicting utility classes (currently `bg-*` for background mismatches, `text-*` for text mismatches) when they are present.
  3. Removes an inline property override (only when the inline property is present).
  4. Records the applied patch to an experiment log and publishes it to `globalThis.__AXIOMATIC_INSPECTOR_APPLIED_FIXES__` (legacy name; these are _experiments_, not source fixes).

Recipe model (user programming model bridge):

- A “recipe” is a deterministic checklist + JSON payload intended for manual source edits.
- The current recipe edit kinds are:
  - remove class (`bg-*`/`text-*`)
  - remove inline style (`color` / `background-color`)
  - edit CSS rule (selector + optional file; remove declaration)
- Recipes include the expected surface class as a reference point, but the overlay does **not** claim it can infer the correct “new surface boundary” to add; it recommends wrapping content in a Surface container when appropriate.

Reset semantics:

- The overlay tracks any mutations it makes (original `className` + `style.cssText`) in-memory (`modifiedElements`) and provides reset actions:
  - Reset one element (restores the saved class/style snapshot)
  - `Shift+Click` reset all (restores all tracked elements)

Important boundary note (why this must remain debug-only):

- “Apply Temp” is intentionally **not** a source fix; it mutates live DOM for visual confirmation.
- The supported workflow is: diagnose → copy a recipe → apply changes in source → re-scan.
- The overlay does not write private computed variables (no `--_axm-*` / `--_axm-computed-*` “plumbing”) as a remediation technique.

Theme / tau behavior (important for mental model):

- The inspector UI itself has a “Toggle Theme” button, but it does not use `ThemeManager` semantic state; it uses `AxiomaticTheme` (`src/lib/theme.ts`), which is a lower-level observer/controller for `--tau` + related attributes.
- `AxiomaticTheme.set({ tau })` writes inline `--tau` (unless it is locked `!important`), and at binary endpoints syncs framework-facing signals (`data-theme`, `.dark` class, and `style.colorScheme`).
- The overlay animates tau continuously during theme toggles (300ms rAF tween) and intentionally avoids auto-running continuity checks on page load (“it flashes theme/tau”).

Continuity check (what it actually tests):

- Continuity is implemented in `src/lib/inspector/continuity.ts` and exposed via `AxiomaticInspectorEngine.checkContinuity()`.
- The check is explicitly “physics-like”: it disables transitions/animations and samples multiple fixed tau values.
  - Default tau samples: `[-1, 0, 1]`.
- For each tau sample, it:
  1. Forces `--tau` inline with `!important`.
  2. Sets `data-theme="light"`, snapshots computed paint-related properties across the document.
  3. Sets `data-theme="dark"`, re-reads computed values.
  4. Emits a **Continuity Violation** if a property “snaps” (visually differs) between the two states.
- The comparison currently covers:
  - `background-color`, `color`
  - border top/left/right/bottom color + width (only when width indicates paint)
  - `outline-color` + `outline-width` (only when width indicates paint)
- The continuity checker also tries to produce “culprit” evidence for background snaps:
  - the winning CSS rule (selector + stylesheet file + specificity), or
  - a likely variable source (via the inspector token model), or
  - fallback attribution (“UA default or inherited”).

Important implication:

- Continuity testing is _not_ a consumer integration contract. It intentionally mutates debug-only control planes (`data-theme`, inline `--tau !important`, global motion disabling) to detect whether authored styles remain bridge-routed / tau-driven rather than switching discretely.

How automation consumes it (enforcement integration):

- `pnpm check:violations` (via `scripts/check-violations/run.ts`) uses browser automation to:
  - ensure the debugger is present and ready,
  - run an inspector scan via an `Alt+Click`-equivalent event dispatch,
  - read the `globalThis.__AXIOMATIC_INSPECTOR_VIOLATIONS__` report.
- The check supports inspector control flags:
  - `--no-inspector`
  - `--inspector-scan forced|native|stable|both`
    Scan mode meanings (as implemented in `scripts/check-violations/run.ts`):
  - `native`: set `data-theme` only; do **not** disable motion; do **not** force `--tau`.
    - Highest fidelity, but most timing-sensitive.
  - `stable`: set `data-theme` and disable transitions/animations (global style injection); do **not** force `--tau`.
    - Intended to be deterministic while still reflecting the engine’s resolved tau.
  - `forced`: set `data-theme`, disable transitions/animations, and force `--tau` to the target endpoint inline with `!important`.
    - Maximum determinism; explicitly bypasses any runtime/theme initialization timing to isolate mismatches.
  - `both`: actually runs all of `native`, `stable`, and `forced` (in that order) for both light and dark.

Continuity in automation (distinct from inspector scan):

- `pnpm check:violations -- --continuity` runs a dedicated continuity scenario (`scripts/check-violations/checks/continuity.ts`) which:
  - captures a small “computed debug” payload (tau + a few key computed variables) for diagnostics, and
  - runs the inspector engine’s continuity checker while passing the debugger element as an ignore container.
- Playwright tests consume the inspector overlay as a stable UI contract via `tests/helpers/inspector.ts`.

Implication for the user programming model:

- The inspector is not “just a UI”; it is part of the enforcement surface area (automation reads its global reports).
- It also introduces a privileged theme/tau control plane for debugging; this must be documented as a debug-only capability (not a supported consumer integration plane) to avoid reintroducing multi-writer or direct `--tau` usage in user code.

## 6. Claim Ledger (Docs → Code Verification)

Status is one of: **OK**, **Drift**, **Ambiguous**.

| Claim                                                                                         | Source                                  | Implementation evidence                                                                                                                                                   | Status                     | Persona impact                                                   | Notes                                                                                                                                        |
| --------------------------------------------------------------------------------------------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- | ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ------ | ----------------------------------------------------------------------- |
| CLI supports `init`, `build` (default), `export`, `audit`                                     | site docs: `reference/cli`              | `src/cli/index.ts` command router includes all four                                                                                                                       | OK                         | Sarah, Marcus                                                    | Implementation also includes an additional `import` command (see Undocumented Capability Ledger).                                            |
| CLI usage is `npx axiomatic ...`                                                              | site docs: `reference/cli`              | `package.json#bin` exposes `axiomatic`                                                                                                                                    | OK                         | Sarah                                                            | Docs may still want `pnpm exec axiomatic` for pnpm-native workflow.                                                                          |
| Install via `pnpm add -D @axiomatic-design/color` and also `npm install -D ...`               | site docs: `reference/cli`              | TBD (Epoch 1)                                                                                                                                                             | Ambiguous                  | Sarah                                                            | Repo guidelines prefer pnpm; docs promise npm too.                                                                                           |
| `build` defaults: `./color-config.json` → `./theme.css`                                       | site docs: `reference/cli`              | `src/cli/commands/build.ts` defaults: `color-config.json`, `theme.css`                                                                                                    | OK                         | Sarah                                                            | Equivalent relative defaults; docs include `./`.                                                                                             |
| `export --format dtcg                                                                         | tailwind                                | typescript` exists w/ defaults                                                                                                                                            | site docs: `reference/cli` | `src/cli/commands/export.ts` supports those formats and defaults | OK                                                                                                                                           | Marcus | Adds a “single JSON file” mode for DTCG when `--out` ends with `.json`. |
| `audit` performs schema + contrast + polarity logic checks                                    | site docs: `reference/cli`              | `src/cli/commands/audit.ts` runs schema validation + contrast/polarity checks                                                                                             | Ambiguous                  | Jordan                                                           | Severity differs: many findings are warnings, not errors; doc wording implies “verifies/ensures”.                                            |
| Runtime import path: `@axiomatic-design/color/browser` exports `ThemeManager`                 | site docs: `reference/javascript-api`   | `package.json#exports["./browser"]` → `./dist/lib/browser.js`; `src/lib/browser.ts` exports `ThemeManager`                                                                | OK                         | Sarah, Marcus                                                    | Import path is correct.                                                                                                                      |
| `ThemeManager` sets `color-scheme` style if no classes provided                               | site docs: `reference/javascript-api`   | `src/lib/browser.ts#ThemeManager.apply()` sets inline `color-scheme` when `lightClass`/`darkClass` are absent                                                             | OK                         | Sarah                                                            | Also publishes semantic state (`data-axm-mode`, `data-axm-resolved-mode`).                                                                   |
| Inverted surfaces need no extra JavaScript                                                    | site docs: `reference/javascript-api`   | `ThemeManager` reads `--axm-inverted-surfaces` and sets inline `color-scheme` on matching nodes (MutationObserver upkeep). No evidence of a CSS-only inversion mechanism. | Drift                      | Sarah, Marcus                                                    | Docs currently say “generated CSS handles this; no extra JS required,” but the implementation requires ThemeManager.                         |
| Theme mode is bridged only via `ThemeManager` (no head scripts writing semantic state)        | RFC014 + axiom `04-integration`         | `site/src/components/StarlightHead.astro` writes `data-axm-mode` / `data-axm-resolved-mode` inline before `ThemeManager` runs                                             | Drift                      | Marcus, Sarah                                                    | First-party site appears to use a bootstrap writer for first paint; this contradicts the “ThemeManager is the only runtime theme API” claim. |
| Consumer/authored code does not address engine variables (e.g. `--axm-*`, `--_axm-*`)         | RFC010 + axiom `04-integration`         | `site/src/content/docs/guides/frameworks/html.mdx` uses `var(--axm-text-high-token)` and `var(--axm-text-subtle-token)` in authored inline styles                         | Drift                      | Sarah, Jordan                                                    | User-facing docs demonstrate a forbidden pattern; this will be copied.                                                                       |
| Manual dark mode toggle should use `ThemeManager` (not `data-theme` direct writes)            | RFC014 + `reference/javascript-api`     | `site/src/content/docs/guides/frameworks/html.mdx` demonstrates toggling `data-theme` directly                                                                            | Drift                      | Sarah, Marcus                                                    | Also creates a second theme control plane.                                                                                                   |
| Manual mode toggle uses `force-dark`/`force-light` classes                                    | site docs: `guides/integration`         | No `force-dark`/`force-light` tokens found in shipped CSS (`css/**`) or library source (`src/**`); runtime mode API is `ThemeManager` with `data-axm-*` semantic state    | Drift                      | Sarah                                                            | This is a direct docs→code contradiction and also risks violating the “single theme authority” model.                                        |
| Runtime integration: mode must be bridged via `ThemeManager` and must not write CSS variables | axiom `04-integration` + RFC014         | TBD (Epoch 2/3)                                                                                                                                                           | Ambiguous                  | Marcus                                                           | Verify site code and examples obey this.                                                                                                     |
| RFC010 is enforced for consumer layers via a CI gate                                          | implied by RFC010 stance + repo scripts | `scripts/check-rfc010.ts` blocks `var(--axm-*)`, `var(--_axm-*)`, `--sl-*` outside allowlists; validates class tokens in static markup                                    | OK                         | Marcus, Jordan                                                   | Enforcement is file-allowlisted; generated CSS is excluded.                                                                                  |
| Starlight adapter boundary (bridge file) is explicitly allowlisted                            | RFC013                                  | `scripts/check-rfc010.ts` allowlists only `site/src/styles/starlight-custom.css` for `--sl-*` and `--axm-bridge-*` usage                                                  | OK                         | Marcus                                                           | This makes the “single bridge file” concept mechanically real.                                                                               |
| Chrome continuity contract is enforced in multiple ways                                       | RFC013/RFC014 intent                    | Static sentinel + runtime CSSOM scan + Playwright contract test                                                                                                           | OK                         | Marcus, Jordan                                                   | Contract spec is centralized in `src/lib/integrations/starlight/chrome-contract-spec.ts`.                                                    |

## 7. Undocumented Capability Ledger (Code → Doc Proposal)

| Capability                                                           | Where it lives                                   | Current discoverability | Persona fit      | Proposed doc placement                                 | Proposed framing                                                   | Risks                                                                                            |
| -------------------------------------------------------------------- | ------------------------------------------------ | ----------------------- | ---------------- | ------------------------------------------------------ | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ |
| `axiomatic import <file>` converts DTCG tokens → `color-config.json` | `src/cli/index.ts`, `src/cli/commands/import.ts` | Not in CLI docs         | Marcus, Dr. Chen | CLI reference (`reference/cli`) under Commands         | “Import DTCG tokens into Axiomatic config (migration tool)”        | Needs careful boundary framing: avoids implying DTCG is authoritative over code.                 |
| `build` emits `*.class-tokens.json` manifest                         | `src/cli/commands/build.ts`                      | Not in CLI docs         | Marcus, Jordan   | Integration guide + advanced “policy/enforcement” docs | “Per-config class-token manifest for enforcement (RFC010 support)” | Could be perceived as overengineering; must explain it as a safety boundary and toolchain input. |
| `build --copy-engine` option                                         | `src/cli/commands/build.ts`                      | Not in CLI docs         | Sarah            | CLI reference (build options)                          | “Copy `engine.css` alongside output for easy integration”          | Risk: can confuse users about which CSS to import.                                               |
| Legacy/default invocation `axiomatic <config> <out>`                 | `src/cli/index.ts`                               | Not in CLI docs         | Sarah            | CLI reference (Usage)                                  | “Legacy shorthand; prefer `axiomatic build --config … --out …`”    | Risk: extra surface area, but can reduce friction for quick usage.                               |

## 8. Persona Toolchains (Unification Check)

For each persona, define a small set of end-to-end “golden paths” and identify feature islands that feel like a grab bag.

Personas source-of-truth: `docs/design/meta/personas.md`.

### 8.1 Sarah — Overwhelmed Pragmatist (Integrator)

Golden paths (sanctioned entry points only):

1. **Copy-pasteable install + CSS integration (system mode)**

- Install the package.
- Produce a config (Theme Studio export or `pnpm exec axiomatic init`).
- Run `pnpm exec axiomatic` (default build) or `pnpm exec axiomatic build --copy-engine`.
- Treat the generated class-token manifest as part of the integration contract (it defines what tokens you’re allowed to use in markup).
- Add render-blocking `<head>` CSS: engine first, then theme.
- Apply `surface-page` at the root container.

2. **Manual toggle (single writer)**

- Add `ThemeManager` (browser entry) as the only supported manual toggle plane.
- For “no-flash first paint”: seed semantic state before paint, then ThemeManager takes over.

3. **Sanity checks**

- Run `pnpm exec axiomatic audit` (or `pnpm exec axiomatic audit --config <path>`).

Audit focus:

- Verify that beginner docs (including MDX) never teach engine addressing or `data-theme` writes.

### 8.2 Alex — Visual Tinkerer (Theme Studio)

Golden paths (intended model; current implementation may drift):

1. **Interactive design loop (config-first)**

- Open Theme Studio.
- Adjust anchors / vibes / per-surface offsets.
- Export **SolverConfig JSON** (strict, boring) to become `color-config.json`.
- Run CLI to generate `theme.css` (and optionally copy engine).

Audit focus:

- Theme Studio must align to ThemeManager semantic plane (no `data-theme` as a taught/supported model).
- Studio must support import/export of the actual `color-config.json` (per C-008 decision).

### 8.3 Jordan — Accessibility Champion (QA / Enforcement)

Golden paths:

1. **CI gate: authoring boundaries**

- Run `pnpm check:rfc010` to block engine addressing / forbidden color literals / foreign variable usage outside allowlists.

2. **CI gate: behavior + continuity**

- Run `pnpm check:violations` and interpret `native|stable|forced` scan modes.
- Run continuity scenarios (either via the violations runner `-- --continuity` or Playwright contract specs).

3. **Actionable remediation**

- Use the inspector overlay in Diagnose mode to produce recipes.
- Apply source edits, then re-scan.

Audit focus:

- The inspector is part of the enforcement surface: globals and report schema stability matter.

### 8.4 Dr. Chen — Color Scientist (Solver / Internals)

Golden paths:

1. **Inspect and validate the math**

- Read solver architecture docs and verify the “physics” claims map to observable config knobs (anchors/curves) and deterministic outputs.

2. **Round-trip exports without losing fidelity**

- CLI export (`dtcg`, `tailwind`, `typescript`) must preserve semantic intent and avoid implying that exported artifacts become the new source of truth.

Audit focus:

- Clearly separate “supported integration API” from “explanation/internal variables.”

### 8.5 Marcus — System Architect (Platform)

Golden paths:

1. **Org-scale integration boundary**

- Adopt the “single bridge file” model for foreign systems (RFC013).
- Treat class-token manifests and policy files as inputs to enforcement.

2. **Docs as part of the contract**

- Enforce RFC010/RFC014 in docs/examples (MD/MDX) to prevent teachable violations.

Audit focus:

- Identify “feature islands” that imply multiple competing theme planes and decide whether to align, explicitly scope as internal-only, or promote to supported surface.

### 8.6 Feature Islands (Composition Risks)

- **Multiple theme control planes**
  - ThemeManager semantic state (`data-axm-*`) vs Starlight `data-theme` vs inspector’s tau controller.

- **Docs entry point drift**
  - Root README vs site docs vs CLI help text diverge; users copy from whichever they find first.

- **Enforcement scope drift**
  - Enforcement is strong for app code, but historically weaker for docs examples; this fractures the taught model.

Composition decision rubric:

- (A) Align implementation to the canonical plane.
- (B) Document as internal-only / debug-only.
- (C) Promote to supported surface (and then enforce + version the contract).

## 9. Documentation Proposals (Detailed, RFC-style)

Each proposal includes:

- Exact placement (page + section)
- Outline (headings)
- Key messages (what to teach)
- Examples to add (commands/code snippets)
- Cross-links (where to route readers next)
- Risks and tradeoffs

### P-001 — One theme switcher, clear placement (ThemeManager-first)

- **Placement**:
  - `site/src/content/docs/guides/integration.md` (replace `force-dark/force-light` guidance)
  - `site/src/content/docs/reference/javascript-api.md` (clarify contracts + responsibilities)
  - `site/src/content/docs/guides/frameworks/*.mdx` (align examples)
- **Key messages**:
  - There is exactly one supported manual theme switcher: `ThemeManager`.
  - “System mode” (no persistent override) can be CSS-only if CSS is loaded before paint.
  - If you need “no flash + persistent override”, you must seed initial mode before paint (SSR cookie or tiny inline seed), then hand off to `ThemeManager`.
  - Inverted surfaces: fully correct native control theming requires `ThemeManager` (because it sets `color-scheme` on inverted nodes).

#### Proposed structure to teach (levels)

1. **Level 0 — System mode, CSS-only**
   - Works with no JS.

- Requirement (first-paint correctness): the **engine layer** (defines `--tau` and the reactive pipeline) and the **theme layer** (generated tokens/surfaces that depend on `--tau`) must be **applied before first paint**.
  - Acceptable forms:
    - Two `<link rel="stylesheet">` tags in `<head>` (engine first, then theme), or
    - One combined stylesheet (bundled/concatenated) applied via a `<link rel="stylesheet">`, or
    - One or two inline `<style>` tags (CSP permitting).
  - Non-acceptable for “first paint correctness”: fetching-only hints (e.g. `rel="preload" as="style"`) without an actual render-blocking stylesheet application.
- Tradeoff: cannot honor a saved user override without pre-paint state.

2. **Level 1 — Manual override, ThemeManager**
   - JS-based manual switching: call `setMode("light"|"dark"|"system")`.
   - ThemeManager publishes semantic state (`data-axm-mode`, `data-axm-resolved-mode`) and can update meta/favicon.

3. **Level 2 — No-flash first paint (integration technique, not a new API)**
   - Seed the initial semantic state before paint, then ThemeManager takes over.
   - Additional invariant: the initial paint should not “transition” from a default mode to a forced mode.
     - Practical shape (as used by the docs site): set `data-axm-motion="tau"` and seed `data-axm-mode`/`data-axm-resolved-mode` before CSS applies; ThemeManager then becomes the steady-state writer.
   - CSP-safe guidance:
     - Prefer SSR cookie (server writes initial `data-axm-resolved-mode`).
     - If inline scripts are allowed, keep the seed snippet tiny and semantic-state-only.

#### Bundler guidance (no unplugin required to understand the model)

- **Vanilla / no bundler**: `<link rel="stylesheet">` in `<head>`.
- **Bundlers**:
- **Bundlers**:
  - If CSS is imported from JS, first paint can occur before styles are applied in dev (HMR injection) and/or in some build setups.
  - The safe rule for “first paint correctness” is: ensure the engine+theme CSS is applied via HTML `<head>` (link or inline style), not deferred behind app hydration.
  - For Vite specifically: importing CSS in the entry module often works, but is not a reliable, documented “before first paint” contract in dev; treat a plugin that controls `index.html` as the robust solution.

#### Concrete “files in head” contract (proposed)

- Always include (applied before first paint, in this order):
  1. Engine layer (`@axiomatic-design/color/engine.css` or copied `engine.css`)
  2. Theme layer (your generated `theme.css`)
- The two layers may be delivered as two links, one combined link, or inline style; what matters is **render-blocking application** and **engine-before-theme ordering**.
- If you want a no-flash persistent override (Level 2), seed **semantic state only** before the CSS applies (CSP permitting), then initialize `ThemeManager` as the single steady-state writer.

#### Existing CLI support that helps (no new tooling)

- `axiomatic build --out <dir>/theme.css --copy-engine` can place `engine.css` next to your output, so vanilla/bundler-agnostic `<link>` integration is straightforward.

#### Optional tooling idea (explicitly optional)

- Consider an optional Vite plugin/unplugin later to encapsulate the “before paint” placement rules:
  - ensure engine+theme are applied as render-blocking styles in `<head>` (dev + build parity),
  - optionally provide a CSP-friendly “seed semantic state” hook (SSR attributes preferred; otherwise a tiny inline script with nonce/hash).
- User-model framing option: “If you use Vite, install the plugin and it just works; otherwise follow the low-level placement guidance.”
- Docs should remain logically correct without the plugin (tooling is an accelerator, not the source of truth).

#### What a Vite unplugin should guarantee (draft)

- Uses Vite’s `transformIndexHtml` hook (ordering via `enforce: "pre" | "post"`) to ensure:
  - Engine-before-theme application in `<head>`.
  - Dev parity: avoid relying on JS/HMR style injection for first paint.
  - Build parity: emits `<link rel="stylesheet">` (or inline `<style>`) pointing at built assets (hashed filenames) while preserving order.
  - Optional seed: injects a minimal semantic-state seed (or exposes a hook) so initial paint never animates into the chosen mode.
- Cross-bundler note: “unplugin” can target multiple bundlers, but HTML injection is only fully supportable in bundlers/pipelines that expose an HTML transform stage (Vite does; others depend on their HTML plugins/framework integration).

### P-002 — HTML guide rewrite (strict contract)

- **Placement**: `site/src/content/docs/guides/frameworks/html.mdx`
- **Change**:
  - Remove examples that use `var(--axm-*)` as styling outputs.
  - Replace manual `data-theme` writes with `ThemeManager` usage.
  - Add an “Advanced: token plumbing” section only as explanation (not as integration guidance).

## 10. Conflicts Requiring Decision (STOP List)

When a Sentinel STOP condition triggers, add a Conflict Card here and stop in chat.

### Conflict Card template

- **Conflict ID**: (e.g., C-001)
- **Claim** (docs/axioms/RFCs say):
- **Observed reality** (code does):
- **Why it matters** (persona break / model fracture):
- **Candidate resolutions** (≥2; do not choose):
- **Smallest question to user** (one decision):

### C-001 — Manual toggle mechanism contradicts implementation

- **Conflict ID**: C-001
- **Claim** (docs/axioms/RFCs say):
  - User-facing integration docs teach manual dark mode toggling by applying `force-dark` / `force-light` classes on the root container.
- **Observed reality** (code does):
  - No `force-dark` / `force-light` classes exist in the library CSS or source.
  - The implemented runtime contract for explicit mode control is `ThemeManager`, which publishes semantic state (`data-axm-mode`, `data-axm-resolved-mode`) and optionally sets `color-scheme` style/class.
  - Engine CSS derives `--tau` from `data-axm-resolved-mode` and only uses `prefers-color-scheme` as a pre-init fallback.
- **Why it matters** (persona break / model fracture):
  - **Sarah** copy-pastes the integration guide and the toggle does nothing → immediate trust failure.
  - **Marcus** needs a clear “single writer” theme authority. Teaching `force-*` classes creates a second, undocumented control plane competing with ThemeManager.
  - This is exactly the kind of boundary confusion that leads to overengineering and integration bugs.
- **Candidate resolutions** (≥2; do not choose):
  1. Update docs to remove `force-dark`/`force-light` and teach `ThemeManager` as the manual toggle (with a minimal snippet + storage guidance).
  2. Add support for `force-dark`/`force-light` as a documented compatibility feature (implemented via semantic state mapping), and clarify precedence vs `ThemeManager`.
  3. Teach a pure-HTML no-JS toggle only as “not supported / not recommended”, and route readers to runtime.
- **Smallest question to user** (one decision):
  - Should the **supported manual toggle** be (A) `ThemeManager` (docs change), or (B) `force-dark`/`force-light` (feature to implement + precedence rules)?

**Decision (user)**: (A) `ThemeManager` is the supported manual toggle. Docs should remove `force-dark`/`force-light`.

### C-002 — “ThemeManager is the only theme writer” vs first-paint bootstrap script

- **Conflict ID**: C-002
- **Claim** (docs/axioms/RFCs say):
  - RFC014: `ThemeManager` is the only sanctioned runtime mechanism for theme control; integrations should not rely on bespoke head scripts.
- **Observed reality** (code does):
  - The docs site injects an inline head script that sets `data-axm-motion`, `data-axm-mode`, and `data-axm-resolved-mode` before `ThemeManager` initializes.
  - A later module (`site/src/lib/starlight-axiomatic.ts`) instantiates `ThemeManager` and then calls `setMode(...)`, effectively taking over after the bootstrap.
- **Why it matters** (persona break / model fracture):
  - **Marcus** needs a clean “single writer” model. If first-party code requires a boot script, real consumers may copy it and reintroduce multi-writer timing bugs.
  - **Sarah** needs copy-pasteable docs; if the real required model is “include a head bootstrap script,” that must be taught explicitly.
  - This is tied to the repo’s known pain: theme bridging is a source of error and overengineering.
- **Candidate resolutions** (≥2; do not choose):
  1. Bless a _minimal, official_ “first paint bootstrap” snippet as part of the runtime contract (document it, keep it tiny), and redefine RFC014 to allow this single pre-init writer.
  2. Remove/forbid head bootstrap scripts (RFC014 stands). Rely on pure CSS fallback (`prefers-color-scheme` until ThemeManager runs) and accept any initial visual transition/flash as the tradeoff.
  3. Provide a library-delivered inline bootstrap (e.g. a tiny `<script>` string export) so consumers don’t hand-roll it, keeping the “single authoritative algorithm” while still bootstrapping early.
- **Smallest question to user** (one decision):
  - Do you want the user programming model to include an **official first-paint bootstrap script** (yes/no)?

**Decision (user)**: First paint correctness is non-negotiable, and initial paint must not “transition” into a forced mode. This implies we must officially support pre-paint semantic-state seeding (SSR attributes preferred; inline seed allowed with appropriate CSP support), with ThemeManager as the steady-state writer.

### C-003 — HTML integration docs teach forbidden engine addressing + direct theme writes

- **Conflict ID**: C-003
- **Claim** (docs/axioms/RFCs say):
  - RFC010: authored/consumer code must not address engine variables (`--axm-*` / `--_axm-*`) as a styling API.
  - RFC014: runtime theme control must go through `ThemeManager`; integrations must not create competing theme writers.
- **Observed reality** (code does):
  - The HTML/vanilla integration guide demonstrates inline styles that read `var(--axm-text-high-token)` / `var(--axm-text-subtle-token)`.
  - The same guide demonstrates toggling theme by directly setting `data-theme` on `<html>`.
- **Why it matters** (persona break / model fracture):
  - **Sarah** will copy/paste this and then later hit enforcement failures (“no engine addressing”) or drift from the intended model.
  - **Marcus/Jordan** lose the ability to enforce/audit boundaries if first-party docs bless variable plumbing.
  - This also reinforces the overengineering loop: once docs allow plumbing, integrations start depending on it.
- **Candidate resolutions** (≥2; do not choose):
  1. Rewrite the HTML guide to be RFC010/RFC014 compliant: use only class tokens for text/surfaces, and use `ThemeManager` for toggles.
  2. Carve out an explicit “beginner exception” allowing limited engine variable reads in HTML-only examples, and _formalize_ it as a scoped, non-goal for enforcement (dangerous but honest).
  3. Split docs into “Quickstart (permissive) vs Contract (strict)” and make the strict contract the default recommendation.
- **Smallest question to user** (one decision):
  - Should user-facing docs be **strictly RFC010/RFC014 compliant** even in beginner HTML examples (yes/no)?

**Decision (user)**: Yes. Beginner examples must stay RFC010/RFC014-compliant; low-level tokens belong only in advanced explanatory material.

### C-004 — “No extra JS for inverted surfaces” contradicts ThemeManager implementation

- **Conflict ID**: C-004
- **Claim** (docs/axioms/RFCs say):
  - Runtime API docs: inverted surfaces “automatically flip `color-scheme`” and “No extra JavaScript is required to handle these local inversions.”
- **Observed reality** (code does):
  - `ThemeManager` reads a selector list from the CSS variable `--axm-inverted-surfaces` and uses runtime JS to set inline `color-scheme` on matching nodes. It also maintains this via a `MutationObserver`.
- **Why it matters** (persona break / model fracture):
  - **Sarah**: expects inverted surfaces to work without JS; may omit runtime and get incorrect native control theming.
  - **Marcus**: needs a crisp contract: is inversion a CSS capability or a runtime capability? This affects SSR, hydration timing, and integration boundaries.
  - This can trigger overengineering: if the docs imply CSS-only, teams will chase “why doesn’t it work” and invent extra scripts.
- **Candidate resolutions** (≥2; do not choose):
  1. Update docs to say: inverted surfaces are supported _when ThemeManager is present_ (and explain that this is specifically to set `color-scheme` for native controls).
  2. Rework implementation in the future so inverted surfaces are handled in CSS only (then docs remain as-is), likely by making surface classes themselves set `color-scheme` appropriately.
  3. Split the contract: CSS handles color tokens; ThemeManager is _optional_ and only needed for native control theming via `color-scheme`.
- **Smallest question to user** (one decision):
  - Do you want the **documented contract** to be “inverted surfaces work without JS” (implying future implementation change), or “inverted surfaces require ThemeManager for native controls” (docs change)?

**Decision (user)**: Document (B) — inverted surfaces require `ThemeManager` (the “dark mode abstraction” that handles the dirty bits, including `color-scheme` for native controls).

### C-005 — Do we still support CSS-only “system dark mode”?

- **Conflict ID**: C-005
- **Claim** (docs/axioms/RFCs say):
  - Integration guide currently teaches that system dark mode works automatically via CSS (no JS required).
- **Observed reality** (code does):
  - Engine CSS includes a pre-init fallback using `prefers-color-scheme` when `data-axm-resolved-mode` is absent.
  - However, full correctness for native control theming in inverted surfaces currently depends on `ThemeManager` (C-004).
- **Why it matters** (persona break / model fracture):
  - **Sarah** wants “it just works”: saying “dark mode requires ThemeManager” is simple, but it may overstate the requirement for basic cases.
  - **Marcus** wants a crisp contract: either we explicitly support a CSS-only system path (with known limitations), or we make ThemeManager the required integration surface for anything involving dark mode.
  - Overengineering risk: if we don’t clearly bound when ThemeManager is required, users will invent head scripts and multiple theme writers.
- **Candidate resolutions** (≥2; do not choose):
  1. Keep a **two-tier contract**: CSS-only system dark mode is supported (Level 0), but ThemeManager is required for manual override and for guaranteed native-control correctness in inverted surfaces.
  2. Make ThemeManager the **required** integration for any dark mode story (even system mode), and treat CSS-only behavior as an implementation detail (not documented as supported).
- **Smallest question to user** (one decision):
  - Do we document a **two-tier contract** (CSS-only system mode supported) or a **single-tier contract** (ThemeManager required for dark mode)?

**Decision (user)**: Document (B) — a **single-tier contract**: `ThemeManager` is the supported integration surface for dark mode.

Rationale (user-facing):

- Users should not have to reason about “fidelity tiers.” If you care about dark mode, you want it to be correct and boring.
- The engine may have CSS-only fallbacks internally (e.g. `prefers-color-scheme` when semantic state is absent), but we should treat that as an implementation detail rather than a promised, fully-correct integration path.

### C-006 — RFC010 enforcement does not cover MDX docs (docs can teach forbidden plumbing)

- **Conflict ID**: C-006
- **Claim** (docs/axioms/RFCs say):
  - Docs should not teach engine addressing as an integration pattern (RFC010/RFC014), and the repo’s enforcement posture suggests “consumer layers” are protected.
- **Observed reality** (code does):
  - The RFC010 gate (`scripts/check-rfc010.ts`) does **not** scan `site/src/content/docs/**/*.mdx`.
  - Multiple user-facing MDX pages currently contain examples like `style="color: var(--axm-text-high-token)"`.
- **Why it matters** (persona break / model fracture):
  - **Sarah** will copy/paste MDX examples and violate the intended boundaries.
  - **Marcus/Jordan** cannot rely on the enforcement gate to prevent docs drift.
  - The user programming model becomes “strict in code, permissive in docs,” which is a predictable source of overengineering and breakage.
- **Candidate resolutions** (≥2; do not choose):
  1. Treat MDX docs as part of “consumer layers” and extend enforcement to scan MDX (with an allowlist for clearly-labeled advanced explanatory sections).
  2. Allow MDX to mention `var(--axm-*)` only in reference/explanatory contexts, but forbid it in integration guides/quickstarts (manual editorial discipline, possibly later enforced by linting).
  3. Explicitly bless a “docs-only exception” (not recommended): MDX may teach variable plumbing even though consumer code must not.
- **Smallest question to user** (one decision):
  - Should MDX docs be treated as part of the RFC010 enforcement boundary (yes/no)?

**Decision (user)**: Yes — MDX docs are part of the RFC010 enforcement boundary.

### C-007 — Theme Studio uses `data-theme` (Starlight) instead of `ThemeManager` semantic state

- **Conflict ID**: C-007
- **Claim** (docs/axioms/RFCs say):
  - The supported manual theme control plane is `ThemeManager`, which publishes semantic state (`data-axm-mode`, `data-axm-resolved-mode`) and owns the “dark mode abstraction”.
- **Observed reality** (code does):
  - Theme Studio’s `ThemeState` tracks and toggles mode by reading/writing `document.documentElement[data-theme]`, and it explicitly syncs with Starlight’s theme picker via a `MutationObserver`.
- **Why it matters** (persona break / model fracture):
  - **Marcus** sees two first-party theme planes (`data-theme` vs `data-axm-*`) and will assume both are supported.
  - **Sarah** may copy the Studio’s behavior (or learn it implicitly) and reintroduce forbidden direct theme writes in integrations.
  - This conflicts with the desire for a “single writer” contract and makes enforcement/education harder.
- **Candidate resolutions** (≥2; do not choose):
  1. Make Theme Studio use `ThemeManager` as its mode authority (and treat Starlight’s `data-theme` as an implementation detail to bridge, if needed).
  2. Treat Theme Studio as a special-case internal tool that intentionally follows Starlight conventions, and explicitly document that `data-theme` is _not_ part of the library’s user programming model.
  3. Define a formal bridge between Starlight `data-theme` and Axiomatic semantic state, and document which attribute is canonical.
- **Smallest question to user** (one decision):
  - Should Theme Studio’s supported model be (A) `ThemeManager` semantic state (single plane), or (B) `data-theme` for Studio only (special-case, explicitly not supported for consumers)?

**Decision (user)**: (A) `ThemeManager` semantic state is the single supported theme plane. This is a hard constraint.

Implication for the audit:

- Treat Theme Studio’s current `data-theme` dependence as first-party drift that should be resolved in a future implementation phase (bridge/adapter work), not as part of the user programming model.

### C-008 — Theme Studio guide promises config import/export UI that does not exist (yet)

- **Conflict ID**: C-008
- **Claim** (docs/axioms/RFCs say):
  - The Theme Studio guide (`site/src/content/docs/guides/theme-builder.md`) teaches a CLI handoff workflow:
    - “Export Config” → copy JSON → paste into local `color-config.json`.
    - An “Import” tab exists where users can paste an existing `color-config.json`.
- **Observed reality** (code does):
  - The Studio UI exposes an `Export` view that outputs CSS/DTCG/Tailwind/TypeScript, but it does not expose a “solver config JSON export” UI.
  - There is a `ConfigState.loadConfigFromFile(file)` method, but no Studio UI wiring for “Import tab / paste JSON / upload config” was found.
- **Why it matters** (persona break / model fracture):
  - **Sarah** follows the guide and can’t find the promised controls → trust failure.
  - **Marcus** can’t rely on Studio as a supported part of the toolchain if its documented handoff path is not implemented.
- **Candidate resolutions** (≥2; do not choose):
  1. Implement the missing Studio features to match the guide: “Export Config” (SolverConfig JSON) + “Import” (paste/upload) wiring.
  2. Update the guide to match current behavior: describe Studio as a live CSS/token preview/export tool (not a config editor), and remove the config import/export claims.
  3. Keep the guide’s aspirational flow but mark it explicitly as “coming soon” with a versioned status banner.
- **Smallest question to user** (one decision):
  - Should the user programming model treat Theme Studio as (A) a **config-first editor** (so we implement missing import/export), or (B) a **theme-export preview tool** (so docs change to match current ExportView)?

**Decision (user)**: (A) Treat Theme Studio as a **config-first editor**.

Hard constraints (user):

- Theme Studio must align to the single supported theme plane: `ThemeManager` semantic state (no `data-theme` user model).
- Import/export must be strict and boring:
  - Export exact `SolverConfig` JSON (optionally including `$schema`).
  - Import validates (schema + basic shape) and clearly labels the handoff target as `color-config.json`.

Implication for the audit:

- Keep the Theme Studio guide’s CLI handoff flow as the intended user programming model, but treat the missing UI as an implementation gap to be closed in a future phase.

### C-009 — Root README teaches importing `utilities.css`, but the repo does not ship it

- **Conflict ID**: C-009
- **Claim** (docs/README say):
  - Root README teaches importing `@axiomatic-design/color/utilities.css`, and describes a `css/utilities.css` file as the “Surface/text utility classes” layer.
- **Observed reality** (repo does):
  - The repo’s shipped `css/` directory contains `engine.css`, `theme.css`, and `index.css` (engine+theme), but no `utilities.css`.
  - The package `exports` includes `./engine.css` and `./theme.css`, but not `./utilities.css`.
- **Why it matters** (persona break / model fracture):
  - **Sarah** copy/pastes the README and gets a broken import path → immediate trust failure.
  - **Marcus** can’t reliably define the “minimum CSS set” contract if entry points disagree.
- **Candidate resolutions** (≥2; do not choose):
  1. Update README (and any other docs) to remove `utilities.css` and define the supported CSS entry points as engine+theme (and optionally `css/index.css`).
  2. Reintroduce `utilities.css` as a real exported file (and document what it contains and when to include it).
  3. Provide a single supported CSS entry point (e.g. `index.css`) and teach only that for beginners.
- **Smallest question to user** (one decision):
  - What is the supported **beginner contract**: (A) “a set of CSS entry points” or (B) “config + class tokens (with CSS as a derived artifact)”?

**Decision (user)**: (B) The supported beginner contract is:

- Theme Builder / config
- Class tokens produced by the Theme Builder

Implication for docs:

- Beginner docs should emphasize “author config → generate theme → use class tokens” and avoid inventing extra CSS layers.
- Any CSS import guidance should be framed as the minimal baseline (engine + generated theme), not a third `utilities.css` surface unless it actually exists and is exported.

Status:

- **Resolved in docs**: Updated beginner-facing docs to remove `utilities.css` references and teach the minimal baseline (`engine.css` + generated `theme.css`).
  - Root README no longer imports `utilities.css` and now points to the docs site as canonical.
  - Quick Start and CLI reference now include importing `@axiomatic-design/color/engine.css`.
  - Linting docs and eslint-plugin README now treat “utilities.css” as optional (only if a project has a separate utilities file).

### P-003 — Tighten enforcement to match the full goals (docs included, with explicit “explanation-only” carve-outs)

- **Placement**:
  - Enforcement: `scripts/check-rfc010.ts` (primary), plus (optionally) an adjacent helper module if it gets large.
  - Documentation: a short section in the docs authoring guide explaining how to write examples that comply.
- **Goal (what we’re actually enforcing)**:
  - Prevent _integration guidance_ from teaching forbidden “engine addressing” or multi-writer theme control.
  - Allow _advanced/explanatory_ material to reference internal variable names **only when explicitly labeled as explanation**, so the boundary remains auditable.

#### Proposed enforcement changes

1. **Scan MD/MDX doc sources**
   - Include `site/src/content/docs/**/*.{md,mdx}` in the RFC010 scan.
   - Treat MDX as “consumer-facing text”: examples in fenced code blocks still count as teachable integration patterns and should fail unless explicitly marked as explanatory.

2. **Path-scoped policy: guides are strict, catalog/reference can be explanatory**
   - Strict (no `var(--axm-*)`, no `--sl-*`, no `--_axm-*`, no direct `data-theme` toggling examples):
     - `site/src/content/docs/guides/**`
     - `site/src/content/docs/reference/javascript-api*` (runtime contract)
   - Explanatory-allowed (variable names may appear, but only if marked):
     - `site/src/content/docs/catalog/**`
     - `site/src/content/docs/advanced/**`
     - `site/src/content/docs/reference/tokens*`

3. **Explicit, local opt-in marker for “explanation-only plumbing”**
   - Introduce a small, explicit marker that allows a bounded span of MDX to include `var(--axm-*)` etc for explanation.
   - Example shape (illustrative):
     - `<!-- axm-rfc010:explanatory:start -->` … `<!-- axm-rfc010:explanatory:end -->`
   - Enforcement should treat matches inside those spans as allowed _only_ for docs paths that are “explanatory-allowed.”

4. **Enforce “single theme authority” in docs examples**
   - Add explicit checks for teaching competing theme writers (particularly in guides):
     - direct writes to `data-theme` on `<html>`/`documentElement`
     - direct writes to `--tau`
     - “force-dark/force-light” patterns (already drift)
   - These should fail even if no `var(--axm-*)` appears.

#### Expected near-term consequence

- Turning this on will likely surface existing doc violations immediately (which is desired): it converts “drift we noticed” into a mechanically enforced boundary.

#### Why this matches the stated goals

- It preserves RFC010 as a **user-visible contract** (not just a codebase-internal rule).
- It makes “advanced explanation” explicit and auditable, rather than leaking into guides by accident.

### P-004 — Promote “Class-Token Integrity Policy” to a first-class artifact (solver-derived; user-facing; no embedded allowlists)

The current enforcement posture is directionally correct (strict consumer boundaries), but the mechanism risks becoming ad-hoc as more exceptions and scopes appear.

This proposal reframes enforcement away from “an RFC check” and toward a programming-model artifact: a **Class-Token Integrity Policy**.

#### Broad principle (add to the project’s mental model)

- **Do not embed allowlists/exceptions in code.**
  - File allowlists and exception rules inside scripts should be treated as temporary scaffolding.
  - The stable end-state is: enforcement consumes **generated artifacts** derived from user-authored configuration.

#### The solver already produces policy inputs

The toolchain already emits policy artifacts that are appropriate for CI _and_ end users:

- `policy/class-tokens.*.json` (repo-level allowlists)
- `<out>.class-tokens.json` emitted by `axiomatic build` (per-config manifest)

Remediation direction:

1. Treat these as the canonical “Class-Token Integrity Policy” layer.
2. Make checks (including docs linting) consume these outputs rather than inventing parallel, bespoke configuration.

#### Separate the “policy source” from the “policy scope”

- **Policy source**: solver-generated manifests.
- **Policy scope**: where we apply it (examples, site code, and docs).
  - Guides/quickstarts are strict (do not teach variable plumbing or multi-writer theme control).
  - Reference/advanced docs may mention internal variable names only when explicitly marked as explanation.

#### User-facing payoffs

- The same policy files can power a user-run linter (“verify my integration”) and CI gates (“prevent docs drift”).
- This keeps the contract teachable: “run the verifier against your config output,” not “memorize what the repo’s scripts happen to scan.”

## 11. Open Questions

- Personas file is at `docs/design/meta/personas.md` (normative but possibly stale). Need to watch for implied personas during audit and STOP if new personas are required.
- **Docs entrypoint is decided**: site docs are canonical; root README should be a pointer.
- **First paint is decided**: pre-paint semantic-state seeding is supported (SSR attributes preferred; tiny inline seed allowed with CSP support), with `ThemeManager` as the steady-state writer. (See C-002.)

- Idea (later): a small Chrome extension could consume the inspector’s published recipe/report globals and provide a “queue of source edits” workflow outside the overlay UI.

## 12. Appendix: Evidence Notes

### Evidence: first paint vs ThemeManager

- Engine derives `--tau` from semantic state: `:root[data-axm-resolved-mode="light|dark"]` in `css/engine.css`.
- Docs site bootstraps semantic state before ThemeManager initializes: `site/src/components/StarlightHead.astro` writes `data-axm-mode` / `data-axm-resolved-mode` inline.

### Evidence: HTML guide currently bypasses class-token integrity

- `site/src/content/docs/guides/frameworks/html.mdx` demonstrates:
  - authored `style="color: var(--axm-text-high-token)"` and `var(--axm-text-subtle-token)` for text, and
  - toggling `data-theme` directly for dark mode.
    These examples conflict with RFC010/RFC014’s stated boundaries.
