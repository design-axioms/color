# Walkthrough - Epoch 19: Phase 2

**Goal**: Update all documentation, branding, and site content to reflect the new project name: **Axiomatic Color**.

## Changes

### 1. Branding Updates

We have officially renamed the project from "Algebraic Color System" to "**Axiomatic Color**". This change reflects the shift in philosophy from "math-first" to "rules-first" (axioms).

- **Site Title**: Updated `site/astro.config.mjs` to "Axiomatic Color".
- **Homepage**: Updated `site/src/content/docs/index.mdx` with the new title and tagline.
- **Philosophy**: Updated `site/src/content/docs/philosophy.md` to reflect the new name and core pillars.

### 2. Documentation Consistency

We performed a global audit and update of all documentation files to ensure consistent terminology.

- **Concepts**: Updated `thinking-in-surfaces.mdx` to refer to "Axiomatic Color".
- **CLI**: Updated `src/cli/commands/export.ts` usage examples to use `axiomatic` instead of `color-system`.
- **Internal Docs**: Updated `AGENTS.md` to reference the correct CLI binary name.

### 3. Verification

We verified the changes by running a full documentation build (`pnpm docs:build`), which passed successfully.
