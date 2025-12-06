# Design Documentation

This directory contains the high-level design documents for the Color System.

## [Theory](./theory/)

The mathematical models, axioms, and core philosophy of the system.

- [The Constitution (Axioms)](./theory/axioms.md): The fundamental laws.
- [Composition Algebra](./theory/composition-algebra.md): The physics of continuous color.
- [Hue Shift](./theory/hue-shift.md): The math behind non-linear hue rotation.
- [Determinism](./theory/determinism.md): Ensuring reproducible outputs.

## [Architecture](./architecture/)

The system components and how they fit together.

- [Solver Architecture](./architecture/solver-architecture.md): How the contrast solver works.
- [Reactive Pipeline](./architecture/reactive-pipeline.md): The CSS variable dependency graph.
- [State Architecture](./architecture/state-architecture.md): The "Classes with Runes" pattern.
- [Runtime Debugging](./architecture/runtime-debugging.md): Tools for inspecting the system at runtime.

## [Specifications](./specs/)

Detailed designs for specific features.

- [High Level Presets](./specs/high-level-presets.md): The "Vibe" system.
- [Editor Grammar](./specs/editor-grammar-spec.md): The language of the theme editor.
- [Luminance Spectrum UI](./specs/luminance-spectrum-ui.md): Visualizing the color space.
- [Selection vs. Focus](./specs/selection-vs-focus.md): Interaction states.

## [Integration & Tooling](./integration/)

How the system interacts with the outside world.

- [Interoperability Strategy](./integration/interoperability-strategy.md): Exporting to other formats.
- [LLM Context Strategy](./integration/llm-context-strategy.md): How we teach AI about the system.
- [Playwright Setup](./integration/playwright-headless-setup.md): Testing infrastructure.
- [Usage Enforcement](./integration/usage-enforcement.md): Linting and static analysis.

## [Process & Learnings](./process/)

Audits, reviews, and historical context.

- [Project Learnings](./process/project_learnings.md): Key takeaways and pivots.
- [Fresh Eyes Reviews](./process/fresh-eyes-review.md): Periodic audits of the system.

## [Meta](./meta/)

High-level goals and user definitions.

- [Personas](./meta/personas.md): Who we are building for.
- [Vibes](./meta/vibes.md): The aesthetic goals.

## [Archive](./archive/)

Deprecated or superseded design documents.
