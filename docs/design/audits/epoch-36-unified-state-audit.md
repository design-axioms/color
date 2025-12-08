# Epoch 36 Fresh Eyes Audit: Unified State Tuple

> **Date**: December 7, 2025
> **Scope**: Grand Unified Algebra v4.0 (Unified State Tuple)
> **Status**: Remediation Required

## 1. Executive Summary

The transition to the **Unified State Tuple** ($\Sigma = \langle \alpha, \nu, \tau, \gamma, \sigma \rangle$) represents a massive leap in architectural maturity. By moving accessibility (High Contrast, Forced Colors) and physics (Safe Bicone) into the reactive CSS engine, we have eliminated fragile build steps and improved runtime robustness.

However, a "Fresh Eyes" audit by our key personas has identified a **Critical Regression** in the generator logic for interactive states (Hover/Active), as well as opportunities to clean up technical debt and refine the physics model.

## 2. Findings by Persona

### 2.1. Marcus (The Architect): The State Generation Regression

> **Severity**: **Critical**
> **Impact**: Broken UI states (Hover/Active)

**Observation**:
The `generateTokensCss` function in `src/lib/generator.ts` was updated to use the new `--alpha-*` variables for the _base_ surface, but the loop that generates interactive states (`:hover`, `:active`) still references legacy variables that no longer exist in `engine.css`.

**The Broken Code**:

```typescript
// src/lib/generator.ts
const lightChromaVar = isLightModeFilled
  ? pv("context-chroma") // ❌ Undefined in v4.0
  : pv("base-chroma"); // ❌ Undefined in v4.0
```

**The Consequence**:
Because `--_axm-context-chroma` and `--_axm-base-chroma` are undefined, the `var()` fallback chain will fail or resolve to empty/initial, causing hover states to lose their connection to the "Atmosphere" (Context). A "Brand" button might turn gray or black on hover instead of darkening the brand color.

**Remediation**:
Update the generator to use the new **Atmosphere** variables:

- `--alpha-beta` (Vibrancy/Chroma)
- `--alpha-hue` (Hue)

### 2.2. Jordan (The Accessibility Champion): Dead Code & Source of Truth

> **Severity**: **Medium**
> **Impact**: Maintenance Confusion

**Observation**:
The `toHighContrast` function in `src/lib/generator.ts` implements the old "Theme Swapping" strategy (generating a separate high-contrast theme object). This is now obsolete because High Contrast is handled reactively via `*-hc-token` variables and media queries.

**The Risk**:
Leaving this code creates a "Split Source of Truth". A developer might try to use `toHighContrast` and get results that conflict with the new CSS engine.

**Remediation**:
Delete `toHighContrast` and any associated types/tests.

### 2.3. Dr. Chen (The Scientist): The Physics of Time

> **Severity**: **Low (Polish)**
> **Impact**: Sub-optimal Animation Physics

**Observation**:
The "Tunnel Effect" (safety dampening during mode switches) relies on the equation $\zeta(\tau) = \tau^2$.

- We animate `--tau` linearly from `1` to `-1`.
- The resulting curve is a standard parabola.
- However, because the input transition is linear (`ease-in-out` on the _property_, not the _value_), the "dwell time" in the safe zone (near 0) is purely a function of the parabola's shape.

**Remediation**:
While the current implementation is mathematically correct, we can tune the `transition-timing-function` of `--tau` to be `linear` to let the math ($\tau^2$) handle the easing purely, OR keep `ease-in-out` for a "slower start, faster middle" feel.
_Decision_: Keep as is for now, but document the behavior.

### 2.4. Alex (The Tinkerer): Naming & Mental Model

> **Severity**: **Low (DX)**
> **Impact**: Learning Curve

**Observation**:
The documentation speaks of "Atmosphere" ($\alpha$), but the CSS variables are named `--alpha-hue` and `--alpha-beta`. While "Alpha" matches the Greek letter, it is overloaded in graphics programming (Opacity).

**Remediation**:
Add clear comments in `engine.css` mapping the variable names to the concepts.

```css
/* Atmosphere (Alpha) */
@property --alpha-hue { ... }
```

## 3. Detailed Remediation Plan

### Step 1: Fix State Generation (Critical)

We must rewrite the state generation loop in `src/lib/generator.ts`.

**Current Logic (Legacy)**:

```typescript
const lightChromaVar = isLightModeFilled
  ? pv("context-chroma")
  : pv("base-chroma");
```

**New Logic (Unified Tuple)**:
The concept of "Base" vs "Context" chroma is replaced by the **Atmosphere** ($\alpha$).

- **Glass Surfaces** (Tinted) inherit the Atmosphere directly (`var(--alpha-beta)`).
- **Solid Surfaces** (Filled) _are_ the Atmosphere.

However, for _states_ (Hover/Active), we are modifying an existing surface.

- If the surface is **Glass**, it should continue to use the parent's Atmosphere (`--alpha-beta`).
- If the surface is **Solid**, it establishes its own Atmosphere.

**The Fix**:
We simply use `--alpha-beta` as the source of truth for chroma in the `light-dark()` function for states.

```typescript
// New Implementation
rootLines.push(
  `  ${v("surface-token")}: light-dark(
    oklch(${toNumber(bgState.light.l)} var(--alpha-beta) var(--alpha-hue)),
    oklch(${toNumber(bgState.dark.l)} var(--alpha-beta) var(--alpha-hue))
  );`,
);
```

_Wait_: This assumes the state _inherits_ the atmosphere. But a hover state might _change_ the lightness, which affects the **Safe Bicone**. The `engine.css` handles the Bicone clamping automatically based on the new L value. So we just need to pass the correct Hue/Chroma inputs.

**Refined Fix**:
We need to ensure that `local-light-h` etc. are still emitted if we want to support overrides, but for the main token generation, we should rely on the `alpha` variables if they are set, or fall back to the local values.

Actually, looking at `engine.css`:

```css
--_axm-computed-surface-C: min(var(--alpha-beta), var(--_limit));
--_axm-computed-surface: oklch(
  var(--_surface-l) var(--_axm-computed-surface-C) var(--alpha-hue)
);
```

The engine _ignores_ the chroma/hue inside `surface-token`! It extracts `l` from it:

```css
--_surface-l: oklch(from var(--axm-surface-token) l);
```

And then reconstructs the color using `--alpha-beta` and `--alpha-hue`.

**Conclusion**: The `surface-token`'s Chroma and Hue components are **ignored** by the Reactive Engine for Glass Surfaces. They are only used if the engine is bypassed (which shouldn't happen in standard usage).
However, for **Solid Surfaces** (which might not use the engine's dampening?), we need to be careful.
Actually, _all_ surfaces use the engine.

So, the fix in `generator.ts` is to ensure that the `surface-token` for states provides a valid `l` value. The C and H values in the token are effectively "metadata" or "fallbacks" for environments without `@property` support (if we supported that).

**Correct Fix**:
Just output the literal values from the solver for the token. The engine will extract L and apply the Atmosphere.

```typescript
rootLines.push(
  `  ${v("surface-token")}: light-dark(
    oklch(${toNumber(bgState.light.l)} ${toNumber(bgState.light.c)} ${toNumber(bgState.light.h)}),
    oklch(${toNumber(bgState.dark.l)} ${toNumber(bgState.dark.c)} ${toNumber(bgState.dark.h)})
  );`,
);
```

This is much simpler and correct. We don't need `var(--context-chroma)` indirection anymore because the _Engine_ handles the indirection via `--alpha-beta`.

### Step 2: Remove Dead Code

- Delete `export function toHighContrast` from `src/lib/generator.ts`.
- Remove imports of `toHighContrast` from `src/cli/commands/build.ts` (already done in uncommitted changes, but verify).

### Step 3: Documentation

- Add comments to `css/engine.css` clarifying `Alpha` = `Atmosphere`.

## 4. Verification Strategy

1.  **Visual Verification**:
    - Run the demo.
    - Inspect a "Brand" button (Solid). Hover. Verify it stays colored.
    - Inspect a "Card" (Glass). Hover. Verify it stays tinted.
2.  **Code Verification**:
    - Grep for `context-chroma` and `base-chroma` in `src/lib/`. Should be zero results.
