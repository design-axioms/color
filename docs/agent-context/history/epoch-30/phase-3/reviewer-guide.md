# Reviewer Guide - Epoch 18

This guide is intended for reviewers to verify the work done in Epoch 18 (Deployment & Sharing).

## 1. Getting Started

Clone the repository and install dependencies:

```bash
git clone https://github.com/wycats/algebraic.git
cd algebraic
pnpm install
```

## 2. Verifying the Build

Run the build command to ensure everything compiles correctly:

```bash
pnpm build
```

This will build the core library and CLI.

## 3. Verifying the Documentation Site

To run the documentation site locally:

```bash
pnpm dev:site
```

Visit `http://localhost:4321` to see the site.

### Key Areas to Review:

- **Ember Integration Guide**: Navigate to `Guides > Ember Integration` in the sidebar. Verify the content is accurate and follows the style of other guides.
- **Typography**: Check that the new fonts (Inter, JetBrains Mono, Space Grotesk) are loading and rendering correctly.
- **Visualizer**: Check the "Theme Builder" and "Hue Shift Visualizer" for functionality.

## 4. Verifying Exports

Run the export verification script to ensure the package exports are correct:

```bash
pnpm check:exports
```

## 5. Verifying Publishing Workflow

Check `.github/workflows/publish.yml` to ensure the NPM publishing workflow is correctly configured.

## 6. StackBlitz Compatibility

The root repository is configured with `.stackblitzrc` to allow for easy exploration in StackBlitz.

- **Start Command**: `pnpm dev:site`
- **Node Version**: 24

You can test this by opening the repository in StackBlitz (if you have access to the repo).
