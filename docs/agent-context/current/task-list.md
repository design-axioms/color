# Task List - Epoch 22: Phase 2 - Luminance Spectrum UI

## Phase 1: Scaffolding & Primitives

- [x] **RangeSlider Component**
  - [x] Create `site/src/components/builder/RangeSlider.svelte`.
  - [x] Implement dual-handle logic (min/max).
  - [x] Implement drag handling.
  - [x] Add accessibility attributes (ARIA).
- [x] **LuminanceSpectrum Component**
  - [x] Create `site/src/components/builder/LuminanceSpectrum.svelte`.
  - [x] Implement the visual track (0-100% gradient).
  - [x] Integrate `RangeSlider` for Dark Mode range.
  - [x] Integrate `RangeSlider` for Light Mode range.

## Phase 2: Logic & Integration

- [x] **State Binding**
  - [x] Connect Dark Mode handles to `configState.anchors.page.dark`.
  - [x] Connect Light Mode handles to `configState.anchors.page.light`.
- [x] **Contrast Calculation**
  - [x] Import `contrastForPair` from `src/lib/math.ts`.
  - [x] Calculate and display contrast ratio between Surface and Ink handles.
  - [x] Implement "Contrast Tether" visualization (via RangeSlider fill).
- [x] **Constraints**
  - [x] Enforce `Surface < Ink` (Dark) and `Ink < Surface` (Light).
  - [x] Prevent invalid crossovers.

## Phase 3: Integration & Polish

- [x] **GlobalInspector Integration**
  - [x] Replace "Page Anchors" section with `LuminanceSpectrum` in `AnchorsEditor.svelte`.
- [x] **Visual Polish**
  - [x] Add "Safe Zone" / "Danger Zone" indicators (Color coded badges).
  - [x] Add tooltips for handle values (Badges serve this purpose).
  - [x] Ensure mobile responsiveness (Flex layout).
