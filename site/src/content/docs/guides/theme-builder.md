---
title: The Theme Builder
description: How to use the visual Theme Builder to generate your configuration.
---

The **Theme Builder** is a web-based tool that allows you to visually design your theme and export the configuration for your project.

<div style="margin: 2rem 0;">
  <a href="https://color-system-demo.netlify.app" target="_blank" style="background: var(--fg); color: var(--bg); padding: 0.75rem 1.5rem; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">
    Launch Theme Builder →
  </a>
</div>

## Workflow

The Theme Builder is designed to work hand-in-hand with the CLI.

1.  **Design**: Use the visual controls to adjust anchors, key colors, and surfaces.
2.  **Export**: Click the "Export Config" button to get your JSON.
3.  **Paste**: Copy the JSON into your local `color-config.json`.
4.  **Build**: Run `npx color-system build` to generate your CSS.

## Key Features

### 1. Anchor Tuning

The most powerful feature of the builder is the **Anchor Tuner**.

-   **Background Anchors**: Drag the sliders to change the "start" (page background) and "end" (highest surface) lightness. Watch how every surface in the preview updates instantly.
-   **Foreground Anchors**: Adjust the contrast range for text.

### 2. Semantic Colors

You can define your semantic hues (Brand, Success, Danger, etc.) and see how they look across different surfaces.

-   **Hue**: Pick the base hue.
-   **Chroma**: Adjust the saturation.
-   **Usage**: See how the color looks as a button (`surface-action`), a badge (`surface-tinted`), or text (`text-link`).

### 3. Real-time Accessibility Check

As you drag sliders, the builder runs the **APCA Solver** in real-time.

-   If you make the background too dark for the text, the text will automatically lighten to maintain readability.
-   If you create a combination that is mathematically impossible to solve (e.g., low contrast background + low contrast text), the builder will warn you.

## Importing an Existing Config

If you already have a `color-config.json`, you can paste it into the "Import" tab of the Theme Builder to visualize your current theme and make adjustments.
