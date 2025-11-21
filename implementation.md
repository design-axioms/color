# Color System Implementation

This document details the technical implementation of the color system.

## Architecture

The system is built on **CSS Variables** and **OKLCH** color space.

### Directory Structure

- **`css/`**: Contains the CSS files.
  - `base.css`: The generated base variables.
  - `tokens.css`: The semantic token definitions.
  - `logic.css`: The core calculation logic.
  - `utilities.css`: The utility classes exposed to the developer.
- **`scripts/`**: Contains the TypeScript scripts for solving and generating colors.

## The Solver

The heart of the system is the **Surface Lightness Solver** (`scripts/surface-lightness-solver.mts`).

### How it works

1.  **Configuration**: It reads `scripts/surface-lightness.config.json` which defines the surfaces and their desired contrast relationships.
2.  **Anchors**: It uses "anchors" (start and end lightness values) for light and dark modes.
3.  **Solving**: It solves for the optimal background lightness for each surface to meet the target contrast ratios.
4.  **Output**: It writes the calculated values to `css/base.css`.

## Look-Up Table (LUT)

For performance and static analysis, we also generate a Look-Up Table (`css/lightness-lut.css`) using `scripts/lightness-lut-sketch.mts`. This file contains pre-calculated values for common surface/foreground combinations.

## Running the Scripts

- **Solve**: `pnpm solve` - Recalculates surface lightnesses.
- **Sketch**: `pnpm sketch` - Regenerates the LUT.
- **Debug**: `pnpm debug` - Checks contrast ratios and reports issues.
