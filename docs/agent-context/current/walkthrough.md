# Phase Walkthrough: Usage Linter

## Goal

The goal of this phase was to create an ESLint plugin to enforce the usage of semantic tokens and utility classes, preventing hardcoded colors and raw internal tokens. This ensures that developers adhere to the design system and facilitates future refactoring.

## Implementation

### ESLint Plugin Structure

We created a new package `packages/eslint-plugin` containing the plugin logic. The plugin exports a recommended configuration that enables the rules.

### Rules

#### `no-hardcoded-colors`

This rule detects hardcoded color values (hex, rgb, hsl, named colors) in style attributes across various frameworks (JSX, Svelte, Vue, Glimmer).

- **Mechanism**: It parses the style strings and identifies color values.
- **Suggestions**: It suggests replacing the hardcoded color with a valid semantic token `var(--axm-...)`.
- **Context Awareness**: It uses heuristics based on the CSS property name (e.g., `background-color` -> suggest `surface` tokens) to provide relevant suggestions.

#### `no-raw-tokens`

This rule detects the usage of internal or non-existent tokens.

- **Internal Tokens**: It flags tokens starting with `--color-sys-`, `--scale-`, etc., as internal and suggests using the corresponding semantic token.
- **Utility Classes**: It suggests using utility classes (e.g., `.shadow-sm`) instead of raw variables (e.g., `var(--axm-shadow-sm)`) where appropriate.
- **Surface Tokens**: It specifically enforces that surface tokens should be applied via utility classes to ensure proper context nesting.

### Dynamic Theme Loading

The rules are dynamic; they read the generated `css/theme.css` and `css/utilities.css` files from the user's project. This means the linter is always aware of the actual tokens and utilities available in the current build of the design system.

## Key Decisions

1.  **Late Binding for Linter**: Just like the CSS engine, the linter binds to the _generated_ artifacts. This avoids duplicating logic and ensures consistency.
2.  **Framework Agnostic Core**: The core logic for identifying colors and tokens is shared, with specific visitors for different template syntaxes (JSX, Svelte, Vue, Glimmer).
3.  **Strict Typing**: The plugin itself is written in TypeScript with strict linting rules to ensure maintainability.

## Verification

- **Unit Tests**: Comprehensive unit tests using `RuleTester` cover various scenarios and edge cases.
- **Smoke Tests**: Integration tests for Vue, Svelte, and GTS ensure the plugin works correctly in real-world file structures.
- **Self-Hosting**: The project itself is linted using the plugin (where applicable), and the plugin code is linted with standard rules.
