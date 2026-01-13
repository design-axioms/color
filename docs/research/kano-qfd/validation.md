# Kano-QFD Validation: RFC010 Conflict Analysis

**Date**: 2026-01-12  
**Status**: Validated - Conflict is Real

## Executive Summary

The previous Kano-QFD analysis identified a potential conflict between the RFC010 enforcement gate and the Starlight adapter's use of color synthesis functions. **This conflict is confirmed and active.** Running `node scripts/check-rfc010.ts` produces **31 violations**, meaning the docs site currently fails the consumer contract gate.

## Evidence

### RFC010 Gate Behavior

**File**: `scripts/check-rfc010.ts`

The gate scans `site/src/**/*.{css,astro,svelte,ts,tsx,js,jsx}` (line 49) and applies the following relevant patterns:

```typescript
// Line 226-233
{
  rule: "no-hardcoded-color-functions",
  re: /\b(?:rgb|rgba|hsl|hsla|oklch|oklab|color-mix)\(/gi,
  appliesTo: "all",
}
```

**Exemptions exist for**:

- `--sl-*` variables: Only in `ALLOWED_STARLIGHT_VARS_FILES` (line 139-142)
- `--axm-bridge-*` variables: Only in `ALLOWED_BRIDGE_EXPORTS_FILES` (line 144-147)

**No exemption exists for**:

- Color functions (`oklch()`, `color-mix()`) in any file
- The adapter bridge file is NOT in `IGNORE_GLOBS` (lines 36-47)

### Starlight Adapter Violations

**File**: `site/src/styles/starlight-custom.css`

The adapter uses color functions for intermediate gray synthesis (lines 540-665):

| Line    | Function      | Purpose                                        |
| ------- | ------------- | ---------------------------------------------- |
| 540-545 | `color-mix()` | Gray-4 intermediate                            |
| 550-555 | `color-mix()` | Gray-6 surface elevation                       |
| 558-563 | `color-mix()` | Hairline-light                                 |
| 566-590 | `oklch()`     | Accent colors (low/mid/high)                   |
| 596-665 | `oklch()`     | Semantic colors (blue/green/orange/red/purple) |

**Total**: ~25 `oklch()` + ~6 `color-mix()` = 31 violations in adapter alone

### Documentation Violations

**File**: `site/src/content/docs/advanced/framework-integration.mdx`

The framework integration docs show `--axm-bridge-*` usage in code examples (lines 59-69). These are flagged as `no-axm-vars` violations because:

1. The docs file is NOT in `ALLOWED_BRIDGE_EXPORTS_FILES`
2. The gate doesn't distinguish "explanatory code samples" from "authored CSS"

This is a **false positive** for docs—the code is showing how adapters should work, not authored consumer CSS.

## Conflict Classification

| Issue                        | Type             | Severity |
| ---------------------------- | ---------------- | -------- |
| Color functions in adapter   | Architecture gap | High     |
| Bridge vars in docs examples | Gate design gap  | Medium   |

## Root Cause

RFC-029 explicitly endorses `oklch()` and `color-mix()` for adapter synthesis (see RFC-029 lines 84-120), but RFC010 enforcement was written without an adapter-scoped exemption for color functions. The two RFCs are in direct conflict.

## Implications

1. **"Best-face docs" goal is currently unmet**: The site fails its own contract gate
2. **CI may be broken or not running this check**: Need to verify CI pipeline
3. **RFC reconciliation required**: Either RFC-029's approach or RFC010's enforcement must change

## Next Steps

See `options.md` for resolution paths.
