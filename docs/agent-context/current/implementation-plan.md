# Implementation Plan - Epoch 22: Phase 2 - Luminance Spectrum UI

## Goal

Replace the disconnected "Page Anchors" sliders in the Theme Builder with a unified **Luminance Spectrum** visualization. This component will treat Light and Dark modes as two windows onto a single continuous axis of lightness (L\*), providing immediate feedback on contrast ratios and accessibility.

## Scope

- **New Components**:
  - `LuminanceSpectrum.svelte`: The main container component.
  - `RangeSlider.svelte`: A reusable dual-handle slider for the spectrum track.
- **Integration**:
  - Replace the existing "Page Anchors" section in `GlobalInspector.svelte`.
  - Connect the new components to `configState` and `themeState`.
- **Logic**:
  - Implement contrast calculation using `src/lib/math.ts`.
  - Visualize "Safe Zone" (APCA compliance) and "Danger Zone".
  - Enforce constraints (Surface < Ink in Dark Mode, Ink < Surface in Light Mode).

## Strategy

1.  **Component Architecture**: Build `LuminanceSpectrum` as a self-contained component that accepts the current config and emits updates.
2.  **Visual Design**: Use the existing design language (Theme Builder aesthetic) but introduce the "Spectrum" concept (0-100% gradient or track).
3.  **Incremental Adoption**: We can develop this alongside the existing controls initially, or replace them directly if confident. Given the "Fresh Eyes" audit, a direct replacement is preferred to reduce clutter.

## Deliverables

- `site/src/components/builder/LuminanceSpectrum.svelte`
- `site/src/components/builder/RangeSlider.svelte`
- Updated `site/src/components/builder/GlobalInspector.svelte`

## Execution Steps

1.  **Scaffold Components**: Create the files for `LuminanceSpectrum` and `RangeSlider`.
2.  **Implement RangeSlider**:
    - Needs to support two handles (min, max).
    - Needs to support a "track" visualization.
    - Needs to handle drag events and constraints.
3.  **Implement LuminanceSpectrum**:
    - **Architecture**: A single track representing 0-100% L\*.
    - **Handles**: Four independent handles on this single track.
      - `Dark Surface` (Low L\*)
      - `Light Ink` (Low L\*)
      - `Dark Ink` (High L\*)
      - `Light Surface` (High L\*)
    - **Visual Grouping**: While they share a track, we visually connect the "Dark Pair" and the "Light Pair" with the "Contrast Tether" (lines below/above the track).
    - **Z-Index**: Since `Dark Surface` and `Light Ink` will both be near 0, handles must handle overlap gracefully (e.g., active handle pops to front).
4.  **Connect Logic**:
    - Bind handles to `configState.config.anchors.page.dark.start`, `dark.end`, `light.end`, `light.start`.
    - Calculate contrast between Surface and Ink handles using `contrastForPair`.
    - Display contrast badges.
5.  **Integration**:
    - Swap into `GlobalInspector`.
6.  **Polish**:
    - Add tooltips, labels, and visual feedback.

## Questions / Risks

- **Overlapping Ranges**:
  - _Q: Can Dark Mode Ink be lighter than Light Mode Ink?_
  - **A: Yes.** In fact, `Dark Ink` (e.g., 90%) is almost always lighter than `Light Ink` (e.g., 10%). They do not "collide"; they pass each other.
  - _Q: Can Dark Mode Surface be lighter than Light Mode Surface?_
  - **A: Technically yes, but practically no.** If `Dark Surface` > `Light Surface`, the user has inverted the theme meanings. We should warn but perhaps not strictly prevent, or just assume `Dark Surface` is the one near 0.
- **Constraints**:
  - **Hard Constraint**: `Dark Surface < Dark Ink`
  - **Hard Constraint**: `Light Ink < Light Surface`
  - **Interaction**: Dragging a Surface handle past its Ink handle should push the Ink handle (or stop), maintaining a minimum distance of 0.
- **Mobile**:
  - A single wide track is fine, but touch targets are the risk.
  - **Mitigation**: Ensure handles have large hit areas. If handles overlap (e.g., Dark Surface at 5%, Light Ink at 10%), ensure the user can select the one they want (maybe tap to cycle, or vertical staggering of handles).

## Refinement

- The design doc specifies "The Contrast Tether (Feedback Loop)". This is a visual line connecting the handles.
- We should use `src/lib/math.ts` for `contrastForPair`.
