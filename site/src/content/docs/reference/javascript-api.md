---
title: Runtime API
---

The Runtime API allows you to manage the theme mode and sync it with the browser environment.

## `ThemeManager`

The `ThemeManager` class is the main entry point for runtime theme control.

```typescript
import { ThemeManager } from "@axiomatic-design/color/browser";
```

### Constructor

```typescript
import { invertedSelectors } from "./theme.generated";

const themeManager = new ThemeManager({ invertedSelectors });
```

**Options:**

| Option              | Type                        | Default                    | Description                                                                 |
| :------------------ | :-------------------------- | :------------------------- | :-------------------------------------------------------------------------- |
| `invertedSelectors` | `readonly string[]`         | (required)                 | Selectors for surfaces with inverted polarity. Import from generated file. |
| `root`              | `HTMLElement`               | `document.documentElement` | The element to apply the theme to.                                          |
| `lightClass`        | `string`                    | `undefined`                | (deprecated) Class to add in light mode.                                    |
| `darkClass`         | `string`                    | `undefined`                | (deprecated) Class to add in dark mode.                                     |
| `faviconGenerator`  | `(color: string) => string` | `undefined`                | Function to generate an SVG favicon based on the current theme color.       |

### Methods

#### `setMode(mode: ThemeMode)`

Sets the active theme mode.

- **`mode`**: `"light" | "dark" | "system"`

```typescript
themeManager.setMode("dark");
```

#### `get mode()`

Returns the current configured mode (e.g., `"system"`).

#### `get resolvedMode()`

Returns the actual active mode (`"light"` or `"dark"`). If mode is `"system"`, this returns the OS preference.

#### `dispose()`

Cleans up event listeners (e.g., for system preference changes). Call this when unmounting your app or component.

### Interaction with Inverted Surfaces

The `ThemeManager` sets the global theme state on the root element. The generated CSS uses this state to automatically flip the `color-scheme` for inverted surfaces (like `surface-spotlight`).

No extra JavaScript is required to handle these local inversions.

## Helper Functions

### `updateThemeColor()`

Updates the `<meta name="theme-color">` tag to match the computed background color of the document body. This is called automatically by `ThemeManager`, but you can export and use it manually if needed.

```typescript
import { updateThemeColor } from "@axiomatic-design/color/browser";

updateThemeColor();
```

### `updateFavicon(generator)`

Updates the favicon dynamically.

```typescript
import { updateFavicon } from "@axiomatic-design/color/browser";

updateFavicon(
  (color) => `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
    <circle cx="16" cy="16" r="14" fill="${color}" />
  </svg>
`,
);
```
