# Current Work: Epoch 46 — Alpha Release & Stabilization

**Updated:** 2026-01-13

## Previous Epoch: Epoch 45 — Alpha Polish ✅ COMPLETE

**PRs:**

- #33: Documentation quick wins (integration guide, framework-integration.mdx)
- #35: Phase B working example, known limitations docs, troubleshooting guide
- #36: Inspector sentinel probe refactor for conditional rule evaluation

**Outcome:**

- All alpha release criteria met
- Documentation polish complete (Why Axiomatic, restructured sidebar, troubleshooting)
- Known limitations documented
- Inspector container query evaluation refactored to 100% accurate sentinel probe technique

---

## Current Epoch: Epoch 46 — Alpha Release & Stabilization

**Goal:** Ship the alpha release (1.0.0-alpha.1) with a clean API, proper dependency injection, and verified stability.

**Key Decisions:**

1. **Remove lightClass/darkClass immediately** — No current users, breaking change is fine
2. **ThemeManager DI refactor NOW** — Do before release, not defer to v2.0.0

---

### Phase 1: Breaking Changes & Cleanup

- [x] **Remove \`lightClass\`/\`darkClass\` from ThemeManager** ✅
  - ~~Delete options from \`ThemeManagerOptions\` in \`src/lib/browser.ts\`~~
  - ~~Remove private fields, constructor assignments, deprecation warnings~~
  - ~~Remove backwards-compat class manipulation in \`apply()\`~~
  - ~~Delete \`warnDeprecationOnce\` helper if no longer needed~~
  - ~~Update \`site/src/content/docs/reference/javascript-api.md\`~~
  - ~~Update \`docs/rfcs/RFC-021-INTEGRATION.md\`~~
  - [ ] Regenerate llms.txt via \`pnpm generate-llms\`

- [x] **Refactor ThemeManager to use Dependency Injection** ✅
  - ~~Remove singleton pattern from \`AxiomaticTheme\`~~ (kept `get()` for BC, made constructor public)
  - ~~Make \`AxiomaticTheme\` instantiable normally (public constructor)~~
  - ~~Add \`theme?: AxiomaticTheme\` option to \`ThemeManagerOptions\`~~
  - ~~Update \`ThemeManager\` to accept injected instance or create one internally~~
  - ~~Update \`AxiomaticTheme.get()\` usages in \`src/lib/browser.ts\` to use \`this.theme\`~~
  - ~~Update \`src/lib/inspector/tuner.ts\` to accept optional theme via options~~
  - ~~Update \`examples/vercel-demo/src/App.tsx\` to showcase DI pattern via React Context~~
  - ~~Update javascript-api.md and RFC-021 with `theme` option~~

- [x] **Run knip to identify unused exports** ✅
  - ~~Execute \`pnpm exec knip\`~~
  - No unused exports found!

- [x] **Audit PRESETS system** ✅
  - Knip didn't flag PRESETS as unused, so it's being used somewhere
  - No action needed

**Success Criteria:**

- ✅ No \`lightClass\`/\`darkClass\` in codebase
- ✅ \`AxiomaticTheme\` is injectable (no global singleton required)
- ✅ All 131 tests pass
- ✅ knip reports no unused exports

**Phase 1 Status: COMPLETE** 🎉

---

### Phase 2: Pre-Release Verification

- [ ] Full test suite (\`pnpm test\`, \`pnpm playwright test\`)
- [ ] Build verification (\`pnpm build\`, \`pnpm typecheck\`, \`pnpm lint\`)
- [ ] Documentation audit (search for stale API references)
- [ ] RFC updates if needed

---

### Phase 3: Release Engineering

- [ ] Version bump to \`1.0.0-alpha.1\`
- [ ] Generate CHANGELOG via \`pnpm exec release-plan prepare\`
- [ ] \`npm publish --dry-run\`
- [ ] \`npm publish --tag alpha\`
- [ ] Git tag \`v1.0.0-alpha.1\`

---

### Phase 4: Community Launch

- [ ] GitHub Release with release notes
- [ ] Issue template for alpha feedback
- [ ] Announcement
- [ ] Monitor 48 hours

---

## DI Architecture Decision ✅ RESOLVED

**Decision:** Option A — Pass theme to constructors. Inspector is already instantiated per-overlay, so threading through is natural.

---

## PRESETS Decision ✅ RESOLVED

**Decision:** Remove `PRESETS` array if knip confirms it's unused. (Note: This is separate from the `presets` config property for typography utilities, which is actively used.)

---

## Vercel Demo Decision ✅ RESOLVED

**Decision:** Refactor Vercel Demo to use DI pattern. The demo should serve as a showcase for the recommended design patterns.

---

## Files to Touch (Phase 1)

### lightClass/darkClass removal:

- \`src/lib/browser.ts\` — Options type, private fields, constructor, apply(), warnDeprecationOnce
- \`site/src/content/docs/reference/javascript-api.md\` — Remove from API docs
- Tests: \`src/lib/**tests**/browser.test.ts\` — Remove tests for deprecated behavior

### DI refactor:

- `src/lib/theme.ts` — Remove singleton, make constructor public
- `src/lib/browser.ts` — Accept optional theme, create if not provided
- `src/lib/inspector/overlay.ts` — Receive theme via constructor/options
- `src/lib/inspector/tuner.ts` — Receive theme via constructor/options
- `examples/vercel-demo/src/theme.tsx` — Refactor to DI pattern (showcase)
- Tests: `src/lib/__tests__/theme.test.ts`, `src/lib/__tests__/browser.test.ts`

### RFC updates:

- `docs/rfcs/RFC-020-CONSUMER-CONTRACT.md` — Remove/update AxiomaticTheme singleton section
- `docs/rfcs/RFC-021-INTEGRATION.md` — Remove lightClass/darkClass, update Layer 1 architecture

### Documentation updates:

- `site/src/content/docs/reference/javascript-api.md` — Remove deprecated options
- `site/src/content/docs/guides/react.mdx` — Update AxiomaticTheme.get() example

---

## Post-Alpha Roadmap

### Epoch 47: Interoperability & Ecosystem

- Round-trip DTCG import
- Native Tailwind preset with Late Binding
- Extract Starlight adapter to separate package

### Epoch 48: Beta Release

- Luminance Spectrum UI (Delighter)
- Auto-Fix in Inspector (Delighter)
- Expanded ESLint plugin rules
