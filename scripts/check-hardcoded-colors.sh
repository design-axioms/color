#!/bin/bash

# Define colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

echo "Checking for hardcoded colors in site/src..."

# Define patterns to search for
# 1. Hex codes
# 2. rgb/rgba/hsl/hsla/oklch (excluding 'from var')
# 3. Common named colors (white, black, red, blue, green, etc. - risky but useful)

# Files to check: site/src/styles/docs.css, site/src/components
# Exclude: theme.css, node_modules

ERROR_FOUND=0

# Function to check a file
check_file() {
    local file=$1
    # Search for Hex
    if grep -E "#[0-9a-fA-F]{3,6}" "$file" | grep -v "var(" | grep -v "{#" > /dev/null; then
        echo -e "${RED}Found Hex color in $file${NC}"
        grep -nE "#[0-9a-fA-F]{3,6}" "$file" | grep -v "var(" | grep -v "{#"
        ERROR_FOUND=1
    fi

    # Search for Color Functions (excluding relative color syntax 'from var')
    if grep -E "(rgb|hsl|oklch)\(" "$file" | grep -v "from var" | grep -v "light-dark" > /dev/null; then
        echo -e "${RED}Found color function in $file${NC}"
        grep -nE "(rgb|hsl|oklch)\(" "$file" | grep -v "from var" | grep -v "light-dark"
        ERROR_FOUND=1
    fi
    
    # Search for specific named colors (white, black) as they are common offenders
    # We need to be careful not to match text content, so we look for ": white" or ": black" or "color: white" etc.
    if grep -E ":\s*\b(white|black|red|blue|green|yellow|orange|purple|gray)\b" "$file" > /dev/null; then
         echo -e "${RED}Found named color in $file${NC}"
         grep -nE ":\s*\b(white|black|red|blue|green|yellow|orange|purple|gray)\b" "$file"
         ERROR_FOUND=1
    fi

    # Search for internal token usage (--axm-)
    # We want to discourage using these directly in components/pages
    if grep "\-\-axm-" "$file" > /dev/null; then
         echo -e "${RED}Found internal token usage in $file${NC}"
         grep -n "\-\-axm-" "$file"
         ERROR_FOUND=1
    fi
}

# Find files to check
FILES=$(find site/src/styles site/src/components -type f \( -name "*.css" -o -name "*.svelte" -o -name "*.astro" \) | grep -v "theme.css" | grep -v "starlight-overrides.css" | grep -v "GlobalInspector.svelte" | grep -v "HueShiftVisualizer.svelte" | grep -v "DataVizDemo.svelte" | grep -v "LuminanceSpectrum.svelte" | grep -v "ContrastBadge.svelte" | grep -v "ContrastStabilityDemo.svelte" | grep -v "docs.css")

for file in $FILES; do
    check_file "$file"
done

if [ $ERROR_FOUND -eq 1 ]; then
    echo -e "${RED}Hardcoded colors found!${NC}"
    exit 1
else
    echo -e "${GREEN}No hardcoded colors found.${NC}"
    exit 0
fi
