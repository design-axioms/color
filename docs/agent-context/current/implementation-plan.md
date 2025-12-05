# Implementation Plan: Epoch 32 Phase 2 (Token Reorganization)

## Goal

Refactor the DTCG exporter to produce a multi-file structure (Primitives, Semantics, Modes) that aligns with the "Three-Tier" architecture and better supports tools like Tokens Studio.

## Architecture Changes

### 1. Exporter Interface

The `DTCGExporter` currently returns a single JSON object. We will change this to return a "File Map":

```typescript
type DTCGExport = {
  files: {
    "primitives.json": DTCGFile;
    "light.json": DTCGFile;
    "dark.json": DTCGFile;
    // potentially others
  };
};
```

### 2. Primitives Generation

We need to extract the "Ingredients" from the `ColorConfig`:

- **Key Colors**: `config.keyColors` -> `color.{name}`
- **Anchors**: `config.anchors` (calculated steps) -> `color.neutral.{step}`

### 3. Mode Generation

Instead of a single file with `light` and `dark` keys, we will generate separate files.

- `light.json`: Contains the resolved values for the Light theme.
- `dark.json`: Contains the resolved values for the Dark theme.
- **Nesting**: All tokens will be wrapped in a `color` group to avoid root namespace pollution.

## Step-by-Step Implementation

### Step 1: Refactor `src/lib/exporters/dtcg.ts`

1.  Modify the `toDTCG` function signature (or create a new `toDTCGMultiFile` function to preserve backward compatibility if needed, but likely we'll just update the main one and let the CLI handle the output format).
2.  Implement `getPrimitives(config)`: Returns the DTCG structure for key colors and anchors.
3.  Implement `getMode(theme, modeName)`: Returns the DTCG structure for a specific mode.
4.  Combine these into the result map.

### Step 2: Update CLI `src/cli/commands/export.ts`

1.  Check the `--out` argument.
2.  If it ends in `.json`, assume single-file mode (maybe merge the result into one object for legacy support, or error).
3.  If it's a directory (or doesn't have an extension), assume multi-file mode.
4.  Ensure the output directory exists.
5.  Write the files.

### Step 3: Verification

1.  Generate tokens for the example config.
2.  Check the output files.
3.  Validate against the DTCG spec (using the `check-tokens.sh` script if applicable, or manual inspection).

## Risks & Mitigations

- **Breaking Changes**: Changing the export format is a breaking change for anyone consuming the JSON. We should consider a flag or heuristic to maintain the old format if needed, but since we are in `0.x`, we can break it with a major version bump or just document it.
- **Complexity**: Splitting files might make it harder to see the "whole picture" at once. Good documentation is key.
