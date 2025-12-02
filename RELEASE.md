# Release Process

This project uses [release-plan](https://github.com/embroider-build/release-plan) to automate releases.

## How it works

1.  **Development**: Create Pull Requests as usual.
2.  **Labeling**: Label your PRs with one of the following labels to indicate the impact:
    - `breaking` (Major version bump)
    - `enhancement` (Minor version bump)
    - `bug` (Patch version bump)
    - `documentation` (No version bump, or patch if configured)
    - `internal` (No version bump)
3.  **Planning**: The "Plan Release" workflow runs on every push to `main` and when PRs are labeled/unlabeled. It checks if there are any unreleased changes.
4.  **Preview**: If there are unreleased changes, a "Prepare Release" Pull Request is automatically created (or updated). This PR contains:
    - The calculated version bumps.
    - The generated `CHANGELOG.md` entries.
    - A `.release-plan.json` file.
5.  **Release**: To release, simply **merge the "Prepare Release" PR**.
6.  **Publishing**: When the "Prepare Release" PR is merged, the "Publish Stable" workflow runs. It:
    - Publishes the package to NPM.
    - Creates a GitHub Release.

## Manual Release

If you need to trigger a release manually or check the plan locally:

```bash
# Check the plan
pnpm release-plan explain-plan

# Prepare a release locally (updates files)
pnpm release-plan prepare
```
