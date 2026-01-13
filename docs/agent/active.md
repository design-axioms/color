# Current Work: Epoch 45 — Alpha Polish

**Updated:** 2026-01-12

## Previous Epoch: Epoch 44 — Starlight Extraction ✅ COMPLETE

**PRs:**

- #23: ThemeManager delegation to AxiomaticTheme
- #24: ThemeManager inverted selectors option
- #25: CLI `--emit-ts` flag
- #26: Deep partial type fix
- #28: Prettierignore for site
- #29: Make `invertedSelectors` required (BREAKING)
- #32: FrameworkContractAdapter pattern and Starlight implementation

**Outcome:**

- ThemeManager unified, race condition eliminated
- Core inspector framework-agnostic
- RFC010 compliance enforced (adapters = wiring only)
- Bridge expanded to 22 exports (semantic accents: brand, info, success, warning, danger)
- Bridge refactored to `css/bridge.css` for "pay as you go" loading

---

## Current Epoch: Epoch 45 - Alpha Polish

Based on Kano-QFD analysis, we're focusing on documentation gaps that affect new user onboarding and set correct expectations for alpha release.

### Phase A: Quick Wins — ✅ COMPLETE

- [x] Update integration guide with prominent ThemeManager section
- [x] Create `advanced/framework-integration.mdx` for framework authors
- [x] Update plan.md to reflect pivot
- **PR**: #33

### Phase B: Working Example — ✅ COMPLETE

- [x] Document `examples/vercel-demo` as a reference implementation (README.md)
- [x] Add "How It Works" walkthrough
- [x] Cross-link from integration guide
- [x] RFC010/RFC029 conflict resolved (bridge expansion)
- [x] Bridge refactored to separate file (`css/bridge.css`)

---

## Remaining Sessions to Alpha

### Session 1: Close Phase B & Known Limitations — ✅ COMPLETE

**Goal:** Complete Phase B closure and set alpha expectations

- [x] Add cross-link in `advanced/framework-integration.mdx` → Vercel demo
- [x] Create `alpha-limitations.mdx` with known gaps
- [x] Link limitations from Quick Start
- [x] Add to sidebar navigation (Reference section)

**Effort:** S (completed 2026-01-12)

### Session 2: Documentation Polish — ✅ COMPLETE

**Goal:** Address "Concept Overload" gap for new users

- [x] Create "Why Axiomatic?" benefits-focused landing page
- [x] Restructure sidebar with "Start Here" section (Why Axiomatic? + Quick Start)
- [x] Rename "Getting Started" to "Framework Integration" (theory now opt-in)
- [x] Added link to Alpha Limitations from Why Axiomatic page

**Effort:** M (completed 2026-01-12)

### Session 3: Troubleshooting Skeleton — ✅ COMPLETE

**Goal:** Seed troubleshooting content (will expand with alpha feedback)

- [x] Create `reference/troubleshooting.mdx` with skeleton sections
- [x] Add to sidebar navigation (Reference section)
- [x] Cross-link from alpha-limitations.mdx
- [x] Document known issues: theme switching, color appearance, build errors, inspector, integration conflicts

**Note:** Moved to `reference/` to allow explanatory code examples under RFC010.

**Effort:** S (completed 2026-01-12)

### Session 4: VS Code Extension Decision (Current)

**Goal:** Resolve extension ambiguity

**Recommendation:** Defer to post-beta, mark as "Community Welcome"

- [ ] Update deferred.md with decision
- [ ] Add to "Future Ecosystem" section in docs

**Effort:** XS (1 hour)

---

## Alpha Release Criteria

| Criterion                    | Status       |
| ---------------------------- | ------------ |
| All core contract items      | ✅           |
| Static checks pass           | ✅           |
| Working examples exist       | ✅           |
| Known limitations documented | ⏳ Session 1 |
| Gentle on-ramp exists        | ⏳ Session 2 |
| Troubleshooting guide exists | ⏳ Session 3 |

**Blocking Items:** Sessions 1-2  
**Non-Blocking Polish:** Sessions 3-4

---

## Post-Alpha Roadmap

### Epoch 46: Alpha Release

- Version bump, changelog
- npm publish
- Announce to target community

### Epoch 47: Interoperability & Ecosystem

- Round-trip DTCG import
- Native Tailwind preset with Late Binding

### Epoch 48: Beta Release

- Luminance Spectrum UI (Delighter)
- Auto-Fix in Inspector (Delighter)
- Expanded ESLint plugin rules

---

## Deferred Work

### Phase 3: Layer Separation (Deferred to Epoch 47)

- Restructure exports: Pure System / Integration / Dev Tools
- Clear "what layer am I in?" for consumers

### Phase 4: Silent Failures → Explicit Errors (Deferred to Epoch 47)

- Missing backgrounds → throw with helpful message
- Invalid config → validation errors
- Solver errors → actionable suggestions

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
