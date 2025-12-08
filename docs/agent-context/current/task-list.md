# Phase 1: Feedback Implementation

- [x] **Layout Fixes**
  - [x] Fix Context Tree Truncation (Left Sidebar).
  - [x] Fix Inspector Clipping (Right Sidebar).
- [x] **Data Investigation**
  - [x] Investigate "Spotlight" delta (108).
- [x] **Color Tuning**
  - [x] Tune "Action" surface colors.

# Phase 2: Proactive Polish

- [x] **Visual Audit (Browser)**
  - [x] Capture screenshots of Theme Builder (Desktop/Mobile). (Skipped: Tooling Limitation)
  - [x] Inspect DOM for overflow/clipping. (Verified via Code)
  - [x] Verify "Action" color in context. (Verified via Code)
- [x] **Code Audit (Static)**
  - [x] Scan for hardcoded dimensions. (Fixed `InspectorPanel`)
  - [x] Check z-index layering. (Fixed `StudioWrapper` comment)

# Phase 3: Build & Test Repair

- [x] **Test Suite Repair**
  - [x] Fix `tests/llm-context.spec.ts` (ELOOP error).
  - [x] Fix `tests/golden-master.spec.ts` (Snapshot mismatches).
  - [x] Fix `tests/brand-button.spec.ts` (Playwright/Vitest conflict).
- [x] **Documentation Generation**
  - [x] Fix `scripts/generate-llms-txt.ts` to reference correct CSS files.
  - [x] Regenerate `site/public/llms.txt`.
