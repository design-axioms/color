# Axiomatic Color Concepts

This document explains the high-level concepts of Axiomatic Color.

> **Note**: For the foundational laws and philosophy governing the system, see [The Constitution (Axioms)](docs/design/theory/axioms.md).

## Core Philosophy

Axiomatic Color is designed to be **Platform-Native**, **Adaptive**, and **Automated**.

### Semantics Derived from Accessibility

Our semantic roles (like "Surface", "Action", "Link") are not arbitrary choices. They are derived directly from the **fundamental semantics of the web platform**, specifically the System Colors used by Forced Colors and High Contrast modes.

By aligning our taxonomy with these platform primitives (e.g., `Canvas`, `ButtonFace`, `Highlight`), we ensure that accessibility is not an "add-on" or a "special case." It is the **foundation** of the design. When you design with these concepts, you are designing with the grain of the web, ensuring your application feels native and works perfectly for every user, regardless of their device or settings.

1.  **Semantic**: You pick roles that map to platform primitives.
2.  **Adaptive**: Because the roles are native, the system adapts to Light, Dark, High Contrast, and Forced Colors automatically.
3.  **Automated**: Lightness values are calculated by a solver to guarantee accessible contrast within those roles.

## The Grand Unified Algebra

The system is governed by a rigorous mathematical model called the **Grand Unified Algebra (v4.0)**.

Instead of storing static colors, we store the _State_ of the UI as a tuple:
$$ \Sigma = \langle \alpha, \nu, \tau, \gamma, \sigma \rangle $$

- _Atmosphere_ ($\alpha$): The ambient hue and vibrancy.
- _Voice_ ($\nu$): The semantic weight of the content.
- _Time_ ($\tau$): The continuous cycle between Light and Dark modes.
- _Gain_ ($\gamma$): The user's contrast preference (High Contrast).
- _System_ ($\sigma$): The rendering mode (Rich vs. X-Ray/Forced Colors).

This algebra allows us to calculate the perfect color for any element in any environment, guaranteeing accessibility and gamut safety via the _Safe Bicone_ physics model.

## Surfaces & Context

Everything sits on a _Surface_. A surface is not just a background color; it **sets the rules** for everything inside it (creating a _Context_).

- `surface-page`: The application background.
- `surface-card`: A contained content area.
- `surface-action`: A clickable interactive area (e.g., a button).
- `surface-spotlight`: An inverted or high-emphasis area.

When you nest surfaces (e.g., a Card on a Page), the system automatically adjusts the context so that text and borders maintain perfect contrast.

## Foregrounds (Text & Icons)

Text utilities consume the _Context_ provided by the surface. You don't need to know _which_ surface you are on; you just declare the hierarchy.

- `text-strong` (Default): Primary content. High contrast.
- `text-subtle`: Secondary content. Medium contrast.
- `text-subtlest`: Meta-data or low-emphasis content.
- `text-link`: Interactive navigation elements. Uses the brand hue.

## States

Interactive elements have standard states that work across all surfaces.

- `hover` / `active`: Interaction feedback.
- `state-selected`: For chosen items (e.g., a selected list option). Maps to System Highlight.
- `state-disabled`: For non-interactive items. Maps to System GrayText.

## X-Ray Mode (Forced Colors)

When the user enables "High Contrast Mode" (Windows HCM), the system switches to _X-Ray Mode_.

- _Rich Mode_: Surfaces have background colors.
- _X-Ray Mode_: Backgrounds become transparent, and a _Border_ appears automatically to define the structure.

This ensures the UI remains usable ("Fail Visible") even when the operating system strips away all color.
