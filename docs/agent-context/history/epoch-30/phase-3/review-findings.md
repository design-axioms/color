# Code Review Findings - Epoch 28

## Critical Violations

### 1. Source of Truth Violation in `starlight-custom.css`

- **File**: `site/src/styles/starlight-custom.css`
- **Violation**: Manually re-declares system tokens (`--axm-surface-token`, `--axm-text-high-token`, etc.) instead of importing the generated `css/theme.css`.
- **Evidence**:
  ```css
  --axm-surface-token: light-dark(
    oklch(1 var(--surface-light-c) var(--surface-light-h)),
    oklch(0 var(--surface-dark-c) var(--surface-dark-h))
      /* Drift: theme.css uses 0.1 */
  );
  ```
- **Risk**: The documentation site's visual representation has drifted from the actual generated code (Dark mode surface lightness is 0 vs 0.1). This undermines the "Dogfooding" strategy.
- **Remediation**: Remove manual declarations and ensure `css/theme.css` is loaded before `starlight-custom.css`.

## Performance Risks

### 1. Expensive MutationObserver in `ThemeManager`

- **File**: `src/lib/browser.ts`
- **Risk**: The `MutationObserver` callback queries the entire document (`node.querySelector(...)`) for every added node.
- **Evidence**:
  ```typescript
  node.querySelector(this.invertedSelectors.join(","));
  ```
- **Impact**: Potential layout thrashing or main-thread blocking during heavy DOM updates (e.g., hydration).
- **Remediation**: Optimize the observer to check `matches` on the node itself or use a more specific observation strategy.

## Component Architecture

### 1. Magic Numbers in Algebra Demos

- **Files**: `StateVectorExplainer.svelte`, `ContrastStabilityDemo.svelte`
- **Observation**: Extensive use of hardcoded color values (e.g., `oklch(0.96 ...)`).
- **Verdict**: **Acceptable**. These are educational visualizations demonstrating the _underlying math_ of the system, so they need to operate at a lower level of abstraction than the system tokens themselves.

## Compliance

- **Axiom 9 (Baseline Newly Available)**: `light-dark()` usage is consistent and correct.
- **Axiom 7 (Code is Source of Truth)**: Violated by `starlight-custom.css`.
