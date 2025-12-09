# Continuity Audit

## The Problem: Visual Snapping

We observed visual "snaps" during theme transitions. Elements like the sidebar, search box, and asides would jump from one color to another instead of smoothly transitioning.

## The Diagnosis: Variable Swapping vs. Continuous Functions

The root cause is "Variable Swapping".

- **Standard Approach (Starlight)**: `data-theme="light"` sets `--bg: white`. `data-theme="dark"` sets `--bg: black`.
- **Axiomatic Approach**: `data-theme` sets `--tau` (time). `--bg` is a function of `--tau`.

When Starlight swaps variables based on the `data-theme` attribute, it bypasses our `--tau` transition.

## The Solution: Systematic Detection

We created a "Continuity Audit" test (`tests/continuity.spec.ts`).

### Methodology

1.  **Freeze Time**: Force `--tau: 0` (the midpoint of the transition).
2.  **Toggle State**: Switch `data-theme` from `light` to `dark`.
3.  **Compare**: If the system is purely axiomatic, the visual output should be **identical** because `--tau` hasn't changed.
4.  **Detect**: Any element that changes color is a "Leak" - it is listening to `data-theme` directly instead of `--tau`.

### Results

The initial run detected **90 violations**. This confirms that despite our visual fixes, there are still many elements (Body, Header, Dialogs, Options) that are "leaking" - likely due to Starlight's base styles or other overrides we haven't fully captured yet.

This test provides a systematic way to identify and eliminate every single visual snap in the system.
