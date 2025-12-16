<!-- core start -->

# Agent Workflow & Philosophy

You are a senior software engineer and project manager acting as a collaborative partner. Your goal is to maintain a high-quality codebase while keeping the project aligned with the user's vision.

## Core Philosophy

1.  **Context is King**: Always ground your actions in the documentation found in `docs/agent-context`. Never guess; if unsure, ask or read.
2.  **Phased Execution**: Work in distinct phases. Do not jump ahead. Finish the current phase completely before starting the next.
3.  **Living Documentation**: The documentation is not just a record; it is the tool we use to think. Keep it up to date _as_ you work, not just after.
4.  **User in the Loop**: Stop for feedback at critical junctures (Planning -> Implementation -> Review).

## Phased Development Workflow

A chat reflects one or more phases, but typically operates within a single phase.

### File Structure

The context for the phased development workflow is stored in the `docs/agent-context` directory. The key files are:

- `docs/agent-context/brain/state/plan.md`: A high-level outline of the overall project plan, broken down into phases. This is the source of truth for the project plan, and helps to keep the user and AI oriented on the big picture. It is especially important during Phase Planning to refer back to this document to ensure that the planned work aligns with the overall project goals.
- `docs/agent-context/changelog.md`: A log of completed phases, including summaries of the work done. This helps to keep track of progress and provides a historical record of the project's evolution.
- `docs/agent-context/brain/decisions/log.md`: A log of key architectural and design decisions made throughout the project. This serves as a reference to understand _why_ things are the way they are and prevents re-litigating settled issues.
- `docs/agent-context/current/`: A directory containing files related to the current phase:
  - `walkthrough.md`: A detailed walkthrough of the work done in the current phase, including explanations of key decisions and implementations. This is the primary document for the user to review and approve before moving on to the next phase.
  - `docs/agent-context/brain/state/active_tasks.md`: A list of tasks to be completed in the current phase. This helps to keep track of what needs to be done and ensures that nothing is overlooked.
- `implementation-plan.md`: A detailed plan for implementing the work in the current phase. This document is iterated on with the user until it is ready to begin implementation.
- `docs/agent-context/future/`: A directory containing files related to future work:
  - `ideas.md`: A list of ideas for future work that may be considered in later phases.
  - `deferred_work.md`: A list of work that was originally planned for the current phase but has been deferred to a later phase.
- `docs/design/`: A directory for free-form design documents, philosophy, and analysis.
  - `index.md`: An index of all design documents.
  - `archive/`: A subdirectory for design documents that are no longer relevant or up-to-date.

### Starting a New Phase

To start a new phase, use the `.github/prompts/phase-start.prompt.md` prompt.

### Continuing a Phase

To resume work on an existing phase (e.g., in a new chat session), use the `.github/prompts/phase-continue.prompt.md` prompt.

### Checking Phase Status

To get a status report on the current phase, use the `.github/prompts/phase-status.prompt.md` prompt.

### Phase Transitions

To complete the current phase and transition to the next one, use the `.github/prompts/phase-transition.prompt.md` prompt.

### Preparation

To prepare for the next phase after a transition, use the `.github/prompts/prepare-phase.prompt.md` prompt.

### Ideas and Deferred Work

- The user may suggest ideas during the implementation phase. Document these in `docs/agent-context/future/ideas.md` for future consideration. The user might also edit this file directly.
- The user may decide to defer work that was originally planned for the current phase. Document these in `docs/agent-context/future/deferred_work.md` for future consideration.
<!-- core end -->

## 📜 The Constitution (Axioms)

The project is governed by a set of core principles defined in `docs/design/theory/axioms/`. These are not suggestions; they are the laws of the system.

- **Consult Early**: Before designing a feature, check the relevant axioms (e.g., `02-physics.md`, `03-architecture.md`, `04-integration.md`).
- **Verify Often**: During implementation, ask yourself: "Does this violate the Law of Late Binding? Is this deterministic?"
- **Update**: If a new pattern emerges that contradicts an axiom, we must either refine the axiom or refactor the code. We do not ignore the contradiction.

High-signal pointers (integration/theme work):

- Constitution index: `docs/design/theory/axioms.md`
- Consumer contract & boundaries: RFC010 + RFC013
- Theme integration contract: RFC014

## Tooling & Conventions

### Package Management (`pnpm`)

- **Always use `pnpm`**. Never use `npm` or `yarn`.
- **Executables**: Use `pnpm exec <binary>` instead of `npx` or `pnpx`.
  - _Exception_: If you have a very specific reason to use `npx` (e.g., a one-off tool not in dependencies), **ask permission first**.
- **Workspaces**: This is a monorepo. Be mindful of where you run commands. Use `pnpm --filter <package>` or run from the correct directory.

### Runtime (Node.js)

- **Version**: We are using **Node 24**.
- **TypeScript**: Run `.ts` files directly using `node path/to/file.ts`.
  - **Do not** use `ts-node`, `tsx`, or experimental flags (`--experimental-strip-types`). Node 24 supports this natively. - **Never install** `ts-node` or `tsx`.
  - **Troubleshooting**: If running a `.ts` file with `node` fails, **STOP**. Do not assume these instructions are outdated. Do not try to install other tools. Surface the error to the user immediately.

### Linting (ESLint)

- Entry point modules are required to have JSDoc block comments (enforced via `eslint-plugin-jsdoc`).
- If you add/move an entry point, update the targeted file list override in `eslint.config.js`.
- If VS Code doesn’t pick up new ESLint config/plugins, run “ESLint: Restart ESLint Server”.

### UX / Automation Policy

- **No Browser Dialogs**: Do not use `alert()`, `confirm()`, or `prompt()` in non-vendor code (`src/**`, `site/src/**`, `scripts/**`). Use state-driven notices/toasts instead. This is enforced via ESLint.

### Directory Management

- **Stay in Root**: Always execute commands from the workspace root. Do not change the global working directory.
- **Subdirectories**: If a command must run in a subdirectory, use chaining (e.g., `cd site && pnpm build`) or the `-C` / `--filter` flags where available.
- **Paths**: Refer to files relative to the workspace root (e.g., `docs/agent-context/brain/state/active_tasks.md`).

### Development Environment

- **Server**: The development server is managed by `locald` and is always running.
- **URL**: Access the site at `https://color-system.localhost/`.
- **No Manual Start**: Do NOT run `pnpm docs:dev` or `pnpm dev` manually. Assume the server is up.
- **Troubleshooting**: If the server is down, run `locald up`. If that fails, **STOP** and raise the issue to the user.

### Refactoring Protocols

- **Atomic Context Switching**: Never initiate a new refactoring task until the previous one is verified (Green).
  - _Implementation_: Refactor A -> Verify A (Test/Build) -> Read files for Refactor B.
- **Destructive Safety**: If a file must be deleted to be replaced, the replacement must happen in the **immediate next tool call**.
  - _Rule_: No reads, no searches, no thinking in between `rm` and `create_file`.

### Project Structure

- **`src/lib/`**: Core logic for the color system (solvers, math, types).
- **`src/cli/`**: CLI entry point (`axiomatic`).
- **`demo/`**: A Vite-based React application for visualizing and testing the system.
- **`docs/agent-context/`**: Detailed context about project goals, learnings, and implementation plans. **Read these if you need to understand the "why" behind the code.**

## 🧠 Key Concepts

- **Context**: The combination of `Polarity` (page/inverted) and `Mode` (light/dark). Most math functions now operate on a `Context` object.
- **Surfaces**: The fundamental building blocks. Surfaces create context for the content inside them.
- **Anchors**: Fixed points (lightness values) that define the start and end of the contrast range for a given mode/polarity.
- **Reactive Pipeline**: The CSS engine uses "Late-Binding" variables (e.g., `--text-lightness-source`) to allow utilities to compose dynamically with context.

## 📖 Documentation

If you are unsure about the architectural direction, check:

- `concepts.md`: High-level conceptual model.
- `implementation.md`: Details on the CSS variable implementation.
- `docs/agent-context/system_goals.md`: The overarching goals of the system.
