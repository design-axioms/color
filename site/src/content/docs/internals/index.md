---
title: Deep Dive
---

This section covers the internal mechanisms of the Color System. You don't need to understand these to use the system, but they are helpful for advanced configuration and customization.

- **[Anchors](./../concepts/anchors.md)**: How the system defines the lightness range for a theme.
- **[Hue Shifting](./../concepts/hue-shifting.md)**: The algorithm used to simulate natural color shifts in shadows and highlights.

## Glossary

- **Anchor**: A fixed point (like "Black" or "White") that defines the extremes of your theme.
- **APCA**: The math used to calculate contrast. It's better than the old WCAG math.
- **Context**: The environment a color lives in. Is it on a dark background? Is it in light mode?
- **Hue Shift**: The natural phenomenon where colors change hue as they get lighter or darker (e.g., Blue turns Purple as it gets lighter).
- **Polarity**: The "direction" of contrast. "Page" polarity is Light-on-Light (standard). "Inverted" polarity is Dark-on-Light (high contrast).
- **Surface**: A container that has a background color and defines the context for its children.