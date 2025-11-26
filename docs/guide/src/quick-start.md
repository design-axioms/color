# Quick Start

Get up and running with the Color System in under 5 minutes.

## 1. The Setup

For this guide, we'll assume you have the CSS file generated (or you're using the CLI).

```html
<!-- In your HTML head -->
<link rel="stylesheet" href="./theme.css" />
```

## 2. Your First Surface

The system works by placing content on **Surfaces**. Let's create a simple card.

```html
<body class="surface-page">
  <div class="surface-card">
    <h2 class="text-strong">Hello World</h2>
    <p class="text-subtle">This is my first color system component.</p>
    <button class="surface-action hue-brand">Click Me</button>
  </div>
</body>
```

**What just happened?**

- `surface-page`: Sets the background of the body.
- `surface-card`: Creates a distinct container with a slightly different background color.
- `text-strong`: Automatically picks a high-contrast text color for the card.
- `text-subtle`: Picks a lower-contrast text color.
- `surface-action`: Creates a button background.
- `hue-brand`: Tints the button with your brand color.

## 3. The Magic Switch (Dark Mode)

You don't need to write any extra CSS for dark mode. Just add the `force-dark` class to the body (or let the system detect the user's preference).

```html
<body class="surface-page force-dark">
  <!-- Everything inside here automatically inverts! -->
  <div class="surface-card">...</div>
</body>
```

The `surface-card` will become dark, the `text-strong` will become light, and the `hue-brand` button will adjust its lightness to remain accessible.

## 4. Changing the Brand

Want to change your brand color? You don't need to find-and-replace hex codes. Just update the CSS variable.

```css
:root {
  /* Change from Blue (260) to Pink (330) */
  --hue-brand: 330;
}
```

Every element using `hue-brand` (like our button) will instantly update, maintaining perfect contrast ratios.

## Next Steps

- Learn about the different [Surfaces](./concepts/surfaces.md) available.
- Understand how [Context](./concepts/context.md) works.
- Check out the [CLI](./usage/cli.md) to generate your own theme.
