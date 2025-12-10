# Website Polish & Remediation Plan

> **Status**: Draft
> **Date**: 2025-12-08
> **Context**: Post-review "Fresh Eyes" analysis of the documentation site.

## Overview

This document outlines the friction points identified during the "Fresh Eyes" review of the documentation site and proposes specific remediation steps. The goal is to lower the barrier to entry for new users (Sarah), enable easier experimentation (Alex), and provide concrete integration steps (Marcus).

## 1. Landing Page Clarity

**Persona**: Sarah (Overwhelmed Pragmatist)

### Issues

1.  **Misleading Terminology**: The section titled "Quick Start" on the landing page (`index.mdx`) is actually a feature showcase/demo, not a tutorial. The actual Quick Start is a separate guide.
2.  **Missing Context**: The page jumps immediately into code snippets without a clear "Elevator Pitch" explaining what the tool is (Library? Framework? CLI?).

### Proposed Fixes

- **Rename Section**: Change "Quick Start" on the landing page to **"At a Glance"** or **"See it in Action"**.
- **Add Elevator Pitch**: Insert a concise definition above the fold.
  > "Axiomatic Color is a CSS framework and CLI that automates accessibility, dark mode, and consistency using a physics-based constraint solver."

## 2. Quick Start Guide Consistency

**Persona**: Sarah (Overwhelmed Pragmatist)

### Issues

1.  **Cognitive Overload**: The React example in `guides/quick-start.mdx` introduces the `tokens` object (`style={{ color: tokens.context.text.high }}`) while the HTML example uses utility classes (`class="text-strong"`). This forces the user to learn two mental models simultaneously.

### Proposed Fixes

- **Standardize on Classes**: Rewrite the React example in the Quick Start to use standard string classes (e.g., `className="surface-card"`). This aligns with the HTML example and reduces initial friction.
- **Defer Complexity**: Move the `tokens` object (Type-safe API) documentation to the dedicated **Frameworks > React** guide.

## 3. Configuration & Customization

**Persona**: Alex (Visual Tinkerer)

### Issues

1.  **Hard to Find Customization**: Users looking to "just set my brand color" cannot find a simple example in `guides/configuration.mdx`. The docs point to complex theory pages instead.

### Proposed Fixes

- **Add "Customizing Colors" Section**: Insert a prominent section in `guides/configuration.mdx` with a copy-pasteable snippet.
  ```json
  {
    "anchors": {
      "brand": "#0055FF"
    }
  }
  ```

## 4. Integration & Interoperability

**Persona**: Marcus (System Architect)

### Issues

1.  **Vague Tailwind Instructions**: The `guides/integration.md` mentions a roadmap plugin but offers no immediate solution.
2.  **Naming Inconsistency**: The discrepancy between JS tokens (`text.high`) and CSS classes (`.text-strong`) creates confusion about the source of truth.

### Proposed Fixes

- **Provide Tailwind Config**: Add a concrete `tailwind.config.js` snippet to `guides/integration.md` that maps the core semantic tokens to the CSS variables.
  ```javascript
  // tailwind.config.js
  module.exports = {
    theme: {
      extend: {
        colors: {
          surface: {
            card: "var(--surface-card)",
            // ...
          },
        },
      },
    },
  };
  ```
- **Clarify Naming**: Add a "Token vs. Class" mapping table in the Reference section or Integration guide to explain the relationship.

## 5. Additional Improvements (User Requested)

- [ ] **Simplify Math in Prose**: In "Physics of Light" and introductory sections, remove mathematical variables ($\alpha$, $\nu$, etc.) from main prose and headings. Move them to "Deep Dive" asides or link to the Algebra theory page.
- [ ] **Fix Algebra Documentation**: `site/src/content/docs/theory/algebra.mdx` appears corrupted/truncated. Sync it with the source of truth in `docs/design/theory/composition-algebra.md`.
