# Phase 2: Fix Issues (Walkthrough)

## Goal

Resolve all linting errors and warnings identified in Phase 1.

## Changes

### Svelte Components

Systematically fixed ~130 linting errors across the `site/src/components` directory.

#### Common Fixes

- **`svelte/require-each-key`**: Added unique keys (slugs, names, or indices) to all `#each` blocks.
- **`@typescript-eslint/no-confusing-void-expression`**: Wrapped void-returning function calls in arrow functions with block bodies (e.g., `() => { fn(); }`).
- **`@typescript-eslint/no-unnecessary-condition`**: Removed redundant checks where types guaranteed existence (e.g., removing `if (theme.charts)` where `charts` is mandatory).
- **`svelte/no-useless-mustaches`**: Removed unnecessary mustache interpolation for string literals (e.g., `class={"foo"}` -> `class="foo"`).
- **`@typescript-eslint/no-base-to-string`**: Explicitly cast arrays to `string[]` before calling `.join(" ")` in class name construction.
- **`@typescript-eslint/no-unsafe-*`**: Improved type safety by removing `any` usage and adding proper interfaces (e.g., `DragData` interface in `SurfaceManager`).

#### Specific Component Fixes

- **`HueShiftVisualizer.svelte`**: Fixed `Number()` conversions, unnecessary conditionals, and void expressions.
- **`AnchorGraph.svelte`**: Fixed void expressions in event handlers and unnecessary optional chaining.
- **`SurfaceManager.svelte`**: Added `DragData` interface to fix `any` usage in drag-and-drop logic.
- **`SurfaceRow.svelte`**: Fixed floating promises (`void navigator.clipboard.writeText(...)`) and `any` usage.
- **`ThemeBuilder.svelte`**: Fixed `any` usage in `JSON.parse` by casting to `SolverConfig`.
- **`InspectorPanel.svelte`**: Removed unnecessary null checks for props that are guaranteed to be defined.
- **`InspectorSurface.svelte`**: Fixed `no-base-to-string` by ensuring class names are strings.
- **`Diagram.svelte`**: Fixed `no-base-to-string` and improved prop typing.
- **`DynamicRange.svelte`**: Disabled `no-confusing-void-expression` for `{@render ...}` snippets as it appears to be a false positive or limitation with Svelte 5 snippets.

### Scripts

- **`scripts/check-links.ts`**: Added `void` return type to `checkLinks` and handled the floating promise at the top level.

### Library

- **`src/lib/exporters/dtcg.ts`**: Removed unnecessary checks for `theme.charts` and `theme.primitives` as they are mandatory in the `Theme` interface.
- **`src/lib/exporters/tailwind.ts`**: Removed unnecessary checks for `theme.charts` and `theme.primitives`.

## Verification

- Ran `pnpm lint` and confirmed 0 errors.
- Ran `pnpm build` and confirmed successful build.
