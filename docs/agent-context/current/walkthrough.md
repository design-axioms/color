# Walkthrough - Epoch 7: Deployment & Infrastructure

## Goal
Unify the Demo and Documentation into a single, cohesive site deployed to GitHub Pages, with a streamlined development workflow.

## Changes

### 1. Unified Development Server
We created a new script `scripts/dev-site.ts` that runs both the Documentation (`mdbook`) and the Theme Builder (`vite`) in parallel, behind a proxy.

- **Command**: `pnpm dev:site`
- **Proxy**: `http://localhost:3000`
- **Routing**:
  - `/` -> Documentation (mdbook on port 3001)
  - `/demo/` -> Theme Builder (Vite on port 3002)

This ensures that the local development environment mirrors the production URL structure, allowing us to test cross-linking and asset loading reliably.

### 2. Unified Build Pipeline
We created `scripts/build-site.ts` to orchestrate the production build.

- **Command**: `pnpm build:site`
- **Process**:
  1. Builds the Demo App (`pnpm build` in `demo/`).
  2. Builds the Documentation (`mdbook build`).
  3. Copies the Demo build output (`demo/dist`) into the Documentation output (`docs/guide/book/demo`).

### 3. GitHub Pages Deployment
We added a GitHub Actions workflow (`.github/workflows/deploy.yml`) that automatically builds and deploys the unified site to GitHub Pages on every push to `main`.

### 4. Routing & Configuration
- **Vite Config**: Updated `demo/vite.config.ts` to use a conditional `base` path (`/algebraic/demo/` in production, `/demo/` in dev).
- **Hash Routing**: Switched the Demo App to use **Hash Routing** (`wouter/use-hash-location`). This solves the issue of 404s on GitHub Pages when refreshing deep links (e.g., `/demo/#/builder` works reliably).
- **Documentation**: Updated `README.md` with instructions for the new workflow.

## Verification
- Ran `pnpm build:site` locally to verify the build pipeline succeeds and produces the expected directory structure.
- Verified `mdbook` and `vite` integration via the proxy script logic.
