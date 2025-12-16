---
agent: agent
description: This prompt is used to end the current phase in the phased development workflow and prepare for a new phase in a new chat.
---

### Phase Transitions

- **Completion Check**: Before marking a phase as complete in `${workspaceFolder}/docs/agent-context/brain/state/active_tasks.md`, ensure all related tasks are done.
- **Verification**: Run `${workspaceFolder}/scripts/agent/verify-phase.sh`. This script runs tests and clippy, and provides a checklist for the next steps.
- **Meta-Review**: Update `${workspaceFolder}/AGENTS.md` with any new instructions or changes in workflow. If something didn't work well in this phase, fix the process now.
- **Coherence Check**: Verify that coherence between the documentation and codebase is increasing. If necessary, update documentation to reflect recent changes.
- **Walkthrough**: After all checks pass, update the `${workspaceFolder}/docs/agent-context/current/walkthrough.md` file to reflect the work done since the last phase transition and surface it to the user for review.
- **Finalize**: Once the user has approved the walkthrough:
  - Run `${workspaceFolder}/scripts/agent/prepare-phase-transition.sh`. This script will display the current context and remind you of the necessary updates.
  - Follow the script's output to update `${workspaceFolder}/docs/agent-context/changelog.md`, `${workspaceFolder}/docs/agent-context/brain/decisions/log.md`, and `${workspaceFolder}/docs/agent-context/brain/state/plan.md`.
  - Once the documentation is updated, run `${workspaceFolder}/scripts/agent/complete-phase-transition.sh "<commit_message>"`. This script will commit the changes, empty the current context files, and display the future work context.
