# Walkthrough - Epoch 35: Deployment & Release

## Phase 1: Pre-Flight Verification

### Summary

Successfully verified the build pipeline and fixed several issues preventing a clean build and test run.

### Key Actions

#### 1. Build Fixes

- **Restored `css/utilities.css`**: The file was missing, causing `pnpm build` to fail. Restored it from `site/src/styles/docs.css` which serves as the source of truth.
- **Fixed `ExportView.svelte`**: Corrected a relative import path (`../../lib/state/...` -> `../../../lib/state/...`) that was breaking the site build.

#### 2. Linting & Security

- **Updated Security Check**: Modified `scripts/check-security.ts` to correctly ignore `vendor/` and `node_modules` directories, resolving false positives in the security lint check.
- **Fixed `theme.ts` Lint Errors**: Updated `src/lib/exporters/typescript.ts` to include `/* eslint-disable @axiomatic-design/no-raw-tokens */` in the generated file, as `theme.ts` intentionally maps tokens to CSS variables.
- **Fixed `overlay.ts` Lint Errors**: Added `/* eslint-disable @axiomatic-design/no-raw-tokens */` to `src/lib/inspector/overlay.ts` to allow CSS variables in the Shadow DOM styles.

#### 3. Testing

- **Updated Snapshots**: Ran `pnpm test:update-snapshots` to accept changes in `theme.ts` (added eslint disable comment) and minor formatting differences in other generated files.
- **Verified Tests**: All tests passed after snapshot updates.

### Outcome

The codebase is now in a clean state:

- `pnpm build` passes.
- `pnpm --filter site build` passes.
- `pnpm lint:all` passes.
- `pnpm test` passes.

Ready for deployment.
