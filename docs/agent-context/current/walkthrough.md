# Phase 3 Walkthrough: Release Automation & Rebranding

## Rebranding

- Renamed package to `@axiomatic-design/color`.
- Updated `bin` entry to `axiomatic`.
- Updated `CHANGELOG.md` to reflect the new name and version `0.1.0`.

## Release Automation

We have transitioned to an automated release process using `release-plan`.

### Workflow

1. **Plan Release**:
   - Triggered on push to `main` or label on PR.
   - Runs `release-plan prepare` to calculate version bumps.
   - Creates a "Prepare Release" PR with the new version and changelog.
2. **Publish**:
   - Triggered when the "Prepare Release" PR is merged.
   - Runs `pnpm release-plan publish` to publish to NPM.

### Configuration

- Installed `release-plan` and `@release-plan/actions`.
- Created `.github/workflows/plan-release.yml` and `.github/workflows/publish.yml`.
- Created `RELEASE.md` to document the process.

## Verification

- Verified package exports using `publint`.
- Verified CLI functionality (`axiomatic init`).
- Verified site build.
- Reset git tags to `v0.0.0` to ensure `release-plan` correctly detects the new release.
