#!/bin/bash

echo "=== Project Goals (Plan Outline) ==="
if [ -f "docs/agent-context/brain/state/plan.md" ]; then
    cat docs/agent-context/brain/state/plan.md
elif [ -f "docs/agent-context/plan-outline.md" ]; then
    # Legacy path (kept for older epochs)
    cat docs/agent-context/plan-outline.md
else
    echo "No plan outline found."
fi
echo ""

echo "=== Architecture & Decisions ==="
if [ -f "docs/agent-context/brain/decisions/log.md" ]; then
    cat docs/agent-context/brain/decisions/log.md
elif [ -f "docs/agent-context/decisions.md" ]; then
    # Legacy path (kept for older epochs)
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

echo "--- Active Tasks ---"
if [ -f "docs/agent-context/brain/state/active_tasks.md" ]; then
    cat docs/agent-context/brain/state/active_tasks.md
elif [ -f "docs/agent-context/current/task-list.md" ]; then
    # Legacy path (kept for older epochs)
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

echo "--- Report (Optional) ---"
if [ -f "docs/agent-context/current/report.md" ]; then
    cat docs/agent-context/current/report.md
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
