# Walkthrough - Epoch 22: Phase 2 - Luminance Spectrum UI

## Overview

We have replaced the disconnected "Page Anchors" sliders with a unified **Luminance Spectrum** visualization. This new component treats Light and Dark modes as two windows onto a single continuous axis of lightness (L\*), providing immediate feedback on contrast ratios and accessibility.

## Key Changes

### 1. New Components

- **`RangeSlider.svelte`**: A reusable, dual-handle slider component that supports min/max values and drag interactions. It serves as the primitive for the spectrum ranges.
- **`LuminanceSpectrum.svelte`**: The main container component that visualizes the 0-100% lightness spectrum. It composes two `RangeSlider` instances (one for Dark Mode, one for Light Mode) and calculates real-time contrast ratios.

### 2. Integration

- **`AnchorsEditor.svelte`**: Replaced the "Page Context" section of the legacy `ContextGraph` with the new `LuminanceSpectrum` component.
- **`ContextGraph.svelte`**: Updated to accept `showPage` and `showInverted` props, allowing us to selectively render the "Inverted Context" section while delegating "Page Context" to the new component.

### 3. Features

- **Unified Axis**: Both Light and Dark modes are visualized on a single track, making it easier to understand their relationship.
- **Contrast Feedback**: Live "Lc" (Lightness Contrast) badges display the contrast ratio between the Surface and Ink handles.
- **Color-Coded Compliance**: The badges change color (Green/Yellow/Red) based on APCA compliance levels (75+/60+/Fail).
- **Constraints**: The UI naturally enforces `Surface < Ink` (Dark) and `Ink < Surface` (Light) constraints via the range slider logic.

## Technical Details

- **State Management**: Leverages Svelte 5 Runes (`$derived`, `$state`) for reactive updates from `ConfigState`.
- **Math**: Uses `contrastForPair` from `@axiomatic-design/color` to calculate accurate APCA contrast ratios.
- **CSS**: Uses absolute positioning and z-indexing to layer the Dark and Light mode sliders on top of the gradient track.

## Next Steps

- Gather user feedback on the new interaction model.
- Consider migrating the "Inverted Context" to a similar spectrum visualization if this pattern proves successful.
