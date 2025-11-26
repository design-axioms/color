# Implementation Plan - Epoch 5: Phase 1 (Browser Integration)

## Goal

Make the Color System feel "native" to the browser environment by syncing the theme with browser UI primitives (Address Bar, Scrollbars, Favicons).

## Proposed Scope

- **Meta Theme Color**: Automatically update `<meta name="theme-color">` to match the current page background.
- **Color Scheme**: Ensure `color-scheme` property is set correctly on `:root` to affect native form controls and scrollbars.
- **Scrollbar Styling**: Apply theme-aware styling to scrollbars using `scrollbar-color`.
- **Dynamic Favicons**: Implement SVG favicons that use CSS variables to adapt to the current theme (e.g., a brand-colored dot that changes in dark mode).

## Tasks

- [ ] **Meta Theme Color Sync**
  - [ ] Create a runtime utility (or extend `FearlessInjector`) to observe the computed background color of the body.
  - [ ] Update the `<meta name="theme-color">` tag in real-time.
- [ ] **Native UI Integration**
  - [ ] Add `color-scheme: light dark` (or specific) to `engine.css`.
  - [ ] Add `scrollbar-color` definitions to `engine.css` using generated tokens.
- [ ] **Dynamic Favicons**
  - [ ] Design a simple SVG favicon that accepts CSS variables.
  - [ ] Implement a mechanism to serve this SVG as a data URI or separate file.
  - [ ] Verify it updates when the theme changes.
- [ ] **Verification**
  - [ ] Test in Chrome/Firefox/Safari.
  - [ ] Test Light/Dark mode switching.
