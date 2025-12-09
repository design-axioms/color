# Phase 5: Manual QA & Iteration - Walkthrough

## [2025-12-08] Phase Kickoff

We have successfully transitioned from "Phase 2: Remediation" to "Phase 5: Manual QA & Iteration". The codebase is in a clean state, with all linting and syntax errors resolved.

### Goals for this Phase

1.  **Manual Verification**: The user will manually review the system (Demo App, Documentation, CLI) to identify any remaining visual or functional issues.
2.  **Remediation**: We will fix any issues found during the manual review.
3.  **Final Polish**: We will ensure the documentation is accurate and the system feels robust.

### Current Status

- **Linting**: Clean (Strict TypeScript, Knip, Prettier).
- **Tests**: Passing.
- **Documentation**: Syntax errors fixed.
- **Context**: Reset for the new phase.

### Next Steps

- Wait for user feedback on the manual review.
- Address items in `task-list.md` as they are prioritized.

## [2025-12-08] Fix: Invisible Spotlight Surface in Visualizer

### Issue

The "Spotlight (Inverted Context)" surface in the `ContextVisualizer` (on the "Thinking in Surfaces" page) appeared with invisible text. The text was light (correct for an inverted surface), but the background was transparent instead of dark.

### Root Cause

The `InspectorSurface` component was implemented as a `<button>` with `all: unset` to strip user-agent styles. However, the scoped class on the component had higher specificity than the Axiomatic system's `:where(...)` selectors. As a result, `all: unset` (specifically `background-color: initial`) overrode the Axiomatic `background-color` variable.

### Resolution

1.  **Refactored `InspectorSurface`**: Changed the underlying element from `<button>` to `<div>` with `role="button"` and `tabindex="0"`. This avoids the need for `all: unset` to fight user-agent button styles.
2.  **Removed `all: unset`**: The component now inherits styles naturally, allowing the Axiomatic `:where(...)` selectors to apply the correct surface colors.
3.  **Cleaned up Usage**: Removed a redundant `text-white` class from `ContextVisualizer.svelte`, proving that the Axiomatic system now correctly calculates the high-contrast text color automatically.

### Verification

Used `scripts/debug-css-cascade.ts` to verify that `.surface-spotlight` now correctly resolves its `background-color` and `color` from the Axiomatic tokens.

## [2025-12-08] Polish: Hue Shifting Documentation & Visualizer

### Issues Identified

1.  **MDX Formatting**: `quick-start.mdx` had broken tabs and code blocks due to indentation issues.
2.  **Visualizer UI**: `HueShiftVisualizer` had distorted "oval" handles (SVG aspect ratio issue) and uncentered slider thumbs.
3.  **Comparison Clarity**: The "Visual Comparison" in `hue-shifting.mdx` was confusing. The linear vs. bezier distinction was subtle, and the layout was hard to scan.
4.  **Narrative Flow**: The `hue-shifting.mdx` page felt disjointed, with redundant diagrams and a weak argument structure.

### Resolutions

1.  **MDX Fixes**: Corrected indentation and spacing in `quick-start.mdx`.
2.  **Visualizer Polish**:
    - Replaced SVG `<circle>` handles with HTML `<div>` overlays to ensure perfect circles regardless of aspect ratio.
    - Updated CSS variables to use `_axm-` prefix for correct color resolution.
    - Fixed slider thumb centering.
3.  **Comparison Redesign**:
    - Created a new `docs-grid-comparison-v2` layout (side-by-side).
    - Exaggerated the hue shift (Blue → Orange, 180°) to make the difference obvious.
    - Added a midpoint stop to the linear gradient to ensure it travels the "long way" around the color wheel (through purple), matching the Bezier curve's path.
    - Added descriptive text to each row explaining _why_ the linear shift fails (drifting, premature warmth) vs. the Bezier success (stable extremes).
4.  **Narrative Restructuring**:
    - Reorganized `hue-shifting.mdx` to follow a logical flow: Goal -> Problem (Linearity) -> Solution (Bezier) -> Proof (Comparison) -> Action (Playground).
    - Removed redundant/confusing diagrams.
    - Updated the Interactive Playground to initialize with the same values (180° shift) as the static examples for continuity.

### Outcome

The "Hue Shifting" page now presents a coherent, visually distinct argument for the system's non-linear hue rotation feature.

## [2025-12-08] Fix: Broken Shadows (Invalid `light-dark()` Usage)

### Issue

The "Elevation (Shadows)" section in the documentation showed flat cards with no visible shadows. The computed `box-shadow` style was `none`.

### Root Cause

The CSS generator was wrapping the entire shadow definition in `light-dark()`:
`--shadow-sm: light-dark(0 1px 2px 0 oklch(...), 0 1px 2px 0 oklch(...))`

This is invalid CSS because `light-dark()` only accepts `<color>` arguments. It cannot handle complex strings like shadow definitions containing lengths.

### Resolution

Modified `src/lib/generator.ts` to intelligently merge the light and dark shadow definitions. It now parses the shadow string, finds the color components (using `oklch(...)`), and wraps _only_ the colors in `light-dark()`.

**Before:**
`--shadow-sm: light-dark(0 1px 2px 0 oklch(L C H), 0 1px 2px 0 oklch(L C H))` (Invalid)

**After:**
`--shadow-sm: 0 1px 2px 0 light-dark(oklch(L C H), oklch(L C H))` (Valid)

### Verification

Used `scripts/debug-css-cascade.ts` to verify that:

1.  The generated CSS variable now contains a valid string.
2.  The computed `box-shadow` on `.shadow-sm` is correctly parsed by the browser.

## [2025-12-08] Fix: Jammed Buttons in Actions Catalog

### Issue

In the "Action Surfaces" section of the documentation (`catalog/actions`), the example buttons were touching each other with no spacing, making them look jammed together.

### Root Cause

The buttons were rendered inside a `Diagram` component (which renders a `div`) without any layout utility classes. As `inline-block` elements, they relied on whitespace for separation, which was insufficient.

### Resolution

Added the `.docs-flex` utility class to the `Diagram` containers. This applies `display: flex` and `gap: 1rem`, ensuring consistent spacing between the buttons.

### Verification

Verified that the `Diagram` component correctly passes the `class` prop to its root element, and that `.docs-flex` is defined in `docs.css` with the appropriate gap.

## [2025-12-08] Feature: Reactive Chart Algebra

### Issue

The chart colors were implemented as static `light-dark()` pairs, which violated the "Grand Unified Algebra" (Reactive Physics). They did not respond to nested contexts (e.g., charts inside an inverted card) or atmospheric changes (Vibrancy).

### Resolution

Implemented a new "Reactive Chart Algebra" that calculates chart colors dynamically using CSS `calc()` and the system's core variables (`--tau`, `--beta`).

1.  **Reactive Lightness**: $L_{chart} = L_{mid} - (k \times \tau)$. This ensures charts automatically flip their lightness when the context inverts (since $\tau$ flips).
2.  **Vibrancy Injection**: $C_{chart} = C_{base} + (\beta \times 0.5)$. This allows the chart colors to pick up the "vibe" of the current theme.
3.  **X-Ray Support**: Added borders to chart elements to ensure visibility in "X-Ray" (high contrast/debug) modes.

### Fix: Invisible Charts

During verification, the charts appeared as empty boxes. Investigation revealed a typo in `src/lib/charts.ts` where the generated CSS variables were missing the `--` prefix (e.g., `axm-chart-1` instead of `--axm-chart-1`).

**Fix**: Updated `src/lib/charts.ts` to use the `v()` helper function, ensuring consistent variable naming. Rebuilt the system to propagate the fix to `theme.css`.

### Verification

- **Visual**: Charts are now visible in the `DataVizDemo` component.
- **Code**: Verified `theme.css` contains valid `--axm-chart-N` declarations.

## [2025-12-08] Fix: Broken Light/Dark Transition for Charts

### Issue

The user reported that the charts were not transitioning correctly between light and dark modes.

### Root Cause

The reactive chart algebra relies on the `--tau` variable (Time) to flip lightness ($L = L_{mid} - k \times \tau$).
`--tau` was defined in `css/engine.css` using `@media (prefers-color-scheme: dark)`.
However, the documentation site uses a manual theme toggle that sets the `data-theme` attribute on the root element. This updates `color-scheme` but **does not trigger the media query** if the OS preference differs from the toggle state.
As a result, `--tau` remained stuck at `1` (Light Mode) even when the site was in Dark Mode.

### Resolution

Updated `site/src/styles/starlight-custom.css` to explicitly set `--tau` based on the `data-theme` attribute:

```css
:root[data-theme="light"] {
  --tau: 1;
}
:root[data-theme="dark"] {
  --tau: -1;
}
```

### Verification

Verified that `starlight-custom.css` now contains the correct selectors to drive `--tau` from the theme toggle. This ensures the algebra receives the correct time value.
