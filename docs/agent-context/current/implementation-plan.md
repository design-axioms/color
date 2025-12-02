# Implementation Plan - Epoch 20: Linting & Quality Assurance (Phase 2)

**Goal**: Systematically resolve the ~130 linting errors identified in Phase 1 to achieve a clean, zero-error codebase.

## 1. Svelte Component Fixes

- [ ] **Missing Keys**: Fix `svelte/require-each-key` errors in `#each` blocks.
  - [ ] `DataVizDemo.svelte`
  - [ ] `DynamicRange.svelte`
  - [ ] `KeyColorsEditor.svelte`
  - [ ] `VisualizerGraph.svelte`
  - [ ] `TokenLevelVisualizer.svelte`
  - [ ] `InspectorPanel.svelte`
- [ ] **Return Types**: Add explicit return types to functions in components.
  - [ ] `DebugVisualizer.svelte`
  - [ ] `Diagram.svelte`
  - [ ] `DynamicRange.svelte`
  - [ ] `HueShiftVisualizer.svelte`
  - [ ] `AnchorGraph.svelte`
  - [ ] `SurfaceManager.svelte`
  - [ ] `SurfaceRow.svelte`
  - [ ] `VisualizerGraph.svelte`
  - [ ] `InspectorSurface.svelte`
  - [ ] `TokenInspector.svelte`
- [ ] **Type Safety**: Resolve `no-unsafe-*` and `no-explicit-any` errors.
  - [ ] `Diagram.svelte`
  - [ ] `SurfaceManager.svelte` (heavy usage of `any`)
  - [ ] `SurfaceRow.svelte` (heavy usage of `any`)
  - [ ] `ThemeBuilder.svelte`
- [ ] **Void Expressions**: Fix `no-confusing-void-expression` in arrow functions.
  - [ ] `HueShiftVisualizer.svelte`
  - [ ] `ThemeToggle.svelte`
  - [ ] `AnchorGraph.svelte`
  - [ ] `KeyColorsEditor.svelte`
  - [ ] `SurfaceManager.svelte`
  - [ ] `SurfaceRow.svelte`
  - [ ] `ThemeBuilder.svelte`
  - [ ] `TokenInspector.svelte`
- [ ] **Mustache Interpolation**: Fix `svelte/no-useless-mustaches`.
  - [ ] `HueShiftVisualizer.svelte`
  - [ ] `ThemeBuilder.svelte`

## 2. Script Fixes

- [ ] **Check Links**: Fix `scripts/check-links.ts` (return types, floating promises).

## 3. Library Fixes

- [ ] **Exporters**: Fix `no-unnecessary-condition` in `dtcg.ts` and `tailwind.ts`.

## 4. Verification

- [ ] Run `pnpm lint` to confirm 0 errors.
- [ ] Run `pnpm test:coverage` to ensure no regressions.
