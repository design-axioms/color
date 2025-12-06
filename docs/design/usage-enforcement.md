# Design: Usage Enforcement (Linter)

> **Related Axiom**: [The Laws of Integration](../axioms/04-integration.md) (Code is Truth)

## The Law of Usage

**If the Code is the Source of Truth, the Usage must reflect the Code.**

We spend a lot of effort validating the _configuration_ (`axiomatic audit`), but we currently do nothing to validate the _consumption_. A developer can define a perfect system and then write `<div class="bg-gray-500">` in their component, bypassing the entire engine.

## The Problem: Leakage

"Magic Numbers" and hardcoded values leak into the codebase over time.

- Developers copy-paste from StackOverflow.
- Developers use "approximate" Tailwind classes because they forgot the semantic token name.
- This erodes the "System" part of the Design System.

## The Solution: `eslint-plugin-axiomatic`

We need a linter that enforces the Axioms at the point of usage.

### Rules

1.  **`no-hardcoded-colors`**:
    - Flag: `color: #ccc`, `background: rgb(0,0,0)`.
    - Suggest: Use a system token.
2.  **`no-magic-tailwind`** (if using Tailwind):
    - Flag: `bg-gray-500`, `text-blue-600`.
    - Suggest: `bg-surface-sunken`, `text-link`.
3.  **`prefer-semantic-tokens`**:
    - Flag: Usage of raw CSS variables like `var(--color-scale-500)`.
    - Suggest: Semantic variables like `var(--text-subtle)`.

### Integration

- This plugin should be part of the standard `init` template.
- It should be auto-fixable where possible (though semantic mapping is hard to auto-fix).
- It serves as an educational tool, teaching the user _why_ they should use the system tokens.
