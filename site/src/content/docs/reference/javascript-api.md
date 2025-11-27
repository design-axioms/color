---
title: Runtime API
---

The Runtime API allows you to manage the theme mode and sync it with the browser environment.

## `ThemeManager`

The `ThemeManager` class is the main entry point for runtime theme control.

```typescript
import { ThemeManager } from "color-system/browser";
```

### Constructor

```typescript
const themeManager = new ThemeManager(options?: ThemeManagerOptions);
```

**Options:**

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `root` | `HTMLElement` | `document.documentElement` | The element to apply the theme to. |
| `lightClass` | `string` | `undefined` | Class to add in light mode. If omitted, sets `style="color-scheme: light"`. |
| `darkClass` | `string` | `undefined` | Class to add in dark mode. If omitted, sets `style="color-scheme: dark"`. |
| `faviconGenerator` | `(color: string) => string` | `undefined` | Function to generate an SVG favicon based on the current theme color. |

### Methods

#### `setMode(mode: ThemeMode)`

Sets the active theme mode.

-   **`mode`**: `"light" | "dark" | "system"`

```typescript
themeManager.setMode("dark");
```

#### `get mode()`

Returns the current configured mode (e.g., `"system"`).

#### `get resolvedMode()`

Returns the actual active mode (`"light"` or `"dark"`). If mode is `"system"`, this returns the OS preference.

#### `dispose()`

Cleans up event listeners (e.g., for system preference changes). Call this when unmounting your app or component.

## Helper Functions

### `updateThemeColor()`

Updates the `<meta name="theme-color">` tag to match the computed background color of the document body. This is called automatically by `ThemeManager`, but you can export and use it manually if needed.

```typescript
import { updateThemeColor } from "color-system/browser";

updateThemeColor();
```

### `updateFavicon(generator)`

Updates the favicon dynamically.

```typescript
import { updateFavicon } from "color-system/browser";

updateFavicon((color) => `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
    <circle cx="16" cy="16" r="14" fill="${color}" />
  </svg>
`);
```
