# Agent Instructions

This file contains instructions for AI agents working on this repository.

## ⚡️ Critical Workflows

### Testing

**ALWAYS** use `pnpm test` to run tests.

- ❌ `pnpm vitest` (Runs in watch mode, which will hang the agent)
- ✅ `pnpm test` (Runs `vitest --run`, which executes once and exits)

### Linting

- Use `pnpm lint` to check for issues.
- Use `pnpm lint:fix` to automatically fix fixable issues.

### Chat Lifecycle

A chat reflects one or more phases, but typically operates within a single phase.

- Start by reviewing `docs/agent-context` files to understand project goals.
  - Review `docs/agent-context/walkthrough.md`. It will give you a sense of the most recent completed phase.
  - Review `docs/agent-context/task.md` and `docs/agent-context/implementation_plan.md` to discover upcoming work. Review the `#codebase` to identify a good next step.
- If starting a new phase, update `docs/agent-context/implementation_plan.md` to be completely focused on the implementation plan for the next phase. Ask the user for feedback.
- If continuing a phase, review `docs/agent-context/implementation_plan.md` to track progress.
- Continue iterating with the user on the Implementation Plan until it's ready to begin.

### Phase Transitions

- Before marking a phase as complete in `docs/agent-context/task.md`, ensure all related tasks are done.
- Update `AGENTS.md` with any new instructions or changes in workflow.
- Run `pnpm test` and `pnpm lint` to verify everything is in order.
- Verify that coherence between the documentation and codebase is increasing. If necessary, update documentation to reflect recent changes or surface any new gaps between the intent of the system as documented, the planning documents, and the actual implementation.
- After all checks pass, update the `docs/agent-context/walkthrough.md` file to reflect the work done since the last phase transition and surface it to the user for review. Include a summary of the most important or controversial changes made that the user has not yet reviewed.
- Once the user has reviewed the walkthrough and approved the changes, mark the phase as complete in `docs/agent-context/task.md` and commit the changes.

## 📂 Project Structure

- **`src/lib/`**: Core logic for the color system (solvers, math, types).
- **`src/cli/`**: CLI entry point (`color-system`).
- **`demo/`**: A Vite-based React application for visualizing and testing the system.
- **`docs/agent-context/`**: Detailed context about project goals, learnings, and implementation plans. **Read these if you need to understand the "why" behind the code.**

## 🧠 Key Concepts

- **Context**: The combination of `Polarity` (page/inverted) and `Mode` (light/dark). Most math functions now operate on a `Context` object.
- **Surfaces**: The fundamental building blocks. Surfaces create context for the content inside them.
- **Anchors**: Fixed points (lightness values) that define the start and end of the contrast range for a given mode/polarity.

## 📖 Documentation

If you are unsure about the architectural direction, check:

- `concepts.md`: High-level conceptual model.
- `implementation.md`: Details on the CSS variable implementation.
- `docs/agent-context/system_goals.md`: The overarching goals of the system.
