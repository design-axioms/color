# Design: High-Level Presets ("Vibes")

> **Related Axiom**: [The Laws of Integration](../axioms/04-integration.md) (No Magic Numbers)

## The Law of "Just Enough" Configuration

**We expose knobs for Intent, not Implementation.**

Currently, the Theme Builder exposes the raw "Physics Engine" controls: Bezier curves, anchor points, and chroma multipliers. This is powerful for a "Color Scientist" (Dr. Chen), but overwhelming for a "Pragmatist" (Sarah) who just wants a "Dark Mode that looks good".

## The Problem: Cognitive Load

Asking a user to "adjust the P3 control point of the hue rotation curve" to make their theme feel "warmer" is a failure of abstraction. It requires deep domain knowledge.

## The Solution: Vibe Presets

We need a meta-configuration layer that sits above the raw solver config.

### The "Vibe" Abstraction

A "Vibe" is a named configuration preset that sets multiple low-level parameters to achieve a high-level aesthetic goal.

#### Examples

- **"Corporate"**:
  - High Contrast.
  - Low Chroma in neutrals.
  - Linear Hue Shifts (no wild color swings).
  - Cool Grays.
- **"Vibrant / Playful"**:
  - Higher Chroma budget.
  - Aggressive Hue Shifting (Warm Highlights).
  - Rounder typography (via Type Presets).
- **"Cyberpunk"**:
  - Dark Mode default.
  - Neon accents (Max Chroma).
  - High saturation backgrounds.

### Implementation

1.  **Preset Registry**: A collection of `SolverConfig` partials.
2.  **Selection UI**: A high-level picker in the Theme Builder (e.g., "Choose a Starting Point").
3.  **Ejection**: Users can start with a Vibe and then "Eject" to tweak the raw curves if they need to.

This bridges the gap between "Magic Numbers" (bad) and "Raw Math" (hard), providing "Curated Math" (good).
