# Kano-QFD Sequencing: Critical Path to Green

**Date**: 2026-01-12  
**Goal**: Docs site passes all contract checks

## Dependency Graph

```
┌─────────────────────────────────────────────────────────────────┐
│                    DECISION GATE                                 │
│  "Allow color functions in adapter?" (Options A/B/C/D/E)        │
└─────────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
┌─────────────────────────┐     ┌─────────────────────────────────┐
│  Update RFC010 Gate     │     │  Update Adapter CSS (if needed) │
│  (add exemption logic)  │     │  (depends on chosen option)     │
└─────────────────────────┘     └─────────────────────────────────┘
              │                               │
              └───────────────┬───────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Fix Docs Examples Issue                                         │
│  (bridge vars in framework-integration.mdx)                     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Verify All Checks Pass                                          │
│  - RFC010 gate: 0 violations                                    │
│  - Starlight adapter contract sentinel: passes                  │
│  - Starlight CSSOM sentinel: passes                             │
│  - Continuity test: passes                                      │
│  - verify-colors test: passes (or updated)                      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Update RFC-029 to Match Reality                                 │
│  (document actual !important count and exemption rationale)     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Cross-Link Working Example                                      │
│  (examples/vercel-demo in integration docs)                     │
└─────────────────────────────────────────────────────────────────┘
```

## Phase 1: Unblock (Must Do First)

### 1.1 Make Decision on Adapter Color Functions

**Owner**: Project lead  
**Effort**: XS (decision only)  
**Blocks**: Everything else

**Question**: Should the adapter bridge file be allowed to use `oklch()` and `color-mix()` for intermediate color synthesis?

**Recommended answer**: Yes, with documentation. Adapters are acknowledged as special in RFC-021; this is consistent with that stance.

### 1.2 Implement Chosen Option in RFC010 Gate

**Effort**: XS-S (depending on option)  
**Depends on**: 1.1  
**Blocks**: Verification

**If Option A/C (recommended)**:

- Add `ALLOWED_COLOR_FUNCTIONS_FILES` set to `scripts/check-rfc010.ts`
- Add `site/src/styles/starlight-custom.css` to that set
- Skip `no-hardcoded-color-functions` rule for files in that set

### 1.3 Fix Docs Examples Issue

**Effort**: XS-S  
**Depends on**: Nothing (can parallel with 1.2)  
**Blocks**: Verification

**Options**:

1. Add `site/src/content/docs/advanced/framework-integration.mdx` to `ALLOWED_BRIDGE_EXPORTS_FILES`
2. Wrap the code examples in `<!-- axm-docs:explanatory:start/end -->` markers
3. Change rule to recognize fenced code blocks as non-enforced

**Recommended**: Option 2 (explanatory markers)—this is what they're for.

## Phase 2: Verify (Can Proceed After Phase 1)

### 2.1 Run Full Check Suite

**Effort**: XS  
**Depends on**: 1.2, 1.3

```bash
node scripts/check-rfc010.ts
node scripts/check-starlight-adapter-contract.ts
node scripts/check-starlight-chrome-cssom-sentinel.ts
pnpm test:playwright tests/continuity.spec.ts
pnpm test:playwright tests/verify-colors.spec.ts
```

**Acceptance**: All pass with 0 violations

### 2.2 Update verify-colors Test (if needed)

**Effort**: S  
**Depends on**: 2.1 results

The test asserts specific `--sl-color-*` → `--axm-*` mappings. If the adapter's intermediate gray synthesis changed the mappings, the test may need updating.

**Check**: Does gray-4 (`--sl-color-gray-4`) still equal `--axm-border-int-token`?

## Phase 3: Document (After Verification)

### 3.1 Update RFC-029 to Match Reality

**Effort**: S  
**Depends on**: 2.1

Current RFC-029 claims goal of "3-5 `!important`". Reality is ~51. Update to:

- Document actual count and ceiling (55)
- Explain the lock pattern rationale
- Clarify that color function usage in adapter is intentional

### 3.2 Cross-Link Working Example

**Effort**: XS  
**Depends on**: Nothing (can parallel)

Add link to `examples/vercel-demo` from:

- `site/src/content/docs/guides/integration.mdx`
- `site/src/content/docs/advanced/framework-integration.mdx`

## Parallel Track: CI Integration

### P.1 Verify RFC010 Gate Runs in CI

**Effort**: S  
**Depends on**: Nothing

Check if `scripts/check-rfc010.ts` is called in:

- `scripts/check` (the main check script)
- GitHub Actions workflow
- Vercel build script

**If not**: Add it to prevent regression.

## Critical Path

```
Decision (1.1) → Gate Update (1.2) → Verify (2.1) → Update RFC-029 (3.1)
                     ↓
               Docs Fix (1.3) ────────┘
```

**Minimum time to green**: 1 decision + 2 code changes + 1 test run

## Risk Points

| Step | Risk                            | Mitigation                      |
| ---- | ------------------------------- | ------------------------------- |
| 1.1  | Indecision delays everything    | Time-box to 1 session           |
| 1.2  | Gate change breaks other checks | Run full suite after            |
| 2.2  | Test changes weaken coverage    | Review what's actually asserted |
| 3.1  | RFC update creates confusion    | Clear "what changed" section    |
