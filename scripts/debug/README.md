# Debug Scripts

This directory contains specialized scripts for debugging the Axiomatic Color System. These scripts are designed to be run with `ts-node` (or `node` directly if using Node 24+ with native TS support).

## Available Scripts

### `debug-css-cascade.ts`

**Purpose**: Diagnoses CSS cascade issues, specifically looking for semantic violations where hardcoded colors or incorrect tokens override the system's axiomatic layers.

**Usage**:

```bash
# Basic usage (inspects cascade for a selector)
node scripts/debug/debug-css-cascade.ts <url> <selector>

# Auto Mode (detects semantic violations)
node scripts/debug/debug-css-cascade.ts <url> <selector> auto
```

**Example**:

```bash
node scripts/debug/debug-css-cascade.ts http://localhost:4321/ .surface-card auto
```

### `debug-hero.ts`

**Purpose**: Debugs the "Hero" section of the landing page or documentation, verifying that the layout and color tokens are applied correctly.

**Usage**:

```bash
node scripts/debug/debug-hero.ts <url>
```

### `debug-visualizer.ts`

**Purpose**: Debugs the `HueShiftVisualizer` and other interactive components to ensure they are rendering the correct SVG paths and handling user input properly.

**Usage**:

```bash
node scripts/debug/debug-visualizer.ts <url>
```

## Prerequisites

- Ensure the development server is running (`locald up` or `pnpm dev:site`).
- These scripts use Playwright to launch a headless browser.
