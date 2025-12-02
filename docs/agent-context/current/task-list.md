# Task List - Epoch 20: Linting & Quality Assurance (Phase 2)

**Goal**: Resolve all linting errors and warnings identified in Phase 1.

## 1. Fix Svelte Component Errors

- [ ] Fix `svelte/require-each-key` errors (missing keys in `#each` blocks).
- [ ] Fix `@typescript-eslint/explicit-function-return-type` errors in components.
- [ ] Fix `@typescript-eslint/no-unsafe-*` errors (type safety issues).
- [ ] Fix `@typescript-eslint/no-confusing-void-expression` errors.

## 2. Fix Script Errors

- [ ] Fix `explicit-function-return-type` in `scripts/`.
- [ ] Fix `no-floating-promises` in `scripts/`.

## 3. Fix General Errors

- [ ] Fix `no-unnecessary-condition` errors.
- [ ] Fix `no-unused-vars` errors.

## 4. Final Verification

- [ ] Run `pnpm lint` and ensure 0 errors.
- [ ] Run `pnpm test:coverage` and ensure it still passes.
