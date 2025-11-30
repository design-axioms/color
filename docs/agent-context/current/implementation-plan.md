# Implementation Plan - Epoch 13: Phase 1 - The Golden Path

## Goal

Create a zero-friction onboarding experience that guides users from "What is this?" to "I have a running app" with minimal effort.

## Proposed Changes

### 1. Quick Start Overhaul

- **Current State**: The "Quick Start" is mostly installation instructions (`pnpm add ...`).
- **New State**: A step-by-step tutorial that builds a simple UI (e.g., a "Profile Card").
- **Content**:
  - Step 1: Install & Init.
  - Step 2: The "Hello World" of Surfaces (wrapping content in `surface-page`).
  - Step 3: Adding a Card (nesting `surface-card`).
  - Step 4: Adding Interactivity (Buttons).
- **Files**: `site/src/content/docs/index.mdx` (or a new `getting-started.mdx`).

### 2. Embedded Snippets (The "Snippet Library")

- **Concept**: A set of copy-pasteable HTML/CSS patterns that use the system's tokens correctly.
- **Implementation**:
  - Create a `snippets/` directory in the repo root containing raw HTML files for:
    - `card.html`
    - `button.html`
    - `input.html`
    - `layout-stack.html`
  - Create a `<Snippet>` component in the docs site that reads these files and displays them with a "Copy" button and a live preview.
- **Files**: `snippets/*.html`, `site/src/components/Snippet.astro`.

### 3. Interactive "Try It"

- **Concept**: One-click access to a live environment.
- **Implementation**:
  - Create a `stackblitz.config.js` or similar configuration for a starter project.
  - Add a "Open in StackBlitz" button to the hero section of the docs.
- **Files**: `site/src/content/docs/index.mdx`.

## Verification Plan

- **Manual**: Walk through the new Quick Start as a "fresh user" (Sarah).
- **Automated**: Ensure snippets render correctly in the docs build.
