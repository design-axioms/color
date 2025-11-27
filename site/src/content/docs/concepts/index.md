---
title: Core Concepts
---

This section details the fundamental building blocks of the color system.

- **[Surfaces](./surfaces.md)**: The containers that create context.
- **[Context](./context.md)**: How polarity and mode affect color calculation.
- **[Accessibility](./accessibility.md)**: How the system handles high contrast and print.

## Surfaces & Context

Everything sits on a **Surface**. A surface is not just a background color; it creates a **Context** for everything inside it.

<div class="docs-grid">
  <div class="surface-page docs-p-4 docs-rounded docs-border">
    <strong>Page</strong>
    <div class="text-subtle">Background</div>
  </div>
  <div class="surface-card docs-p-4 docs-rounded">
    <strong>Card</strong>
    <div class="text-subtle">Content</div>
  </div>
  <div class="surface-action docs-p-4 docs-rounded">
    <strong>Action</strong>
    <div class="text-subtle">Interactive</div>
  </div>
  <div class="surface-spotlight docs-p-4 docs-rounded">
    <strong>Spotlight</strong>
    <div class="text-subtle">Emphasis</div>
  </div>
</div>

When you nest surfaces (e.g., a Card on a Page), the system automatically adjusts the context so that text and borders maintain perfect contrast.

## Foregrounds (Text & Icons)

Text utilities consume the **Context** provided by the surface. You don't need to know _which_ surface you are on; you just declare the hierarchy.

<div class="surface-card docs-p-4 docs-rounded">
  <div class="text-strong">Text Strong (Primary)</div>
  <div class="text-subtle">Text Subtle (Secondary)</div>
  <div class="text-subtler">Text Subtler (Meta)</div>
  <div class="text-link">Text Link (Interactive)</div>
</div>

- **`text-strong`** (Default): Primary content. High contrast.
- **`text-subtle`**: Secondary content. Medium contrast.
- **`text-subtler`**: Meta-data or low-emphasis content.
- **`text-link`**: Interactive navigation elements. Uses the brand hue.

## States

Interactive elements have standard states that work across all surfaces.

<div class="docs-flex surface-card docs-p-4 docs-rounded">
  <button class="surface-action docs-p-2 docs-rounded">Normal</button>
  <button class="surface-action state-selected docs-p-2 docs-rounded">Selected</button>
  <button class="surface-action state-disabled docs-p-2 docs-rounded">Disabled</button>
</div>

- **`hover` / `active`**: Interaction feedback.
- **`state-selected`**: For chosen items (e.g., a selected list option). Maps to System Highlight.
- **`state-disabled`**: For non-interactive items. Maps to System GrayText.

## Borders

Borders also consume the surface context.

<div class="docs-grid">
  <div class="surface-card docs-p-4 docs-rounded bordered">
    <strong>Bordered</strong>
    <div class="text-subtle">Decorative edge</div>
  </div>
  <div class="surface-card docs-p-4 docs-rounded bordered border-interactive">
    <strong>Interactive</strong>
    <div class="text-subtle">Input / Active edge</div>
  </div>
</div>

- **`bordered`**: Adds a decorative border (low contrast) to define the edge of a surface.
- **`border-interactive`**: A higher contrast border for inputs or active elements.