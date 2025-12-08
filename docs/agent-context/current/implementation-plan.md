# Implementation Plan - Epoch 37: Phase 2 - Remediation

**Goal**: Fix the visual and semantic defects identified in the Phase 1 Audit to ensure a premium, robust user experience.

**Source of Truth**: `qa-audit/audit-results.md`

## 1. Global Fixes

**Status**: Pending

- [ ] **Code Block Contrast**:
  - **Task**: Override `.astro-code` background to use a semantic surface token (e.g., `var(--axm-surface-sunken)` or a dedicated code surface).
  - **Goal**: Eliminate the "cutout" effect in Dark Mode.
- [ ] **Sidebar Active State**:
  - **Task**: Map Starlight's active link color variable to a brand token (e.g., `var(--axm-color-primary)`).
  - **Goal**: Replace the hardcoded blue with the system's brand color.
- [ ] **Starlight Leaks**:
  - **Task**: Create a `starlight-reset.css` or scope custom components (`.card`, `.sl-link-button`) to prevent style leakage.
  - **Goal**: Ensure custom components look consistent regardless of Starlight's default styles.

## 2. Page-Specific Fixes

**Status**: Pending

### Home Page

- [ ] **Hero Visibility Safeguard**:
  - **Task**: Explicitly set `color-scheme: dark` and `z-index` on the Hero container.
  - **Goal**: Prevent regression of the "invisible text" issue.

### Concepts Page

- [ ] **"Ghost Text" (Spotlight)**:
  - **Task**: Investigate and fix the text color/weight for inverted surfaces in Light Mode.
  - **Goal**: Ensure text inside the "Spotlight" box is legible.
- [ ] **Mobile Layout (Context Visualizer)**:
  - **Task**: Add `min-width` and horizontal scrolling to the Context Visualizer container.
  - **Goal**: Preserve the nesting visualization on small screens.

### Tokens Page

- [ ] **Mobile Tables**:
  - **Task**: Wrap token tables in a scrollable container (`overflow-x: auto`) or implement a stacked layout for mobile.
  - **Goal**: Make token tables readable on mobile devices.

## 3. Design Quality & Polish

**Status**: Pending

- [ ] **Visual Density**:
  - **Task**: Increase `gap` in button groups and review padding in "Surface Hierarchy" grids.
  - **Goal**: Reduce the "packed" feeling.
- [ ] **Card Styling**:
  - **Task**: Audit lists on the Tokens page and wrap distinct sections in `.surface-card`.
  - **Goal**: Improve visual hierarchy.
- [ ] **Example Differentiation**:
  - **Task**: Update the "Surface Hierarchy" examples to use distinct layouts/content for different surface types (e.g., Button vs. Callout vs. Card).
  - **Goal**: Make the semantic difference between surfaces obvious.

## 4. Verification

**Status**: Pending

- [ ] **Visual Regression Check**:
  - **Task**: Re-run `scripts/qa-screenshots.ts` and compare with the audit screenshots.
  - **Goal**: Confirm fixes without introducing regressions.
