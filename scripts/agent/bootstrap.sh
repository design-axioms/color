#!/bin/bash
set -e

# SAFETY: This script is intended for initializing a brand-new repo.
# In this workspace we already have an established agent workflow (Brain paths,
# agent scripts, and prompts). Re-running bootstrap would overwrite those files
# and break phase continuity.
if [ -f "scripts/agent/restore-context.sh" ] || [ -d "docs/agent-context/brain" ]; then
    echo "Refusing to run: agent workflow already initialized."
    echo "If you truly need to re-bootstrap, remove scripts/agent and docs/agent-context/brain first."
    exit 1
fi

# 1. Create .github/prompts files
mkdir -p .github/prompts

cat << 'EOF' > .github/prompts/phase-start.prompt.md
---
agent: agent
description: This prompt is used to start a new phase in the phased development workflow.
---

### Starting a New Phase

When starting a new phase in a new chat, you should restore the project context by following these steps:

- **Context Loading**: Make sure you understand the phased development workflow as described in this document.
- **State Verification**: Run `${workspaceFolder}/scripts/agent/restore-context.sh`. This script will output the project goals, decisions, changelog, and current phase state. Read this output carefully to ground yourself in the project's history and current status.
- **Plan Alignment**:
  - Update `${workspaceFolder}/docs/agent-context/current/implementation-plan.md` to be completely focused on the implementation plan for the next phase. Ask the user for feedback.
- **Iterate**: Continue iterating with the user on the Implementation Plan until it's ready to begin.
EOF

cat << 'EOF' > .github/prompts/phase-continue.prompt.md
---
agent: agent
description: This prompt is used to resume work on an existing phase in a new chat session.
---

### Continuing a Phase

When picking up work in the middle of a phase (e.g., starting a new chat session for an ongoing task), follow these steps:

- **Context Restoration**: Run `${workspaceFolder}/scripts/agent/resume-phase.sh`.
  - This script will verify that an active phase exists and output the current project context.
- **State Analysis**:
  - Review the `Task List` output to identify completed and pending items.
  - Review the `Implementation Plan` to understand the current technical direction.
  - Review the `Walkthrough` (if any) to see what has been accomplished so far.
- **Resume Work**:
  - Identify the next incomplete task from the task list.
  - Continue execution from that point.
EOF

cat << 'EOF' > .github/prompts/phase-status.prompt.md
---
agent: agent
description: This prompt is used to get a status report on the current phase.
---

### Phase Status Report

When asked for the status of the current phase, perform the following actions:

1.  **Gather Context**:
    - Read `${workspaceFolder}/docs/agent-context/brain/state/active_tasks.md` to see what is done and what is pending.
    - Read `${workspaceFolder}/docs/agent-context/current/implementation-plan.md` to understand the goals and scope.
    - Read `${workspaceFolder}/docs/agent-context/current/walkthrough.md` to see the narrative of progress so far.
    - Read `${workspaceFolder}/docs/agent-context/brain/state/plan.md` to identify the current phase number and title.

2.  **Generate Report**:
    - **Phase Identity**: State the current phase number and title.
    - **Progress Summary**: Summarize how much of the work is complete (e.g., "Design and Core Implementation are done, currently working on Tests").
    - **Pending Tasks**: List the immediate next tasks from the `task-list.md`.
    - **Blockers/Issues**: If the context suggests any open questions or deferred work, mention them.
    - **Next Action**: Suggest the logical next step for the user or agent.

3.  **Presentation**:
    - Keep the report concise and high-level.
    - Use bullet points for readability.
EOF

cat << 'EOF' > .github/prompts/phase-transition.prompt.md
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
EOF

cat << 'EOF' > .github/prompts/prepare-phase.prompt.md
---
agent: agent
description: This prompt is used to prepare the next phase in the phased development workflow.
---

### Preparation

- The `complete-phase-transition.sh` script will have displayed the contents of `docs/agent-context/future/`. Review this output and the chat history.
- Propose a high-level outline for the next phase to the user.
- Once the user has approved the high-level outline, update `${workspaceFolder}/docs/agent-context/current/implementation-plan.md` with the agreed outline. Do not include detailed implementation steps yet.
- Update `${workspaceFolder}/docs/agent-context/brain/state/plan.md` to reflect the portion of the outline that will be tackled in the next phase.
- Update `${workspaceFolder}/docs/agent-context/future/` files to remove any items that will be addressed in the next phase, and add any new ideas or deferred work that arose during the iteration with the user.
EOF

cat << 'EOF' > .github/prompts/fresh-eyes.prompt.md
---
agent: agent
description: This prompt is used to review the project through the eyes of specific user personas.
---

You are reviewing the project through the "Fresh Eyes" of our key personas. Your goal is to identify friction points, confusion, or missing information that a user might encounter.

## Use Case

{{USE_CASE}}

## The Personas

1.  **Read the Personas**: Read `${workspaceFolder}/docs/design/personas.md` to understand the key personas for this project.
2.  **Internalize**: Adopt the mindset of one or more of these personas.

## Instructions

1.  Review the provided code, documentation, or plan in the context of the **Use Case**.
2.  Provide feedback in the voice of the persona(s).
3.  Highlight specific areas where the user experience could be improved.
EOF

cat << 'EOF' > .github/prompts/persona-build.prompt.md
---
agent: agent
description: This prompt is used to define or refine a user persona for the project.
---

### Building a Persona

You are helping the user define a new persona or refine an existing one for the project. This persona will be used to guide design decisions and documentation.

**Goal**: Create a detailed profile that captures the user's mindset, needs, and pain points.

**Instructions**:

1.  **Ask Clarifying Questions**: If the user provides a vague description (e.g., "a beginner"), ask specific questions to narrow it down:
    - What is their technical background? (e.g., "Knows Python but new to Rust", "Complete programming novice")
    - What are they trying to build? (e.g., "A configuration file parser", "A full programming language")
    - What are their biggest fears? (e.g., "Compiler errors", "Complex terminology")

2.  **Draft the Persona**: Once you have enough information, draft a persona entry in the following format:
    - **Name**: A catchy title (e.g., "The Pragmatist").
    - **Description**: A brief summary of who they are.
    - **Needs**: What do they need from the project? (e.g., "Clear examples", "Robust error recovery")
    - **Frustrations**: What drives them away? (e.g., "Boilerplate", "Abstract theory")
    - **Focus**: What specific aspects of the project should we focus on for them?

3.  **Update Documentation**:
    - Once the user approves the draft, add it to `${workspaceFolder}/docs/design/personas.md`.
EOF

# 2. Bootstrap docs/agent-context files
mkdir -p docs/agent-context/brain/state
mkdir -p docs/agent-context/brain/decisions
mkdir -p docs/agent-context/current
mkdir -p docs/agent-context/future
mkdir -p docs/design

touch docs/agent-context/brain/state/plan.md
touch docs/agent-context/changelog.md
touch docs/agent-context/brain/decisions/log.md
touch docs/agent-context/brain/state/active_tasks.md
touch docs/agent-context/current/implementation-plan.md
touch docs/agent-context/current/walkthrough.md
touch docs/agent-context/current/report.md
touch docs/agent-context/future/ideas.md
touch docs/agent-context/future/deferred_work.md

# 3. Bootstrap scripts/check
mkdir -p scripts
if [ ! -f scripts/check ]; then
cat << 'EOF' > scripts/check
#!/bin/bash
set -e

echo "Running cargo test..."
cargo test

echo "Running cargo clippy..."
cargo clippy
EOF
chmod +x scripts/check
fi

# 4. Bootstrap scripts/agent scripts
mkdir -p scripts/agent

cat << 'EOF' > scripts/agent/restore-context.sh
#!/bin/bash

echo "=== Project Goals (Plan Outline) ==="
if [ -f "docs/agent-context/plan-outline.md" ]; then
    cat docs/agent-context/plan-outline.md
else
    echo "No plan outline found."
fi
echo ""

echo "=== Architecture & Decisions ==="
if [ -f "docs/agent-context/decisions.md" ]; then
    cat docs/agent-context/decisions.md
else
    echo "No decisions log found."
fi
echo ""

echo "=== Progress (Changelog) ==="
if [ -f "docs/agent-context/changelog.md" ]; then
    cat docs/agent-context/changelog.md
else
    echo "No changelog found."
fi
echo ""

echo "=== Current Phase State ==="
echo "--- Implementation Plan ---"
if [ -f "docs/agent-context/current/implementation-plan.md" ]; then
    cat docs/agent-context/current/implementation-plan.md
else
    echo "(Empty or missing)"
fi
echo ""

echo "--- Task List ---"
if [ -f "docs/agent-context/current/task-list.md" ]; then
    cat docs/agent-context/current/task-list.md
else
    echo "(Empty or missing)"
fi
echo ""

echo "--- Walkthrough (Draft) ---"
if [ -f "docs/agent-context/current/walkthrough.md" ]; then
    cat docs/agent-context/current/walkthrough.md
else
    echo "(Empty or missing)"
fi
echo ""

echo "=== Available Design Docs ==="
if [ -d "docs/design" ]; then
    ls docs/design
else
    echo "No design docs directory found."
fi
EOF
chmod +x scripts/agent/restore-context.sh

cat << 'EOF' > scripts/agent/verify-phase.sh
#!/bin/bash

echo "=== Running Verification ==="
if [ -f "scripts/check" ]; then
    ./scripts/check
else
    echo "Error: scripts/check not found."
    exit 1
fi

if [ $? -ne 0 ]; then
    echo "Verification failed! Fix errors before proceeding."
    exit 1
fi

echo "=== Verification Successful ==="
echo "Next Steps:"
echo "1. **Meta-Review**: Update AGENTS.md if workflow needs improvement."
echo "2. **Coherence Check**: Ensure docs match code."
echo "3. **Walkthrough**: Update docs/agent-context/current/walkthrough.md."
echo "4. Run scripts/agent/prepare-phase-transition.sh when ready to finalize."
EOF
chmod +x scripts/agent/verify-phase.sh

cat << 'EOF' > scripts/agent/prepare-phase-transition.sh
#!/bin/bash

echo "=== Current Phase Context ==="
for file in docs/agent-context/current/*; do
    if [ -f "$file" ]; then
        echo "--- $file ---"
        cat "$file"
        echo ""
    fi
done

echo "=== Plan Outline ==="
if [ -f "docs/agent-context/plan-outline.md" ]; then
    echo "--- docs/agent-context/plan-outline.md ---"
    cat docs/agent-context/plan-outline.md
    echo ""
fi

echo "========================================================"
echo "REMINDER:"
echo "1. Update 'docs/agent-context/changelog.md' with completed work."
echo "2. Update 'docs/agent-context/decisions.md' with key decisions."
echo "3. Update 'docs/agent-context/plan-outline.md' to reflect progress."
echo "4. Run 'scripts/agent/complete-phase-transition.sh \"<commit_message>\"' to finalize."
echo "========================================================"
EOF
chmod +x scripts/agent/prepare-phase-transition.sh

cat << 'EOF' > scripts/agent/complete-phase-transition.sh
#!/bin/bash

if [ -z "$1" ]; then
    echo "Error: Please provide a commit message."
    echo "Usage: $0 \"Commit message\""
    exit 1
fi

echo "=== Committing Changes ==="
git add .
git commit -m "$1"

if [ $? -ne 0 ]; then
    echo "Git commit failed. Aborting."
    exit 1
fi

echo "=== Emptying Current Context ==="
truncate -s 0 docs/agent-context/current/task-list.md
truncate -s 0 docs/agent-context/current/walkthrough.md
truncate -s 0 docs/agent-context/current/implementation-plan.md
echo "Context files emptied."

echo "=== Future Work Context ==="
for file in docs/agent-context/future/*; do
    if [ -f "$file" ]; then
        echo "--- $file ---"
        cat "$file"
        echo ""
    fi
done

echo "========================================================"
echo "NEXT STEPS:"
echo "1. Review the future work and current chat context."
echo "2. Propose a plan for the next phase to the user."
echo "3. Once agreed, update 'docs/agent-context/current/task-list.md' and 'docs/agent-context/current/implementation-plan.md'."
echo "4. Prepare to begin the new phase in a new chat session."
echo "========================================================"
EOF
chmod +x scripts/agent/complete-phase-transition.sh

cat << 'EOF' > scripts/agent/resume-phase.sh
#!/bin/bash

# Check if we are in an active phase
if [ ! -s "docs/agent-context/current/task-list.md" ]; then
  echo "Error: No active phase detected (task-list.md is empty)."
  echo "Please use the 'Starting a New Phase' workflow if you are beginning a new phase."
  exit 1
fi

echo "=== Resuming Phase ==="
echo "This script restores the context for an ongoing phase."
echo "It will print the current project state, including the active task list and implementation plan."
echo "Review this output to determine where you left off and what needs to be done next."
echo ""

# Reuse restore-context to dump state
# Get the directory of the current script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
"$SCRIPT_DIR/restore-context.sh"
EOF
chmod +x scripts/agent/resume-phase.sh

# 5. Update AGENTS.md
CORE_CONTENT=$(cat << 'EOF'
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

- `docs/agent-context/plan-outline.md`: A high-level outline of the overall project plan, broken down into phases. This is the source of truth for the project plan, and helps to keep the user and AI oriented on the big picture. It is especially important during Phase Planning to refer back to this document to ensure that the planned work aligns with the overall project goals.
- `docs/agent-context/changelog.md`: A log of completed phases, including summaries of the work done. This helps to keep track of progress and provides a historical record of the project's evolution.
- `docs/agent-context/decisions.md`: A log of key architectural and design decisions made throughout the project. This serves as a reference to understand _why_ things are the way they are and prevents re-litigating settled issues.
- `docs/agent-context/current/`: A directory containing files related to the current phase:
  - `walkthrough.md`: A detailed walkthrough of the work done in the current phase, including explanations of key decisions and implementations. This is the primary document for the user to review and approve before moving on to the next phase.
  - `task-list.md`: A list of tasks to be completed in the current phase. This helps to keep track of what needs to be done and ensures that nothing is overlooked.
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
EOF
)

if [ ! -f AGENTS.md ]; then
    echo "<!-- core start -->" > AGENTS.md
    echo "$CORE_CONTENT" >> AGENTS.md
    echo "<!-- core end -->" >> AGENTS.md
else
    # Check if markers exist
    if grep -q "<!-- core start -->" AGENTS.md && grep -q "<!-- core end -->" AGENTS.md; then
        # Replace content between markers
        # We use perl for multiline replacement because sed is tricky with newlines
        # Pass content via env var to avoid delimiter collision in the regex
        export CORE_CONTENT
        perl -i -0777 -pe 's/<!-- core start -->.*<!-- core end -->/"<!-- core start -->\n" . $ENV{CORE_CONTENT} . "\n<!-- core end -->"/se' AGENTS.md
    else
        # Prepend content
        TEMP_FILE=$(mktemp)
        echo "<!-- core start -->" > "$TEMP_FILE"
        echo "$CORE_CONTENT" >> "$TEMP_FILE"
        echo "<!-- core end -->" >> "$TEMP_FILE"
        cat AGENTS.md >> "$TEMP_FILE"
        mv "$TEMP_FILE" AGENTS.md
    fi
fi

echo "Bootstrap complete."
