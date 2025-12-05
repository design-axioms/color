# Implementation Plan - Epoch 32 Phase 1: Round-Trip DTCG

## Goal

Enable importing configuration from standard Design Token Community Group (DTCG) token files, allowing interoperability with tools like Figma (via plugins) and Style Dictionary.

## Strategy

We will implement a "heuristic importer" that attempts to map generic design tokens to the specific semantic requirements of the Axiomatic system.

1.  **Strict Mapping**: If tokens follow our naming convention (e.g., `surface.card`), map them directly.
2.  **Heuristic Mapping**: If tokens are "incompatible" (generic palettes, raw colors), use them to populate:
    - **Key Colors**: Detect tokens like "brand", "primary", "success" and map them to `anchors.keyColors`.
    - **Anchors**: If a lightness scale is detected (e.g., `gray.100` to `gray.900`), infer the `start` and `end` anchor points for the `page` context.

## Tasks

### 1. Importer Logic (`src/lib/importers/dtcg.ts`)

- [ ] Create `DTCGImporter` class.
- [ ] Implement `parse(json: string): ColorConfig`.
- [ ] Implement **Key Color Heuristics**:
  - Scan for common names (`brand`, `primary`, `accent`, `success`, `warning`, `danger`, `error`, `info`).
  - Extract hex values and populate `anchors.keyColors`.
- [ ] Implement **Anchor Heuristics**:
  - Look for neutral/gray scales.
  - Determine min/max lightness to set `anchors.page.light/dark`.

### 2. CLI Command (`src/cli/commands/import.ts`)

- [ ] Add `import` command.
  - Usage: `axiomatic import <file>`
  - Options: `--dry-run`, `--out <file>`
- [ ] Integrate `DTCGImporter`.
- [ ] Output/Update `color-config.json`.

### 3. Verification

- [ ] Create sample DTCG files (e.g., from Figma Tokens or Style Dictionary).
- [ ] Test importing a "messy" file and verifying the resulting `color-config.json`.
- [ ] Verify that the imported config generates a valid theme.

## Risks

- **Ambiguity**: Heuristics might guess wrong. We should log what we inferred so the user can correct it.
- **Data Loss**: We can't map everything. We should be clear about what was ignored.
