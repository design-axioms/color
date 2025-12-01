# Implementation Plan - Epoch 19: Phase 2 - Documentation & Site Updates

**Goal**: Update all documentation, branding, and site content to reflect the new project name: **Axiomatic Color**.

## 1. README & Metadata Updates

- [ ] **Update Root README.md**
  - Change title to "Axiomatic Color".
  - Update description to reflect the "axiomatic" philosophy.
  - Update installation instructions (`pnpm add @axiomatic-design/color`).
  - Update CLI usage (`pnpm exec axiomatic init`).
- [ ] **Update Site Metadata**
  - Update `site/astro.config.mjs` (site title).
  - Update `site/package.json` (if applicable).

## 2. Documentation Content Updates

- [ ] **Global Find & Replace**
  - Search for "Algebraic Color System" -> "Axiomatic Color".
  - Search for "Algebraic Color" -> "Axiomatic Color".
  - Search for `color-system` (CLI command) -> `axiomatic`.
- [ ] **Specific File Updates**
  - `docs/design/personas.md`: Update personas to reference the new name.
  - `docs/design/axioms.md`: Ensure axioms align with the new branding.
  - `site/src/content/docs/index.mdx`: Update hero title and tagline.
  - `site/src/content/docs/introduction.mdx`: Update introduction text.

## 3. Site Branding

- [ ] **Visual Branding**
  - Check for any logos or images that contain the old name (if any).
  - Update page titles and meta tags.

## 4. Verification

- [ ] **Local Preview**
  - Run `pnpm docs:dev` and verify the site loads correctly with the new branding.
  - Check the "Getting Started" guide to ensure commands are correct.
