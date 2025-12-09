# RFC 004: Axiomatic Validation & Debugging

## Summary

This RFC defines the strategy for validating that a UI implementation adheres to the Axiomatic Color System. It establishes the core invariants that must be maintained, the methods for verifying them, and the tooling required to detect and diagnose violations.

## Core Invariants

The Axiomatic Color System relies on three fundamental invariants. A violation of any of these constitutes a bug in the implementation.

### 1. The Continuity Invariant (Tau-Invariance)

**Definition**: The visual state of the UI must be a continuous function of the time variable $\tau$ (tau).
**Implication**: The `data-theme` attribute (or any other state switch) must _only_ drive the value of $\tau$. It must not directly toggle discrete values (e.g., swapping `white` for `black`).
**The Test**: If we freeze $\tau$ (e.g., at $\tau=0$), toggling `data-theme` between `light` and `dark` must result in **zero visual change**.
**Violation**: A "Snap". This occurs when an element or variable listens to the theme attribute directly instead of interpolating via $\tau$.

### 2. The Provenance Invariant

**Definition**: Every visible color in the DOM must be derived from the Axiomatic System Palette.
**Implication**: No hardcoded hex values, RGB values, or "foreign" variables (like Starlight's default `--sl-color-gray-5`) should be visible, unless they have been explicitly mapped to the system.
**The Test**: Scrape all visible colors. Verify that each color matches the computed value of a known, valid Axiomatic token.
**Violation**: A "Leak". This occurs when a component bypasses the system tokens.

### 3. The Consistency Invariant (Surface Integrity)

**Definition**: An element's `background-color` must match its resolved `Surface Color` token.
**Implication**: You cannot simply set `background-color: red`. You must establish a `Surface` context (which defines the token) and let the element consume that token.
**The Test**: For every element, compare `getComputedStyle(el).backgroundColor` with `resolveToken(el, '--axm-surface-token')`.
**Violation**: A "Mismatch". This occurs when a utility class or specific rule overrides the axiomatic background without updating the context.

## Validation Strategy

We employ a multi-layered validation strategy:

### 1. Automated Regression Testing (CI)

We use Playwright to perform "Audits" on the running application.

- **Continuity Audit**: Freezes $\tau$, toggles theme, asserts 0 changes.
- **Provenance Audit**: Collects valid tokens, scans DOM, asserts 0 unknown colors.

### 2. Interactive Debugging (The Inspector)

An on-page overlay (`<axiomatic-debugger>`) allows developers to inspect the state of the system in real-time.

- **Visualizer**: Highlights elements and shows their resolved tokens.
- **Continuity Mode**: Performs the "Tau Zero" dance in the browser and highlights snapping elements.
- **Violation Mode**: Highlights elements with Surface Mismatches or Private Token leaks.

## Diagnosis & Remediation

Detecting a violation is only the first step. The system must explain _why_ it happened.

### Diagnosing Continuity Violations

When an element snaps, we must identify the source of the discontinuity.

- **Variable Swap**: Did a variable used by the element change its definition? (e.g., `--bg` changed from `white` to `black`).
- **Selector Override**: Did a different CSS rule apply? (e.g., `[data-theme='dark'] .card` vs `.card`).

**Proposed Logic**:

1. Capture `ComputedStyle` at State A.
2. Capture `ComputedStyle` at State B.
3. If `backgroundColor` differs:
   - Check if the element uses CSS variables for background.
   - If yes, check if those variables changed value between A and B.
   - If a variable changed, **Blame the Variable**.
   - If no variable changed (or none used), **Blame the Selector** (implies a direct rule change).

### Diagnosing Surface Mismatches

When `background-color` != `Surface Token`, we must identify the overriding force.

- **Inline Style**: Check `element.style`.
- **Utility Class**: Check `classList` for known utilities (e.g., `bg-red-500`).
- **Foreign Token**: Check if the actual color matches a known "foreign" token (e.g., Starlight's palette).

**Proposed Logic**:

1. Get `actualColor`.
2. Check if `actualColor` matches any known "bad" tokens (Starlight defaults). If so, **Blame the Foreign Token**.
3. Check `classList` for `bg-*`. If found, **Blame the Utility**.
4. Check `style` attribute. If set, **Blame Inline Style**.
5. Fallback: **Blame Specific Selector** (ID or high-specificity rule).

## Implementation Plan

1.  **Update `AxiomaticDebugger`**:
    - Implement the "Blame" logic for Continuity checks.
    - Implement the "Foreign Token" matching for Surface checks.
2.  **Update `check-violations.ts`**:
    - Sync the logic with the debugger so CI reports the same detailed reasons.
3.  **Documentation**:
    - Update `CONTRIBUTING.md` to explain how to use these tools.
