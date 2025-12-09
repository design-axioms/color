# RFC 005: Overlay Color System Integration

## Status

- **Status**: Strawman
- **Created**: 2025-12-09

## Summary

The current implementation of the inspector overlay (`src/lib/inspector/overlay.ts`) relies on hardcoded CSS colors (e.g., `rgba(255, 0, 0, 0.3)`). This RFC proposes refactoring the overlay to utilize the project's axiomatic color system, ensuring consistency with the rest of the application and enabling theme awareness.

## Motivation

- **Consistency**: The overlay currently stands apart from the design system, using arbitrary values.
- **Theming**: Hardcoded colors do not adapt to light/dark modes or high-contrast settings.
- **Maintainability**: Centralizing color definitions reduces magic values scattered across the codebase.

## Proposed Design

### 1. Define Overlay Tokens

We should define a specific set of semantic tokens for the inspector overlay within the color system.

```json
// Example token structure
{
  "inspector": {
    "overlay": {
      "highlight": "color.semantic.inspector.highlight",
      "grid": "color.semantic.inspector.grid",
      "text": "color.semantic.inspector.text"
    }
  }
}
```

### 2. Update `overlay.ts`

Refactor `src/lib/inspector/overlay.ts` to consume these tokens instead of raw CSS values.

```typescript
// Before
ctx.fillStyle = "rgba(255, 0, 0, 0.3)";

// After
ctx.fillStyle = theme.colors.inspector.overlay.highlight;
```

### 3. Late Binding

Ensure that the overlay respects the "Late Binding" principle, resolving colors at runtime based on the active context (if applicable), or explicitly opting out if the inspector should remain high-contrast/invariant.

## Alternatives Considered

- **Keep Hardcoded**: Low effort, but technical debt accumulates.
- **CSS Variables**: Use CSS variables directly in the canvas context (requires `getComputedStyle` or similar bridge).

## Implementation Plan

1.  Identify all hardcoded colors in `src/lib/inspector/overlay.ts`.
2.  Define corresponding semantic tokens in the color config.
3.  Expose these tokens to the runtime environment where `overlay.ts` executes.
4.  Refactor `overlay.ts` to use the new tokens.
