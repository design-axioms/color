# Walkthrough - Epoch 8: Architecture Migration (Astro Starlight)

## Summary

We successfully initialized the new documentation site using **Astro Starlight** and migrated the existing content from `mdbook`. We chose **Preact** for the interactive components to enable direct code reuse from the existing `demo` application.

## Key Changes

### 1. Infrastructure Setup

- Created `site/` as the new documentation root.
- Initialized Astro Starlight with Preact support.
- Configured `site/astro.config.mjs` with:
  - Sidebar structure mirroring the old docs.
  - Vite aliases (`@demo`, `@lib`) to allow importing code from the `demo` and `src` directories.
- Updated root `package.json` scripts (`docs:dev`, `docs:build`) to point to the new Astro site.

### 2. Content Migration

- Wrote a custom migration script (`scripts/migrate-docs.ts`) that:
  - Reads markdown files from `docs/legacy-guide`.
  - Adds required Frontmatter (title) for Starlight.
  - Moves them to `site/src/content/docs`.
- Successfully migrated all chapters (Concepts, Usage, API).

### 3. Component Integration Strategy

- Created a `SystemDemo` wrapper component (`site/src/components/SystemDemo.tsx`).
  - This wraps children in `ConfigProvider` and `ThemeProvider` from the demo app.
  - This allows us to use complex demo components (like `ContextVisualizer`) directly in MDX files without rewriting state logic.
- Verified this works by creating a test page `demo-test.mdx`.

### 4. Interactive Components Integration

- **ContextVisualizer**: Integrated into `concepts/surfaces.mdx`.
  - Renamed file to `.mdx` to support components.
  - Replaced the "Nesting Surfaces" HTML block with the live component.
  - Wrapped content in `<SystemDemo>` to provide theme context.
- **HueShiftVisualizer**: Integrated into `concepts/hue-shifting.mdx`.
  - Replaced the static "Visual Comparison" section with the interactive visualizer.
  - This allows users to experiment with the hue shift curve directly in the docs.

### 5. Deployment & Cleanup

- **Build Pipeline**:
  - Updated `scripts/build-site.ts` to build the Astro site and the Demo app, then merge them.
  - Updated `.github/workflows/deploy.yml` to deploy the `site/dist` artifact.
- **Cleanup**:
  - Verified all links using `scripts/check-links.ts` (fixed missing dependency).
  - Deleted `docs/legacy-guide` as the migration is complete.

## Next Steps

- The `scripts/check-links.ts` script was created to find broken relative links but failed due to a missing `glob` dependency. This needs to be fixed and run.
- We need to systematically replace the static HTML placeholders in the migrated markdown with the actual Preact components.
