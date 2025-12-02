# Implementation Plan: Config State & Live Preview

## Goal

Connect the Theme Builder UI to a reactive `ConfigState` that drives the application of CSS variables in real-time.

## Architecture

### 1. `ConfigState` (Svelte 5 Rune)

A new state class `site/src/lib/state/ConfigState.svelte.ts` that:

- Holds the `SolverConfig` object.
- Provides granular mutation methods (e.g., `updateAnchor`, `updateKeyColor`).
- Exposes a `derived` property for the generated CSS.

### 2. Live Preview Engine

A mechanism to compile the config into CSS and inject it into the page.

- **Solver**: Run `solve()` from `@axiomatic-design/color` in the browser.
- **Generator**: Run `generateTokensCss()` in the browser.
- **Injection**: A `StyleInjector` component (or effect in `ConfigState`) that updates a `<style id="preview-theme">` tag.

### 3. UI Binding

Update the Inspector components to bind to `ConfigState`.

- `GlobalInspector`: Bind inputs to `config.anchors` and `config.keyColors`.
- `SurfaceInspector`: Bind inputs to `config.groups` (finding the correct surface by ID).

## Step-by-Step Implementation

### Step 1: Create `ConfigState`

- [ ] Create `site/src/lib/state/ConfigState.svelte.ts`.
- [ ] Import default config from `src/cli/default-config.ts` (may need to move/copy this to `site/src/lib/default-config.ts` to avoid importing from `src/cli` which might have Node.js dependencies).
- [ ] Implement `updateAnchor(polarity, mode, type, value)`.
- [ ] Implement `updateKeyColor(name, color)`.
- [ ] Implement `updateSurfaceOverride(surfaceId, mode, color)`.

### Step 2: Implement Live Solver

- [ ] Use `generateTheme` and `injectTheme` from `@axiomatic-design/color` (exported via `browser.ts`).
- [ ] Create a `$derived` property in `ConfigState` that calls `generateTheme(this.config)`.
- [ ] **Performance Note**: Solving might be expensive. We might need to debounce it or run it in a Web Worker later. For now, run it on the main thread.

### Step 3: Style Injection

- [ ] Create `site/src/components/StyleInjector.svelte`.
- [ ] This component subscribes to `ConfigState.css` and calls `injectTheme`.
- [ ] Add `StyleInjector` to `StudioWrapper.svelte`.

### Step 4: Bind Global Inspector

- [ ] Update `GlobalInspector.svelte` to use `ConfigState`.
- [ ] Bind Range inputs to `config.anchors`.
- [ ] Bind Color inputs to `config.anchors.keyColors`.

### Step 5: Bind Surface Inspector

- [ ] Update `SurfaceInspector.svelte` to use `ConfigState`.
- [ ] Implement logic to find the selected surface in the config.
- [ ] Bind inputs to `surface.override` or `surface.contrastOffset`.

## Dependencies

- `@axiomatic-design/color` (Local workspace package).
- We need to ensure `src/lib` is clean of Node.js specific code (fs, path) so it runs in Vite/Browser. (Checked: `src/lib` looks clean, `src/cli` has Node deps).

## Verification

- [ ] Changing an anchor slider should update the CSS variables and visibly change the theme.
- [ ] Changing a key color should update the brand colors.
- [ ] Selecting a surface and changing its override should update that specific surface.
