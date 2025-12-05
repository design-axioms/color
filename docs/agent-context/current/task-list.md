# Task List - Epoch 31: Phase 1 (Golden Master Tests)

## Phase 1.1: Infrastructure Setup

- [x] **Snapshot Directory**: Create `tests/golden-masters/` to store the canonical outputs.
- [x] **Test Runner**: Configure `vitest` to run snapshot tests.
- [x] **CI Integration**: Ensure snapshot tests run in CI.

## Phase 1.2: Snapshot Generation

- [x] **CSS Output**: Snapshot the generated `theme.css` for various configurations (Default, High Contrast, P3).
- [x] **JSON Output**: Snapshot the generated `tokens.json` and DTCG export.
- [x] **TypeScript Output**: Snapshot the generated `theme.d.ts`.

## Phase 1.3: Determinism Verification

- [x] **Seed Control**: Ensure any random number generation (if used) is seeded or mocked. (Verified: No `Math.random` or `Date` usage in core logic).
- [x] **Environment Isolation**: Ensure tests are not affected by local environment variables or file system state. (Verified: Tests use fixed config and do not read env vars).
