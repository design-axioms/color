# Walkthrough: Claim Ledger Triage — Epoch 2 (Theme Studio alignment)

This walkthrough summarizes the work shipped in PR #18 and captures the key invariants so a future session can pick up without oral history.

## What shipped

- **Single theme plane**: Studio + Starlight now share a single theme authority (ThemeManager semantic plane). Starlight's `data-theme` remains a vendor signal and is kept in sync.
- **Studio mode UX**: Studio has an explicit System/Light/Dark selector, and components that need a concrete polarity use the resolved mode.
- **Strict config IO**: Studio can export `color-config.json` with `$schema` and import config with schema validation (AJV) and human-readable UI errors.
- **Hook ergonomics**: Pre-push build is hermetic so validation doesn't leave generated artifacts dirty.
- **Coverage**: Playwright coverage for theme-mode switching + config import/export.

## Key files

- Theme bridge: `site/src/lib/theme-bridge.ts`
- Starlight integration: `site/src/lib/starlight-axiomatic.ts`
- Studio theme state: `site/src/lib/state/ThemeState.svelte.ts`
- Studio config state: `site/src/lib/state/ConfigState.svelte.ts`
- Studio export/import UI: `site/src/components/builder/stage/ExportView.svelte`
- Tests: `tests/studio.spec.ts`
- Hermetic build wrapper: `scripts/hooks/hermetic-build.sh`
- Hook wiring: `lefthook.yml`

## Verification

- `pnpm -w test`
- `pnpm -w check:site`
- `pnpm -w test:playwright tests/studio.spec.ts`

## Invariants

- `css/theme.css` is a public export artifact; never delete it.
- Theme intent must have a single semantic writer; avoid multi-writer DOM mutations.
- Studio config import must validate (no silent acceptance).

## Handoff

For continuing on a new machine, see `docs/agent-context/handoff.md`.
