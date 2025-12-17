#!/usr/bin/env bash
set -euo pipefail

# Runs the repo build in a way that does not leave regenerated artifacts dirty.
# This script is intended for git hooks (pre-push) where we want validation
# without requiring developers to commit generator formatting deltas.

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

# Files that `pnpm build` regenerates as part of validation.
# These are tracked and can become dirty due to formatting differences.
READONLY_RESTORE_PATHS=(
  "css/theme.css"
  "color-config.schema.json"
)

TMP_DIR="$(mktemp -d)"
cleanup() {
  # Restore the original working tree versions of the regenerated files.
  for rel in "${READONLY_RESTORE_PATHS[@]}"; do
    if [[ -f "$TMP_DIR/$rel" ]]; then
      mkdir -p "$(dirname "$rel")"
      cp "$TMP_DIR/$rel" "$rel"
    fi
  done

  rm -rf "$TMP_DIR"
}
trap cleanup EXIT

# Snapshot current working tree content for the files we plan to restore.
for rel in "${READONLY_RESTORE_PATHS[@]}"; do
  if [[ -f "$rel" ]]; then
    mkdir -p "$TMP_DIR/$(dirname "$rel")"
    cp "$rel" "$TMP_DIR/$rel"
  fi
done

pnpm build
