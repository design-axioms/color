# Implementation Plan - Epoch 8: Architecture Migration (Astro Starlight)

## Goal

Modernize the documentation stack by migrating from `mdbook` to **Astro Starlight**. This will enable us to embed live **Preact** components (from the demo app) directly into the documentation, creating a truly interactive style guide.

## Strategy

### 1. Directory Structure

We will use the `site/` directory for the new Astro project, keeping the existing `docs/` folder for legacy content and agent context.

- **Legacy**: `docs/legacy-guide/` (mdbook source), `docs/agent-context/` (AI context).
- **New**: `site/` (Astro root), `site/src/content/docs/` (Markdown content).

### 2. Component Sharing

The system itself is framework-agnostic and does not expose UI components. However, the **Demo App** contains valuable educational components (like `ContextVisualizer`) built with **Preact**.

- **Decision**: We will use **Preact** for the documentation site.
- **Rationale**: This allows us to directly import and reuse the existing visualization components from `demo/src/components` without rewriting them in another framework (like Svelte or Vue).
- We will configure Vite (inside Astro) to alias `@demo/` to `demo/src/`.

### 3. Migration Process

1.  **Backup**: `docs/guide` has been moved to `docs/legacy-guide`.
2.  **Scaffold**: Astro Starlight initialized in `site/`.
3.  **Port**: Move markdown files to `site/src/content/docs`.
4.  **Enhance**: Replace static HTML/CSS blocks with MDX components imported from the demo.

## Phases

### Phase 1: Setup & Scaffolding

- [x] Rename `docs/guide` to `docs/legacy-guide`.
- [x] Initialize Astro Starlight in `site/`.
- [x] Install dependencies: `preact`, `@astrojs/preact`.
- [x] Configure `site/astro.config.mjs`:
  - Enable Starlight.
  - Enable Preact.
  - Configure Sidebar (based on old `SUMMARY.md`).
- [x] Configure `site/tsconfig.json` to extend root config and support Preact.

### Phase 2: Content Migration

- [x] Port `introduction.md` and `philosophy.md`.
- [x] Port "Concepts" chapter.
- [x] Port "Usage" chapter.
- [x] Port "API" chapter.
- [ ] Fix internal links and image paths.

### Phase 3: Interactive Components

- [x] Configure Vite aliases in `site/astro.config.mjs` to access `demo/src/`.
- [x] Create a `SystemDemo` wrapper component in Astro to provide the `ThemeContext` (using the system's runtime).
- [ ] Replace the "Live CSS" HTML blocks in `concepts/surfaces.md` with the `ContextVisualizer` component from the demo.
- [ ] Replace `hue-shifting.md` diagrams with `HueShiftVisualizer`.

### Phase 4: Deployment & Cleanup

- [ ] Update `package.json` scripts (`docs:dev`, `docs:build` to point to `site`).
- [ ] Update GitHub Actions workflow.
- [ ] Delete `docs/legacy-guide`.

## Risks

- **Broken Links**: Moving files might break relative links. Starlight warns about this, but we need to be careful.
- **Styling**: We must ensure the System's CSS (`engine.css`) is loaded globally so the components render correctly, without conflicting with Starlight's default styles. We will **not** use Tailwind.
