# Phase Walkthrough: The Runtime Debugger

## Overview

In this phase, we implemented the **Runtime Debugger**, a "X-Ray" tool for the Axiomatic Color System. This tool allows developers to visualize the invisible "Late Binding" context (Surface, Polarity, Intent) directly in the browser, making it easier to understand _why_ a color is rendered the way it is.

## Key Decisions

### 1. Tree-Shakable Architecture

To prevent the debugger code from bloating production bundles, we decided to expose it as a separate entry point (`@axiomatic-design/color/inspector`). This ensures that the debugger code is only included when explicitly imported, allowing for "vanilla dead code elimination" in build tools.

### 2. Vanilla Web Component

We implemented the debugger UI as a **Vanilla Web Component** (`<axiomatic-debugger>`) using Shadow DOM. This choice provides:

- **Style Isolation**: The debugger's styles do not bleed into the host application, and the host's styles do not affect the debugger.
- **Framework Agnostic**: The debugger can be used with any framework (React, Svelte, Vue, etc.) or no framework at all.
- **Zero Dependencies**: The debugger has no external runtime dependencies, keeping it lightweight.

### 3. Testing Strategy (Happy-DOM)

We initially considered `jsdom` but opted for `happy-dom` for its superior performance. During testing, we encountered limitations with `happy-dom`'s support for `@property` and full CSS cascade resolution when loading external stylesheets. To work around this, we adopted an **Inline Style Mocking** strategy for unit tests, focusing on verifying the _logic_ of variable resolution and DOM traversal rather than the browser's CSS engine itself.

## Implementation Details

### Core Logic (`src/lib/inspector/`)

- **`walker.ts`**: Implements `findContextRoot`, which traverses the DOM upwards to find the nearest element defining a surface context (indicated by `--bg-surface`).
- **`resolver.ts`**: Implements `resolveTokens`, which reads computed styles and resolves "Indirection Variables" (like `--text-lightness-source`) back to their semantic tokens.
- **`types.ts`**: Defines the `DebugContext` and `ResolvedToken` interfaces.

### UI Component (`src/lib/inspector/overlay.ts`)

- **`AxiomaticDebugger`**: A custom element that manages the overlay UI.
- **Highlight Box**: Uses `element.getClientRects()` to draw precise highlights around target elements.
- **Info Card**: Displays the resolved context (Surface, Polarity) and token values in a floating card.

### Integration

- **Package Export**: Updated `package.json` to export `./inspector`.
- **Site Integration**: Added the debugger to the documentation site via `site/src/components/StarlightHead.astro`, enabling it in development and preview modes.

## Verification

- **Unit Tests**: Verified the core logic using `vitest` and `happy-dom`.
- **Dogfooding**: Integrated the debugger into the documentation site, allowing us to inspect the site's own surfaces and tokens.
