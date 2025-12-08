# RFC 001: Foreign Element Adapters

## Context

The Axiomatic Color System relies on a "Reactive Pipeline" where elements participate in a physics simulation to determine their color. This requires elements to:

1.  Inherit context (Atmosphere, Time).
2.  Define their role (Surface, Text).
3.  Execute the physics math (The "Grand Unified Algebra").

Third-party frameworks (like Starlight, or legacy CSS) often use hardcoded colors and isolated class names (e.g., `.sl-link-button.primary`), breaking this contract.

## Problem

Currently, fixing these "foreign" elements requires manually copying and pasting complex CSS calculation logic into override files. This is:

- **Fragile**: If the core math changes, overrides break.
- **Tedious**: Requires deep knowledge of the system's internals.
- **Error-Prone**: Easy to miss a variable or calculation step.

## Proposal: "Mounting" the Physics Engine

We propose a configuration-driven approach to "bless" foreign selectors as Axiomatic surfaces.

### 1. Configuration

Users define mappings in `color-config.json`:

```json
{
  "adapters": {
    ".sl-link-button.primary": {
      "role": "surface-action",
      "context": "brand"
    },
    ".card": {
      "role": "surface-card"
    },
    ".sidebar": {
      "role": "surface-workspace"
    }
  }
}
```

### 2. Automated Generation

The build system generates a CSS file (e.g., `adapters.css`) that injects the necessary logic into these selectors.

**Generated CSS (Conceptual):**

```css
.sl-link-button.primary {
  /* 1. Inject Context (if specified) */
  --alpha-hue: var(--_axm-hue-brand);
  --alpha-beta: var(--_axm-chroma-brand);

  /* 2. Inject Tokens (from the requested role) */
  --axm-surface-token: var(--axm-surface-action-token); /* Conceptual */

  /* 3. Inject The Physics Engine (The Reactive Pipeline) */
  /* This logic is currently duplicated in engine.css but would be applied here */
  --_axm-computed-surface: oklch(
    from var(--axm-surface-token) l
      min(
        var(--alpha-beta),
        var(--alpha-beta) * (1 - abs(2 * l - 1)) * var(--tau) * var(--tau)
      )
      h
  );

  background-color: var(--_axm-computed-surface);
  color: var(--_axm-computed-fg-color);
}
```

### 3. Benefits

- **Zero Friction**: Map `Selector -> Intent`.
- **Robustness**: Updates to the physics engine propagate to adapters automatically.
- **Encapsulation**: Keeps foreign CSS isolated.

## Open Questions

1.  **Specificity**: How do we ensure the generated CSS wins over the framework's CSS? (Likely via `@layer` or high specificity).
2.  **Token Access**: We need to ensure the "source tokens" for a role (like `surface-action`) are available to be aliased. Currently, they are defined inside the class block in `theme.css`. We might need to expose them as global vars or mixins.
3.  **Complex Selectors**: Handling pseudo-states (`:hover`, `:active`) might require more complex config or assumption that the physics engine handles it via the reactive variables.

## Status

- **Draft**: Needs discussion.
- **Prototype**: Manual overrides in `site/src/styles/starlight-custom.css` serve as the proof of concept.
