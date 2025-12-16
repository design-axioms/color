# Solver Architecture

The Solver is the mathematical engine of the Axiomatic Color System. It takes a high-level configuration (Anchors, Surfaces, Key Colors) and produces a concrete Theme (Hex codes, CSS variables).

## Pipeline

The solving process follows a strict pipeline:

### 1. Normalize (`planner.ts`)

- **Anchor Alignment**: Ensures inverted mode anchors are derived from key colors.
- **Syncing**: Synchronizes Dark Mode contrast ranges to match Light Mode (preserving "Delta Contrast").

### 2. Plan (`planner.ts`)

- **Sequence Generation**: Calculates the "ideal" contrast for every surface in a sequence.
- **Constraint Solving**: Clamps these ideal values to the physical reality of the anchors (e.g., you can't have more contrast than Black on White).
- **Binary Search**: Uses `solveBackgroundForContrast` to find the exact Lightness value that yields the target contrast.

### 3. Resolve (`resolver.ts`)

- **Key Color Extraction**: Analyzes brand colors to determine default Hue and Chroma.
- **Hue Shifting**: Applies the Bezold-Brücke effect simulation (shifting hue based on lightness).
- **Chart Generation**: Generates data visualization palettes.
- **Primitive Generation**: Generates shadows, focus rings, and other UI primitives.

### 4. Emit (`index.ts`)

- **Assembly**: Combines all solved pieces into a `Theme` object.
- **Overrides**: Applies manual overrides from the config.

## Key Concepts

- **Anchors**: The fixed points of the system (e.g., "Page Background" and "Text Color").
- **Sequences**: Ordered lists of surfaces (e.g., "Default", "Subtle", "Card").
- **Delta Contrast**: The difference in contrast between steps in a sequence. We try to preserve this across modes.
