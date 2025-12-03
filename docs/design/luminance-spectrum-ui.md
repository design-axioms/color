# Design Document: The Luminance Spectrum UI

**Status:** Proposed
**Date:** 2025-12-02
**Author:** The Design & Experience Council

## 1. Executive Summary

We are replacing the disconnected "Page Anchors" sliders with a unified **Luminance Spectrum** visualization. This component treats Light and Dark modes not as separate settings, but as two windows onto a single continuous axis of lightness (L\*).

This design solves the "Degrees of Freedom" confusion by visually linking the background (Surface) and content (Ink) boundaries, providing immediate feedback on contrast ratios and accessibility.

## 2. The Problem

The current UI exposes four independent sliders:

- `Light Start`
- `Light End`
- `Dark Start`
- `Dark End`

**Issues:**

1.  **Cognitive Load:** Users must mentally construct the relationship between these values.
2.  **Lack of Feedback:** There is no indication of whether the selected range provides sufficient contrast.
3.  **Broken States:** Users can invert ranges (Start < End in Light Mode) without clear visual indication of why the system might break.
4.  **Missing Context:** It fails to visualize the "system" as a whole—specifically, how Light and Dark modes relate to each other.

## 3. The Solution: Luminance Spectrum

A single, high-fidelity control that visualizes the entire 0-100% Lightness (L\*) spectrum.

### 3.1. Visual Anatomy

The component consists of a horizontal track representing L* 0 (Black) to L* 100 (White).

```text
LUMINANCE SPECTRUM (L*)

0%  [Dark Mode Zone]                                     [Light Mode Zone]  100%
|---|==============|-------------------------------------|===============|---|
    ^              ^                                     ^               ^
  Surface        Ink                                    Ink           Surface
(Dark Start)  (Dark End)                            (Light End)    (Light Start)
```

### 3.2. Interaction Model (The Handles)

Instead of "Start" and "End," we use semantic handles that map to the user's mental model:

**Dark Mode Zone (Left Side)**

- **Surface Handle (Left):** Controls `anchors.page.dark.start.background`.
  - _Behavior:_ Sets the darkest background color.
- **Ink Handle (Right):** Controls `anchors.page.dark.end.background`.
  - _Behavior:_ Sets the lightest text/content color.

**Light Mode Zone (Right Side)**

- **Ink Handle (Left):** Controls `anchors.page.light.end.background`.
  - _Behavior:_ Sets the darkest text/content color.
- **Surface Handle (Right):** Controls `anchors.page.light.start.background`.
  - _Behavior:_ Sets the lightest background color.

### 3.3. The Contrast Tether (Feedback Loop)

A visual line connects the Surface and Ink handles for each mode.

- **Visual:** A line drawn below the track connecting the two handles.
- **Data:** Displays the calculated Contrast Ratio (e.g., "16:1").
- **State:**
  - **Pass (AAA):** Green line/badge.
  - **Warning (AA):** Yellow line/badge.
  - **Fail:** Red line/badge.

### 3.4. Constraints & Logic

- **Non-Crossing:** In Dark Mode, Surface must always be < Ink. In Light Mode, Ink must always be < Surface. The UI should physically prevent crossing or visually flag it as an error.
- **Symmetry:** Users can visually assess if their Dark Mode is "as dark" as their Light Mode is "light."

## 4. Data Compatibility Analysis

**Verdict:** ✅ **100% Compatible**

The proposed UI is a direct projection of the existing data structure. It requires **no changes** to the configuration schema (`configState.config.anchors`).

| UI Component      | Visual Location            | Maps To Config Path        | Current Logic      |
| :---------------- | :------------------------- | :------------------------- | :----------------- |
| **Dark Surface**  | Left Handle (Low L\*)      | `anchors.page.dark.start`  | Background (Start) |
| **Dark Ink**      | Mid-Left Handle (High L\*) | `anchors.page.dark.end`    | Content (End)      |
| **Light Ink**     | Mid-Right Handle (Low L\*) | `anchors.page.light.end`   | Content (End)      |
| **Light Surface** | Right Handle (High L\*)    | `anchors.page.light.start` | Background (Start) |

The UI respects the existing directionality naturally. The "Surface" handles always map to `start`, and the "Ink" handles always map to `end`.

## 5. Implementation Plan

1.  **Create `LuminanceSpectrum.svelte`:** A new component to replace the "Page Anchors" section in `GlobalInspector`.
2.  **Implement `RangeSlider`:** A reusable dual-handle slider component.
3.  **Add Contrast Calculation:** Import `wcagContrast` from `culori` to calculate the ratio between the handle values dynamically.
4.  **Connect to Store:** Bind the handles to `configState.updateAnchor`.
