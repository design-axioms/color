# Deferred Work

## Technical Debt & Cleanup

- [ ] **Remove JS Positioning Fallback**: The `AxiomaticDebugger` in `src/lib/inspector/overlay.ts` contains a manual JS positioning fallback for browsers that don't support CSS Anchor Positioning (`position-area`). This feature is targeted for Baseline 2025. We should remove the `updateInfoCardPosition` logic and the `@supports` block in January 2026 to simplify the codebase.
