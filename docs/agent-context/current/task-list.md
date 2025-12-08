# Phase 5: Regression Fixes

## Tasks

- [x] **Fix Invisible Click Targets**: `InspectorSurface` was using `all: unset` which removed the background color provided by `surface-card`. Replaced with targeted resets.
- [x] **Fix Broken Cards**: `SurfacePreview` was using incorrect class names (`text-text-strong`) and missing layout utilities. Updated to use correct system classes and `docs-*` utilities.
- [x] **Fix Missing Shadows**: `engine.css` defined shadow variables but not the utility classes. Added `.shadow-*` utilities.
- [x] **Fix Text Hierarchy**: Updated components to use correct `text-subtle` classes.
- [x] **Fix Math Syntax**: Corrected invalid LaTeX syntax in `algebra.mdx` that was causing lint failures.
