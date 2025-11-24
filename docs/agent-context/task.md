# Current Task: Consumption & Packaging

**Focus:** Phase 1: Scoping & Brand Definition

## Context

We have a robust system, but the "Consumption Story" is muddy. The runtime generator pollutes the global scope, and the package structure isn't clearly defined for consumers.

## Active Steps

- [ ] **Refactor Generator (`src/lib/generator.ts`)**:
  - [ ] Add `selector` option to `generateTokensCss`.
  - [ ] If `selector` is provided, prefix all rules (e.g., `.my-scope .surface-card`).
- [ ] **Refactor Runtime (`src/lib/runtime.ts`)**:
  - [ ] Update `generateTheme` to accept `selector`.
  - [ ] Change `generateTheme` to output `--hue-brand` / `--chroma-brand` instead of `--base-hue` / `--base-chroma`.
- [ ] **Update Demo**:
  - [ ] Update `FearlessInjector` to use a scoped selector (e.g., `#fearless-demo`).
  - [ ] Apply `.hue-brand` to the demo container to activate the generated brand variables.

## Upcoming Phases

### Phase 2: Package Structure

- [ ] Define clear exports in `package.json`.
- [ ] Rename/Organize CSS files for distribution:
  - `css/base.css` -> `dist/engine.css` (The Core)
  - `css/utilities.css` -> `dist/utilities.css` (The API)
  - `css/generated-tokens.css` -> `dist/theme.css` (The Default Theme)

### Phase 3: Documentation

- [ ] Document how to consume the package (Static vs. Runtime).
- [ ] Document how to use Scoping.
