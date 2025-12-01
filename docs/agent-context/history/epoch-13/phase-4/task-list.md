# Task List - Epoch 13 Phase 4

## Configuration Options
- [x] Update `ColorConfig` schema in `src/lib/types.ts` to include `options: { prefix?: string, selector?: string }`.
- [x] Update `src/lib/generator.ts` to use `config.options.prefix` and `config.options.selector`.
- [x] Update `src/lib/exporters/typescript.ts` to use `config.options.prefix`.
- [x] Update `src/cli/default-config.ts` to include default options.
- [x] Verify CSS output with custom prefix and selector.

## Audit Command
- [x] Create `src/cli/commands/audit.ts`.
- [x] Implement basic config validation (Contrast & Polarity checks).
- [x] Register command in `src/cli/index.ts`.

## Theme Builder Overrides
- [x] Update `Surface` type to support `override: string` (hex).
- [x] Update `Solver` to respect overrides.
- [x] Add UI in `ThemeBuilder` to set/clear overrides.
- [x] Add visual warning for overridden surfaces.
