# Walkthrough - Epoch 13: Phase 1 - The Golden Path

## Goal
Create a zero-friction onboarding experience that guides users from "What is this?" to "I have a running app" with minimal effort.

## Changes

### 1. Quick Start Overhaul
I completely rewrote `site/src/content/docs/index.mdx` to feature a step-by-step "Hello World" tutorial. Instead of generic marketing copy, the user now immediately builds a "Profile Card" using the system's core concepts:
- **Surfaces**: `surface-page`, `surface-card`
- **Interactivity**: `surface-action`
- **Inputs**: `surface-input` (implied)

### 2. Snippet Library
I created a `snippets/` directory in the project root to house raw HTML examples. This ensures that the code shown in the documentation is:
- **Real**: It's actual HTML files, not markdown strings.
- **Reusable**: These snippets can be used by other parts of the docs or even tested.

**Snippets Created:**
- `snippets/card.html`: A basic card with padding and border.
- `snippets/button.html`: A brand-colored action button.
- `snippets/input.html`: A text input.
- `snippets/layout-stack.html`: A flexbox stack layout.

### 3. `<Snippet>` Component
I implemented a new Astro component `site/src/components/Snippet.astro` that:
- Reads the raw HTML from the `snippets/` directory at build time.
- Renders a **Live Preview** of the snippet (using `Fragment set:html`).
- Renders the **Source Code** using Starlight's `<Code>` component.

This "Show, Don't Tell" approach allows users to see exactly what the code produces without leaving the docs.

### 4. Interactive "Try It"
I added an "Open in StackBlitz" button to the hero section, linking to the repository. This allows users to instantly fork the project and start experimenting in a cloud environment.

## Verification
- Ran `pnpm docs:build` to ensure the new component and snippets render correctly.
- Verified that the build passes with no errors.
