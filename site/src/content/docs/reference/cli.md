---
title: CLI Reference
---

The `axiomatic` CLI is the primary tool for generating your theme tokens.

## Installation

```bash
pnpm add -D @axiomatic-design/color
# or
npm install -D @axiomatic-design/color
```

## Usage

```bash
npx axiomatic [command] [options]
```

## Commands

### `init`

Scaffolds a new configuration file in your project.

```bash
npx axiomatic init
```

**Behavior:**

- Checks if `color-config.json` exists.
- If not, creates it with the default configuration (including the `$schema` reference).
- If it exists, exits with an error to prevent overwriting.

### `build` (Default)

Generates the CSS tokens based on your configuration. If no command is specified, this is the default behavior.

```bash
npx axiomatic build [options]
```

**Options:**

- `--config <path>`: Path to your JSON configuration file. (Default: `./color-config.json`)
- `--out <path>`: Path where the generated CSS will be written. (Default: `./theme.css`)
- `--watch`: Watch for changes in the config file and rebuild automatically.

**Examples:**

```bash
# Use defaults
npx axiomatic build

# Watch mode
npx axiomatic build --watch

# Custom paths
npx axiomatic build --config ./design/colors.json --out ./src/variables.css
```

### `export`

Exports your theme tokens to other formats (DTCG, Tailwind, TypeScript).

```bash
npx axiomatic export [options]
```

**Options:**

- `--format <format>`: The output format. Supported: `dtcg`, `tailwind`, `typescript`. (Default: `dtcg`)
- `--out <path>`: Output file or directory.
  - For `dtcg`: Defaults to `./tokens/` (Directory).
  - For `tailwind`: Defaults to `./tailwind.preset.js`.
  - For `typescript`: Defaults to `./theme.ts`.
- `--config <path>`: Path to config file.

**Examples:**

```bash
# Export DTCG tokens to ./tokens/ directory
npx axiomatic export --format dtcg

# Export as a single JSON file
npx axiomatic export --format dtcg --out tokens.json

# Export Tailwind preset
npx axiomatic export --format tailwind
```

### `audit`

Audits your configuration and generated theme for accessibility and logic errors.

```bash
npx axiomatic audit
```

**Checks:**

- **Schema Validation**: Ensures your JSON config matches the schema.
- **Contrast Compliance**: Verifies that all surfaces meet APCA contrast guidelines.
- **Polarity Logic**: Ensures "Page" surfaces are light in Light Mode, and "Inverted" surfaces are dark.

## Output

The `build` command generates a CSS file containing:

1.  **:root Variables**: Global tokens like shadows, focus rings, and data viz colors.
2.  **Surface Classes**: Classes for each surface defined in your config (e.g., `.surface-card`).
3.  **High Contrast Media Query**: A `@media (prefers-contrast: more)` block with accessible overrides.

### Integration

Import the generated file in your main CSS entry point:

```css
@import "./theme.css";
```
