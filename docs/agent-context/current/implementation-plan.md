# Implementation Plan - Epoch 16 Phase 1: Documentation Styling & CI Integration

## Goal
Elevate the visual quality of the documentation by removing technical debt (inline styles) and enforcing accessibility standards automatically via CI.

## Proposed Changes

### 1. Documentation Styling Refactor
- **Target**: `site/src/content/docs/**/*.mdx`
- **Action**:
    - Identify components or HTML elements using `style="..."`.
    - Replace with Tailwind-like utility classes (if available) or standard CSS classes defined in `site/src/styles/custom.css` (or similar).
    - Ensure consistent use of design tokens (e.g., `var(--color-surface-base)` instead of hardcoded hex).

### 2. Diagram Polish
- **Target**: Concept diagrams in `concepts/`.
- **Action**:
    - Improve contrast and spacing.
    - Ensure diagrams look good in both Light and Dark modes.
    - Use the "Inline Token Inspector" pattern where applicable.

### 3. CI Integration
- **Target**: `.github/workflows/`
- **Action**:
    - Add a step to run `pnpm exec color-system audit` (or the package script) during the build process.
    - Fail the build if the audit finds violations.

## Verification Plan
- **Visual Check**: Manually verify the documentation site (`pnpm dev`) to ensure no visual regressions.
- **Automated Check**: Run `color-system audit` locally and verify it passes.
- **CI Check**: Push changes and verify GitHub Actions success.
