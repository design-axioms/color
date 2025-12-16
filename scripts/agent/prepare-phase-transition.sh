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
if [ -f "docs/agent-context/brain/state/plan.md" ]; then
    echo "--- docs/agent-context/brain/state/plan.md ---"
    cat docs/agent-context/brain/state/plan.md
    echo ""
fi

echo "========================================================"
echo "REMINDER:"
echo "1. Update 'docs/agent-context/changelog.md' with completed work."
echo "2. Update 'docs/agent-context/brain/decisions/log.md' with key decisions."
echo "3. Update 'docs/agent-context/brain/state/plan.md' to reflect progress."
echo "4. Run 'scripts/agent/complete-phase-transition.sh \"<commit_message>\"' to finalize."
echo "========================================================"
