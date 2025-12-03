#!/bin/bash

# 1. Update Mermaid
# Directory to store the mermaid script
DEST_DIR="docs/guide/js"
mkdir -p "$DEST_DIR"

# URL for the latest mermaid.min.js (using jsdelivr to get the latest version)
MERMAID_URL="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"

echo "Fetching latest mermaid.min.js from $MERMAID_URL..."
curl -L "$MERMAID_URL" -o "$DEST_DIR/mermaid.min.js"

if [ $? -eq 0 ]; then
  echo "Successfully updated mermaid.min.js in $DEST_DIR"
else
  echo "Failed to download mermaid.min.js"
  exit 1
fi

# 2. Update Color System CSS
echo "Updating Color System CSS..."

# Ensure the output directory exists
mkdir -p docs/guide/css

# Run the solver to ensure theme.css is up to date
pnpm solve

# Concatenate the CSS files and remove @import statements
cat css/engine.css css/utilities.css css/theme.css | sed '/^@import/d' > docs/guide/css/color-system.css

if [ $? -eq 0 ]; then
  echo "Successfully updated docs/guide/css/color-system.css"
else
  echo "Failed to update color-system.css"
  exit 1
fi
