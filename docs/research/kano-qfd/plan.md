# Kano-QFD Action Plan: Path to Exemplary Docs Site

**Date**: 2026-01-12  
**Author**: Planning Analysis  
**Status**: Ready for Execution

---

## 1. Executive Summary

The docs site currently fails its own consumer contract gate (31 violations). The root cause is a conflict between RFC-029's endorsed adapter synthesis approach (`oklch()`, `color-mix()`) and RFC010's universal ban on color functions. This is a **blocking issue** for the "best-face docs" goal. The recommended path is to explicitly exempt the adapter bridge file from color function checks, document this as intentional, then verify all checks pass. Total effort: S-M, achievable in one focused session.

---

## 2. Current State Assessment

### What's Working ✅

- **Core library**: CLI emits valid artifacts, ThemeManager integration is solid
- **P0 silent failures**: All resolved per inventory
- **Starlight adapter structure**: Bridge file pattern is correct, lock pattern is functional
- **Contract sentinels**: `check-starlight-adapter-contract.ts` passes (no forbidden transitions/borders)

### What's Broken ❌

- **RFC010 gate**: 31 violations
  - 25 `oklch()` / 6 `color-mix()` in `site/src/styles/starlight-custom.css`
  - 6 `--axm-bridge-*` references in `site/src/content/docs/advanced/framework-integration.mdx`
- **Docs-as-exemplar goal**: Docs site doesn't pass its own contract checks

### What's At Risk ⚠️

- **RFC-029 credibility**: States goal of "3-5 `!important`" but actual count is 51
- **verify-colors test**: May assert mappings that changed during recent adapter work
- **CI gap**: Unclear if RFC010 gate runs in CI (not found in `scripts/check`)

---

## 3. Key Decision Required

**Question**: Should the adapter bridge file (`site/src/styles/starlight-custom.css`) be allowed to use color synthesis functions (`oklch()`, `color-mix()`) that are forbidden for consumers?

**Context**:

- RFC-021 acknowledges adapters as special ("Axiom 2: Adapters are explicit and few")
- RFC-029 explicitly endorses synthesis for intermediate gray mapping
- Without synthesis, docs site would lose visual fidelity (flat grays, no accent colors)

**Recommendation**: **Yes, allow synthesis in the adapter bridge file.**

**Rationale**:

1. Adapters translate between systems—synthesis is inherent to translation
2. The alternative (pure mapping) produces a visually degraded experience
3. The exemption is explicit, scoped to one file, and documented
4. Consumers still cannot use these patterns—the contract is enforced for them

---

## 4. Recommended Path

### Option C: Documented Adapter Exception

1. Add `ALLOWED_COLOR_FUNCTIONS_FILES` exemption to RFC010 gate
2. Include `site/src/styles/starlight-custom.css` in that set
3. Wrap docs code examples in explanatory markers
4. Update RFC-029 to document actual state and rationale
5. Verify all checks pass

This is the **fastest path to green** that maintains visual quality and documents the exception clearly.

---

## 5. Sequenced Action Items

### Phase 1: Unblock (Immediate)

| #   | Task                                         | Size | Depends On | Acceptance Criteria                                                                                                                                   |
| --- | -------------------------------------------- | ---- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Decide**: Allow color functions in adapter | XS   | —          | Decision recorded in this plan                                                                                                                        |
| 2   | **Add exemption to RFC010 gate**             | S    | #1         | `ALLOWED_COLOR_FUNCTIONS_FILES` set created; `site/src/styles/starlight-custom.css` included; `no-hardcoded-color-functions` skipped for files in set |
| 3   | **Fix docs examples**                        | XS   | —          | Add explanatory markers around bridge var examples in `framework-integration.mdx`                                                                     |
| 4   | **Run RFC010 gate**                          | XS   | #2, #3     | `node scripts/check-rfc010.ts` outputs 0 violations                                                                                                   |

### Phase 2: Verify (After Phase 1)

| #   | Task                              | Size | Depends On | Acceptance Criteria                                                                       |
| --- | --------------------------------- | ---- | ---------- | ----------------------------------------------------------------------------------------- |
| 5   | **Run adapter contract sentinel** | XS   | #4         | `node scripts/check-starlight-adapter-contract.ts` passes                                 |
| 6   | **Run CSSOM sentinel**            | XS   | #4         | `node scripts/check-starlight-chrome-cssom-sentinel.ts` passes                            |
| 7   | **Run continuity test**           | S    | #4         | `pnpm test:playwright tests/continuity.spec.ts` passes                                    |
| 8   | **Run verify-colors test**        | S    | #4         | `pnpm test:playwright tests/verify-colors.spec.ts` passes (or update if mappings changed) |

### Phase 3: Document (After Phase 2)

| #   | Task                           | Size | Depends On | Acceptance Criteria                                                                                         |
| --- | ------------------------------ | ---- | ---------- | ----------------------------------------------------------------------------------------------------------- |
| 9   | **Update RFC-029**             | S    | #8         | Document: actual `!important` count (51), ceiling (55), lock pattern rationale, adapter synthesis exception |
| 10  | **Cross-link working example** | XS   | —          | `examples/vercel-demo` linked from integration guide                                                        |
| 11  | **Add RFC010 to CI**           | S    | #4         | `scripts/check` or CI workflow includes RFC010 gate                                                         |

---

## 6. Risk Mitigation

| Risk                                            | Likelihood | Impact | Mitigation                                                                      |
| ----------------------------------------------- | ---------- | ------ | ------------------------------------------------------------------------------- |
| Gate exemption logic breaks other checks        | Low        | Medium | Run full test suite after change                                                |
| verify-colors test fails due to mapping changes | Medium     | Low    | Test is checking mapping correctness; update if semantics changed intentionally |
| CI doesn't run RFC010, allowing regression      | Medium     | High   | Add to `scripts/check` as part of this work                                     |
| Adapter exception sets bad precedent            | Low        | Low    | Document clearly in RFC-029; limit to explicit bridge files                     |

---

## 7. Success Metrics

### Immediate (This Session)

- [ ] `node scripts/check-rfc010.ts` returns 0 violations
- [ ] All Playwright tests pass
- [ ] All sentinels pass

### Short-Term (This Phase)

- [ ] RFC-029 accurately describes implementation
- [ ] Working example is linked from docs
- [ ] CI includes RFC010 gate

### Long-Term (Alpha Release)

- [ ] No consumer-layer violations in wild usage
- [ ] Adapter pattern documented and replicable
- [ ] Docs site is demonstrably "best-face" exemplar

---

## 8. Appendix: Files to Modify

| File                                                       | Changes                                                                              |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `scripts/check-rfc010.ts`                                  | Add `ALLOWED_COLOR_FUNCTIONS_FILES` set; update pattern loop to skip for those files |
| `site/src/content/docs/advanced/framework-integration.mdx` | Wrap bridge var examples in `<!-- axm-docs:explanatory:start/end -->`                |
| `docs/rfcs/RFC-029-STARLIGHT-CSS-STRATEGY.md`              | Update "goals" section to match reality; add "Adapter Synthesis" rationale           |
| `site/src/content/docs/guides/integration.mdx`             | Add link to `examples/vercel-demo`                                                   |
| `scripts/check` (if exists)                                | Add RFC010 gate call                                                                 |

---

## 9. Decision Record

**Decision**: Allow color functions in adapter bridge file

**Date**: 2026-01-12

**Rationale**: See Section 3 above.

**Owner**: (To be filled by project lead)
