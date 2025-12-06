# System Intuition: The Mental Model

This document explains the "Why" and "How" of the Color System. It is designed to give you a mental model that makes using the system intuitive.

## 1. The Philosophy: Math vs. Magic

Most color systems are built on **Magic Numbers**.

> "Use `Blue-500` for buttons and `Gray-100` for cards."

Why? Because a designer said so. But what happens when you change the brand color to Purple? Does `Purple-500` have the same contrast ratio against white as `Blue-500`? (Spoiler: No, it doesn't).

This system is built on **Math**.

> "I need a surface that guarantees APCA 60 contrast against the page."

The **Solver** calculates the exact lightness value required to hit that target. If you switch to Dark Mode, it recalculates. If you change the brand hue, it recalculates.

**You define the intent. The system solves the math.**

## 2. The Surface Taxonomy

In this system, you don't pick colors. You pick **Surfaces**.

A Surface is not just a background color. It is a **Context Creator**. When you place an element on a surface, that surface dictates how text, borders, and other elements should behave to remain accessible.

### The Hierarchy

1.  **The Canvas (Foundations)**
    - `surface-page`: The infinite backdrop of your application.
    - `surface-workspace`: A slightly elevated area (often used for sidebars or main content areas).

2.  **The Objects (Containers)**
    - `surface-card`: A distinct, contained element. It has boundaries. It holds content.
    - `surface-tinted`: A subtle variation for grouping related items without a hard border.

3.  **The Interactors (Actions)**
    - `surface-action`: Something you click. It wants to be touched. (e.g., Buttons).

4.  **The Spotlights (Attention)**
    - `surface-spotlight`: High-emphasis, usually inverted. For toasts, tooltips, or major callouts.
    - `surface-soft-spotlight`: A softer version of the spotlight.

### Polarity: The "Light Switch"

Every surface has a **Polarity**:

- **Page-Aligned**: Light surface on light mode, dark surface on dark mode. (e.g., Cards).
- **Inverted**: Dark surface on light mode, light surface on dark mode. (e.g., Spotlights, Tooltips, Primary Buttons).

The Solver handles this automatically. You just ask for a `spotlight`, and it ensures it pops against the current theme.

## 3. The Reactive Pipeline (`engine.css`)

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

## 4. Text & Borders: Consuming the Context

Text and borders are **Context Consumers**. They don't have their own colors; they calculate their color based on the surface they are sitting on.

- `text-strong`: "I need high contrast against _whatever surface I am on_."
- `text-subtle`: "I need to be readable, but less prominent."
- `bordered`: "I need a decorative border that is visible on this surface."

This means you can copy-paste a component from a light card to a dark spotlight, and the text will automatically invert to remain readable.

## 5. Runtime Portability

Because the logic is split between the **Solver** (Math) and the **Pipeline** (CSS), we can run the Solver in the browser!

The `color-system/runtime` module allows you to generate a full theme from a brand color on the fly. This is how the "Fearless Injector" demo works.

```typescript
import { generateTheme, injectTheme } from "color-system/runtime";

const css = generateTheme({
  anchors: { ... },
  keyColors: { brand: "#ff0000" }
});

// Inject and update later
const style = injectTheme(css);
// ... later ...
injectTheme(newCss, undefined, style); // Updates the existing tag
```
