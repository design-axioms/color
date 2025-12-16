# Time Continuity & The Tau Engine

This document explains the concept of **Time Continuity** in the Axiomatic Color system and how the **Tau Engine** enforces it.

## The Concept: Time as a Dimension

In traditional color systems, "Light Mode" and "Dark Mode" are two discrete states. You are either in one or the other.

In Axiomatic Color, we treat the transition between modes as a continuous dimension called **Time** ($\tau$).

- $\tau = 1$: Day (Light Mode)
- $\tau = -1$: Night (Dark Mode)
- $\tau = 0$: Twilight (The midpoint)

### The Law of Continuity

> **Axiom**: All color transitions must be continuous functions of Time.

This means that as $\tau$ moves from 1 to -1, every color on the screen should interpolate smoothly. There should be no "snapping" or "flashing".

## The Tau Engine

The **Tau Engine** is the CSS logic that implements this interpolation. It uses CSS custom properties to calculate the current color based on the current value of `--tau`.

```css
/* The Physics Model */
--_axm-computed-surface: oklch(
  from var(--axm-surface-token) l
    min(
      var(--alpha-beta),
      var(--alpha-beta) * (1 - abs(2 * l - 1)) * var(--tau) * var(--tau)
    )
    h
);
```

Because the color is calculated dynamically in the browser's style engine, we can animate `--tau` to create smooth, perfect transitions between themes without any JavaScript.

## Continuity Violations

A **Continuity Violation** occurs when an element bypasses the Tau Engine. This usually happens when:

1.  **Hardcoded Colors**: An element has a static background color (e.g., `background: white` or `bg-white`).
2.  **Utility Classes**: Using Tailwind or other utility classes that set specific color values.
3.  **Legacy CSS**: Old styles that haven't been updated to use Axiomatic Surface tokens.

When the theme switches, these elements "snap" instantly from their light value to their dark value (or don't change at all), breaking the illusion of a continuous physical environment.

## The Inspector's Check

The **Axiomatic Inspector** includes a "Continuity Check" (the Timer icon) to detect these violations.

### How it Works

1.  **Freeze Time**: The inspector sets `--tau` to `0` (Twilight) and disables all CSS transitions.
2.  **Capture State A**: It forces the browser into Light Mode and records the computed background color of every element.
3.  **Capture State B**: It forces the browser into Dark Mode and records the colors again.
4.  **Compare**: If an element's color changes between State A and State B while Time is frozen, it means the element is **not** respecting the value of $\tau$. It is reacting directly to the system theme preference, which is a violation.

### Fixing Violations

To fix a violation, replace the static color with an **Axiomatic Surface Token**.

**Bad (Violation):**

```html
<div class="bg-white dark:bg-black">...</div>
```

**Good (Continuous):**

```html
<div class="surface-card">...</div>
```

By using `.surface-card`, you opt-in to the Tau Engine, ensuring that the element's color is a function of Time, guaranteeing smooth continuity.
