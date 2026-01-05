# Implementation Plan - Epoch 44: Architecture Clarity

## Goal

Establish clear boundaries between the pure color system, integration layer, and developer tools. Fix structural issues that cause downstream bugs and confusion.

**Rationale**: Analysis revealed that Phase 2.1 tasks (snaps, inspector hardening) are fighting structural issues. Architecture work first saves 4-10 days and eliminates rework.

## Current Status: Phase 4 - Silent Failures → Explicit Errors

### Context

This phase addresses the inventory of silent failures identified during the architecture clarity review. The inventory document (`docs/agent-context/current/silent-failures-inventory.md`) catalogs **37 silent failures** across the codebase:

- **8 P0 (Critical)**: Core math, config validation, missing DOM elements
- **18 P1 (High)**: Solver errors, inspector edge cases, CSS fallbacks
- **11 P2 (Medium)**: Dev-mode warnings, defensive patterns

### Completed Work (This Session)

1. **RFC Consolidation**: Merged 19 scattered RFCs into 9 coherent logical RFCs in `docs/rfcs/`:
   - RFC-CONSUMER-CONTRACT (from RFC010, RFC012)
   - RFC-INTEGRATION (from RFC013, RFC014, RFC015)
   - RFC-AUDITING (from RFC011, RFC012 elements)
   - RFC-INSPECTOR (from RFC017, RFC018)
   - RFC-CHARTS (from RFC001)
   - RFC-TOKENS (from three-tier-tokens)
   - RFC-TUFTE-LAYOUT (from RFC007, RFC008)
   - RFC-TOOLING (from RFC006, RFC019)
   - RFC-CONFIGURATION (new - documents config schema)

2. **P0 Documentation Gaps Addressed**:
   - Created RFC-CONFIGURATION documenting config schema, validation, vibes
   - Documented ThemeManager/AxiomaticTheme relationship in RFC-INTEGRATION
   - Added implementation checklist for bridge exports
   - Added alpha readiness criteria to RFC-CONSUMER-CONTRACT

3. **P1 Improvements**:
   - Added cross-references across RFCs
   - Standardized terminology ("internal engine variable" vs "private token")
   - Added implementation status sections to RFC-TOKENS and RFC-CHARTS
   - Added feature maturity classification to RFC-INSPECTOR

4. **Silent Failures Inventory**: Created comprehensive inventory with priority classification

### Next Steps

1. **Implement P0 Silent Failure Fixes**:
   - Add validation at config resolution entry points
   - Guard math functions against NaN propagation
   - Add missing DOM element detection with actionable messages
   - Replace `@ts-expect-error` patterns with proper error handling

2. **Implement P1 Silent Failure Fixes**:
   - Add solver error suggestions
   - Add inspector edge case handling
   - Add CSS fallback warnings in dev mode

3. **Update Tests**: Add regression tests for fixed silent failures

## RFC Reference

The consolidated RFCs in `docs/rfcs/` serve as the architectural authority:

| RFC                   | Purpose                              | Status               |
| --------------------- | ------------------------------------ | -------------------- |
| RFC-CONSUMER-CONTRACT | Public API surface, SemVer rules     | Alpha-Ready          |
| RFC-INTEGRATION       | Framework adapters, theme management | Alpha-Ready          |
| RFC-AUDITING          | Continuity/provenance checking       | Alpha-Ready          |
| RFC-INSPECTOR         | Browser overlay, diagnostics         | Alpha-Ready (core)   |
| RFC-CHARTS            | Reactive visualization               | Alpha-Ready          |
| RFC-TOKENS            | Token pipeline, DTCG                 | Deferred to Epoch 47 |
| RFC-TUFTE-LAYOUT      | Layout system                        | Deferred             |
| RFC-TOOLING           | ESLint, editor support               | Alpha-Ready          |
| RFC-CONFIGURATION     | Config schema, validation            | Alpha-Ready          |

## Phase Summary

### Phase 1: ThemeManager Unification (Planned)

- Resolve ThemeManager/AxiomaticTheme confusion
- Fix race condition in `initInvertedSurfaces`
- Establish single semantic writer for theme state
- See RFC-INTEGRATION for documentation of current state

### Phase 2: Starlight Extraction (Planned)

- Extract `starlight-chrome-contract.ts` from core inspector
- Create adapter pattern for framework-specific checks
- See RFC-INTEGRATION "Framework Adapters" section

### Phase 3: Layer Separation (Planned)

- Restructure exports: Pure System / Integration / Dev Tools
- See RFC-CONSUMER-CONTRACT for export audit requirements

### Phase 4: Silent Failures → Explicit Errors (Active)

- **Inventory**: `docs/agent-context/current/silent-failures-inventory.md`
- **Categories**: Config, Solver, Runtime, CSS, Inspector
- **Goal**: Replace silent failures with helpful error messages

## Related Documents

- [Project Plan](docs/agent-context/brain/state/plan.md) - Epoch overview
- [Silent Failures Inventory](docs/agent-context/current/silent-failures-inventory.md) - P0/P1/P2 failures
- [RFCs](docs/rfcs/) - Architectural authority
