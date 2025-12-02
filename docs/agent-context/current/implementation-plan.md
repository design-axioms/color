# Implementation Plan - Epoch 20: Linting & Quality Assurance (Phase 1)

**Goal**: Review and tighten ESLint and Prettier configurations to ensure code quality and consistency across the entire monorepo (including the new `site/` directory).

## 1. Audit Current State

- [ ] Run `pnpm lint` to see the current status of the codebase.
- [ ] Check if `site/` (Astro/Svelte) is currently being linted.
- [ ] Check `prettier` configuration and usage.

## 2. Configuration Updates

- [ ] **ESLint**:
  - [ ] Update `eslint.config.js` to include `site/` (remove `demo/` from ignores if it's gone).
  - [ ] Add support for **Astro** files (`eslint-plugin-astro`).
  - [ ] Add support for **Svelte** files (`eslint-plugin-svelte`).
  - [ ] Ensure `typescript-eslint` is correctly configured for the new project structure.
- [ ] **Prettier**:
  - [ ] Ensure `.prettierrc` exists and is configured.
  - [ ] Ensure `eslint-config-prettier` is used to prevent conflicts.

## 3. Coverage Infrastructure

- [ ] **Expand Coverage**:
  - [ ] Update `vitest.config.ts` to include `src/cli/**/*.ts`.
- [ ] **Thresholds**:
  - [ ] Configure coverage thresholds in `vitest.config.ts` (start with a baseline, e.g., 80% or current levels).
- [ ] **Reporting**:
  - [ ] Ensure `test:coverage` generates a report that can be viewed easily.

## 4. Verification

- [ ] Run the linter on the entire codebase.
- [ ] Document the number of errors/warnings (to be fixed in Phase 2).
- [ ] Ensure the lint command is wired up in `package.json` and `lefthook.yml`.

## 4. Verification

- [ ] Run the linter on the entire codebase.
- [ ] Document the number of errors/warnings (to be fixed in Phase 2).
- [ ] Ensure the lint command is wired up in `package.json` and `lefthook.yml`.
- [ ] Verify coverage reports are generated and thresholds are enforced.

## 5. User Feedback

- [ ] Confirm if there are specific rules or plugins the user wants to enforce.
