# Walkthrough: Visual Regression Fixes

Following the "Grand Unified Algebra" refactor and build stabilization, several visual regressions were identified in the documentation site. This phase focused on diagnosing and fixing these issues.

## 1. Invisible Click Targets (`InspectorSurface`)

**Issue**: The `InspectorSurface` component, used in the `ContextVisualizer`, was rendering as invisible.
**Root Cause**: The component used `all: unset` to reset button styles. This property has high specificity (when scoped) and was resetting the `background-color` provided by the `surface-card` utility class to `initial` (transparent).
**Fix**: Replaced `all: unset` with a set of targeted properties (`appearance: none`, `border: none`, etc.) inside a `:global(:where(.inspector-surface))` block. This lowers the specificity of the reset, allowing the `surface-card` utility class (specificity 0,1,0) to win.

## 2. Broken Cards (`SurfacePreview`)

**Issue**: The `SurfacePreview` component rendered cards that looked like plain text sections.
**Root Cause**:

1.  Incorrect class names: `text-text-strong` instead of `text-strong`, `border-border-subtle` instead of `bordered`.
2.  Missing layout utilities: The component used `p-6`, `rounded-lg` which were not defined in the available CSS.
    **Fix**:
3.  Updated class names to match the system tokens (`text-strong`, `text-subtle`, `bordered`).
4.  Updated layout classes to use `docs-*` utilities (`docs-p-6`, `docs-rounded-lg`) and added the missing ones to `site/src/styles/docs.css`.

## 3. Missing Shadows

**Issue**: Shadows were missing from the "Elevation" section in `catalog/surfaces.mdx`.
**Root Cause**: `css/engine.css` defined the shadow variables (`--shadow-sm`) but did not expose them as utility classes (`.shadow-sm`).
**Fix**: Added `.shadow-sm`, `.shadow-md`, `.shadow-lg`, `.shadow-xl` utility classes to `css/engine.css`.

## 4. Math Syntax

**Issue**: The `lint:math` check failed due to suspicious syntax in `site/src/content/docs/theory/algebra.mdx`.
**Root Cause**: The file used `* {` instead of `_ {` for subscripts in LaTeX equations (e.g., `L* {bg}` instead of `L_{bg}`).
**Fix**: Corrected the LaTeX syntax.
