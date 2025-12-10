#!/bin/bash

# Vercel Ignore Step Script
# Returns 0 to SKIP the build.
# Returns 1 to PROCEED with the build.

# If this is the first deployment (no previous SHA), always build.
if [ -z "$VERCEL_GIT_PREVIOUS_SHA" ]; then
  echo "No previous SHA found. Proceeding with build."
  exit 1
fi

# Check for changes in watched directories/files between the last deployment and the current commit.
# We use --quiet which implies --exit-code.
# Exit code 1 means differences were found (Build).
# Exit code 0 means no differences were found (Skip).
git diff --quiet "$VERCEL_GIT_PREVIOUS_SHA" "$VERCEL_GIT_COMMIT_SHA" -- \
  site/ \
  src/ \
  css/ \
  packages/ \
  color-config.json \
  package.json \
  pnpm-lock.yaml \
  pnpm-workspace.yaml \
  vercel.json

# Capture the exit code
EXIT_CODE=$?

if [ $EXIT_CODE -eq 1 ]; then
  echo "Changes detected in watched files. Proceeding with build."
else
  echo "No changes in watched files. Skipping build."
fi

exit $EXIT_CODE
