# Runtime API

The Runtime API allows you to change the theme dynamically in the browser. This is useful for:

- **Theme Builders**: Letting users customize their UI.
- **White Labeling**: Loading a brand's colors from an API at runtime.
- **User Preferences**: Allowing users to tweak contrast or saturation.

## The Reactive Pipeline (Engine)

The core logic lives in `css/engine.css`. It uses CSS `@property` to create a reactive data flow that responds instantly to JavaScript changes.

### 1. Inputs (Variables)

The engine listens to specific CSS variables that you can set on the `:root` or any element.

- **`--base-hue`**: The primary brand hue (0-360).
- **`--base-chroma`**: The saturation level (0-0.25).
- **`--surface-token`**: The lightness value (usually set by the static CSS, but can be overridden).

### 2. Computation (The Engine)

The engine calculates intermediate values and combines them into the final color.

```css
/* Simplified Engine Logic */
.surface-card {
  /* Calculate Chroma based on the base chroma */
  --computed-surface-C: calc(var(--base-chroma) * 0.5);

  /* Calculate Hue (potentially shifted) */
  --computed-surface-H: var(--base-hue);

  /* Combine into final color */
  --computed-surface: oklch(
    var(--surface-token) var(--computed-surface-C) var(--computed-surface-H)
  );
}
```

### 3. Output (Properties)

The computed colors are assigned to standard CSS properties.

```css
.surface-card {
  background-color: var(--computed-surface);
  color: var(--computed-fg-color);
}
```

## Animation Strategy

The runtime supports smooth animations for both continuous and discrete changes.

### Continuous Changes (Hue/Chroma)

When you animate `--base-hue` (e.g., from Blue to Red), the browser interpolates the number, and the engine recalculates the color every frame. This is "free" because of the reactive pipeline.

### Discrete Changes (Light/Dark Mode)

When `light-dark()` flips from Light to Dark, the input token (`--surface-token`) changes _instantly_. Normally, this would cause a harsh snap.

**The Fix:** We transition the **Computed Properties**, not the inputs.

```css
/* css/engine.css */
@property --computed-surface {
  syntax: "<color>";
  inherits: true;
  initial-value: transparent;
}

* {
  /* The browser interpolates the RESULT of the calculation */
  transition: --computed-surface 0.2s;
}
```

By registering `--computed-surface` with `@property`, we tell the browser it's a color. When the input snaps, the _result_ changes, and the browser transitions smoothly between the old result and the new result.

## Browser Integration

The library provides a `ThemeManager` class to manage the theme mode and sync it with the browser's native UI (Address Bar, Favicon).

### `ThemeManager`

The `ThemeManager` handles:
1.  **Mode Switching**: Toggling between `light`, `dark`, and `system` modes.
2.  **DOM Updates**: Applying the correct classes or `color-scheme` styles to the root element.
3.  **Browser Sync**: Automatically updating the address bar color and favicon.

```typescript
import { ThemeManager } from "color-system/browser";

// Initialize the manager
const themeManager = new ThemeManager({
  // Optional: Custom classes for light/dark modes
  lightClass: 'light-theme',
  darkClass: 'dark-theme',
  
  // Optional: Generator for dynamic favicons
  faviconGenerator: (color) => `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
      <circle cx="16" cy="16" r="14" fill="${color}" />
    </svg>
  `
});

// Set the mode
themeManager.setMode('dark');   // Force dark mode
themeManager.setMode('light');  // Force light mode
themeManager.setMode('system'); // Follow system preference

// Get the current resolved mode ('light' or 'dark')
console.log(themeManager.resolvedMode);

// Clean up listeners when done
themeManager.dispose();
```

### Automatic Syncing

When you call `setMode()`, the `ThemeManager` automatically:
1.  Updates the root element (e.g. `document.documentElement`).
2.  Waits for styles to compute.
3.  Updates `<meta name="theme-color">` to match the body background.
4.  Updates the favicon (if a generator is provided) to match the body text color.
