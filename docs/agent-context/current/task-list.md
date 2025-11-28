# Phase Task List: Tailwind Integration & Visual Fixes

- [x] **Tailwind Integration**
  - [x] Implement `toTailwind` exporter in `src/lib/exporters/tailwind.ts`
  - [x] Add unit tests for Tailwind exporter
  - [x] Update CLI to support `--format tailwind`
- [x] **Visual Regression Fix (Action Surfaces)**
  - [x] Invert polarity of `surface-action` in `color-config.json`
  - [x] Add `surface-action-soft` for secondary actions
  - [x] Implement `--override-surface-lightness` mechanism in `engine.css`
  - [x] Unregister override properties to enable `var()` fallbacks
