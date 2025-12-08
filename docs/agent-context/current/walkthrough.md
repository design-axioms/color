# Phase 3 Walkthrough: Grand Unified Algebra v4.0

## Overview

This phase implemented the **Grand Unified Algebra v4.0** (Baseline 2025), a major architectural overhaul of the color system. The goal was to replace the legacy "Parabolic Dome" physics with the "Safe Bicone" model, implement the Unified State Tuple ($\Sigma$), and transition accessibility features (High Contrast, Forced Colors) to a fully reactive, variable-based architecture.

## Key Implementations

### 1. Unified State Tuple ($\Sigma$)

We formalized the state of any surface as a 5-tuple:
$$ \Sigma = \langle \alpha, \nu, \tau, \gamma, \sigma \rangle $$

- **$\alpha$ (Atmosphere)**: The base hue/chroma context.
- **$\nu$ (Voice)**: The lightness/contrast target.
- **$\tau$ (Time)**: The animation state (Quadratic Ease).
- **$\gamma$ (Gain)**: High Contrast mode state.
- **$\sigma$ (System)**: Forced Colors mode state.

This is now reflected in `css/engine.css` via the `--alpha-*` variables.

### 2. Hybrid Manifold Physics

We implemented a **Hybrid Manifold** strategy, combining Linear Space with Quadratic Time to maximize both gamut safety and transition smoothness.

- **Space (Taper)**: **Linear** (`1 - abs(2L - 1)`).
  - _Why_: The sRGB gamut boundary is linear. This prevents clipping at the extremes (black/white).
- **Time (Tunnel)**: **Quadratic** (`tau^2`).
  - _Why_: A parabolic tunnel stays closer to 0 for longer around the "Gray Equator", creating a wider "Diving Bell" effect that suppresses the Neon Flash during the most dangerous part of the transition.

**New Math:**
$$ \text{Taper} = 1 - |2L - 1| $$
$$ \text{Tunnel} = \tau^2 $$
$$ \text{Limit} = \beta \times \text{Taper} \times \text{Tunnel} $$

### 3. Reactive Accessibility

#### High Contrast (Gain $\gamma$)

Instead of a separate build pass, High Contrast is now handled via CSS variables and the `@media (prefers-contrast: more)` query.

- **Generator**: Emits `*-hc-token` variables (boosted contrast).
- **Engine**: Swaps the source variables dynamically when the media query matches.

#### Forced Colors (System $\sigma$) - "Hollow State"

We implemented the "Hollow State" for Windows High Contrast Mode (Forced Colors).

- **Mechanism**: Surfaces switch from `background-color` to `border` using the `--alpha-structure` variable.
- **Implementation**:
  ```css
  @media (forced-colors: active) {
    .surface-card {
      background: transparent;
      border: var(--alpha-structure); /* e.g., 1px solid CanvasText */
    }
  }
  ```

### 4. Build Pipeline Optimization

- **Removed**: The "double-pass" build logic in `src/cli/commands/build.ts`.
- **Added**: Single-pass generation with all tokens (standard and HC) emitted in one go.
- **Result**: Faster builds and a single source of truth for tokens.

## Verification

- **Unit Tests**: Updated snapshots in `tests/golden-master.spec.ts` and `src/lib/__tests__/generator.test.ts` to reflect the new token structure and media queries.
- **Integration Tests**: Verified `tests/verify-colors.spec.ts` passes, ensuring Starlight integration remains intact.
- **Visual Logic**: Created and ran `tests/hollow-state.spec.ts` to verify that `--alpha-structure` is correctly applied in `forced-colors: active` mode.

## Key Decisions

- **Syntax Fix**: We used `syntax: "*"` for `--alpha-structure` to work around parser limitations with complex border strings.
- **Baseline 2025**: We fully embraced modern CSS features (`@property`, `oklch`, `light-dark`, `abs()`), assuming a modern browser baseline.

## Next Steps

- Manual visual inspection of the demo site to catch any subtle rendering issues that automated tests might miss.

## Bug Fix: CSS Calculation Syntax

### Issue

The variable `--_axm-computed-fg-color` was resolving to `transparent` (initial value).

### Cause

The calculation chain used invalid CSS syntax:

```css
--_text-l-raw: oklch(from var(--_axm-text-lightness-source) l);
```

`oklch` requires 3 components. This caused the variable to be invalid, cascading failure to `--_axm-computed-fg-color`.

### Fix

Inlined the calculation into the final `oklch` function using the correct `from` syntax:

```css
--_axm-computed-fg-color: oklch(
  from var(--_axm-text-lightness-source)
    calc(l + (0.05 * var(--_axm-computed-fg-C))) var(--_axm-computed-fg-C)
    var(--alpha-hue)
);
```

This correctly accesses the `l` component within the function scope.

## Feature Enablement: Tunnel Effect

### Issue

The "Tunnel" effect (chroma dampening during mode transitions) was inactive because `--tau` was static at `1`.

### Fix

Enabled animation for `--tau` in `css/engine.css`:

1.  **Set Target**: Added `@media (prefers-color-scheme: dark) { :root { --tau: -1; } }`.
2.  **Animate**: Added `transition: --tau 0.3s ease-in-out;` to `:root`.

Now, when switching modes, `--tau` sweeps through `0`, causing `--_tunnel` ($ \tau^2 $) to dip to zero, creating the "Diving Bell" safety effect.

## Bug Fix: Surface Physics Syntax

### Issue

Surfaces were rendering as transparent because the physics engine relied on extracting lightness into a variable using invalid syntax:

```css
--_surface-l: oklch(from var(--axm-surface-token) l);
```

### Fix

Refactored the physics calculation to happen inline within the `oklch` function, which allows valid access to the `l` component of the source token:

```css
--_axm-computed-surface: oklch(
  from var(--axm-surface-token) l
    min(
      var(--alpha-beta),
      var(--alpha-beta) * (1 - abs(2 * l - 1)) * var(--tau) * var(--tau)
    )
    h
);
```

## Build & Test Repair

### Issue 1: ELOOP in `llm-context.spec.ts`

**Problem**: The test runner was traversing into `.locald/build/rootfs/...`, causing infinite recursion (ELOOP) due to symlinks in the build environment.
**Fix**: Updated `vitest.config.ts` to explicitly exclude `.locald/**`.

### Issue 2: Snapshot Mismatches

**Problem**: The "Grand Unified Algebra" changes (specifically the use of `var(--alpha-beta)` in `light-dark()` functions) caused `tests/golden-master.spec.ts` snapshots to fail.
**Fix**: Verified the new CSS output was correct (Late Binding) and updated the snapshots.

### Issue 3: Playwright/Vitest Conflict

**Problem**: `tests/brand-button.spec.ts` is a Playwright test but was being picked up by Vitest, causing a crash because it tried to use the Playwright `test()` function in a Vitest environment.
**Fix**: Added `tests/brand-button.spec.ts` to the `exclude` list in `vitest.config.ts`.

### Issue 4: Missing CSS for Docs

**Problem**: `scripts/generate-llms-txt.ts` failed because `css/theme.css` was missing (likely cleaned).
**Fix**: Ran `pnpm solve` to regenerate the theme CSS before running the doc generation script.
