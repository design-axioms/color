---
title: Accessibility
---

The Color System is designed with accessibility as a first-class citizen. It automates many of the tedious aspects of compliance, ensuring your theme is inclusive by default.

## Contrast Compliance (APCA)

The core solver uses the **APCA (Advanced Perceptual Contrast Algorithm)** to calculate lightness values. APCA is the candidate method for **WCAG 3.0** (Silver), representing the future of web accessibility standards.

Unlike WCAG 2.1, which uses simple ratios (e.g., 4.5:1) that can be inaccurate for dark modes, APCA models human visual perception. It accounts for:

- **Polarity**: Dark text on light backgrounds is perceived differently than light text on dark backgrounds.
- **Spatial Frequency**: Thinner fonts require higher contrast than bolder fonts to be equally legible.
- **Context**: The surrounding luminance affects perceived contrast.

By using APCA, the system ensures your theme is not just "compliant" with a checklist, but genuinely readable for all users in all modes.

- **Text**: The system automatically selects text colors that meet the required Lc (Lightness Contrast) scores for their context.
- **Borders**: Decorative and interactive borders are generated with specific contrast targets to ensuring visibility without clutter.

## Forced Colors (Windows High Contrast)

The system includes built-in support for **Forced Colors Mode** (commonly known as Windows High Contrast). This mode is used by people with low vision to strip away complex styling and enforce a limited, high-contrast palette.

### How it Works

The CSS Engine detects `forced-colors: active` and automatically maps your semantic surfaces to standard **System Colors**:

| Surface          | System Color                  |
| :--------------- | :---------------------------- |
| `surface-card`   | `Canvas` / `CanvasText`       |
| `surface-action` | `ButtonFace` / `ButtonText`   |
| `state-selected` | `Highlight` / `HighlightText` |
| `text-link`      | `LinkText`                    |

### Testing

You can verify this behavior in Chrome/Edge DevTools:

1. Open the **Command Menu** (`Ctrl+Shift+P` / `Cmd+Shift+P`).
2. Type "Show Rendering" and select it.
3. Scroll down to **Emulate CSS media feature prefers-contrast**.
4. Or, look for **Emulate CSS media feature forced-colors** and set it to `active`.

## High Contrast Preference

The system respects the user's operating system preference for higher contrast (`prefers-contrast: more`).

When you run `color-system build` (or `solve`), the generator automatically creates a **High Contrast Variant** of your theme. This variant:

1. **Widening Anchors**: Pushes background and foreground anchors to pure Black (0%) and White (100%) to maximize dynamic range.
2. **Desaturation**: Removes chroma from text and surfaces to reduce visual noise and improve legibility.

This variant is wrapped in a `@media (prefers-contrast: more)` block in your `theme.css`, so the browser applies it instantly with zero runtime overhead.

## Print Styles

The system includes a print stylesheet (`@media print`) that optimizes your theme for paper.

### Strategy: "Ink & Paper"

Instead of trying to translate your digital theme directly to print, we map it to the physical constraints of ink and paper:

1.  **Force Light Mode**: We explicitly set `color-scheme: light` to ensure all `light-dark()` tokens resolve to their light values. This prevents printing dark backgrounds which waste massive amounts of ink.
2.  **Remove Chroma**: We set `--base-chroma: 0` to remove all saturation. This ensures that even if a surface has a slight tint in light mode, it prints as grayscale.
3.  **White Backgrounds**: We explicitly set the background of main surfaces (`.surface-card`, etc.) to `white`.
    - _Why hardcode white?_ In the context of print, `white` represents the **paper**. By setting it explicitly, we ensure that no background ink is laid down, even if the user has "Background Graphics" enabled in their print settings.
    - _No `!important`_: We rely on the low specificity of our CSS Engine (`:where(...)`) to allow these print overrides to apply naturally without needing `!important`.
4.  **Borders**: Since we remove background colors, we add a `1px solid` border using the `text-subtlest` token to maintain the visual structure of cards and sections.
5.  **Cleanup**: We hide purely interactive elements (like `.surface-action`) that serve no purpose on a static page.