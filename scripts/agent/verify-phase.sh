#!/bin/bash

# Ensure we are running from the workspace root
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
WORKSPACE_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"
cd "$WORKSPACE_ROOT" || exit 1

echo "=== Running Verification ==="
if [ -f "scripts/check" ]; then
    ./scripts/check
else
    echo "Error: scripts/check not found in $WORKSPACE_ROOT"
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
