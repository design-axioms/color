# Walkthrough: Epoch 32 Phase 2 - Token Reorganization

## Goal

The goal of this phase was to reorganize the DTCG export structure to align with ecosystem standards, specifically the "Token Sets" model used by tools like Tokens Studio. This involved splitting the monolithic export into three distinct tiers: Primitives, Light Mode, and Dark Mode.

## Changes

### 1. Exporter Refactoring (`src/lib/exporters/dtcg.ts`)

We refactored the `toDTCG` function to return a `DTCGExport` object, which contains a map of filenames to their content (`Record<string, DTCGFile>`).

- **`generatePrimitives`**: Extracts global key colors and anchors into a `primitives.json` structure.
- **`generateMode`**: Generates semantic tokens (surfaces, text, charts, shadows) for a specific mode (`light` or `dark`).
- **`toDTCG`**: Orchestrates the generation of `primitives.json`, `light.json`, and `dark.json`.

### 2. CLI Update (`src/cli/commands/export.ts`)

We updated the `export` command to handle directory outputs.

- **Directory Detection**: If the `--out` path does not end in `.json`, it is treated as a directory.
- **Multi-File Write**: When exporting to a directory, the CLI writes the individual files returned by the exporter (`primitives.json`, `light.json`, `dark.json`).
- **Legacy Support**: If the `--out` path ends in `.json`, the CLI merges the files into a single JSON object (preserving the old structure) for backward compatibility.

### 3. TypeScript Fixes

We resolved several TypeScript errors that were blocking the build:

- Fixed strict property initialization in `src/lib/inspector/overlay.ts`.
- Fixed import extensions and type safety issues in `src/lib/importers/dtcg.ts`.
- Updated tests in `src/lib/exporters/__tests__/dtcg.test.ts` to match the new exporter signature.

## Verification

We verified the changes by:

1.  Running `pnpm build` to ensure a clean compilation.
2.  Running `axiomatic export --out tokens/` to generate the new file structure.
3.  Inspecting the generated files (`primitives.json`, `light.json`, `dark.json`) to confirm they contain the expected data.

## Next Steps

The next phase is **Epoch 32 Phase 3: High-Level Presets ("Vibes")**, where we will implement curated configuration presets to simplify the initial setup for users.
