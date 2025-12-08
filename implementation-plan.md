# Implementation Plan - Epoch 38: Grand Unified Algebra v4.0

## Goal

Implement the **Grand Unified Algebra v4.0** across the entire stack. This replaces the deprecated "Parabolic Dome" with the **Safe Bicone** and introduces the **Unified State Tuple** $\Sigma = \langle \alpha, \nu, \tau, \gamma, \sigma \rangle$ to handle High Contrast and Forced Colors modes natively.

## Conceptual Integrity

The system is defined by the Unified State Tuple:

- **$\alpha$ (Atmosphere)**: The environment (Hue + Vibrancy Coefficient).
- **$\nu$ (Voice)**: The semantic intent (Lightness Token).
- **$\tau$ (Time)**: The global cycle (Scalar -1 to 1).
- **$\gamma$ (Gain)**: High Contrast Multiplier.
- **$\sigma$ (System)**: Rendering Mode (Rich vs. X-Ray).

## Execution Phases

### Phase 1: Documentation Verification (Complete)

- [x] `composition-algebra.md`: Updated to define Unified State Tuple & Bicone Taper.
- [x] `biconical-safety.md`: Updated with Linear Taper formula.
- [x] `formal-proof-context-intent.md`: Updated with new math.

### Phase 2: Core Library (`src/lib`)

- [ ] **Generator (`src/lib/generator.ts`)**:
  - **Implement HK Buffer**: $L_{target} = L_{APCA} + (0.05 \times \beta)$.
  - **Generate High Contrast Tokens**: Create `--text-subtle-high` (APCA 60) alongside standard tokens.
  - Verify `src/lib/types.ts` reflects any new configuration needs.

### Phase 3: CSS Engine (`css/engine.css`)

- [ ] **Global State**:
  - Define `@property --tau` (initial: 1).
- [ ] **Modifiers**:
  - Update `.hue-*` to set `--alpha-hue` and `--alpha-beta`.
  - Define `--alpha-structure` for X-Ray Mode fallbacks.
- [ ] **Surfaces**:
  - Implement `surface-card` with **Safe Bicone** logic:
    - `_x = 2 * L - 1`
    - `_taper = 1 - abs(_x)` (Linear Taper)
    - `_tunnel = tau * tau`
    - `_limit = beta * taper * tunnel`
  - Implement **X-Ray Mode** (`@media (forced-colors: active)`):
    - Disable background colors.
    - Enable borders via `--alpha-structure`.
- [ ] **Voice**:
  - Implement **Gain** (`@media (prefers-contrast: more)`):
    - Swap `--nu-target` for High Contrast tokens.

### Phase 4: CLI & Theme Builder (`src/cli`)

- [ ] **Token Generation**:
  - Ensure the CLI writes the correct CSS variables to `theme.css`.
  - Verify `src/cli/index.ts` handles the new variable names.

### Phase 5: Verification

- [ ] **Build**: Run `pnpm build:css`.
- [ ] **Test**: Run `pnpm test` to check for regressions.
- [ ] **Visual**: Check the demo site for:
  - No clipping on white backgrounds (Bicone Taper check).
  - Smooth transitions between modes (Tunnel check).
  - High Contrast Mode behavior.
  - Forced Colors Mode behavior (Hollow State).

## Key Formulas

- **Taper**: `1 - abs(2L - 1)`
- **Tunnel**: `tau^2`
- **Limit**: `beta * taper * tunnel`
- **HK Buffer**: `L_req + (0.05 * beta)`
