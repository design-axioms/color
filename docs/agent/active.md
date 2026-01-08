# Current Work: Epoch 44, Phase 2 — Starlight Extraction

**Updated:** 2026-01-08

## Previous Phase: ThemeManager Unification — ✅ COMPLETE

**PRs:**

- #23: ThemeManager delegation to AxiomaticTheme
- #24: ThemeManager inverted selectors option
- #25: CLI `--emit-ts` flag
- #26: Deep partial type fix
- #28: Prettierignore for site
- #29: Make `invertedSelectors` required (BREAKING)

**Outcome:**

- ThemeManager now delegates to AxiomaticTheme for all reads
- `invertedSelectors` is a required option, imported from generated TypeScript
- Race condition eliminated: data available at ES module import time
- RFC-021 and JavaScript API docs updated

## Current Phase: Starlight Extraction

**Goal:** Extract Starlight-specific code from core inspector. Create adapter pattern for framework-specific checks.

### Tasks

- [ ] **Extract `starlight-chrome-contract.ts` from core inspector**
  - Move Starlight-specific checks to integration layer
  - Define clear boundary between core inspector and framework adapters

- [ ] **Create adapter pattern**
  - Define `FrameworkAdapter` interface for framework-specific checks
  - Implement `StarlightAdapter` as first adapter

- [ ] **Update site integration**
  - Migrate site to use adapter pattern
  - Verify all existing tests still pass

### Success Criteria

- [ ] Core inspector has no Starlight-specific code
- [ ] Adapter pattern documented in RFC or design doc
- [ ] Site integration uses the new adapter
- [ ] All tests green

---

## Upcoming Phases

### Phase 2: Starlight Extraction

- Extract `starlight-chrome-contract.ts` from core inspector
- Create adapter pattern for framework-specific checks

### Phase 3: Layer Separation

- Restructure exports: Pure System / Integration / Dev Tools
- Clear "what layer am I in?" for consumers

### Phase 4: Silent Failures → Explicit Errors

- Missing backgrounds → throw with helpful message
- Invalid config → validation errors
- Solver errors → actionable suggestions

---

## Deferred from Original Phase 2.1

These tasks move to Epoch 45, Phase 3 (after architecture work):

- Transition snaps (will be simpler with unified ThemeManager)
- Inspector overlay UX hardening
- CSSOM sentinel (now as Starlight adapter, not core)

---

## Handoff Notes

- Project review documents are in `docs/research/status/`
- Agent infrastructure epochs (40-42) moved to Exosuit—see `docs/agent-context/future/exosuit-migration-summary.md`
- Vercel demo is no longer immediate priority (Yehuda starts at Vercel 1/26/2026!)

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

### 5) Inspector Overlay UX Hardening

- Add a Playwright check ensuring continuity flashing stops immediately when the overlay is disabled mid-run.
- Manual QA checkpoint: open overlay, run continuity, disable mid-audit, verify no further theme flips.
- Add regression tests around overlay report schema consumed by `check:violations`.

### 6) Starlight Chrome Continuity: CSSOM Sentinel Migration

- Add a CSSOM-based chrome rule sentinel (Playwright) that scans rules for non-bridge-routed borders and competing transitions.
- Prove the sentinel catches a seeded violation (then remove the seed).
- After verification, migrate existing border “witness” tests to a selector-fed witness set (no broad DOM scanning).

## Acceptance Criteria

- A saved `ObservationLog` can be analyzed for `snaps` with no browser session.
- `CheckModule` exists and at least one check (`snaps`) uses it.
- Lint/tests remain green and the no-dialog invariant is preserved.
