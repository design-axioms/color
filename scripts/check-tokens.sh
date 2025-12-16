#!/bin/bash
# Check for usage of Starlight tokens or raw Axiomatic tokens in the components directory

ERROR=0

if grep -r "var(--sl-" site/src/components | grep -v "var(--sl-font-"; then
  echo "Error: Starlight tokens (var(--sl-...)) found in components (excluding fonts)."
  ERROR=1
fi

if grep -rE "var\(--(axm-)?(surface|text|border)-.*-token\)" site/src/components; then
  echo "Error: Raw Axiomatic color tokens (var(--...-token)) found in components."
  echo "Please use the Color System classes instead:"
  echo "  - Surfaces: .surface-{slug} (e.g. .surface-card)"
  echo "  - Text: .text-{role} (e.g. .text-subtle)"
  echo "  - Borders: .bordered or .border-interactive"
  ERROR=1
fi

if grep -rE "var\(--axm-.*\)" site/src/components | grep -v "var(--axm-chart-"; then
  echo "Error: Generated Axiomatic tokens (var(--axm-...)) found in components."
  echo "Please use the utility classes instead."
  ERROR=1
fi

if [ $ERROR -eq 1 ]; then
  echo "Please use the Color System (Surfaces, Hues, Foregrounds) via CSS classes instead."
  exit 1
else
  echo "Token check passed."
  exit 0
fi
