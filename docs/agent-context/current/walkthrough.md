# Walkthrough - Epoch 5: Phase 1 (Browser Integration)

## Native UI Integration

We have updated the core engine to better integrate with the browser's native UI.

### CSS Updates (`css/engine.css`)
- **`color-scheme: light dark`**: Added to `:root`. This tells the browser that the page supports both light and dark modes, which allows it to render native form controls (checkboxes, inputs) and scrollbars in the correct mode.
- **`scrollbar-color`**: Added to the surface engine (`:where([class^="surface-"])`). This applies theme-aware styling to scrollbars on any surface.
  - Thumb: `var(--text-subtle-token)`
  - Track: `var(--surface-token)`
  - This ensures that if you have a scrollable card or sidebar, the scrollbar blends in perfectly with that specific surface.

## Runtime Utilities

We created a new module `src/lib/browser.ts` containing a centralized `ThemeManager` class for managing theme modes and syncing with browser metadata.

### `ThemeManager`
- **Purpose**: A unified controller for managing the application's theme mode (`light`, `dark`, `system`) and its side effects.
- **Features**:
  - **Mode Management**: Handles switching between explicit modes and system preference.
  - **DOM Updates**: Applies the correct classes or `color-scheme` styles to the root element.
  - **Browser Sync**: Automatically updates the `<meta name="theme-color">` and favicon when the theme changes.
  - **Event-Driven**: Uses `requestAnimationFrame` to ensure styles are computed before syncing, avoiding the need for polling or `MutationObserver`.

### `syncThemeColor` & `syncFavicon` (Internal)
- The `ThemeManager` uses these internal utilities to perform the actual updates.
- **`updateThemeColor`**: Updates the `<meta name="theme-color">` tag to match the document body's background color.
- **`updateFavicon`**: Updates the favicon using a dynamic SVG generator that receives the current brand color.

## Demo Integration
- Updated `demo/src/context/ThemeContext.tsx` to use `ThemeManager` instead of manual DOM manipulation.
- Removed `MutationObserver` from `demo/src/app.tsx` as the `ThemeManager` now handles synchronization imperatively when the mode changes.
