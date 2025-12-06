# Implementation Plan - Epoch 36: Website Polish (Phase 1)

## Goal

Address specific user feedback regarding layout truncation, visual clipping, and color tuning in the Theme Builder (Studio).

## Scope

### 1. Layout Fixes

- **Context Tree (Left Sidebar)**: The text labels for surfaces (e.g., "Surface Workspace") are being truncated.
  - **Fix**: Adjust the width of the sidebar or the indentation/padding of the tree items to allow more space for labels. Consider dynamic resizing or tooltips for very long names, but primary fix is spacing.
- **Inspector (Right Sidebar)**: The `LuminanceSpectrum` control and text are being clipped by the container edge.
  - **Fix**: Increase internal padding of the Inspector panel. Ensure the slider handles have enough "safe area" so they don't overflow the container when at 0% or 100%.

### 2. Data Investigation

- **Spotlight Delta**: The "Surface Spotlight" shows a $\Delta L^c$ of **108**, which should be mathematically impossible on a 0-100 scale.
  - **Action**: Investigate the `calculateDelta` logic and the specific configuration for "Spotlight" to understand this anomaly. It might be a display bug or a wrapping issue.

### 3. Color Tuning

- **Primary Action**: The "Save Changes" button feels washed out.
  - **Fix**: Adjust the `targetChroma` or lightness constraints for the `action` surface in the default configuration to increase visual weight.
- **Vibrancy Slider**: The purple slider doesn't match the cyan/teal theme.
  - **Fix**: Ensure the Studio UI controls reflect the _Studio's_ theme (neutral/purple) distinct from the _User's_ theme, OR make them dynamic. For now, we will focus on the Action surface itself.

## Execution Order

1.  **Layout**: Fix the clipping and truncation first as they are objective bugs.
2.  **Investigation**: Debug the Spotlight value.
3.  **Tuning**: Adjust the Action surface parameters.
