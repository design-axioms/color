# Claim Ledger Triage Plan (RFC016 → Scheduled Work)

## 1) Summary

This plan triages the audit claim ledger and conflict cards in `docs/rfcs/016-user-programming-model-audit-and-doc-plan.md` into executable buckets and a draft multi-epoch schedule.

**Target boundary**: the public consumer contract of **Axiomatic Color** as shipped via `@axiomatic-design/color` and taught via the docs site.

Top priority themes (tentative):

1. **Single-plane theme authority**: `ThemeManager` + first-paint seeding, no competing writers.
2. **Docs are part of the contract**: keep guides enforceably “no plumbing,” while allowing labeled internals only when we truly intend them.
3. **Config-first adoption**: Theme Studio as a config editor with strict import/export, aligned to the same semantic theme plane.

Top 5 items by Priority (draft; for confirmation):

1. **C-007** — Theme Studio theme plane alignment (`data-theme` → `ThemeManager`) (High severity, High leverage)
2. **C-008** — Theme Studio strict config import/export (High severity, High leverage)
3. **T-002** — Intentional internals policy (High blast radius; gates docs/API shape)
4. **CL-007** — `axiomatic audit` semantics (trust + CI integration clarity)
5. **CL-006** — npm support promise (golden-path adoption friction)

Status: decisions recorded; **Epoch 1 in progress**.

## 2) Triage Scope & Assumptions

- **Target boundary + primary surface**
  - Boundary: user-facing integration surface of `@axiomatic-design/color`.
  - Primary surfaces:
    - Docs site: `site/src/content/docs/**`
    - CLI: `axiomatic` (`src/cli/**`)
    - Runtime API: `@axiomatic-design/color/browser` (`src/lib/browser.ts`)
    - Theme Studio (first-party tool): `site/src/pages/studio.astro` + `site/src/lib/state/**`

- **In-scope (for scheduling)**
  - Docs changes (site docs, README, reference pages) that affect the taught model.
  - Tooling changes that enforce the model (e.g., RFC010 gate scope/markers).
  - Implementation work required to align first-party tools (Theme Studio, Inspector overlay) with the canonical user model.

- **Out-of-scope (for this triage)**
  - Major solver/physics refactors.
  - Cosmetic site polish unrelated to programming model.

- **Assumptions affecting prioritization**
  - Site docs are canonical entrypoint; root README should route to them (already decided in RFC016).
  - Dark mode contract is single-tier: `ThemeManager` is the supported integration surface.
  - Docs/examples must remain RFC010/RFC014 compliant, even in beginner HTML guides.
  - This document does **not** resolve new decisions; it only schedules work and queues decisions.

## 3) Ledger Normalization Notes

Normalization applied only inside this triage plan:

- The RFC016 Claim Ledger rows do not have stable IDs; this plan assigns local IDs `CL-###` for referencing.
- RFC016 Conflict Cards already have stable IDs `C-###` and are used directly.
- New concerns discovered after RFC016 (e.g., “intentional internals” spans) are recorded here as **triage-only** items with IDs `T-###`.
- Some Claim Ledger items are already satisfied (Status **OK**) or already remediated on this branch. For completeness, they are captured in Bucket **D (Not Scheduled)**.

## 4) Scoring Model (Coarse, Human-Readable)

Dimensions use **Low / Med / High**.

- **Severity**: breaks golden path / causes failure / violates contract
- **Blast radius**: affects multiple personas or integrations
- **Leverage**: unlocks other work / reduces multi-writer ambiguity
- **Effort**: Docs-only (Low) / Implementation (Med/High)
- **Evidence quality**: Strong (measured in repo) / Weak (inferred)

Priority rule (coarse):

- **Priority = (Severity + Blast + Leverage) − Effort**, then reduce confidence if Evidence is Weak.

## 5) Triage Buckets (The Four-Way Split)

### A — Docs-only, safe

| ID     | Claim / Issue                                                      | Status                    | Persona impact   | Contract impact               | Evidence quality | Proposed action                                                                                                                                                                                            | Notes                                                                                                  |
| ------ | ------------------------------------------------------------------ | ------------------------- | ---------------- | ----------------------------- | ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| CL-001 | Document `axiomatic import` command                                | Done (docs)               | Marcus, Dr. Chen | Migration surface clarity     | Strong           | Add to CLI reference with strict framing                                                                                                                                                                   | Implemented in CLI reference.                                                                          |
| CL-002 | Document `build --copy-engine`                                     | Done (docs)               | Sarah            | Integration clarity           | Strong           | Add to CLI reference/build options                                                                                                                                                                         | Implemented in CLI reference.                                                                          |
| CL-003 | Document `*.class-tokens.json` manifest output                     | Done (docs)               | Marcus, Jordan   | Enforcement/toolchain clarity | Strong           | Add to integration guide + policy/enforcement reference                                                                                                                                                    | Documented in CLI reference and Integration guide.                                                     |
| CL-004 | Document legacy `axiomatic <config> <out>` shorthand               | Done (docs)               | Sarah            | DX clarity                    | Strong           | Add a short “legacy shorthand” note                                                                                                                                                                        | Implemented in CLI reference.                                                                          |
| CL-005 | Add docs-authoring note for `axm-docs:explanatory` usage           | Done (docs)               | Marcus, Jordan   | Contract enforcement hygiene  | Strong           | Add a short authoring section describing markers + intent                                                                                                                                                  | Added to CONTRIBUTING.md.                                                                              |
| CL-008 | Clarify `ThemeManager` vs first-paint seeding (bootstrap) contract | Drift (decision recorded) | Sarah, Marcus    | Single writer semantics       | Strong           | Ensure docs clearly teach “seed semantic state before paint, then ThemeManager takes over”                                                                                                                 | Decision recorded as C-002 in RFC016; docs must not imply multi-writer beyond the sanctioned seed.     |
| T-002  | Intentional internals necessity review + quarantine                | In progress (docs)        | All              | Boundary clarity              | Strong           | Inventory every `axm-docs:explanatory` span; keep internals only when necessary to teach; otherwise replace with contract-level explanation; relocate remaining internals into explicit Internals/Appendix | Started by quarantining catalog token references (Surfaces/Actions) and tightening framing (Data Viz). |
| CL-006 | npm support promise (docs posture)                                 | Done (docs)               | Sarah            | Adoption expectations         | Weak→Med         | Update install docs to recommend pnpm but mention npm as best-effort with crisp caveats                                                                                                                    | Made onboarding + framework guides pnpm-first; kept npm/npx as best-effort alternatives.               |

### B — Implementation, safe

| ID     | Claim / Issue                                                                                                    | Status                | Persona impact | Contract impact              | Evidence quality | Proposed action                                                                                              | Notes                                                                  |
| ------ | ---------------------------------------------------------------------------------------------------------------- | --------------------- | -------------- | ---------------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------- |
| C-007  | Theme Studio uses `data-theme` vs `ThemeManager` plane                                                           | Decision recorded     | Sarah, Marcus  | Single writer / single plane | Strong           | Implement Studio mode control via `ThemeManager` semantic state                                              | Decision already recorded in RFC016.                                   |
| C-008  | Theme Studio config import/export UI gap                                                                         | Decision recorded     | Sarah, Marcus  | Config-first contract        | Strong           | Implement strict JSON import/export for `color-config.json`                                                  | Export exact SolverConfig; import validates.                           |
| C-004  | Inverted surfaces require ThemeManager for native controls (docs aligned; ensure runtime behavior stays correct) | Decision recorded     | Sarah          | Runtime correctness          | Strong           | Add regression coverage around inverted surface color-scheme behavior                                        | If coverage already exists, ratchet it.                                |
| T-001  | Inspector overlay “recipes” contract stabilization                                                               | Partially implemented | Jordan, Marcus | Enforcement UX               | Med              | Add/ratchet tests around overlay outputs used by automation                                                  | Keep overlay debug-only; ensure report schema stability.               |
| CL-007 | `axiomatic audit` strict mode / split semantics                                                                  | Decided (C)           | Jordan         | CI gating clarity            | Med              | Add `audit --strict` (or equivalent) so CI can fail deterministically while keeping default `audit` advisory | Exact flag/command name is implementation detail; contract is “split.” |

### C — Needs decision (explicitly deferred)

| ID     | Claim / Issue                                                                              | Status    | Persona impact | Contract impact               | Evidence quality | Proposed action                                                                   | Notes                                                                                                                        |
| ------ | ------------------------------------------------------------------------------------------ | --------- | -------------- | ----------------------------- | ---------------- | --------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| CL-009 | Runtime integration boundary verification: mode via `ThemeManager`, no CSS variable writes | Ambiguous | Marcus         | RFC014 enforcement confidence | Weak→Med         | Verify first-party + docs examples; decide whether any clarifying docs are needed | RFC016 marks this as TBD (Epoch 2/3 evidence). This is a “needs verification” item that may or may not turn into a decision. |

### D — Not Scheduled (Defer / Done)

| ID     | Claim / Issue                                                                | Status                                    | Persona impact                   | Contract impact          | Evidence quality | Proposed action                                       | Notes                                                           |
| ------ | ---------------------------------------------------------------------------- | ----------------------------------------- | -------------------------------- | ------------------------ | ---------------- | ----------------------------------------------------- | --------------------------------------------------------------- | --------- | -------------------------------- |
| D-001  | Interactive tutorials in Theme Studio                                        | Deferred                                  | Sarah, Alex                      | Education                | Weak             | Defer until core contract is stabilized               | Already listed as deferred elsewhere.                           |
| CL-010 | CLI supports `init`, `build` (default), `export`, `audit`                    | OK                                        | Sarah, Marcus                    | CLI surface stability    | Strong           | No action                                             | Verified in RFC016 Claim Ledger.                                |
| CL-011 | CLI usage is `npx axiomatic ...`                                             | OK                                        | Sarah                            | Docs copy-paste          | Strong           | No action (optionally add pnpm-native examples later) | RFC016 notes pnpm-native docs may still be desirable.           |
| CL-012 | `build` defaults: `./color-config.json` → `./theme.css`                      | OK                                        | Sarah                            | Predictability           | Strong           | No action                                             | Verified in RFC016 Claim Ledger.                                |
| CL-013 | `export --format dtcg                                                        | tailwind                                  | typescript` exists with defaults | OK                       | Marcus           | Export surface                                        | Strong                                                          | No action | Verified in RFC016 Claim Ledger. |
| CL-014 | Runtime import path `@axiomatic-design/color/browser` exports `ThemeManager` | OK                                        | Sarah, Marcus                    | Runtime entrypoint       | Strong           | No action                                             | Verified in RFC016 Claim Ledger.                                |
| CL-015 | `ThemeManager` sets inline `color-scheme` when no classes provided           | OK                                        | Sarah                            | Runtime behavior         | Strong           | No action                                             | Verified in RFC016 Claim Ledger.                                |
| CL-016 | RFC010 is enforced for consumer layers via a CI gate                         | OK                                        | Marcus, Jordan                   | Boundary enforcement     | Strong           | No action                                             | Verified in RFC016 Claim Ledger.                                |
| CL-017 | Starlight adapter boundary (bridge file) is explicitly allowlisted           | OK                                        | Marcus                           | Adapter contract         | Strong           | No action                                             | Verified in RFC016 Claim Ledger.                                |
| CL-018 | Chrome continuity contract is enforced in multiple ways                      | OK                                        | Marcus, Jordan                   | Continuity invariants    | Strong           | No action                                             | Verified in RFC016 Claim Ledger.                                |
| C-001  | Docs teach `force-dark`/`force-light` but implementation uses `ThemeManager` | Done (decision recorded; docs remediated) | Sarah, Marcus                    | Single writer            | Strong           | No action                                             | Resolved per RFC016; docs updated on this branch.               |
| C-003  | HTML docs taught `var(--axm-*)` + `data-theme` writes                        | Done (decision recorded; docs remediated) | Sarah, Jordan                    | RFC010/RFC014 compliance | Strong           | No action                                             | Resolved per RFC016; docs updated and enforcement expanded.     |
| C-006  | RFC010 enforcement did not cover MD/MDX docs                                 | Done (decision recorded; implemented)     | Sarah, Marcus                    | Drift prevention         | Strong           | No action                                             | Resolved per RFC016; docs now in enforcement scope.             |
| C-009  | README taught importing `utilities.css` (nonexistent)                        | Done (decision recorded; docs remediated) | Sarah                            | Onboarding correctness   | Strong           | No action                                             | Resolved per RFC016; docs now teach `engine.css` + `theme.css`. |

## 6) Decision Queue (Handle C Items Turn-Based)

No decisions are resolved in this triage session. Proposed decision order:

| ID     | Decision needed                                                     | Options                                                                                                                                                                                                         | Recommendation   | Why now                                                                       |
| ------ | ------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- | ----------------------------------------------------------------------------- |
| T-002  | Do we _want_ internals examples, or are they a docs/user-goals gap? | (A) Keep but move to explicit “Internals/Appendix” + hard guardrails; (B) Replace with contract-level teaching + remove most internals; (C) Promote selected internals (some `--axm-*`) as a stable interop API | **A (selected)** | Decision recorded; follow-up work ensures internals are necessary per topic.  |
| CL-006 | Do we promise npm support in docs?                                  | (A) pnpm-only official; (B) npm officially supported; (C) “npm works” best-effort with caveats                                                                                                                  | **C (selected)** | Decision recorded “for now”; docs posture should be explicit and revisitable. |

### Decision briefs (do not answer yet)

These are written in the required STOP-question format so we can resolve them later one at a time.

#### T-002 — Intentional internals policy

- **Decision needed**: Should the public docs include internal engine mechanics/examples (e.g., `oklch(from ...)`, `var(--axm-*)`) beyond strictly labeled explanation-only spans? If yes, where and with what stability promises?
- **Options**:
  - **A) Keep internals, but quarantine them**: allow internals only in explicit “Internals / Appendix” (or “Advanced”) sections, with strict “do not copy/paste” framing and enforcement markers.
  - **B) Replace most internals with contract-level teaching**: rewrite advanced pages to avoid showing internal syntax/vars; use diagrams/pseudocode; keep only what’s necessary for conceptual clarity.
  - **C) Promote selected internals to a supported interop surface**: explicitly declare certain `--axm-*` outputs (e.g., `--axm-chart-*`) as stable APIs for libraries.
- **Tradeoffs**:
  - **A optimizes** preserving deep learning value while keeping the golden path clean; **risk** is a persistent “shadow API” if readers still copy/paste.
  - **B optimizes** eliminating the shadow-API risk; **risk** is losing the “how it works” clarity that helps advanced users trust the system.
  - **C optimizes** interoperability and library adoption; **risk** is freezing implementation details into a long-term compatibility contract.
- **Decision (user)**: **A**, with a caveat: keep internals only when they are genuinely necessary to teach the topic.
- **Follow-up requirement**: For each internals example, explicitly justify “why contract-level teaching isn’t sufficient,” otherwise replace/remove.

#### CL-007 — `axiomatic audit` semantics

- **Decision needed**: What does “audit” promise, and how should it behave (wording + exit codes) for CI usage?
- **Options**:
  - **A) Advisory**: `axiomatic audit` reports findings but exits 0 unless there are fatal errors (schema/solver failures).
  - **B) Strict gate**: any audit finding exits non-zero, suitable for CI.
  - **C) Split commands**: keep `audit` advisory, add a separate strict mode/command (e.g. `audit --strict` or `check`) for CI gating.
- **Tradeoffs**:
  - **A optimizes** DX and avoids brittle CI; **risk** is users misunderstanding “audit” as a guarantee.
  - **B optimizes** correctness-by-default and CI suitability; **risk** is noisy failures and higher support burden.
  - **C optimizes** clarity and flexibility; **risk** is added surface area and doc complexity.
- **Decision (user)**: **C** (split). Keep `audit` advisory by default; provide an explicit strict mode/command suitable for CI gating.

#### CL-006 — npm support promise

- **Decision needed**: What install tooling do we officially promise in user-facing docs?
- **Options**:
  - **A) pnpm-only official**: docs use pnpm; other package managers are not promised.
  - **B) npm officially supported**: docs present npm as first-class alongside pnpm.
  - **C) Best-effort npm**: docs mention npm as “likely works,” but pnpm is recommended/official.
- **Tradeoffs**:
  - **A optimizes** internal consistency and reduces support scope; **risk** is adoption friction for new users.
  - **B optimizes** mainstream accessibility; **risk** is policy/tooling drift (repo conventions, lockfiles, guidance).
  - **C optimizes** adoption while limiting promises; **risk** is ambiguous expectations if wording isn’t crisp.
- **Decision (user)**: **C** (best-effort npm), for now.

## 7) Epoch Schedule (Execution Plan)

### Epoch 1 — Docs completeness: CLI + integration surfaces

- **Goal**: Make the golden path complete without inventing new APIs.
- **Inputs**: A items CL-001..CL-005, CL-008, T-002.
- **Deliverables**:
  - Updated CLI reference documenting `import`, `--copy-engine`, class token manifest output, and legacy shorthand.
  - A short docs-authoring note for `axm-docs:explanatory` markers.
  - An “intentional internals” pass: remove unnecessary internals from docs; relocate necessary internals into explicit Internals/Appendix sections.
  - Update CLI docs to explain `audit` as advisory by default and point CI users to the strict mode.
- **Verification gates**: `pnpm -w check:rfc010`, docs lint/build.
- **Exit criteria**: A items landed; no new enforcement violations.

### Epoch 2 — Theme Studio alignment (config-first + single theme plane)

- **Goal**: Make first-party Studio match the user programming model.
- **Inputs**: B items C-007, C-008.
- **Deliverables**:
  - Studio mode control via `ThemeManager` semantic state (no `data-theme` as the taught/supported model).
  - Strict config import/export UI (exact SolverConfig JSON + schema validation).
- **Verification gates**: unit tests (if present), Playwright coverage for Studio export/import + mode switch.
- **Exit criteria**: Studio’s taught workflow is real and stable.

### Epoch 3 — Inspector overlay contract hardening

- **Goal**: Keep the inspector powerful but clearly debug-only, with stable machine-readable outputs for automation.
- **Inputs**: B item T-001.
- **Deliverables**:
  - Regression tests around overlay report schema consumed by `check:violations` / Playwright helpers.
  - Documentation note: Diagnose vs Experiment (if not already documented elsewhere).
- **Verification gates**: Playwright test suite + `pnpm check:violations` targeted runs.
- **Exit criteria**: overlay changes cannot silently break automation.

### Epoch 4 — Decision epoch: install tooling

**Removed**: CL-006 decision recorded (best-effort npm). If new install-tooling decisions emerge, reintroduce a decision epoch.

## 8) Change Packaging (Optional but Recommended)

- PR 1: Docs-only (Epoch 1)
- PR 2: Theme Studio implementation (Epoch 2)
- PR 3: Inspector hardening (Epoch 3)
- PR 4: Decision-only artifacts (Epoch 4)

## 9) Risks & Circuit Breakers

- **Risk: accidental new public API** by documenting internals (e.g., `--axm-*` variables) without intending stability.
  - Circuit breaker: if docs changes cause teams to depend on internals, pause and decide T-002.
- **Risk: multi-writer theme plane regression** (Studio, docs snippets, or overlay reintroduce `data-theme`/direct writes).
  - Circuit breaker: any new theme writer pattern in docs triggers a STOP and enforcement update.
- **Risk: “audit” trust mismatch** if users expect CI-grade gating but receive warnings.
  - Circuit breaker: if CI integrations appear in docs, resolve CL-007 first.

## 10) Acceptance Criteria

Done when:

- Every RFC016 ledger item relevant to the golden paths is bucketed A/B/C/D.
- The decision queue exists and is ordered (even if decisions are deferred).
- A multi-epoch schedule exists with verification gates and clear exit criteria.
- The user approves this schedule as the input to subsequent remediation epochs.
