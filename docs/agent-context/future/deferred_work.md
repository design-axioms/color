# Deferred Work

## Technical Debt & Cleanup

- [ ] **Remove JS Positioning Fallback**: The `AxiomaticDebugger` in `src/lib/inspector/overlay.ts` contains a manual JS positioning fallback for browsers that don't support CSS Anchor Positioning (`position-area`). This feature is targeted for Baseline 2025. We should remove the `updateInfoCardPosition` logic and the `@supports` block in January 2026 to simplify the codebase.

## RFC 011 Follow-ups

- [ ] **Typed Registry Boundary**: Remove remaining weak typing (`any`) around the heterogenous check registry and runner boundary.
- [ ] **Remaining Tau-Stable Snaps**: Investigate and eliminate the last real tau-stable snaps, or refine the detector if they’re artifacts.
