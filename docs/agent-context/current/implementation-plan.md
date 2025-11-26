# Implementation Plan - Epoch 7: Deployment & Infrastructure

## Goal

Unify the Demo and Documentation into a single, cohesive site deployed to GitHub Pages, with a streamlined development workflow.

## Proposed Architecture

### URL Structure

- **Production**: `https://wycats.github.io/algebraic/`
  - `/` -> Documentation (mdbook)
  - `/demo/` -> Theme Builder (Vite App)
- **Development**: `http://localhost:3000/`
  - `/` -> Documentation
  - `/demo/` -> Theme Builder

### Build Pipeline

We will create a unified build process that:

1. Builds the `mdbook` to `dist/`.
2. Builds the `demo` app to `dist/demo/`.
3. Ensures all assets are correctly linked using the base path `/algebraic/`.

### Development Server

We will create a custom development server (`scripts/dev-site.ts`) that:

1. Spawns `mdbook serve` (e.g., port 3001).
2. Spawns `vite` (e.g., port 3002).
3. Runs a proxy server on port 3000 to route traffic:
   - `/demo/*` -> `localhost:3002`
   - `/*` -> `localhost:3001`
     This ensures that links between the docs and demo work locally exactly as they will in production.

> [!NOTE]
>
> The proxy server script should take a port argument, and spawn vite and mdbook on random available ports to avoid conflicts.

## Tasks

### 1. Configuration Updates

- [ ] **Demo**: Update `demo/vite.config.ts` to set `base: '/algebraic/demo/'` (prod) or `/demo/` (dev).
- [ ] **Docs**: Update `docs/guide/book.toml` to set `site-url = "/algebraic/"`.
- [ ] **Docs**: Ensure `mdbook` outputs to a predictable location (or we move it).
- [ ] **Docs**: Update README.md to explain the new structure.

### 2. Tooling & Scripts

- [ ] **Dev Proxy**: Create `scripts/dev-site.ts` using `http-proxy` and `concurrently` (or similar).
- [ ] **Build Script**: Create `scripts/build-site.ts` to orchestrate the build.
- [ ] **Dependencies**: Add necessary dev dependencies (`http-proxy`, `connect`, etc. if needed, or just use standard node libs).

### 3. CI/CD

- [ ] **Workflow**: Create `.github/workflows/deploy.yml`.
- [ ] **Permissions**: Configure GITHUB_TOKEN permissions for Pages.

### 4. Content Integration

- [ ] **Cross-Linking**: Add links between the Demo and Docs.
- [ ] **404 Handling**: Ensure SPA routing works for the demo (GitHub Pages needs a `404.html` hack or similar if we use client-side routing, but the demo is mostly single page).
