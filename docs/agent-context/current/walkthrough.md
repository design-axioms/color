# Walkthrough - Epoch 20: Linting & Quality Assurance (Phase 1)

**Goal**: Configure linting and coverage infrastructure for the entire monorepo.

## Key Changes

### 1. ESLint Configuration

- **Expanded Scope**: Updated `eslint.config.js` to lint the entire project, including `site/` (Astro/Svelte) and `scripts/`.
- **Plugin Integration**:
  - Added `eslint-plugin-astro` for `.astro` files.
  - Added `eslint-plugin-svelte` for `.svelte` and `.svelte.ts` files.
  - Added `eslint-config-prettier` to prevent conflicts with Prettier.
- **Parsing Fixes**:
  - Configured `typescript-eslint` to correctly parse `.svelte.ts` files (Svelte 5 modules) using the TS parser.
  - Configured `projectService` to handle root files (`eslint.config.js`, `knip.ts`).
  - Disabled `projectService` for `.astro` files (using `project: null`) to avoid warnings from `astro-eslint-parser`.

### 2. Coverage Infrastructure

- **Expanded Scope**: Updated `vitest.config.ts` to include `src/cli/**/*.ts` in coverage reports.
- **Thresholds**: Established baseline coverage thresholds to prevent regression:
  - Statements: 60%
  - Branches: 40%
  - Functions: 80%
  - Lines: 60%
- **Philosophy**: Adopted a "Ratchet" philosophy (Axiom 11) where coverage must increase over time, and new code must always include tests.
- **Verification**: Confirmed that `pnpm test:coverage` passes with these thresholds.

### 3. Tooling

- **Lefthook**: Updated `lefthook.yml` to run linting on staged `.svelte` and `.astro` files.

## Next Steps

- Proceed to **Phase 2** to fix the ~130 linting errors identified during the audit.
