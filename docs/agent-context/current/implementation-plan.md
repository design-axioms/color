# Implementation Plan - Epoch 11: Phase 1 - The Constitution (Axioms)

**Goal**: Consolidate scattered design wisdom and architectural decisions into a single authoritative document: `docs/design/axioms.md`. This document will serve as the "Constitution" for the system, guiding future decisions and ensuring consistency.

## Context
The project has evolved significantly (Svelte migration, new features). We need to ensure our core design principles ("Axioms") are up-to-date and accurately reflect the current system. Although `axioms.md` exists, we need to verify its completeness against other design documents and the current codebase.

## Proposed Changes

### 1. Review and Refine `axioms.md`
- **Audit**: Compare `axioms.md` against:
    - `concepts.md` (The public-facing mental model)
    - `implementation.md` (The technical details)
    - `docs/design/hue-shift.md` (Specific physics)
    - `docs/design/state-architecture.md` (New Svelte architecture)
- **Update**: Add or refine axioms to cover:
    - **State Management**: The "Classes with Runes" architecture.
    - **Isomorphism**: The "Code is Source of Truth" principle extending to the runtime engine.
    - **Ecosystem**: The "Baseline Newly Available" browser support policy.

### 2. Consolidate Design Docs
- **Deprecate**: Identify if any older design docs in `docs/design/` should be archived or merged into `axioms.md`.
- **Link**: Ensure `axioms.md` links to deep-dive documents where appropriate (e.g., linking to `hue-shift.md` for the "Bezold-Brücke" axiom).

### 3. Update Project Plan
- Mark Epoch 11, Phase 1 as "In Progress" in `docs/agent-context/plan-outline.md`.

## Verification Plan
- **Manual Review**: Read the updated `axioms.md` to ensure it flows logically and covers all key aspects of the system.
- **Cross-Check**: Verify that the "Laws" in `axioms.md` are not contradicted by the code or other documentation.
