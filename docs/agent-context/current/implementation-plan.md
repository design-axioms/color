# Implementation Plan - Epoch 44, Phase 2: RFC 011 Follow-up (Continuity Auditing v2)

## Objective

Turn RFC 011’s architecture into a working loop: browser measurement emits `ObservationLog` artifacts; Node analyzers can re-run from logs without Playwright.

## Milestones

### 1) Snapshot Probe + Log Event

- Implement `Snapshot` measurement in the browser layer.
- Decide the exact payload contract (bounded, stable, replayable):
  - per-selector computed styles (normalized)
  - minimal geometry (only if needed)
  - versioned schema fields for forward compatibility
- Record as `measure:snapshot` in `ObservationLog`.

### 2) Snaps Log-only Replay

- Add a `snaps` analyzer that accepts an `ObservationLog` on disk and produces the same `snaps` output.
- Keep live behavior unchanged; log-only mode is additive.

### 3) Scenario + Analyzer Modularization

- Define a tiny `CheckModule` interface.
- Port `snaps` to the new shape:
  - scenario: uses capabilities and records measurements
  - analyzer: pure Node logic over logs

### 4) Resolve Remaining Late “Tau-stable” Snaps

- Run the detector on a small, curated set of docs URLs.
- For each remaining snap:
  - Fix real late flips in CSS/tokens
  - Or refine detector definition and add a regression case to keep it honest

## Acceptance Criteria

- A saved `ObservationLog` can be analyzed for `snaps` with no browser session.
- `CheckModule` exists and at least one check (`snaps`) uses it.
- Lint/tests remain green and the no-dialog invariant is preserved.
