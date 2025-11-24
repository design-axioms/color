# Enhancement Implementation Plan

## Phase Status

- **Current Phase:** Complete
- **State:** Maintenance

## Goal

The system is feature-complete and ready for distribution.

---

## Remaining Tasks

None.

---

## Completed Tasks

### Phase 10: Project Identity (Done)

- [x] **Refactor Directory Structure**:
  - Move `scripts/solver` to `src/lib` (or similar).
  - Ensure `demo` imports from the new location.
- [x] **Package Configuration**:
  - Update `package.json` to export the solver as a library.
  - Add `types` definition.

### Phase 9: System Completeness (Done)

- [x] **Missing Primitives**:
  - [x] Fix `.text-link` in `css/utilities.css` to use `var(--computed-fg-color)` instead of undefined `var(--fg-strong)`.
  - [x] Verify `.state-disabled` implementation (opacity + grayscale).
  - [x] Verify `.state-selected` implementation (brand background/border).
- [x] **Forced Colors Support**:
  - [x] Review and expand `@media (forced-colors: active)` in `css/base.css`.
  - [x] Ensure all surfaces (`.surface-workspace`, `.surface-tinted`) have appropriate High Contrast mappings.
  - [x] Verify utility mappings (`.text-link`, `.state-disabled`, `.state-selected`).

### Phase 10: Project Identity (Partial)

- [x] **Refactor Directory Structure**:
  - Move `scripts/solver` to `src/lib` (or similar).
  - Ensure `demo` imports from the new location.
- [x] **Package Configuration**:
  - Update `package.json` to export the solver as a library.
  - Add `types` definition.

### Phase 5: Documentation (Done)

- [x] `docs/solver-architecture.md` created.

### Phase 1: Cleanup (Done)

- [x] `css/logic.css` deleted
- [x] `scripts/debug-contrast.ts` deleted

### Phase 2: Testing Infrastructure (Done)

- [x] Vitest configured (`vitest.config.ts`)
- [x] Tests created: `math.test.ts`, `generator.test.ts`, `build.test.ts`

### Phase 3: TypeScript + ESLint (Done)

- [x] `tsconfig.json` strict mode verified
- [x] `eslint.config.js` created and configured

### Phase 4: Performance Optimization (Skipped)

- [~] Memoization skipped (Build time ~0.4s is sufficient)

### Phase 5: Documentation (Partial)

- [x] `README.md` updated
- [x] `docs/hue-shift-rationale.md` created

### Phase 6: Robustness & Integration (Done)

- [x] Generator snapshot tests created
- [x] End-to-End build test created
- [x] CI workflow (`.github/workflows/ci.yml`) created

### Phase 7: Demo Enhancements (Done)

- [x] Live Solver Integration (`apca-w3`, `culori` in demo)
- [x] `ContrastTrap` component created
- [x] `Playground` component created

### Phase 8: Experience Lab (Done)

- [x] `ExperienceLab` component created
- [x] `IntentPlayground` component created
- [x] `FearlessInjector` component created
- [x] `ContextPortal` deleted
