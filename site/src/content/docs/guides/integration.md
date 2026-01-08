---
title: Integration
description: How to integrate the generated CSS into your application.
---

Once you have generated your `theme.css` file, integrating it is straightforward. The system produces standard CSS, so it works with any framework (React, Vue, Svelte, etc.) or vanilla HTML.

> **Working Example**: See the [Vercel Demo](https://github.com/design-axioms/color/tree/main/examples/vercel-demo) for a complete Vite + React integration with runtime solver, theme toggle, and dynamic brand color picker.

## 1. Load the CSS

Import the generated file into your application's entry point.

### Vanilla HTML

```html
<head>
  <link
    rel="stylesheet"
    href="https://unpkg.com/@axiomatic-design/color@latest/engine.css"
  />
  <link rel="stylesheet" href="/styles/theme.css" />
</head>
```

### JavaScript / Bundlers (Vite, Webpack)

```javascript
// main.js or index.tsx
import "@axiomatic-design/color/engine.css";
import "./styles/theme.css";
```

### About `*.class-tokens.json`

When you generate `theme.css`, the CLI also writes a class-token manifest alongside it (for example `theme.class-tokens.json`). This file is used for tooling and enforcement (e.g., lint rules and automated checks). Most applications don’t need to read it directly.

## 2. Set the Root Surface

The system requires a "Root Surface" to establish the initial context. Usually, this is the `<body>` tag.

```html
<body class="surface-page">
  <!-- Your app goes here -->
</body>
```

This sets the background color of the page and initializes the CSS variables for the "Page" context.

## Adapter boundary (Bridge exports)

Sometimes you need to integrate Axiomatic Color into a host system that already “owns” its own palette variables and chrome.

In that situation, the contract is:

For a concrete example mapping, see [Bridge API (Adapters)](/advanced/bridge-api).

Continuity constraints (the “interesting” part):

- Bridge exports must not become a second animation driver.
- Chrome borders must not be coupled to text color (`currentColor`).
- Painted properties in chrome should not introduce independent transitions that compete with the engine’s driver.

For a concrete example mapping, see the advanced Bridge API note.

## 3. Using Surfaces

Now you can start building your UI using the semantic classes.

### The Card Pattern

The most common pattern is placing content inside a card.

```html
<div class="surface-card">
  <h2 class="text-strong">Card Title</h2>
  <p class="text-subtle">Card content goes here.</p>
</div>
```

### The Button Pattern

Buttons are interactive surfaces.

```html
<button class="surface-action hue-brand">Primary Action</button>

<button class="surface-action">Secondary Action</button>
```

## 4. Setting Up ThemeManager

**ThemeManager is required** for most applications. If you need dark mode, theme switching, or inverted surfaces (like cards that flip polarity), this is the answer—and it's simpler than what you were probably doing before.

### What ThemeManager Does For You

- **System preference detection** — Automatically syncs with `prefers-color-scheme`
- **Inverted surfaces** — Coordinates cards, spotlights, and other surfaces that flip between light/dark
- **Browser integration** — Updates `<meta name="theme-color">` and `color-scheme`
- **Native controls** — Ensures scrollbars, inputs, and checkboxes match the theme

You would have to implement all of this yourself. ThemeManager does it in 3 lines of code.

### Basic Setup

```ts
import { ThemeManager } from "@axiomatic-design/color/browser";
import { invertedSelectors } from "./theme.generated";

const themeManager = new ThemeManager({ invertedSelectors });
```

**That's it.** Your app now has light/dark mode based on system preference.

### Building a Theme Toggle

```ts
import { ThemeManager } from "@axiomatic-design/color/browser";
import { invertedSelectors } from "./theme.generated";

const themeManager = new ThemeManager({ invertedSelectors });

// Toggle button
document.getElementById("theme-toggle")?.addEventListener("click", () => {
  const newMode = themeManager.resolvedMode === "light" ? "dark" : "light";
  themeManager.setMode(newMode);
  localStorage.setItem("theme-mode", newMode);
});

// Restore on load
const savedMode = localStorage.getItem("theme-mode");
if (savedMode === "light" || savedMode === "dark") {
  themeManager.setMode(savedMode);
}
```

### About `invertedSelectors`

The `invertedSelectors` array tells ThemeManager which surfaces flip polarity. Generate it by running:

```bash
axiomatic build --emit-ts
```

This creates `theme.generated.ts` with the selectors for your configured inverted surfaces. **Do not skip the `--emit-ts` flag**—without it, inverted surfaces won't work correctly.

> **Smooth transitions**: `light-dark()` selects endpoints based on context; smoothness comes from transitioning the computed colors. If another framework sets mode-dependent `background-color`/`color` directly (or disables transitions during toggles), you may see "snaps" even though the Axiomatic engine is correct.

## 5. Inverted Surfaces

Some surfaces, like `surface-spotlight`, are defined as "Inverted". This means they automatically flip the theme context.

- In **Light Mode**, a spotlight is **Dark**.
- In **Dark Mode**, a spotlight is **Light**.

The system achieves this using the standard `color-scheme` CSS property. This ensures that native browser controls (like scrollbars and checkboxes) inside the spotlight render with the correct contrast.

```html
<div class="surface-spotlight p-4">
  <p class="text-strong">I am in a dark context (if the page is light)!</p>
  <!-- Native checkbox will be dark-themed -->
  <input type="checkbox" />
</div>
```

## Framework Examples

### React

```tsx
function Card({ title, children }) {
  return (
    <div className="surface-card p-4 rounded-lg">
      <h3 className="text-strong text-lg font-bold">{title}</h3>
      <div className="text-subtle mt-2">{children}</div>
    </div>
  );
}
```

### Tailwind CSS

The Color System plays nicely with Tailwind. You can use Tailwind for layout (`p-4`, `flex`, `rounded`) and the Color System for... well, color.

If you want to use the Color System's tokens _inside_ Tailwind utility classes (e.g., `bg-surface-card`), you can configure your `tailwind.config.js` to map to the CSS variables.

_Note: A dedicated Tailwind plugin is on the roadmap._

### Tailwind Configuration

To use the system's tokens within Tailwind classes (e.g., `bg-surface-card`), add this to your `tailwind.config.js`:

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
        // Map semantic surfaces
        surface: {
          page: "var(--surface-page)",
          card: "var(--surface-card)",
          action: "var(--surface-action)",
        },
        // Map semantic text
        text: {
          strong: "var(--text-strong)",
          subtle: "var(--text-subtle)",
        },
      },
    },
  },
};
```
