---
title: Philosophy
description: The core principles behind the Algebraic Color System.
---

The Algebraic Color System is built on three core pillars: **Math**, **Semantics**, and **Adaptability**.

## Math vs. Magic

Most color systems are built on **Magic Numbers**.

> "Use `Blue-500` for buttons and `Gray-100` for cards."

This forces **you** to be the calculator.

1.  **Is it accessible?** You have to know that `Blue-800` is safe on `Blue-200`. Is `Blue-500` safe? You have to check a table.
2.  **What about Dark Mode?** `Blue-800` on `Blue-200` might work in Light Mode, but in Dark Mode, you need to invert it. Now you're managing two sets of magic numbers.
3.  **Is it consistent?** The math of perception is non-linear. A step of "100" in lightness looks different in dark mode than in light mode. To make them _feel_ the same, you have to manually tweak the values.

This system is built on **Math**.

> "I need a Card."

The system translates this intent into a mathematical rule: _Must have APCA 60 contrast against the background._

The **Solver** handles the complexity for you:

- **It guarantees contrast**: It picks the exact lightness to hit APCA 60.
- **It handles polarity**: It automatically flips for Dark Mode.
- **It balances perception**: It adjusts the lightness steps so that "contrast" feels the same in both modes.
- **It shifts hue**: It automatically warms up lighter colors and cools down darker colors (the "Bezold–Brücke effect") so you don't have to manually pick "warmer" grays.

**You define the intent. The system solves the math.**

## Designing with Intent

Our semantic roles (like "Surface", "Action", "Link") are not arbitrary choices. They are derived directly from the **fundamental semantics of the web platform**.

By aligning our taxonomy with these platform primitives, we ensure that accessibility is not an "add-on" or a "special case." It is the **foundation** of the design. When you design with these concepts, you are designing with the grain of the web, ensuring your application feels native and works perfectly for every user, regardless of their device or settings.

> **For the curious:** Under the hood, we map these roles to CSS System Colors (like `Canvas`, `ButtonFace`, `Highlight`). This is how we support Windows High Contrast mode automatically. But you don't need to know that to use the system—just use the semantic names.

## The Reactive Pipeline

How does this actually work in the browser?

We use a technique called the **Reactive Pipeline**. Instead of hardcoding hex values into classes, we use CSS Custom Properties (`var(--...)`) and the Relative Color Syntax (`oklch(from ...)`).

### The Flow

1.  **Input Variables**: You set high-level intent variables.

    ```css
    .hue-brand {
      --hue-brand: 250;
    }
    ```

2.  **The Engine (`engine.css`)**: The engine listens to these variables and recalculates the colors in real-time.

    ```css
    /* Simplified Engine Logic */
    --computed-surface: oklch(from var(--surface-token) l c var(--hue-brand));
    ```

3.  **The Output**: The browser renders the final color.

### Why is this powerful?

- **Instant Theming**: Change `--hue-brand` on the `<body>`, and the entire app updates instantly. No re-compiling CSS.
- **Scoped Theming**: Change `--hue-brand` on a specific `<div>`, and only that section changes color.
- **Animation**: Because these are just numbers, you can animate them! The system handles the color interpolation for you.
