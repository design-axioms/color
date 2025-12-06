# Design Audit: Theme Builder V2

**Date**: 2025-12-02
**Epoch**: 21 (Phase 1)

## Executive Summary

The current Theme Builder (V1) is a functional **configuration utility**. It successfully allows users to manipulate the `SolverConfig` and see a live preview. However, it fails to be a **design tool** or a **learning environment**. It assumes the user already understands the system's mental model (Context, Anchors, Surfaces) rather than teaching it to them.

## Axiom Alignment Audit

### 1. Context is King (Axiom II.1, III.5)

- **Current State**: The "Surface Manager" is a flat list of surfaces. It does not visually represent the hierarchy or the flow of context.
- **Gap**: Users cannot see how a `card` nested inside a `sidebar` inherits a different context than a `card` on the `page`. The "Context" object is invisible.
- **Verdict**: **FAIL**. The UI hides the most important concept in the system.

### 2. Physics of Light (Axiom II)

- **Current State**: We have a basic lightness graph (Epoch 17) that shows the curve.
- **Gap**: The graph is somewhat disconnected from the controls. You tweak a slider on the left, and the line moves on the right. It's not "Direct Manipulation".
- **Verdict**: **PARTIAL**. Better than nothing, but not "physical".

### 3. Chroma is Expensive (Axiom II.2)

- **Current State**: If a color clips, it just clips. There is no visual feedback that you have "overspent" your chroma budget until the contrast badge turns red.
- **Gap**: No visualization of the gamut boundary. Users are flying blind against the walls of the color space.
- **Verdict**: **FAIL**.

### 4. No Magic Numbers (Axiom IV.8)

- **Current State**: We show the anchor values (0-100), but the resulting LCH values are hidden inside the "Surface Row" expansion or the "Token Inspector" (which is a separate tool).
- **Gap**: The connection between "Input (Anchor 50)" and "Output (L=50, C=0, H=200)" is opaque.
- **Verdict**: **PARTIAL**.

## Persona Friction Points

### 1. Alex (The Visual Tinkerer)

- **Friction**: "I want to make the dark mode 'cooler' (bluer)."
- **Current UI**: He has to find the "Hue Shift" section, understand what "Start" and "End" mean in terms of lightness, and tweak a slider.
- **Ideal UI**: He should be able to grab the curve in the dark region and drag it towards blue.

### 2. Sarah (The Overwhelmed Pragmatist)

- **Friction**: "I just want a 'Soft' theme."
- **Current UI**: She sees a wall of sliders. The "Presets" are hidden in a dropdown.
- **Ideal UI**: High-level "Vibe" controls (Contrast, Vibrancy, Warmth) that adjust multiple parameters under the hood.

### 3. Dr. Chen (The Color Scientist)

- **Friction**: "Is this compliant?"
- **Current UI**: She has to expand every surface row to see the APCA badges.
- **Ideal UI**: A "Dashboard" view that shows the health of the entire system at a glance.

## Key Opportunities

1.  **Visualize the Tree**: Move away from a flat list of surfaces. Show the **Context Tree** (Page -> Card -> Button).
2.  **Direct Manipulation**: Make the graphs interactive. Drag the curve to change the anchors.
3.  **Gamut Visualization**: Show a slice of the color space (L vs C) to show where the colors sit relative to the P3/sRGB boundary.
4.  **Educational Overlays**: "Why is this button black?" -> Hover to see the "Context Trace" (e.g., "Because it's in Light Mode on a White Surface").

## Conclusion

The V2 Theme Builder needs to pivot from "Form Filling" to "System Modeling". It should look less like a Settings panel and more like a CAD tool or a Node Editor.
