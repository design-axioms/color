# Axiomatic Color Concepts

This document explains the high-level concepts of Axiomatic Color.

> **Note**: For the foundational laws and philosophy governing the system, see [The Constitution (Axioms)](docs/design/theory/axioms.md).

## Core Philosophy

Axiomatic Color is designed to be **Platform-Native**, **Adaptive**, and **Automated**.

### Semantics Derived from Accessibility

Our semantic roles (like "Surface", "Action", "Link") are not arbitrary choices. They are derived directly from the **fundamental semantics of the web platform**, specifically the System Colors used by Forced Colors and High Contrast modes.

By aligning our taxonomy with these platform primitives (e.g., `Canvas`, `ButtonFace`, `Highlight`), we ensure that accessibility is not an "add-on" or a "special case." It is the **foundation** of the design. When you design with these concepts, you are designing with the grain of the web, ensuring your application feels native and works perfectly for every user, regardless of their device or settings.

1.  **Semantic:** You pick roles that map to platform primitives.
2.  **Adaptive:** Because the roles are native, the system adapts to Light, Dark, High Contrast, and Forced Colors automatically.
3.  **Automated:** Lightness values are calculated by a solver to guarantee accessible contrast within those roles.

## Surfaces & Context

Everything sits on a **Surface**. A surface is not just a background color; it **sets the rules** for everything inside it (creating a **Context**).

- **`surface-page`**: The application background.
- **`surface-card`**: A contained content area.
- **`surface-action`**: A clickable interactive area (e.g., a button).
- **`surface-spotlight`**: An inverted or high-emphasis area.

When you nest surfaces (e.g., a Card on a Page), the system automatically adjusts the context so that text and borders maintain perfect contrast.

## Foregrounds (Text & Icons)

Text utilities consume the **Context** provided by the surface. You don't need to know _which_ surface you are on; you just declare the hierarchy.

- **`text-strong`** (Default): Primary content. High contrast.
- **`text-subtle`**: Secondary content. Medium contrast.
- **`text-subtler`**: Meta-data or low-emphasis content.
- **`text-link`**: Interactive navigation elements. Uses the brand hue.

## States

Interactive elements have standard states that work across all surfaces.

- **`hover` / `active`**: Interaction feedback.
- **`state-selected`**: For chosen items (e.g., a selected list option). Maps to System Highlight.
- **`state-disabled`**: For non-interactive items. Maps to System GrayText.

## Borders

Borders also consume the surface context.

- **`bordered`**: Adds a decorative border (low contrast) to define the edge of a surface.
- **`border-interactive`**: A higher contrast border for inputs or active elements.
