# Implementation Plan - Phase 7: Theme Builder Refinement & Docs Fixes

## Goal
Polish the Theme Builder to be mobile-responsive and visually consistent, and fix critical rendering issues in the documentation.

## Objectives

1.  **Documentation Fixes (Priority)**
    - [ ] **Context Adaptation**: Fix the "Light Context" vs "Dark Context" visualization to correctly show the difference (likely missing a wrapper class or incorrect context injection).
    - [ ] **Data Visualization**: Fix the MDX rendering issue where import statements are printed as text instead of being executed.
    - [ ] **Hue Shifting**: Investigate and fix the runtime error in the Hue Shift visualizer.
    - [ ] **Linear Contrast**: Fix the visual alignment and content of the "Linear Contrast" comparison (ensure boxes line up and show the correct gradient/steps).

2.  **Refactor Inline Styles (Theme Builder)**
    - [ ] Audit `ThemeBuilder.tsx` and its sub-components for inline styles.
    - [ ] Move styles to `ThemeBuilder.css` using BEM-like class naming or semantic class names.
    - [ ] Utilize system utility classes (e.g., `.text-strong`, `.text-subtle`, `.bordered`) where appropriate.

3.  **Mobile Responsiveness Polish**
    - [ ] Verify the stacking behavior on mobile (already implemented in `ThemeBuilder.css`).
    - [ ] Adjust padding and margins for smaller screens to maximize usable space.
    - [ ] Ensure touch targets are large enough.

4.  **Visual Consistency**
    - [ ] Ensure all colors and spacing use system tokens.
    - [ ] Standardize border radii and shadow usage.

## Proposed Changes

### Documentation
- **`site/src/content/docs/concepts/thinking-in-surfaces.mdx`** (or similar): Check how the Context Adaptation example is implemented. It likely needs a `SystemDemo` wrapper or specific classes to force the context.
- **`site/src/content/docs/usage/data-viz.mdx`**: Fix the MDX syntax for imports. Ensure there are no extra spaces or weird formatting preventing the import from being recognized.
- **`site/src/content/docs/concepts/physics-of-light.mdx`** (or similar): Check the Linear Contrast visualization. It might be a custom component that needs CSS fixes.
- **`demo/src/components/HueShiftVisualizer.tsx`**: Debug the error.

### Theme Builder
- **`demo/src/components/ThemeBuilder/ThemeBuilder.tsx`**: Remove `style={{ ... }}` props.
- **`demo/src/components/ThemeBuilder/ThemeBuilder.css`**: Add styles for the new classes.

## Verification Plan
- **Docs Review**: Manually check the affected pages in the local dev server (`pnpm dev:site`).
- **Theme Builder Review**: Check the Theme Builder in the browser at various viewport widths.
