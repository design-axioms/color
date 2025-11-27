# Phase Walkthrough: Documentation & Deployment Fixes

## Goal
Unify the Demo and Documentation into a single deployable site and ensure it renders correctly on GitHub Pages.

## Changes

### 1. Deployment Pipeline
- Configured GitHub Actions to deploy the `docs/guide/book` directory to `gh-pages`.
- Ensured the build process runs `scripts/update-docs.sh` and `mdbook build`.

### 2. CSS Asset Management
- Updated `scripts/update-docs.sh` to:
  - Concatenate CSS files (`tokens.css`, `engine.css`, `utilities.css`, `theme.css`) into `docs/guide/css/color-system.css`.
  - Strip `@import` statements from the concatenated file to prevent 404 errors in production.
- Updated `docs/guide/book.toml` to reference the correct CSS path (`css/color-system.css`).

### 3. Global Styling
- Updated `css/engine.css` to target `:where(:root, .surface-page, body)` to ensure the page surface color is applied globally to the document body.
- Updated `src/lib/generator.ts` to include `body` in the `page` surface generation logic.

### 4. JavaScript Runtime Fix
- Removed custom theme overrides in `docs/guide/theme/` (`book.js`, `highlight.js`, `css/`, `fonts/`) which were causing a runtime error (`Uncaught TypeError: Cannot read properties of null (reading 'querySelectorAll')`) due to incompatibility with the default mdbook theme.
- Reverted to using the default mdbook theme scripts and assets, while layering the custom `color-system.css` on top.

## Verification
- **Build**: `scripts/update-docs.sh` runs successfully and generates `docs/guide/css/color-system.css`.
- **Deployment**: GitHub Actions pipeline should deploy the site.
- **Runtime**: The JS error should be resolved, and the theme switcher should work (using the default mdbook theme switcher).
