# Changelog

## Release (2026-01-08)

* @axiomatic-design/color 1.0.0 (major)

#### :boom: Breaking Change
* `@axiomatic-design/color`
  * [#29](https://github.com/design-axioms/color/pull/29) refactor: make invertedSelectors required, remove CSS fallback ([@wycats](https://github.com/wycats))

#### :rocket: Enhancement
* `@axiomatic-design/color`
  * [#25](https://github.com/design-axioms/color/pull/25) feat: add --emit-ts flag to generate TypeScript metadata ([@wycats](https://github.com/wycats))
  * [#24](https://github.com/design-axioms/color/pull/24) feat: add invertedSelectors option and mark AxiomaticTheme internal ([@wycats](https://github.com/wycats))

#### :house: Internal
* `@axiomatic-design/color`
  * [#28](https://github.com/design-axioms/color/pull/28) chore: add site/ to prettierignore and format CHANGELOG ([@wycats](https://github.com/wycats))
  * [#26](https://github.com/design-axioms/color/pull/26) refactor: delegate ThemeManager CSS writes to AxiomaticTheme ([@wycats](https://github.com/wycats))
* Other
  * [#23](https://github.com/design-axioms/color/pull/23) docs: consolidate ThemeManager architecture in RFCs ([@wycats](https://github.com/wycats))

#### Committers: 1
- Yehuda Katz ([@wycats](https://github.com/wycats))

## Release (2026-01-06)

- @axiomatic-design/color 0.3.0 (minor)
- @axiomatic-design/eslint-plugin 0.3.0 (minor)
- @axiomatic-design/vscode-extension 0.2.0 (minor)

#### :rocket: Enhancement

- `@axiomatic-design/color`
  - [#21](https://github.com/design-axioms/color/pull/21) feat: Complete P0+P1 error remediation (21 error codes) ([@wycats](https://github.com/wycats))
  - [#18](https://github.com/design-axioms/color/pull/18) Epoch 2: Theme Studio alignment (single theme plane + strict config IO) ([@wycats](https://github.com/wycats))
- `@axiomatic-design/color`, `@axiomatic-design/eslint-plugin`
  - [#17](https://github.com/design-axioms/color/pull/17) User programming model audit + docs enforcement + inspector remediation ([@wycats](https://github.com/wycats))
- `@axiomatic-design/color`, `@axiomatic-design/eslint-plugin`, `@axiomatic-design/vscode-extension`
  - [#15](https://github.com/design-axioms/color/pull/15) Website polish + generator export fix ([@wycats](https://github.com/wycats))

#### :bug: Bug Fix

- `@axiomatic-design/color`
  - [#22](https://github.com/design-axioms/color/pull/22) fix: use proper DeepPartial type from types.ts ([@wycats](https://github.com/wycats))
  - [#19](https://github.com/design-axioms/color/pull/19) Fix inspector mismatch prioritization ([@wycats](https://github.com/wycats))

#### :house: Internal

- `@axiomatic-design/color`
  - [#20](https://github.com/design-axioms/color/pull/20) chore: consolidate RFCs and flatten docs/agent structure ([@wycats](https://github.com/wycats))

#### Committers: 1

- Yehuda Katz ([@wycats](https://github.com/wycats))

## Release (2025-12-10)

- @axiomatic-design/color 0.2.0 (minor)
- @axiomatic-design/eslint-plugin 0.2.0 (minor)
- @axiomatic-design/vscode-extension 0.1.0 (minor)

#### :rocket: Enhancement

- `@axiomatic-design/color`, `@axiomatic-design/eslint-plugin`, `@axiomatic-design/vscode-extension`
  - [#13](https://github.com/design-axioms/color/pull/13) fix: website polish and node 25 support ([@wycats](https://github.com/wycats))

#### :bug: Bug Fix

- `@axiomatic-design/color`
  - [#14](https://github.com/design-axioms/color/pull/14) fix: handle git diff errors in vercel-ignore and ignore qa-audit ([@wycats](https://github.com/wycats))
- `@axiomatic-design/color`, `@axiomatic-design/eslint-plugin`, `@axiomatic-design/vscode-extension`
  - [#10](https://github.com/design-axioms/color/pull/10) fix: resolve svelte check syntax and type errors ([@wycats](https://github.com/wycats))

#### :house: Internal

- `@axiomatic-design/color`
  - [#9](https://github.com/design-axioms/color/pull/9) fix: resolve all linting errors (Epoch 20 Phase 2) ([@wycats](https://github.com/wycats))

#### Committers: 1

- Yehuda Katz ([@wycats](https://github.com/wycats))

## Release (2025-12-02)

- @axiomatic-design/color 0.1.0 (minor)

#### :rocket: Enhancement

- `@axiomatic-design/color`
  - [#6](https://github.com/design-axioms/color/pull/6) docs: update readme title ([@wycats](https://github.com/wycats))
- Other
  - [#4](https://github.com/design-axioms/color/pull/4) docs: update readme ([@wycats](https://github.com/wycats))
  - [#3](https://github.com/design-axioms/color/pull/3) chore: force v0.1.0 release ([@wycats](https://github.com/wycats))

#### :house: Internal

- `@axiomatic-design/color`
  - [#5](https://github.com/design-axioms/color/pull/5) Prepare Release vnull ([@github-actions[bot]](https://github.com/apps/github-actions))

#### Committers: 2

- Yehuda Katz ([@wycats](https://github.com/wycats))
- [@github-actions[bot]](https://github.com/apps/github-actions)

## Release (2025-12-02)

#### :rocket: Enhancement

- [#4](https://github.com/design-axioms/color/pull/4) docs: update readme ([@wycats](https://github.com/wycats))
- [#3](https://github.com/design-axioms/color/pull/3) chore: force v0.1.0 release ([@wycats](https://github.com/wycats))

#### Committers: 1

- Yehuda Katz ([@wycats](https://github.com/wycats))

All notable changes to this project will be documented in this file.

## [0.1.0] - 2025-12-02

### Rebrand

- **Identity**: Renamed package from `color-system` to `@axiomatic-design/color`.
- **CLI**: Renamed CLI binary from `color-system` to `axiomatic`.

### Added

- **CLI**: New `audit` command to verify theme accessibility and polarity.
- **CLI**: New `export` command supporting DTCG, Tailwind, and TypeScript formats.
- **Configuration**: Added `prefix` and `selector` options for custom scoping.
- **Overrides**: Added support for manual hex overrides in `SurfaceConfig`.
- **Charts**: Added data visualization palette generation (`--chart-*`).
- **Primitives**: Added shadow and focus ring primitives.

### Changed

- **Architecture**: Shifted to `oklch` for all color calculations.
- **P3 Gamut**: Full support for P3 wide gamut colors.
- **Documentation**: Complete overhaul of the documentation site using Astro Starlight.

## [0.0.1] - 2025-11-24

### Added

- **CLI**: New `color-system` CLI with `init` command for scaffolding.
- **Build**: `tsup` build configuration for optimized distribution.
- **Runtime**: `generateTheme` and `injectTheme` exports for runtime theming.
- **CSS**: `engine.css` and `theme.css` are now exported.
- **Docs**: Comprehensive README with installation and usage instructions.

### Changed

- **Package**: Updated to version 0.1.0 and removed private flag.
- **Architecture**: Shifted to `@property` based transitions for smooth light/dark mode switching.
