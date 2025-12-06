# Implementation Plan - Epoch 34: Phase 2 (Token Simplification)

## Goal

Reduce the cognitive load on users by hiding internal "plumbing" tokens (e.g., `--text-lightness-source`) and exposing only clear, semantic intents (e.g., `--surface-card`, `--text-high`).

## Strategy

### 1. Audit & Classification

- **Audit**: Run a comprehensive audit of all generated CSS variables.
- **Classify**: Categorize tokens into:
  - **Public API**: Semantic tokens intended for direct use (Surfaces, Text, Borders).
  - **Internal Plumbing**: Intermediate variables used for calculation (Sources, Raw L/C/H values).

### 2. Generator Refactoring

- **Scoping**: Where possible, move internal variables to local scope (inside the rule) rather than `:root`.
- **Naming**: If global scope is required (for inheritance), prefix internals with `--_axm` or similar private convention.
- **Metadata**: Update the `Theme` object to explicitly mark tokens as `public` or `private`.

### 3. Exporter Updates

- **DTCG**: Filter out private tokens from `tokens.json`.
- **Tailwind**: Ensure only public tokens are generated in the preset.
- **TypeScript**: Ensure `theme.ts` only types public tokens.

### 4. Documentation

- **Catalog**: Update the "Tokens" reference page to show only the simplified public API.
- **Visualizer**: Update the Token Inspector to optionally show/hide internals (default: hide).

## Success Criteria

- `tokens.json` contains NO internal plumbing variables.
- `tailwind.preset.js` contains NO internal plumbing variables.
- The documentation site still renders correctly (proving internals are still functional).
- The "Token Inspector" shows a cleaner list by default.
