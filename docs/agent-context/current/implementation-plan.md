# Implementation Plan - Epoch 3: Polish & Persistence

## Goal

Refine the Theme Builder into a production-grade tool by adding persistence, templates, and validation.

## Phase 1: Persistence

**Objective:** Allow users to save their work so they don't lose it on refresh.

- [ ] **Local Storage**: Save `SolverConfig` to `localStorage` on change.
- [ ] **Load/Reset**: Load from storage on boot; provide "Reset to Default" (already done, but verify).

## Phase 2: Templates & Presets

**Objective:** Give users starting points.

- [ ] **Preset System**: Define a set of presets (e.g., "High Contrast", "Soft", "Vibrant").
- [ ] **Preset Selector**: UI to switch between presets.

## Phase 3: Contrast Validation

**Objective:** Ensure accessibility.

- [ ] **Contrast Calculation**: Compute APCA or WCAG contrast ratios for surfaces against text.
- [ ] **Visual Feedback**: Warn users if contrast is too low.

## Phase 4: Framework Integration (Optional)

**Objective:** Make it easy to use in React/Vue.

- [ ] **React Hook**: `useColorSystem(config)`.
- [ ] **Vue Composable**: `useColorSystem(config)`.
