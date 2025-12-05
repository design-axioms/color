# Phase Walkthrough: Golden Master Tests

## Overview

In this phase, we established a **Golden Master** testing strategy to ensure the Axiomatic Color System remains deterministic and stable across releases. By snapshotting the exact output of the system (CSS, JSON, TypeScript) for a known configuration, we can guarantee that future changes do not inadvertently alter the generated artifacts.

## Key Decisions

### 1. Vitest Snapshots

We leveraged Vitest's built-in `toMatchFileSnapshot` assertion. This allows us to store the "Golden Masters" as actual files on disk (`tests/golden-masters/`), making them easy to inspect and review in pull requests.

### 2. Comprehensive Coverage

We chose to snapshot all major output formats:

- **CSS**: `theme.css` (The runtime engine)
- **DTCG**: `tokens.json` (Interoperability)
- **Tailwind**: `tailwind.preset.js` (Ecosystem)
- **TypeScript**: `theme.ts` (Type safety)

### 3. Determinism Verification

We audited the codebase for sources of non-determinism (like `Math.random` or `Date.now`) and confirmed that the core logic is a pure function of the configuration. This ensures that the tests will pass reliably in any environment (CI, local, etc.).

## Implementation Details

### Test Suite (`tests/golden-master.spec.ts`)

- Loads the project's own `color-config.json`.
- Runs the `solve` engine to generate the in-memory theme.
- Passes the theme to each exporter (`generateTheme`, `toDTCG`, `toTailwind`, `toTypeScript`).
- Asserts that the output matches the stored snapshot.

### CI Integration

The existing CI pipeline runs `pnpm test`, which automatically includes the new `golden-master.spec.ts`. No changes to the workflow file were needed.

## Verification

- **Run**: `pnpm test tests/golden-master.spec.ts`
- **Result**: 4 tests passed, 4 snapshots written/matched.
