---
title: Accessibility First
description: How the system ensures inclusive design by default using APCA and automated compliance.
---

In most design systems, accessibility is a step you take *after* you choose your colors. You pick a palette, check the contrast ratios, and then tweak them until they pass.

In the Algebraic Color System, accessibility is the **input**, not the output.

## The Solver is an Accessibility Engine

When you configure the system, you don't say "I want this specific shade of gray for my text."

You say: **"I want my text to be readable."**

The solver takes that intent and calculates the exact lightness value needed to achieve it. If it's mathematically impossible to achieve that contrast with your current background color, the solver will warn you or adjust the background to make it work.

### APCA: The Future of Contrast

We use the **Advanced Perceptual Contrast Algorithm (APCA)**, the candidate method for WCAG 3.0.

Old contrast ratios (like 4.5:1) are simple math, but they don't match how human eyes work. They often fail to predict readability in Dark Mode.

APCA models **human perception**. It understands that:
1.  **Polarity Matters**: White text on black looks different than black text on white.
2.  **Weight Matters**: Thinner fonts need more contrast than bold fonts.
3.  **Context Matters**: The surrounding light affects how you see a specific element.

By using APCA, the system ensures your text is *actually* readable, not just technically compliant.

## Automated High Contrast

Some users need more than just "good" contrast. They need **High Contrast**.

Usually, supporting this requires a separate "High Contrast Theme" that you have to maintain manually.

The Algebraic Color System generates this for you automatically. When you build your theme, it creates a `@media (prefers-contrast: more)` block that:
1.  **Maximizes Range**: Pushes the Page background to pure Black/White.
2.  **Increases Contrast**: Bumps up the target contrast ratios for all text.
3.  **Reduces Noise**: Desaturates colors to reduce visual vibration.

The browser applies this automatically based on the user's OS settings.

## Forced Colors (Windows High Contrast)

For users with severe visual impairments who use "Forced Colors Mode" (like on Windows), the system maps your semantic surfaces to system colors.

| Surface | Maps To |
| :--- | :--- |
| `surface-card` | `Canvas` |
| `text-strong` | `CanvasText` |
| `surface-action` | `ButtonFace` |
| `text-link` | `LinkText` |
| `state-selected` | `Highlight` |

This ensures that your app behaves like a native application for users who rely on these tools.

## Print is an Accessibility Feature

We treat "Print" as just another mode.

When a user prints your page, the system:
1.  **Forces Light Mode**: To save ink and ensure legibility on paper.
2.  **Removes Backgrounds**: Sets backgrounds to `white` (paper color).
3.  **Adds Borders**: Since backgrounds are gone, it adds borders to `surface-card` and other containers so the structure remains visible.

You don't need to write a print stylesheet. The system's "Physics" just adapt to the medium of "Ink on Paper."
