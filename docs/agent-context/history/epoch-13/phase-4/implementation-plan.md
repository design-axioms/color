# Implementation Plan - Epoch 13 Phase 4: Advanced Customization (Mastery)

## Goal
Remove friction for advanced users integrating the color system into complex environments (e.g., existing codebases, specific naming conventions).

## Scope
1.  **Configuration Options**: Add `prefix` and `selector` options to `color-config.json`.
2.  **Audit Command**: Implement `color-system audit` to verify token validity.
3.  **Override Capability**: Allow "breaking the rules" in the Theme Builder (with warnings).

## Detailed Design

### 1. Configuration Options
- **File**: `src/lib/types.ts` (Config interface), `src/lib/generator.ts` (CSS generation).
- **Changes**:
    - Add `options` object to `ColorConfig`.
    - `options.prefix`: Defaults to `color-sys`. Allows users to change the CSS variable prefix (e.g., `--my-app-surface-1`).
    - `options.selector`: Defaults to `:root`. Allows users to scope the variables to a specific selector (e.g., `.theme-provider`).
- **Impact**:
    - All CSS generation logic needs to use these config values instead of hardcoded strings.
    - The `typescript` exporter needs to respect the prefix.

### 2. Audit Command
- **File**: `src/cli/commands/audit.ts` (New).
- **Functionality**:
    - Load `color-config.json`.
    - Check for common errors:
        - Missing keys.
        - Invalid contrast ratios (if we have a standard).
        - Surfaces that are too dark/light for their context.
    - Output a report.

### 3. Override Capability (Theme Builder)
- **File**: `site/src/components/ThemeBuilder.svelte` (and related components).
- **Functionality**:
    - Allow users to manually set a hex code for a surface, bypassing the solver.
    - Display a "Warning" icon if the manual color violates contrast rules.
    - Store overrides in the config (likely a new `overrides` map or a property on the Surface definition).

## Phasing
1.  **Config Options**: Implement `prefix` and `selector` support in the core library and CLI.
2.  **Audit Command**: Create the basic audit command.
3.  **Theme Builder Overrides**: Add UI for overrides.
