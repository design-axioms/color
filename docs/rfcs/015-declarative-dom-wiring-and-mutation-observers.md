# RFC015: Declarative DOM Wiring + Efficient Mutation Observers

## Summary

Integrations frequently need to apply **class tokens** and occasionally add **structural wrappers** to vendor-owned markup (e.g. documentation frameworks, CMS output, UI kits).

Historically, we solved this with bespoke imperative scripts per integration (lots of glue code and timing hacks). This RFC introduces a small, reusable, **declarative DOM wiring** engine plus an **efficient MutationObserver helper** that keeps the wiring up-to-date without rescanning the entire document.

## Motivation

We want integrations that are:

- **Declarative**: “what should be wired” is data, not imperative code.
- **Idempotent**: repeated application is safe.
- **Efficient under mutation**: only re-wire added subtrees.
- **Adapter-pure**: no JS references to palette/engine internals (no `--sl-*`, `--axm-*`, `--_axm-*`, `--tau`).
- **Reusable**: other systems can use the same wiring engine with different rule tables.

## Non-goals

- Solving theme motion/transactions (handled by `ThemeManager` + `data-axm-motion="tau"`).
- Replacing CSS adapter mapping (bridge exports remain the contract).
- Creating a general-purpose DOM diff/virtualization framework.

## Terminology

- **Wiring**: Adding class tokens / wrappers to vendor markup so the Axiomatic system can apply surfaces and text roles.
- **Rule table**: A declarative list of selectors and actions.
- **Single-writer**: One place commits theme state.

## Proposed API

Implemented in:

- [src/lib/integrations/dom-wiring.ts](src/lib/integrations/dom-wiring.ts)

Exported from:

- [src/lib/index.ts](src/lib/index.ts)

### `DomWiringRule`

A rule targets elements via a selector and applies idempotent actions:

- `addClasses`: add class tokens.
- `ensureClassPrefix`: ensure a `prefix` class exists (e.g. `text-`), otherwise add a `fallbackClass`.
- `ensureDirectChildWrapper`: ensure a direct child wrapper exists and (optionally) move host children into it.
- `descendants`: apply nested rules within each match.

### `applyDomWiring(root, rules)`

- Applies rules within the given root.
- Safe to call repeatedly.
- Does not observe or schedule; purely synchronous.

### `observeDomWiring({ observeRoot, rules, ... })`

- Uses a MutationObserver on `observeRoot`.
- Batches mutation work via RAF (or microtask fallback).
- Applies wiring only to **added subtrees** (`childList` mutations).
- Returns `{ dispose() }`.

## Invariants (hard requirements)

1. **Adapter purity**
   - Wiring code MUST NOT reference CSS variables (`--sl-*`, `--axm-*`, `--_axm-*`, `--tau`).
   - Wiring code MUST NOT compute colors.

2. **Idempotence**
   - Running wiring multiple times MUST NOT duplicate wrappers.
   - Class application MUST be additive and stable.

3. **Efficiency**
   - Mutation handling MUST avoid document-wide rescans.
   - Work MUST be batched (at most once per frame under load).

4. **Single-writer separation**
   - Theme commits remain separate from wiring.

## Example: Starlight integration

The Starlight docs integration defines a rule table describing Starlight’s chrome:

- `.page.sl-flex` → add `surface-page`.
- `header.header, .page > .header` → add `surface-page` + ensure `text-body`.
- `#starlight__sidebar` → add host marker + ensure a direct child wrapper that paints `surface-workspace`.

The adapter then:

- calls `applyDomWiring(document, rules)` once at DOM ready
- starts `observeDomWiring({ observeRoot: document.body, rules })` to keep up with route-level mutations

## Testing strategy

Unit tests MUST cover:

- `addClasses` is applied and is idempotent.
- `ensureClassPrefix` adds fallback only when needed.
- `ensureDirectChildWrapper`:
  - creates wrapper once,
  - moves children exactly once,
  - remains idempotent.
- `observeDomWiring`:
  - batches work,
  - applies wiring to added subtree roots.

## Rollout

- Adopt in the docs site (Starlight) first.
- Keep API small and stable.
- Prefer expanding the rule schema over adding one-off integration code.
