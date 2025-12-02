# Changelog

## Release (2025-12-02)

* @axiomatic-design/color 0.1.0 (minor)

#### :rocket: Enhancement
* `@axiomatic-design/color`
  * [#6](https://github.com/design-axioms/color/pull/6) docs: update readme title ([@wycats](https://github.com/wycats))
* Other
  * [#4](https://github.com/design-axioms/color/pull/4) docs: update readme ([@wycats](https://github.com/wycats))
  * [#3](https://github.com/design-axioms/color/pull/3) chore: force v0.1.0 release ([@wycats](https://github.com/wycats))

#### :house: Internal
* `@axiomatic-design/color`
  * [#5](https://github.com/design-axioms/color/pull/5) Prepare Release vnull ([@github-actions[bot]](https://github.com/apps/github-actions))

#### Committers: 2
- Yehuda Katz ([@wycats](https://github.com/wycats))
- [@github-actions[bot]](https://github.com/apps/github-actions)

## Release (2025-12-02)



#### :rocket: Enhancement
* [#4](https://github.com/design-axioms/color/pull/4) docs: update readme ([@wycats](https://github.com/wycats))
* [#3](https://github.com/design-axioms/color/pull/3) chore: force v0.1.0 release ([@wycats](https://github.com/wycats))

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
- **CSS**: `engine.css`, `utilities.css`, and `theme.css` are now exported.
- **Docs**: Comprehensive README with installation and usage instructions.

### Changed

- **Package**: Updated to version 0.1.0 and removed private flag.
- **Architecture**: Shifted to `@property` based transitions for smooth light/dark mode switching.
