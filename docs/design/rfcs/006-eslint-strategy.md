# RFC 006: Systematic ESLint Suppression Strategy

## Status

- **Status**: Strawman
- **Created**: 2025-12-09

## Summary

We are currently encountering situations where strict ESLint rules (specifically `@typescript-eslint/no-unnecessary-condition`) conflict with defensive programming practices or platform-specific quirks. This RFC proposes a systematic approach to handling these conflicts, moving away from ad-hoc `eslint-disable` comments.

## Motivation

- **"Whac-A-Mole"**: We frequently fight the linter during commits, leading to frustration and "quick fix" disables.
- **Safety vs. Purity**: The linter assumes perfect type safety, but runtime reality (DOM APIs, external inputs) often requires checks that the linter deems "unnecessary".
- **Code Clarity**: Scattered `eslint-disable` comments clutter the code and hide potential real issues.

## Proposed Strategy

### 1. Categorize Suppressions

We should categorize why a rule is being disabled:

- **Runtime Safety**: The type system says it's defined, but runtime might not be (e.g., DOM elements).
- **Legacy/Refactor**: Code scheduled for rewrite.
- **False Positive**: The linter is objectively wrong about the control flow.

### 2. Centralized Configuration vs. Inline

- **Global/Path-based overrides**: For specific directories (like `scripts/` or `tests/`) where loose typing is acceptable, configure overrides in `eslint.config.js`.
- **Utility Wrappers**: Instead of disabling inline, create utility functions that encapsulate the "unsafe" check.

```typescript
// Instead of:
// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
if (foo) { ... }

// Use a utility:
import { isDefined } from '@lib/utils';
if (isDefined(foo)) { ... }
```

### 3. "The Checker" Integration

Update our custom lint scripts to enforce that every `eslint-disable` is accompanied by a comment explaining _why_, or track them in a central allowlist.

## Specific Rules to Review

- `@typescript-eslint/no-unnecessary-condition`: Too aggressive for DOM-heavy code?
- `@typescript-eslint/no-floating-promises`: Essential for Node, but noisy in scripts?

## Action Items

1.  Audit current `eslint-disable` usages.
2.  Discuss adjusting the severity of `no-unnecessary-condition` to `warn` instead of `error` for the `src/lib/inspector` directory.
3.  Implement "branded types" or type guards to satisfy the linter without disabling rules.
