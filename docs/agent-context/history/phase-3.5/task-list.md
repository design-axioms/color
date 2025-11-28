# Task List - Epoch 11: Phase 3.5 - Critical Fixes

- [ ] **CLI Refactor**
  - [ ] Update `src/cli/index.ts` to handle `build` command.
  - [ ] Implement `--out` flag parsing.
  - [ ] Implement `--watch` flag (using `fs.watch` or similar).
  - [ ] Update `package.json` name to `@algebraic/color-system`.

- [ ] **DTCG Exporter**
  - [ ] Update `src/lib/exporters/dtcg.ts` to use `oklch` format.
  - [ ] Ensure all foreground colors (including semantic ones) are exported.
  - [ ] Add palette tokens (`chart-1`...`chart-10`) to export.

- [ ] **Documentation**
  - [ ] Create `site/src/content/docs/concepts/hue-shifting.mdx`.
  - [ ] Restore content from archive.
  - [ ] Add link in `site/src/content/docs/concepts/physics-of-light.mdx`.

- [ ] **Verification**
  - [ ] Manual test of CLI commands.
  - [ ] Verify DTCG JSON output.
