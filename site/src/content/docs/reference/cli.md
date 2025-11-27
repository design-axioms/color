---
title: CLI Reference
---

The `color-system` CLI is the primary tool for generating your theme tokens.

## Installation

```bash
pnpm add -D color-system
# or
npm install -D color-system
```

## Usage

```bash
npx color-system [command] [options]
```

## Commands

### `init`

Scaffolds a new configuration file in your project.

```bash
npx color-system init
```

**Behavior:**
- Checks if `color-config.json` exists.
- If not, creates it with the default configuration.
- If it exists, exits with an error to prevent overwriting.

### `generate` (Default)

Generates the CSS tokens based on your configuration. If no command is specified, this is the default behavior.

```bash
npx color-system [config-file] [output-file]
```

**Arguments:**

1.  **`config-file`** (Optional)
    -   Path to your JSON configuration file.
    -   **Default**: `./color-config.json`

2.  **`output-file`** (Optional)
    -   Path where the generated CSS will be written.
    -   **Default**: `./theme.css`

**Examples:**

```bash
# Use defaults
npx color-system

# Custom config, default output
npx color-system ./design/my-colors.json

# Custom config and output
npx color-system ./design/my-colors.json ./src/styles/variables.css
```

## Output

The CLI generates a CSS file containing:

1.  **:root Variables**: Global tokens like shadows, focus rings, and data viz colors.
2.  **Surface Classes**: Classes for each surface defined in your config (e.g., `.surface-card`).
3.  **High Contrast Media Query**: A `@media (prefers-contrast: more)` block with accessible overrides.

### Integration

Import the generated file in your main CSS entry point:

```css
@import "./theme.css";
```
