---
title: CLI Reference
---

The `axiomatic` CLI is the primary tool for generating your theme tokens.

## Installation

```bash
pnpm add -D @axiomatic-design/color

# Best-effort (pnpm is recommended for this repo)
npm install -D @axiomatic-design/color
```

## Usage

```bash
# Recommended when installed as a dev dependency
pnpm exec axiomatic [command] [options]

# One-off / quick try
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
- `--copy-engine`: Copy `engine.css` next to the output CSS (useful for simple integrations).

**Examples:**

```bash
# Use defaults
npx axiomatic build

# Watch mode
npx axiomatic build --watch

# Custom paths
npx axiomatic build --config ./design/colors.json --out ./src/variables.css

# Copy engine.css next to your output
npx axiomatic build --copy-engine
```

**Notes:**

- `build` also emits a class-token manifest alongside your CSS output:
  - If `--out` is `theme.css`, you’ll also get `theme.class-tokens.json`.
  - Otherwise you’ll get `<out>.class-tokens.json`.
- If you run `axiomatic` with no command, it runs `build`.

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

**Semantics:**

`audit` is designed to be **advisory**: it reports schema and logic findings, but not every finding is treated as a hard failure.

### `import`

Imports a DTCG token file into an Axiomatic configuration.

```bash
npx axiomatic import <file> [--out <file>] [--dry-run]
```

**Notes:**

- Intended as a migration tool: it produces a `color-config.json`-compatible output.

## Output

The `build` command generates a CSS file containing:

1.  **:root Variables**: Global tokens like shadows, focus rings, and data viz colors.
2.  **Surface Classes**: Classes for each surface defined in your config (e.g., `.surface-card`).
3.  **High Contrast Media Query**: A `@media (prefers-contrast: more)` block with accessible overrides.

It also generates a class-token manifest (`*.class-tokens.json`) which is used for enforcement and tooling.

### Integration

Import the generated file in your main CSS entry point:

```css
@import "@axiomatic-design/color/engine.css";
@import "./theme.css";
```

### Legacy shorthand

For compatibility, the CLI supports the legacy shorthand form:

```bash
npx axiomatic <config> <out>
```

This is treated as `build --config <config> --out <out>`.
