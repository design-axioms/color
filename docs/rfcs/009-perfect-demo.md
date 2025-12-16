# RFC 009: The Perfect Demo Requirements

**Status**: Proposed
**Date**: 2025-12-12
**Author**: GitHub Copilot (Gemini 3 Pro)

## Summary

This RFC defines the requirements for "The Perfect Demo", a targeted showcase designed to demonstrate the capabilities of Axiomatic Design to Vercel leadership. The goal is to highlight the system's unique value proposition: **CSS-Native Physics** and **Zero Runtime Overhead**.

## Motivation

To effectively communicate the value of the system, we need a demo that is:

1.  **Familiar**: Starts with a visual language the audience understands (Vercel's design system).
2.  **Magical**: Shows capabilities that are impossible or difficult with current tools (Real-time physics, Hard Flip).
3.  **Technical**: Proves the "Zero Runtime" claim by inspecting the raw CSS.

## Requirements

### 1. Vercel Theme Preset

We must create a `vercel` preset in `src/lib/presets.ts` that approximates the Vercel design system.

- **Neutral Scale**: Cool grays, high contrast text.
- **Brand Color**: Vercel Blue (approx. `oklch(0.55 0.25 260)`).
- **Surfaces**: Clean white backgrounds, subtle borders.
- **Typography**: Inter (or system sans-serif), tight tracking.

### 2. Visual Polish: The "Hard Flip"

The "Hard Flip" (nesting a Dark Mode section inside a Light Mode page) must be visually flawless.

- **Shadows**: Inverted surfaces must have appropriate shadows (White Glow in Dark Mode) to separate them from the background.
- **Borders**: Borders must be visible but subtle in both contexts.
- **Text**: Text contrast must be mathematically perfect in the inverted context.
- **Theme Builder**: The Theme Builder UI must support creating/visualizing this state easily.

### 3. Clean DevTools

When inspecting the DOM, the CSS variables must tell a clear story.

- **Naming**: Variables should use clear, semantic names (e.g., `--_axm-computed-surface`, `--text-lightness-source`).
- **Noise**: Avoid "debug soup" or temporary variables that clutter the view.
- **Readability**: The `calc()` expressions should be formatted or structured in a way that is (somewhat) readable, or at least impressive.

### 4. The Script

The demo will follow the script defined in `.plan/vercel-demo.md`.

## Deliverables

1.  **Code**: Updated `src/lib/presets.ts` with the Vercel preset.
2.  **Code**: CSS refinements for the "Hard Flip" and DevTools cleanliness.
3.  **Artifact**: A 2-minute video recording of the demo.
