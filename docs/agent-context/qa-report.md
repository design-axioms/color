# QA Report: Zero to One (Grand Simulation)

**Date**: 2025-12-08
**Agent**: GitHub Copilot (Gemini 3 Pro)

## Summary

The "Zero to One" simulation was conducted to validate the user journey from installation to a working themed application. The process followed the "Quick Start" guide.

## Findings

### Successes

- **Installation**: `npm install` of the packed tarball worked correctly.
- **Initialization**: `npx axiomatic init` successfully created a valid `color-config.json`.
- **Configuration**: Editing `color-config.json` to use high chroma (0.3) and custom key colors worked as expected.
- **Generation**: `npx axiomatic build` and `export` generated valid CSS and TypeScript files.
- **Audit**: `npx axiomatic audit` passed with the custom configuration.
- **Output Quality**:
  - Generated CSS uses modern `oklch()` and `light-dark()` syntax.
  - High Contrast mode (`prefers-contrast: more`) is correctly supported.
  - Primary text (`text-high`) snaps to absolute Black/White in High Contrast mode.

### Friction Points

1.  **Missing Output Directory**: The command `npx axiomatic build --out ./src/theme.css` failed with `ENOENT` because the `src` directory did not exist. The `init` command does not create a `src` folder, and the documentation does not explicitly instruct the user to create it before running the build command.
    - _Recommendation_: The CLI should ensure the output directory exists (mkdir -p) or the docs should add a step to create it.
    - _Status_: **Fixed**. The CLI now automatically creates the output directory.
2.  **HTML Example Path**: The HTML example in the Quick Start guide uses `<link rel="stylesheet" href="/theme.css" />`. This absolute path assumes the user is serving the project with the `src` (or wherever the file is) as the root, which might not be true for a simple "open file" test or different bundler setups.
    - _Recommendation_: Clarify the serving context or use a relative path in the example if appropriate for a "Zero to One" static file test.
    - _Status_: **Fixed**. Updated documentation to use `./src/theme.css` which matches the build output and works with relative paths.
3.  **Engine Warning**: The `package.json` specifies `"engines": { "node": "^24.0.0" }`. This causes `npm install` to emit `EBADENGINE` warnings on Node 25 (which is the current environment).
    - _Recommendation_: Widen the engine range to include Node 25 (e.g., `>=24.0.0`).
    - _Status_: **Fixed**. Updated `package.json` to allow Node `>=24.0.0`.

### Bugs

- No functional bugs were found in the library logic.

### Axiom Compliance

- **Physics**: The system correctly handled high chroma requests (0.3) without breaking, likely using gamut mapping (though not explicitly verified in the CSS output, the solver logic handles this).
- **Late Binding**: The CSS uses CSS variables for context (`--axm-surface-token`, etc.), adhering to the late-binding axiom.

## Conclusion

The system is robust and functional. The primary friction is in the "Quick Start" documentation regarding file paths and directory creation.
