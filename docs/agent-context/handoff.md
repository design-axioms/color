# Handoff (New Machine)

This document is the “get productive fast” checklist for continuing work on this repo from a fresh machine.

## Prereqs

- Node.js: **24.x**
- Package manager: **pnpm** (use the repo’s normal workflow; do not use npm/yarn)
- Optional but expected for local site: `locald`

## Setup

1. Clone:
   - `git clone https://github.com/design-axioms/color.git`
   - `cd color`

2. Install deps:
   - `pnpm -w install`

3. Bring up the dev site (this repo assumes it’s managed by locald):
   - `locald up`
   - Open: `https://color-system.localhost/`

## Common verification commands

These mirror what we used to validate the Epoch 2 merge.

- Unit tests: `pnpm -w test`
- Site typechecking: `pnpm -w check:site`
- Studio e2e coverage: `pnpm -w test:playwright tests/studio.spec.ts`
- Full build: `pnpm -w build`

## Git hooks / ergonomics

- Pre-push runs a hermetic build wrapper (`scripts/hooks/hermetic-build.sh`) so `pnpm build` validation does not leave `css/theme.css` or `color-config.schema.json` dirty.
- Pre-push includes a github.com-scoped auth check: `gh auth status -h github.com`.

## What just shipped

- PR #18 (Epoch 2: Theme Studio alignment): https://github.com/design-axioms/color/pull/18
- Walkthrough: `docs/agent-context/current/walkthrough.md`
- Next work queue: `docs/agent-context/brain/state/active_tasks.md`
