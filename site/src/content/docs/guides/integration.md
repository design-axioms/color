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
<button class="surface-action hue-brand">
  Primary Action
</button>

<button class="surface-action">
  Secondary Action
</button>
```

## 4. Handling Dark Mode

The system supports two strategies for Dark Mode.

### Strategy A: System Preference (Default)

By default, the generated CSS uses the `light-dark()` function and media queries to automatically respect the user's OS preference (`prefers-color-scheme`).

You don't need to do anything. If the user's OS is in Dark Mode, your app is in Dark Mode.

### Strategy B: Manual Toggle

If you want to offer a toggle button, you can force a specific mode by adding a class to the `<body>` (or any container).

```html
<!-- Force Dark Mode -->
<body class="surface-page force-dark">...</body>

<!-- Force Light Mode -->
<body class="surface-page force-light">...</body>
```

## Framework Examples

### React

```tsx
function Card({ title, children }) {
  return (
    <div className="surface-card p-4 rounded-lg">
      <h3 className="text-strong text-lg font-bold">{title}</h3>
      <div className="text-subtle mt-2">
        {children}
      </div>
    </div>
  );
}
```

### Tailwind CSS

The Color System plays nicely with Tailwind. You can use Tailwind for layout (`p-4`, `flex`, `rounded`) and the Color System for... well, color.

If you want to use the Color System's tokens *inside* Tailwind utility classes (e.g., `bg-surface-card`), you can configure your `tailwind.config.js` to map to the CSS variables.

*Note: A dedicated Tailwind plugin is on the roadmap.*
