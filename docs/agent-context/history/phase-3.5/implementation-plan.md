# Implementation Plan - Epoch 11: Phase 3.5 - Critical Fixes

**Goal**: Address critical friction points identified in the Fresh Eyes Audit to ensure the system is usable and consistent.

## 1. Analysis

The audit revealed significant discrepancies between the documentation and the actual code, particularly in the CLI and package naming. It also highlighted data loss in the DTCG export.

**Key Issues:**
1.  **CLI Mismatch**: Docs say `color-system build --out ...`, but CLI only supports positional args and no `build` command.
2.  **Package Name**: Docs say `@algebraic/color-system`, `package.json` says `color-system`.
3.  **DTCG Data Loss**: Exporter converts to Hex (sRGB) and misses colored text.
4.  **Missing Docs**: Hue Shifting rationale is missing.

## 2. Execution Strategy

### A. CLI Refactor
- Refactor `src/cli/index.ts` to use a proper argument parser (or just better manual parsing) to support:
    - `init` (existing)
    - `build` (new, explicit command for generation)
    - `--out <path>` (flag support)
    - `--watch` (flag support - nice to have, or at least stub/warn)
- Maintain backward compatibility for positional args if possible, or break it cleanly since we are pre-1.0.

### B. Package Name
- Rename `package.json` to `@algebraic/color-system`.
- Ensure `tsup` build and exports are correct.

### C. DTCG Exporter Upgrade
- Update `src/lib/exporters/dtcg.ts`:
    - Use `oklch` for `$value` when in P3 mode (or always, per "Baseline Newly Available").
    - Iterate over `surface.computed` to export all foregrounds, not just neutrals.
    - Include Palette tokens (`--chart-*`).

### D. Documentation Restoration
- Create `site/src/content/docs/concepts/hue-shifting.mdx`.
- Restore content from `docs/agent-context/design/archive/hue-shift-rationale.md`.
- Link to it from "Physics of Light".

## 3. Execution Steps

- [ ] **CLI**: Implement `build` command and flag parsing in `src/cli/index.ts`.
- [ ] **Package**: Rename to `@algebraic/color-system` in `package.json`.
- [ ] **DTCG**: Refactor `toDTCG` to support P3 and full foregrounds.
- [ ] **Docs**: Add `hue-shifting.mdx` and update `physics-of-light.mdx`.

## 4. Verification
- [ ] **CLI Test**: Run `npx color-system build --out dist/theme.css` and verify output.
- [ ] **Export Test**: Run `color-system export --format dtcg` and check for `oklch` values.
- [ ] **Docs Check**: Verify Hue Shift page exists and is linked.
