#!/bin/bash
# Check for usage of Starlight tokens or raw Axiomatic tokens in the components directory

ERROR=0

if grep -r "var(--sl-" site/src/components; then
  echo "Error: Starlight tokens (var(--sl-...)) found in components."
  ERROR=1
fi

if grep -r "var(--.*-token)" site/src/components; then
  echo "Error: Raw Axiomatic tokens (var(--...-token)) found in components."
  ERROR=1
fi

if [ $ERROR -eq 1 ]; then
  echo "Please use the Color System (Surfaces, Hues, Foregrounds) via CSS classes instead."
  exit 1
else
  echo "Token check passed."
  exit 0
fi
