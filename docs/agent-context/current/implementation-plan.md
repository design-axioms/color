# Implementation Plan - Epoch 13 Phase 3: Framework-Specific Integration

## Goal
Provide specific, copy-pasteable implementation guides for major frameworks (React, Svelte, HTML) and a true "Zero to UI" Quick Start experience. This addresses the "Golden Path" gap identified in the Fresh Eyes review.

## User Stories
- **Sarah (The Overwhelmed Pragmatist)**: "I want to copy-paste a code snippet into my React app and have a working, accessible card component immediately."
- **Marcus (The System Architect)**: "I want TypeScript types for my tokens so my team doesn't have to guess string literals."

## Key Deliverables

### 1. TypeScript Export (`color-system export --format typescript`)
- **Why**: Enables type-safe usage of tokens in JS/TS files.
- **What**: A new exporter in the CLI that generates a `.ts` or `.d.ts` file containing the token names as a union type or object.
- **Usage**: `import { tokens } from './theme.ts'` or `type Token = keyof typeof tokens`.

### 2. Framework Guides
- **React Guide**:
  - Setup (CLI + CSS import).
  - `Surface` component (Context provider wrapper).
  - `ThemeToggle` component.
  - Example: Building a Card.
- **Svelte Guide**:
  - Setup.
  - `Surface` component.
  - `ThemeToggle` component.
  - Example: Building a Card.
- **HTML Guide**:
  - Setup.
  - Utility classes vs. CSS Variables.
  - Script for Theme Toggling.

### 3. "Real" Quick Start
- **Why**: The current Quick Start ends at `theme.css`.
- **What**: A new `docs/guides/quick-start.mdx` that:
  1.  Installs the tool.
  2.  Generates the theme.
  3.  **Shows the code** to render a UI element (using the HTML approach for universality, with tabs for React/Svelte).

## Execution Steps

1.  **CLI Update**: Implement `typescript` format in `src/cli/commands/export.ts`.
2.  **Documentation**:
    - Create `docs/guides/frameworks/react.mdx`.
    - Create `docs/guides/frameworks/svelte.mdx`.
    - Create `docs/guides/frameworks/html.mdx`.
    - Update `docs/guides/quick-start.mdx` (or `index.mdx`).
3.  **Verification**:
    - Verify the TypeScript export works in a real file.
    - Verify the code snippets in the docs are copy-pasteable and working.

## Risks
- **Scope Creep**: Trying to build a full component library. **Mitigation**: Focus only on the *primitives* (`Surface`, `Text`) needed to use the system, not a full UI kit.
