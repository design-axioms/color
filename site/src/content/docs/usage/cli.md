---
title: CLI Usage
---

The `color-system` CLI is the primary tool for generating your theme tokens.

## Installation

```bash
pnpm add -D color-system
# or
npm install -D color-system
```

## Commands

### `init`

Scaffolds a new configuration file in your project.

```bash
npx color-system init
```

This creates a `color-config.json` file with default settings.

### Generate

Generates the CSS tokens based on your configuration.

```bash
npx color-system [config-file] [output-file]
```

- **`config-file`**: Path to your JSON config (default: `./color-config.json`).
- **`output-file`**: Path where the CSS will be written (default: `./theme.css`).

**Example:**

```bash
npx color-system ./design/colors.json ./src/styles/theme.css
```

## Configuration

The configuration file controls the Theme Builder. See the [Theme Builder API](../api/theme-builder.md) for details on how the math works.

```json
{
  "anchors": { ... },
  "groups": [ ... ],
  "hueShift": { ... }
}
```