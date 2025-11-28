# Phase 4: Unification (Theme Builder Integration)

**Goal**: Move the Theme Builder from the standalone `demo` app into the Astro site (`site/`).

## Tasks

- [x] **Preparation**
  - [x] Install dependencies in `site`: `apca-w3`, `culori`, `lucide-preact`.
  - [x] Verify `site/src/components/builder` directory exists.

- [x] **Migration**
  - [x] Copy `demo/src/context/ConfigContext.tsx` to `site/src/context/ConfigContext.tsx`.
  - [x] Copy `demo/src/components/ThemeBuilder/` to `site/src/components/builder/`.
  - [x] Copy `demo/src/hooks/useSolvedTheme.ts` (if needed) to `site/src/hooks/`.
  - [x] Move `dual-range` styles from `demo/src/app.css` to `site/src/components/builder/ThemeBuilder.css`.

- [x] **Integration**
  - [x] Create `site/src/content/docs/builder.mdx` with `template: splash`.
  - [x] Create a wrapper component `site/src/components/BuilderWrapper.tsx` to provide `ConfigContext`.
  - [x] Update imports in migrated files to point to correct locations.
  - [x] Create `ThemeContext` for Starlight integration.

- [x] **Verification**
  - [x] Verify Builder loads in the docs site (Server starts).
  - [x] Fix layout issues with `FullScreenContainer`.
  - [x] Verify `localStorage` persistence works.
  - [x] Verify "Reset to Default" works.
  - [x] Check for style conflicts with Starlight.

- [x] **Cleanup**
  - [x] Remove `demo` folder (once verified).
