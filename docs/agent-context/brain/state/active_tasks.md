# Current Work (2025-12-16): Ship `fix/website-polish` PR

## Goal

- Get the branch green under the repo’s pre-push gate, push it, and open a PR to `main`.

## Current Status

- `pnpm -w exec tsc --noEmit` is green (after strict/NodeNext fixes).
- PR is not opened yet; the next step is to re-run the full gate (build/publint/site checks) and then push.

## Known Footguns / Invariants

- `css/theme.css` is part of the public export surface (`package.json` exports `./theme.css`). Tests and cleanups must never delete it.
- Git commit signing may fail intermittently (missing signing agent socket). If a commit is required, use unsigned fallback.

## Immediate Next Steps

- Re-run the same checks the hook runs (or run the hook) and fix any remaining failures:
  - `pnpm build`
  - `pnpm check:exports`
  - `pnpm check:site`
  - `pnpm test`
- Push `fix/website-polish` and open a PR.

## Handoff Note: Prompt Source

- The requested `cast-auto.prompt.md` lives outside the repo workspace, so the agent cannot read it with current tool sandboxing.
- If we need to strictly follow it in-repo, copy it into the workspace (suggested location: `docs/agent-context/brain/prompts/cast-auto.prompt.md`).

---

# Epoch 44, Phase 2.1: RFC 011 Follow-up (Refactor Completion)

Phase 2 is complete; see `docs/agent-context/changelog.md` for the archival record.

## Objectives

1. Finish the remaining RFC 011 refactor edges (typing + registry boundary).
2. Close the loop on remaining real transition snaps.
3. Keep the inspector overlay behavior regression-proof.

## Tasks

### RFC 011: Typed Registry Boundary

- [ ] Remove remaining `any`/weak typing at the heterogenous `CheckModule` registry boundary.
- [ ] Ensure replay vs live runs share the same output formatting and report payload shapes.

### Transition Smoothness: Remaining Snaps

- [ ] Re-run `pnpm check:violations -- --snaps --snaps-focus` on key docs pages.
- [ ] Fix remaining real tau-stable snaps (or codify detector refinement + regression test if they are artifacts).

### Inspector Overlay UX Hardening

- [ ] Add a Playwright check ensuring continuity flashing stops immediately when the overlay is disabled mid-run.
- [ ] Manual QA checkpoint: open overlay, run continuity, disable mid-audit, verify no further theme flips.

### Starlight Chrome Continuity: CSSOM Sentinel Migration

- [ ] Add a CSSOM-based chrome rule sentinel (Playwright) that scans rules for non-bridge-routed borders and competing transitions.
- [ ] Prove the sentinel catches a seeded violation (then remove the seed).
- [ ] After verification, migrate existing border “witness” tests to a selector-fed witness set (no broad DOM scanning).
