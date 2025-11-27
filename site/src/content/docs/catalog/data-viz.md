---
title: Data Visualization
description: Categorical palettes that harmonize with your theme.
---

The Color System includes a built-in engine for generating categorical color palettes that harmonize with your theme. These palettes are designed for data visualization (charts, graphs, maps) where you need distinct colors to represent different categories.

## The Problem

Standard color palettes (like "Tableau 10" or "D3 Category 10") are great, but they often clash with your custom theme.

-   If your theme is "Soft Pastel", a neon chart looks out of place.
-   If your theme is "High Contrast", a subtle chart might be illegible.
-   In Dark Mode, standard colors often lose contrast or look muddy.

## The Solution: Harmonized Fixed Hues

Instead of using a fixed set of hex codes, we use a **Harmonized Fixed Hues** strategy:

1.  **Fixed Hues**: We start with a curated list of distinct hues (Red, Orange, Yellow, Green, etc.) to ensure every color is nameable and distinct.
2.  **Solved Lightness**: We **solve** the lightness of each color against your page background to ensure it meets accessibility targets (APCA ~105).
3.  **Shared Chroma**: We apply a consistent chroma (vibrancy) across the palette, which you can tune to match your brand.

## Usage

The system generates CSS variables in the format `--chart-N`:

```css
.my-chart {
  color: var(--chart-1); /* First color in the palette */
}

.my-chart-bar:nth-child(2) {
  background-color: var(--chart-2);
}
```

### Configuration

You can customize the palette in your `color-config.json`:

```json
{
  "palette": {
    "targetChroma": 0.12,
    "hues": [25, 45, 85, 125, 150, 190, 250, 280, 320, 360]
  }
}
```

-   **targetChroma**: Controls the vibrancy. `0.12` is a safe default. Higher values (e.g., `0.18`) are more vibrant but might be harder to balance in Light Mode.
-   **hues**: An array of hue angles (0-360) to use for the palette.

## Accessibility

Because the lightness is **solved** relative to the background:

-   In **Light Mode**, the colors will be darker (like text) to stand out against the white page.
-   In **Dark Mode**, the colors will automatically flip to be lighter (pastels) to stand out against the dark page.

This ensures your charts are always legible, regardless of the user's theme preference.
