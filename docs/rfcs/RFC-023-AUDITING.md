# RFC-AUDITING: The Axiomatic Audit Framework

**Status**: Consolidated from RFC011, RFC012, design/004  
**Date**: 2026-01-05  
**Depends On**: RFC-CONSUMER-CONTRACT

## Summary

This RFC defines the audit framework that proves the Axiomatic Color System works correctly. It provides systematic, finite-coverage auditing that catches:

- **Continuity violations** ("snaps"): Paint changes that violate tau-invariance
- **Provenance leaks**: Paint not traceable to allowed token inputs
- **Consistency failures**: Surface mismatches where paint doesn't match declared tokens

The framework uses a **trace-first architecture** where measurements are recorded once and analyzed many times, enabling pluggable checks without re-running the browser.

## Core Invariants

The Axiomatic Color System relies on three fundamental invariants. Violation of any constitutes a bug.

### Invariant 1: Continuity (Tau-Invariance)

**Definition**: The visual state of the UI must be a continuous function of the time variable τ (tau).

**Implication**: The `data-theme` attribute must _only_ drive the value of τ. It must not directly toggle discrete values (e.g., swapping `white` for `black`).

**The Test**: If we freeze τ (e.g., at τ=0), toggling `data-theme` between `light` and `dark` must result in **zero visual change**.

**Violation**: A "Snap" - an element or variable that listens to the theme attribute directly instead of interpolating via τ.

### Invariant 2: Provenance

**Definition**: Every visible color in the DOM must be derived from the Axiomatic System via allowed token inputs.

**Implication**: No hardcoded hex values, RGB values, or "foreign" variables should be visible unless they have been explicitly mapped to the system via an integration adapter.

**The Test**: Scrape all visible colors. Verify that each color is traceable to a known, valid Axiomatic token or bridge export.

**Violation**: A "Leak" - a component that bypasses the token system.

### Invariant 3: Consistency (Surface Integrity)

**Definition**: An element's `background-color` must match its resolved Surface token.

**Implication**: You cannot simply set `background-color: red`. You must establish a Surface context (which defines the token) and let the element consume that token.

**The Test**: For every element, compare `getComputedStyle(el).backgroundColor` with the resolved value of the expected surface token.

**Violation**: A "Mismatch" - a utility class or rule that overrides the axiomatic background without updating the context.

---

## Measurement Framework

### Finite Paint Property Families

The audit scope is defined by a finite set of paint-relevant CSS properties:

**Color paint** (14 properties):

- `color`
- `background-color`
- `border-top-color`, `border-right-color`, `border-bottom-color`, `border-left-color`
- `outline-color`
- `caret-color`
- `text-decoration-color`
- `box-shadow` (color component)
- `fill` (SVG)
- `stroke` (SVG)

A property is only audited when it is actually painted (non-transparent, non-zero width, etc.).

### Normalized RGBA Values

Computed colors may serialize as `rgb(...)`, `oklch(...)`, `oklab(...)`, or `color(srgb ...)`. The measurement layer normalizes to canonical RGBA for stable delta computation:

```typescript
interface Rgba {
  r: number; // 0-255
  g: number; // 0-255
  b: number; // 0-255
  a: number; // 0-1
}

function normalize(cssColor: string): Rgba;
function rgbaDelta(a: Rgba, b: Rgba): number; // Returns max component delta
```

### Alpha Cutoff

To reduce noise and align with perceptual relevance, paint with alpha below a cutoff is treated as effectively transparent.

**Default**: `alpha < 0.02`

### Bounded Sampling

To ensure deterministic, bounded runtime:

- **Element cap**: Up to 180 visible elements per sample
- **Frame cap**: Up to 180 frames for timeline sampling
- **Viewport intersection**: Only elements with non-zero client rects intersecting viewport

### Visibility Definition

An element is "visible" for auditing if:

- `display !== none`
- `visibility !== hidden`
- `opacity !== 0`
- Non-zero client rect
- Rect intersects the viewport

---

## Continuity Audit

The continuity audit proves that paint is a continuous function of τ.

### Methodology

#### Tau-Freeze Test

The core test for continuity at a fixed τ value:

1. Set τ to a fixed value (e.g., τ=0) via `!important` inline style
2. Record "before" snapshot (all paint properties for sampled elements)
3. Toggle `data-theme`
4. Record "after" snapshot (same elements, same properties)
5. Compare: If delta > threshold, report as snap

**Key insight**: With τ frozen, `data-theme` toggle should cause zero paint changes. Any change is a continuity violation.

#### Time-Zero Sampling

**Critical**: Mode toggles must capture measurements _immediately_ after the toggle, before `requestAnimationFrame`.

```javascript
// REQUIRED sampling order
const before = captureSnapshot();
toggleTheme();
const timeZero = captureSnapshot(); // Synchronous, same task
await nextFrame();
const afterFrame = captureSnapshot();
```

**Rationale**: Variables that flip synchronously on `data-theme` produce "time-zero pops" that are invisible if you only sample after rAF.

#### Palette Flip Detection

Detect when palette variables (e.g., `--sl-color-hairline`) change while τ is pinned:

```typescript
interface PaletteFlip {
  variable: string; // e.g., "--sl-color-gray-6"
  before: Rgba;
  after: Rgba;
  affectedElements: Element[];
}
```

These indicate foreign theme systems (Starlight) responding directly to `data-theme` instead of routing through τ.

### Tau-Stable Snap Detection

During actual transitions, detect paint changes while τ is stable:

**Definition**: A change is a **snap** only when:

- The measured paint delta is large (Δ > threshold)
- τ is stable: `|τ(t) - τ(t-1)| ≤ ε` (default ε = 0.02)

```typescript
interface SnapDetection {
  element: Element;
  property: string;
  tauBefore: number;
  tauAfter: number;
  colorBefore: Rgba;
  colorAfter: Rgba;
  delta: number;
}
```

### Coverage Matrix

**Context grid** (τ × data-theme):

- Static modes: `data-theme ∈ {light, dark}`
- Pinned τ snapshots: `τ ∈ {+1, 0, -1}`
- Transition timeline: real τ transition while toggling theme

**Element sets** (tiered):

1. **Primary chrome selectors**: body, page, header, sidebar, theme toggle
2. **Representative content selectors**: markdown root, code blocks
3. **Bounded visible sample**: up to N elements with non-trivial paint

---

## Provenance Audit

The provenance audit proves that all paint is token-driven.

### Proof Obligations

#### Authority (Manifest Validation)

If a DOM element uses a reserved-prefix class token, that token must appear in the solver-emitted manifest.

```typescript
// Violation
element.classList.contains("surface-custom"); // Not in manifest → FAIL
```

This prevents "invented tokens" and locks consumers to the solver's published interface.

#### No Bypass (Inline Style Detection)

Consumers must not style painted properties via inline styles.

```typescript
// Violation
element.style.backgroundColor = "#0070f3"; // Direct paint → FAIL
element.style.color = "oklch(0.6 0.15 270)"; // Direct paint → FAIL
```

The audit fails when an element's `style` attribute directly sets any audited paint property.

#### Causality (Token-Driven Paint)

For each audited painted property, the computed value must be reproducible from a narrow set of **allowed source expressions** representing the Axiomatic pipeline.

This is stricter than "value matches a palette" - it constrains the _cause_, not just the _result_.

**Allowed expressions**:

- Values derived from class tokens in the manifest
- Values from bridge exports (`--axm-bridge-*`)
- Inherited values that trace to allowed sources

#### Bridge Boundary Enforcement

Foreign variables (e.g., `--sl-*`) are allowed only inside explicit integration adapter boundaries (see RFC-INTEGRATION).

Outside the boundary, `--sl-*` is treated as a provenance leak.

**Implementation**: Enforced at source level via file allowlist:

- Allowed: `site/src/styles/starlight-custom.css`
- Forbidden elsewhere in `site/src/**`

### Audit Algorithm

```typescript
interface ProvenanceAuditResult {
  manifestViolations: ManifestViolation[];
  inlineBypass: InlineBypass[];
  causalityLeaks: CausalityLeak[];
  foreignVarLeaks: ForeignVarLeak[];
}

function runProvenanceAudit(
  manifest: ClassTokenManifest,
  root: Element,
  config: { alphaCutoff: number; maxElements: number },
): ProvenanceAuditResult;
```

---

## Trace-First Architecture

### ObservationLog

The core artifact is the **ObservationLog**: a durable record of all measurements that can be analyzed offline.

```typescript
interface ObservationLog {
  sessionId: string;
  capturedAt: Date;
  url: string;

  // Raw measurements
  snapshots: Snapshot[];
  timeline?: TimelineEntry[];

  // Metadata
  config: MeasurementConfig;
  manifest: ClassTokenManifest;
}

interface Snapshot {
  id: string;
  context: {
    dataTheme: "light" | "dark";
    tau: number | null;
    timestamp: number;
  };
  elements: ElementSnapshot[];
}

interface ElementSnapshot {
  selector: string;
  computedStyle: Record<string, string>;
  classes: string[];
  inlineStyles: Record<string, string>;
}
```

### Pure Analyzers

Checks are implemented as pure functions over ObservationLog:

```typescript
type Analyzer<T> = (log: ObservationLog) => AnalysisResult<T>;

// Example: snap analysis
const analyzeSnaps: Analyzer<SnapViolation[]> = (log) => {
  const snaps: SnapViolation[] = [];
  // Compare snapshots, detect tau-stable deltas
  return { findings: snaps, summary: `Found ${snaps.length} snaps` };
};
```

**Key property**: Measure once, analyze many. Adding a new check doesn't require re-running the browser.

### Capability-Based Session Wrapper

For checks that need browser interaction (impure scenarios), a capability wrapper provides controlled access:

```typescript
interface AuditSession {
  // Measurement capabilities
  captureSnapshot(id: string): Promise<Snapshot>;
  setTau(value: number | null): Promise<void>;
  toggleTheme(): Promise<void>;

  // Log management
  getLog(): ObservationLog;
  saveLog(path: string): Promise<void>;
}
```

**Guardrail**: No check module holds a Playwright `page` reference. All browser interaction goes through the session wrapper.

### Pluggable Check System

Checks are registered modules:

```typescript
interface CheckModule {
  name: string;

  // Configuration
  buildScenario?(builder: ScenarioBuilder): void;

  // Analysis (pure)
  analyze(log: ObservationLog): CheckResult;

  // Reporting
  formatReport(result: CheckResult): string;
}

// Registry
const checks: CheckModule[] = [
  violationsCheck,
  continuityCheck,
  snapsCheck,
  provenanceCheck,
];
```

---

## Implementation

### MeasurementSpec & Compiled Probes

The measurement spec defines what to capture:

```typescript
interface MeasurementSpec {
  elements: ElementSpec[];
  properties: string[];
  alphaCutoff: number;
  maxElements: number;
}

interface ElementSpec {
  selector: string;
  weight: "primary" | "secondary" | "sample";
}
```

Compiled probes execute the spec efficiently:

```typescript
interface CompiledProbe {
  capture(root: Element): ElementSnapshot[];
}

function compileProbe(spec: MeasurementSpec): CompiledProbe;
```

### RGBA Utilities

```typescript
// Normalization
function parseColor(css: string): Rgba;
function rgbaToString(rgba: Rgba): string;

// Delta computation
function rgbaDelta(a: Rgba, b: Rgba): number;
function isPerceptiblyDifferent(a: Rgba, b: Rgba, threshold?: number): boolean;

// Visibility
function isVisible(rgba: Rgba, cutoff?: number): boolean;
```

### Check Implementations

**Violations Check** (`scripts/check-violations.ts`):

- Scans for surface mismatches
- Scans for token authority violations
- Reports inline style bypasses

**Continuity Check** (`src/lib/inspector/continuity.ts`):

- Tau-freeze comparison across theme toggle
- Time-zero sampling
- Delta computation and reporting

**Snaps Check** (timeline analysis):

- Samples during actual τ transition
- Detects tau-stable paint changes
- Attributes to winning CSS rules

**Provenance Check**:

- Manifest validation
- Causality tracing
- Bridge boundary enforcement

---

## Testing Strategy

### CI Integration

**Primary gate**: `pnpm check:violations`

- Fails on surface mismatches
- Fails on provenance leaks
- Runs on docs site and demos

**Continuity gate**: `pnpm test:playwright tests/continuity.spec.ts`

- Tau-freeze tests
- Time-zero sampling
- Palette flip detection

### Golden Masters

For stability:

- Store expected ObservationLogs as golden masters
- CI compares current run against golden
- Ratchet: new snaps cause failure

### Regression Ratchet

Track violation counts over time:

```typescript
interface ViolationRatchet {
  snaps: number;
  leaks: number;
  mismatches: number;
  timestamp: Date;
}
```

New violations increment the count → CI failure. Fixes decrement → success.

---

## Axioms (Hard Constraints)

### Axiom 1: Checks document their proof scope

Each check explicitly documents:

- Scope (static vs transition-time)
- Sampling strategy
- Failure semantics

### Axiom 2: Snaps are defined relative to τ

A change is a **snap** only when:

- Paint delta is large AND
- τ is stable (within epsilon)

This avoids mislabeling normal continuous transitions.

### Axiom 3: Time-zero sampling is mandatory

Any check that toggles `data-theme` MUST capture:

1. Before state
2. Immediately-after-toggle state (same task)
3. (Optional) subsequent frames

### Axiom 4: Measurement uses normalized values

The measurement layer normalizes computed colors to canonical RGBA for stable delta computation.

### Axiom 5: Checks don't touch Playwright

Check modules depend on:

- ObservationLog (pure analyzers)
- Session capability surface (impure scenarios)

No check holds a `page` reference.

### Axiom 6: Branch-free spine

The runner doesn't accrete check-specific branching:

- Scenario config via module hooks
- Analysis is pure over artifacts
- Output formatting owned by modules

---

## Implementation Locations

**Inspector core**:

- `src/lib/inspector/engine.ts` - Inspector engine
- `src/lib/inspector/continuity.ts` - Continuity checks
- `src/lib/inspector/overlay.ts` - Visual debugging

**Scripts**:

- `scripts/check-violations.ts` - Violation scanning
- `scripts/check-violations/` - Modular check implementations

**Tests**:

- `tests/continuity.spec.ts` - Playwright continuity tests
- `tests/provenance.spec.ts` - Provenance validation
- `tests/golden-masters/` - Expected state snapshots

**Helpers**:

- `tests/helpers/` - Shared test utilities

---

## Related RFCs

- **RFC-CONSUMER-CONTRACT**: Defines the contract that provenance audits enforce
- **RFC-INTEGRATION**: Defines bridge boundaries that audits respect
- **RFC-INSPECTOR**: Debugging tools built on audit primitives

## Appendix: Evolution Notes

This RFC consolidates:

- **RFC011**: Continuity Auditing v2 - tau-freeze methodology, snap detection, timeline sampling
- **RFC012**: Provenance Audit v2 - token authority, causality tracing, boundary enforcement
- **design/004**: Axiomatic Validation - original invariant definitions (superseded)

The design/004 invariants (Continuity, Provenance, Consistency) remain the conceptual foundation, but RFC011/012 provide the rigorous measurement framework and implementation architecture.
