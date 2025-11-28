# Phase 4 Walkthrough: Unification

## Overview

This phase focused on moving the Theme Builder from the standalone `demo` application into the Astro-based documentation site (`site/`). This unification ensures that the tooling is tightly integrated with the documentation, providing a seamless experience for users.

## Key Changes

### 1. Package Renaming

- Renamed the core package from `color-system` to `@algebraic-systems/color-system` to follow best practices and avoid conflicts.
- Updated all internal references in `site/` and `src/` to use the new package name.

### 2. Theme Builder Migration

- **Components**: Moved all components from `demo/src/components/ThemeBuilder/` to `site/src/components/builder/`.
- **Context**:
  - Migrated `ConfigContext` to `site/src/context/ConfigContext.tsx`.
  - Created `ThemeContext` (`site/src/context/ThemeContext.tsx`) to bridge the gap between Starlight's theme management and the Builder's internal state.
- **Styles**: Moved `dual-range` slider styles to `site/src/components/builder/ThemeBuilder.css`.

### 3. Integration with Astro

- Created a new page `site/src/content/docs/builder.mdx` to host the builder.
- Created `BuilderWrapper.tsx` to wrap the builder in the necessary context providers (`ConfigProvider`, `ThemeProvider`).
- Installed necessary dependencies (`apca-w3`, `culori`, `lucide-preact`) in the `site` package.

## Challenges & Solutions

- **Context Resolution**: The standalone app used a simple `ThemeContext`. In Astro/Starlight, theme management is handled by the framework. We created a bridge `ThemeContext` that reads the `data-theme` attribute from the `<html>` tag to keep the Builder in sync with the docs site theme.
- **Import Paths**: Moving files required a systematic update of import paths, especially changing `color-system` to `@algebraic-systems/color-system` and fixing relative imports for contexts.
- **Layout Constraints**: Starlight's default layout constrains content width and adds padding, which is not suitable for a full-screen application like the Theme Builder. We implemented a `FullScreenContainer` component that uses `position: fixed` to break out of the document flow and provide a full canvas.
- **Visual Regressions**: Browser default styles caused misalignment between buttons and inputs in the preview area. We implemented a robust CSS reset for `.preview-button` and `.preview-input` (using `box-sizing: border-box`, `display: inline-flex`, etc.) and introduced layout primitives (`Stack`, `Cluster`) to enforce alignment structurally.

## Final Polish

- **Reset Functionality**: Added a "Reset to Default" button to the sidebar to allow users to clear their local configuration.
- **Cleanup**: Removed the legacy `demo` directory after verifying the migration.

## Next Steps

- Proceed to Phase 5 (Holistic Review) to audit the entire system.

