# Color System Concepts

This document explains the high-level concepts of the color system.

## Core Philosophy

The color system is designed to be **semantic** and **adaptive**. Instead of picking hex codes, you pick **roles** (like "surface", "foreground", "border") and **modifiers** (like "strong", "subtle", "accent").

## Surfaces

Everything sits on a **Surface**. A surface defines the background color and sets the context for the text and borders on top of it.

- **`surface-page`**: The base background of the application.
- **`surface-card`**: A card-like element.
- **`surface-overlay`**: A modal or dropdown.

## Foregrounds (Text & Icons)

Text colors are defined relative to the surface they are on. This ensures accessible contrast automatically.

- **`fg-strong`**: High contrast text (headings, primary actions).
- **`fg-subtle`**: Medium contrast text (body copy, secondary info).
- **`fg-subtler`**: Low contrast text (placeholders, disabled states).

## Borders

Borders also adapt to the surface.

- **`border-strong`**: High contrast border.
- **`border-subtle`**: Low contrast border (dividers).

## Modes

The system supports **Light** and **Dark** modes. The solver automatically calculates the correct lightness values for each mode to maintain contrast and visual hierarchy.
