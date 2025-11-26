# Philosophy

The Color System is built on three core pillars: **Math**, **Semantics**, and **Adaptability**.

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

### 1. Guarantees Contrast

<div class="docs-flex surface-card docs-p-4 docs-rounded">
  <button class="surface-action hue-brand docs-p-2 docs-rounded">Brand</button>
  <button class="surface-action hue-blue docs-p-2 docs-rounded">Blue</button>
  <button class="surface-action hue-success docs-p-2 docs-rounded">Success</button>
  <button class="surface-action hue-warning docs-p-2 docs-rounded">Warning</button>
</div>

_All these buttons have different hues, but the system mathematically guarantees they meet the same contrast standard._

### 2. Handles Polarity & Perception

<div class="docs-grid">
  <div class="force-light surface-page docs-p-4 docs-rounded docs-border">
    <strong>Light Mode</strong>
    <div class="surface-card docs-p-4 docs-rounded docs-mt-4">
      Card
      <div class="text-subtle">Lc 90 vs Page</div>
    </div>
  </div>
  <div class="force-dark surface-page docs-p-4 docs-rounded docs-border">
    <strong>Dark Mode</strong>
    <div class="surface-card docs-p-4 docs-rounded docs-mt-4">
      Card
      <div class="text-subtle">Lc 90 vs Page</div>
    </div>
  </div>
</div>

_The system automatically inverts the colors. Notice how the "Card" feels equally distinct in both modes, even though the actual lightness values are different._

### 3. Shifts Hue (Bezold–Brücke Effect)

<div class="docs-grid">
  <div class="surface-page docs-p-4 docs-rounded docs-border">
    <strong>Linear (Boring)</strong>
    <div class="docs-flex docs-mt-4" style="gap: 0">
      <div style="background: oklch(0.2 0.1 260); height: 40px; flex: 1; border-radius: 4px 0 0 4px"></div>
      <div style="background: oklch(0.4 0.1 260); height: 40px; flex: 1;"></div>
      <div style="background: oklch(0.6 0.1 260); height: 40px; flex: 1;"></div>
      <div style="background: oklch(0.8 0.1 260); height: 40px; flex: 1;"></div>
      <div style="background: oklch(0.95 0.1 260); height: 40px; flex: 1; border-radius: 0 4px 4px 0"></div>
    </div>
    <div class="text-subtle docs-mt-2">Same hue (260) at all lightness levels.</div>
  </div>
  <div class="surface-page docs-p-4 docs-rounded docs-border">
    <strong>Shifted (Dynamic)</strong>
    <div class="docs-flex docs-mt-4" style="gap: 0">
      <div style="background: oklch(0.2 0.1 260); height: 40px; flex: 1; border-radius: 4px 0 0 4px"></div>
      <div style="background: oklch(0.4 0.1 270); height: 40px; flex: 1;"></div>
      <div style="background: oklch(0.6 0.1 285); height: 40px; flex: 1;"></div>
      <div style="background: oklch(0.8 0.1 305); height: 40px; flex: 1;"></div>
      <div style="background: oklch(0.95 0.1 330); height: 40px; flex: 1; border-radius: 0 4px 4px 0"></div>
    </div>
    <div class="text-subtle docs-mt-2">Hue rotates (Blue &rarr; Purple &rarr; Pink) as lightness increases.</div>
  </div>
</div>

_The system automatically rotates the hue as lightness changes, mimicking natural light and creating a richer, more vibrant palette._

## Designing with Intent

Our semantic roles (like "Surface", "Action", "Link") are not arbitrary choices. They are derived directly from the **fundamental semantics of the web platform**.

By aligning our taxonomy with these platform primitives, we ensure that accessibility is not an "add-on" or a "special case." It is the **foundation** of the design. When you design with these concepts, you are designing with the grain of the web, ensuring your application feels native and works perfectly for every user, regardless of their device or settings.

> **For the curious:** Under the hood, we map these roles to CSS System Colors (like `Canvas`, `ButtonFace`, `Highlight`). This is how we support Windows High Contrast mode automatically. But you don't need to know that to use the system—just use the semantic names.

## The Surface Model

In this system, you don't pick colors. You pick **Surfaces**.

A Surface is not just a background color. It is a **Context Creator**. When you place an element on a surface, that surface dictates how text, borders, and other elements should behave to remain accessible.

### Polarity: The "Light Switch"

Before understanding specific surfaces, you must understand **Polarity**. Every surface has a polarity that determines how it reacts to Light and Dark mode.

<div class="docs-grid">
  <div class="surface-card docs-p-4 docs-rounded">
    <strong>Page-Aligned</strong>
    <div class="text-subtle">Follows the theme (Light on Light)</div>
  </div>
  <div class="surface-spotlight docs-p-4 docs-rounded">
    <strong>Inverted</strong>
    <div class="text-subtle">Opposes the theme (Dark on Light)</div>
  </div>
</div>

- **Page-Aligned**: These surfaces follow the global mode. They are light in Light Mode and dark in Dark Mode. (e.g., Cards, Sidebars).
- **Inverted**: These surfaces _flip_ the global mode. They are dark in Light Mode and light in Dark Mode. (e.g., Tooltips, Primary Buttons).

The Solver handles this automatically. You just ask for a `spotlight` (which is inverted), and it ensures it pops against the current theme.

### The Categories

The system groups surfaces into four semantic categories based on their intent:

1.  **Canvas**: The foundation. The "floor" of your app.
2.  **Container**: Objects that hold content. They sit on the canvas.
3.  **Action**: Interactive elements. They sit on containers or the canvas.
4.  **Spotlight**: Attention-grabbing elements. They float above everything.

## The Default Hierarchy

The system comes with a standard set of surfaces that map to these categories. While you can create custom surfaces in the Theme Builder, these defaults cover most UI patterns.

<div class="surface-page docs-p-4 docs-rounded docs-border">
  <strong>Page (Canvas)</strong>
  <div class="text-subtle docs-mb-4">The infinite backdrop</div>

  <div class="surface-workspace docs-p-4 docs-rounded docs-border">
    <strong>Workspace (Canvas)</strong>
    <div class="text-subtle docs-mb-4">Elevated area</div>

    <div class="surface-card docs-p-4 docs-rounded">
      <strong>Card (Container)</strong>
      <div class="text-subtle docs-mb-4">Contained element</div>

      <div class="surface-tinted docs-p-4 docs-rounded">
        <strong>Tinted (Container)</strong>
        <div class="text-subtle">Subtle grouping</div>
      </div>
    </div>

  </div>
</div>

### Interactors (Actions)

Actions are surfaces that invite user input. They are the "buttons" and "controls" of your interface.

<div class="docs-flex surface-card docs-p-4 docs-rounded">
  <button class="surface-action docs-p-2 docs-rounded">Action</button>
  <button class="surface-action hue-brand docs-p-2 docs-rounded">Brand Action</button>
  <button class="surface-action hue-danger docs-p-2 docs-rounded">Danger Action</button>
</div>

### Spotlights (Attention)

Spotlights are used to draw immediate attention. They use **Inverted Polarity** to create maximum contrast and visual separation from the page.

<div class="docs-grid">
  <div class="surface-spotlight docs-p-4 docs-rounded">
    <strong>Spotlight</strong>
    <div class="text-subtle">High emphasis</div>
  </div>
  <div class="surface-soft-spotlight docs-p-4 docs-rounded">
    <strong>Soft Spotlight</strong>
    <div class="text-subtle">Medium emphasis</div>
  </div>
</div>

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

## Context Consumers

Text and borders are **Context Consumers**. They don't have their own colors; they calculate their color based on the surface they are sitting on.

- `text-strong`: "I need high contrast against _whatever surface I am on_."
- `text-subtle`: "I need to be readable, but less prominent."
- `bordered`: "I need a decorative border that is visible on this surface."

This means you can copy-paste a component from a light card to a dark spotlight, and the text will automatically invert to remain readable.

<div class="docs-grid">
  <div class="surface-card docs-p-4 docs-rounded">
    <div class="text-strong">Strong Text</div>
    <div class="text-subtle">Subtle Text</div>
    <div class="bordered docs-p-2 docs-m-4">Bordered Element</div>
  </div>
  <div class="surface-spotlight docs-p-4 docs-rounded">
    <div class="text-strong">Strong Text</div>
    <div class="text-subtle">Subtle Text</div>
    <div class="bordered docs-p-2 docs-m-4">Bordered Element</div>
  </div>
</div>
