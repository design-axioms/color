# Phase Walkthrough: Layout Polish & Responsiveness

## Overview

This phase focused on resolving layout regressions identified by the user, specifically regarding the Starlight header overlap and the usability of the Theme Builder on narrow screens.

## Key Changes

### 1. Collapsible Sidebars

- **Problem**: On narrow screens, the fixed-width Inspector and Sidebar panels were crushing the main stage content.
- **Solution**: Implemented collapsible sidebars using Svelte 5 state.
- **Implementation**:
  - Updated `BuilderState.svelte.ts` to include `isSidebarOpen` and `isInspectorOpen` state properties and toggle methods.
  - Updated `StudioLayout.svelte` to conditionally render the sidebars based on this state.
  - Added toggle buttons to the `StagePanel.svelte` toolbar.

### 2. Header Overlap Fix

- **Problem**: The `StudioWrapper` was positioned at `top: 0` with a high `z-index`, causing it to obscure the Starlight site header.
- **Solution**: Adjusted the positioning and z-index of the layout.
- **Implementation**:
  - Modified `StudioLayout.svelte` to use `top: var(--sl-nav-height, 3.5rem)` and `height: calc(100vh - var(--sl-nav-height, 3.5rem))`.
  - Lowered `z-index` to `10` to sit below the Starlight navbar (which is typically `1000+`) but above standard page content.

### 3. UI Polish

- **Animations**: Added `transition:slide` with `cubicOut` easing to the sidebars for a smooth open/close experience.
- **Accessibility**: Added logic to respect `prefers-reduced-motion` by disabling animations when requested.
- **Icons**: Replaced generic icons with Chrome DevTools-style sidebar icons (SVG paths) for better visual affordance.
  - Added dynamic "filled" state to the icons: when a sidebar is open, the corresponding section of the icon is filled with a subtle opacity, providing a clear visual indicator of the state.
- **States**: Improved hover and active states for the toggle buttons.

## Verification

- **Build**: Ran `pnpm build` and `pnpm --filter site build` to ensure no regressions.
- **Visuals**: Verified that the layout logic now supports collapsing panels and respects the header space.
