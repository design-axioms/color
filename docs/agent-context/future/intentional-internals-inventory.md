# Intentional Internals Inventory (Draft)

This is an inventory of every `axm-docs:explanatory` span currently present in the public docs.

Purpose: decide whether each internal detail is (a) an intentional deep dive that supports the user programming model, or (b) a symptom of a missing public abstraction / doc gap.

## Taxonomy

- **Conceptual contrast**: uses internals mainly to compare against “traditional” approaches.
- **Mechanics deep dive**: explains how the engine works (implementation mechanics).
- **Diagnostic / interoperability**: helps debugging, tooling integration, or external consumption.
- **Reference leak**: teaches internal tokens/vars in a way that could become a dependency.

## Review questions (per span)

1. Which persona is this for (Beginner / Builder / Debugger / Maintainer)?
2. Does this create a _dependency_ (will readers copy/paste into production)?
3. Can we teach the same concept using the public contract (ThemeManager + class tokens + config) instead?
4. If it’s truly valuable, should it live in an explicit “Internals / Appendix” section?

## Inventory

### Philosophy page

- [Reactive pipeline internals mention](site/src/content/docs/philosophy.md)
  - **Category**: Mechanics deep dive (high-level)
  - **Notes**: Mentions CSS vars + Relative Color Syntax (`oklch(from ...)`).
  - **Status**: Kept, with explicit “explanatory only” framing.

- [Input variables example (`--hue-brand`)](site/src/content/docs/philosophy.md)
  - **Category**: Reference leak risk (copy/paste)
  - **Notes**: Shows a concrete internal variable.
  - **Status**: Kept (still inside an explanatory span); consider replacing with a config-first example if we want Philosophy to be strictly contract-level.

- [Simplified engine logic (`--computed-surface` + `oklch(from ...)`)](site/src/content/docs/philosophy.md)
  - **Category**: Mechanics deep dive
  - **Notes**: Directly reveals internal computed tokens.
  - **Status**: Kept (explanatory span) with “do not integrate via internals” framing.

### Advanced: Reactive Pipeline

- [Static model example (hex + `.dark` swap)](site/src/content/docs/advanced/reactive-pipeline.mdx)
  - **Category**: Conceptual contrast
  - **Notes**: Mostly pedagogical; uses hex values.
  - **Status**: Kept (explanatory span) with page-level “explanatory” framing.

- [Reactive model example (context vars + `oklch(...)`)](site/src/content/docs/advanced/reactive-pipeline.mdx)
  - **Category**: Mechanics deep dive
  - **Notes**: Shows internal context variables / anchor variables.
  - **Status**: Kept (explanatory span) with page-level “explanatory” framing.

- [Inputs / primitives example (`--primitive-*` in `oklch`)](site/src/content/docs/advanced/reactive-pipeline.mdx)
  - **Category**: Mechanics deep dive
  - **Notes**: Strongly internal.
  - **Status**: Kept (explanatory span) with page-level “explanatory” framing.

- [Context/state example (`.surface-sunken`)](site/src/content/docs/advanced/reactive-pipeline.mdx)
  - **Category**: Mechanics deep dive
  - **Notes**: Shows internal context variables.
  - **Status**: Now wrapped in an explanatory span.

- [Resolution example (`.text-subtle` + context math)](site/src/content/docs/advanced/reactive-pipeline.mdx)
  - **Category**: Mechanics deep dive
  - **Notes**: Teaches internal resolution pipeline variables.
  - **Status**: Kept (explanatory span) with page-level “explanatory” framing.

### Advanced: Hue Shifting

- [OKLCH-based palette example](site/src/content/docs/advanced/hue-shifting.mdx)
  - **Category**: Mechanics deep dive (color math)
  - **Notes**: Uses explicit `oklch(...)` syntax to explain the failure mode.
  - **Status**: Kept with explicit “explanatory” framing.

### Catalog pages

- [Surfaces token reference table (`--axm-*-token` + `var(...)` usage)](site/src/content/docs/catalog/surfaces.mdx)
  - **Category**: Reference leak
  - **Notes**: Encourages direct consumption of internal tokens.
  - **Status**: Quarantined under “Internals (token reference)” with “prefer class tokens” framing.

- [Actions token reference table (focus ring + surface tokens)](site/src/content/docs/catalog/actions.mdx)
  - **Category**: Reference leak / diagnostic
  - **Notes**: Same concern as surfaces; also touches focus ring behavior.
  - **Status**: Quarantined under “Internals (token reference)” with “prefer class tokens” framing.

- [Data viz usage example (`--axm-chart-N`)](site/src/content/docs/catalog/data-viz.mdx)
  - **Category**: Diagnostic / interoperability (plausibly public)
  - **Notes**: Chart palette variables may be a legitimate public output surface for libraries.
  - **Status**: Reframed as “advanced interop” and explicitly recommends exported tokens first.
  - **Open question**: whether `--axm-chart-*` is a supported/stable interop surface (could become a future decision).

### Reference pages

- [Token Reference (`--axm-*` engine variables)](site/src/content/docs/reference/tokens.mdx)
  - **Category**: Reference leak risk → mitigated
  - **Notes**: This page necessarily mentions engine variables, but can’t be allowed to present them as the primary integration surface.
  - **Status**: Restructured to be contract-first (classes + exported tokens) with an explicit “Internals / interop” section wrapped in explanatory spans.
