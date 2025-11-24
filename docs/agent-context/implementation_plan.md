# Consumption & Packaging Implementation Plan

## Phase Status

- **Current Phase:** Phase 6: Verification
- **State:** Complete

## Goal

Clarify how the system is consumed, prevent global pollution by the runtime, and define a clean package structure.

---

## Phase 1: Scoping & Brand Definition (Done)

**Objective:** Ensure `generateTheme` produces a "Brand Definition" (capabilities) rather than forcing a "Global State" (context), and allow it to be scoped to a specific DOM subtree.

- [x] **Refactor Generator (`src/lib/generator.ts`)**:
  - Update `generateTokensCss` to accept an optional `selector` string.
  - If `selector` is present, wrap or prefix rules:
    - Global properties (`@property`) remain global (or use `@layer`?).
    - Class rules (`.surface-card`) become `${selector} .surface-card`.
- [x] **Refactor Runtime (`src/lib/runtime.ts`)**:
  - Update `generateTheme` to accept `selector`.
  - Change the output of Key Color stats:
    - Instead of `--base-hue`, output `--hue-brand`.
    - Instead of `--base-chroma`, output `--chroma-brand`.
  - This aligns with `utilities.css`, where `.hue-brand` maps these variables to the active context.
- [x] **Update Demo**:
  - Give the "Fearless Injector" container an ID (e.g., `#fearless-demo`).
  - Pass `#fearless-demo` to `generateTheme`.
  - Add the class `.hue-brand` to the container to "activate" the generated brand variables.

## Phase 2: Package Structure (Done)

**Objective:** Define exactly what files are shipped and what they do.

- [x] **File Organization**:
  - `css/engine.css`: The core reactive pipeline (`base.css`).
  - `css/utilities.css`: The standard API (`utilities.css`).
  - `css/theme.css`: The default generated tokens (`generated-tokens.css`).
- [x] **Package Exports**:
  - Update `package.json` exports to expose these CSS files.

## Phase 3: Documentation (Done)

**Objective:** Explain the consumption model.

- [x] **Update README**:
  - "Installation": Import engine + utilities + theme.
  - "Customization": How to generate your own theme.
  - "Runtime": How to use the scoped runtime generator.

**Objective:** Ensure the system handles standard browser behaviors that are currently missing.

- [x] **Focus Rings (`:focus-visible`)**:
  - Implement a system-wide focus ring strategy.
  - Must be visible on all surfaces (likely using `outline` + `outline-offset` or a double-box-shadow approach).
  - Should adapt to the brand hue or high-contrast colors.
- [x] **Selection (`::selection`)**:
  - Implement `::selection` styles.
  - Should use brand colors but ensure text readability.
  - Must work across all surfaces.

## Phase 4: Portability (The Runtime Engine) (Done)

**Objective:** Decouple the runtime solver from React/Preact, making it a pure vanilla JS/TS library.

- [x] **Create Runtime Library (`src/lib/runtime.ts`)**:
  - Export `generateTheme(config: SolverConfig): string` (returns CSS string).
  - Export `injectTheme(css: string, target?: HTMLElement)` helper.
- [x] **Refactor Demo**:
  - Update `FearlessInjector.tsx` to use the new vanilla API.
- [x] **Documentation**:
  - Add a "Runtime Usage" section to the docs showing how to use it without React.

## Phase 5: Education (Intuition & Documentation) (Done)

**Objective:** Document the "Why" and the "Mental Model" so users learn the system as they use it.

- [x] **Create `docs/intuition.md`**:
  - Explain the "Reactive Pipeline" (how `base.css` works).
  - Explain the "Solver" philosophy (math vs. magic).
  - Explain the "Surface" taxonomy.
- [x] **Update `README.md`**:
  - Better "Getting Started" flow.
  - Link to the new intuition docs.
- [x] **Interactive Docs (Optional)**:
  - Consider a "Why is this color here?" tooltip in the demo.

## Phase 6: Verification (Done)

- [x] **Visual Regression**: Ensure no visual regressions in the demo.
- [x] **Code Review**: Ensure generated CSS is readable.
