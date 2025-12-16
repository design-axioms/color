---
title: Integration
description: How to integrate the generated CSS into your application.
---

Once you have generated your `theme.css` file, integrating it is straightforward. The system produces standard CSS, so it works with any framework (React, Vue, Svelte, etc.) or vanilla HTML.

## 1. Load the CSS

Import the generated file into your application's entry point.

### Vanilla HTML

```html
<head>
  <link rel="stylesheet" href="/styles/theme.css" />
</head>
```

### JavaScript / Bundlers (Vite, Webpack)

```javascript
// main.js or index.tsx
import "./styles/theme.css";
```

## 2. Set the Root Surface

The system requires a "Root Surface" to establish the initial context. Usually, this is the `<body>` tag.

```html
<body class="surface-page">
  <!-- Your app goes here -->
</body>
```

This sets the background color of the page and initializes the CSS variables for the "Page" context.

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

## 4. Handling Dark Mode

The system supports two strategies for Dark Mode.

### Strategy A: System Preference (Default)

By default, the generated CSS uses the `light-dark()` function and media queries to automatically respect the user's OS preference (`prefers-color-scheme`).

You don't need to do anything. If the user's OS is in Dark Mode, your app is in Dark Mode.

> **Note on smooth transitions**: `light-dark()` selects endpoints based on context; smoothness comes from transitioning the computed colors that actually paint (and optionally from continuous state like `--tau`). If another framework sets mode-dependent `background-color`/`color` directly (or disables transitions during toggles), you can see “snaps” even though the Axiomatic engine is correct.

### Strategy B: Manual Toggle

If you want to offer a toggle button, you can force a specific mode by adding a class to the `<body>` (or any container).

```html
<!-- Force Dark Mode -->
<body class="surface-page force-dark">
  ...
</body>

<!-- Force Light Mode -->
<body class="surface-page force-light">
  ...
</body>
```

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
