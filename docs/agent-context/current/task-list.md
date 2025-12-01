# Task List: Epoch 16 Phase 1

## Documentation Styling
- [x] **Audit MDX Styles**: Scan `site/src/content/docs/**/*.mdx` for inline `style="..."` attributes. <!-- id: 0 -->
- [x] **Refactor to Utilities**: Replace ad-hoc inline styles with system utility classes or scoped CSS where appropriate. <!-- id: 1 -->
- [x] **Polish Diagrams**: Review and improve the visual hierarchy of concept diagrams (e.g., `concepts/physics-of-light.mdx`). <!-- id: 2 -->

## CI Integration
- [x] **Add Audit Script**: Ensure `package.json` has a script for `color-system audit`. <!-- id: 3 -->
- [x] **Update CI Workflow**: Modify `.github/workflows/deploy.yml` (or equivalent) to run the audit before building. <!-- id: 4 -->
