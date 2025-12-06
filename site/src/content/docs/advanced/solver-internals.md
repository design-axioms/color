---
title: The Solver
---

The **Solver** is the engine that powers the color system. It takes your high-level **Intent** and turns it into precise **CSS Tokens**.

You can interact with the Theme Studio in two ways:

1.  **The UI**: The interactive web interface (for exploration).
2.  **The CLI**: The `axiomatic` command line tool (for production).

Both use the exact same "Solver" logic under the hood.

## The "Theme Studio" Model

To understand the solver, it helps to think about the controls you see in the Theme Studio UI. The solver is simply the code that runs every time you move a slider or add a surface.

### 1. Anchors: Defining the Playing Field

In the Theme Studio, you set the **Anchors**. These are the boundaries of your color system.

<div class="not-content">
<div class="surface-workspace docs-p-4 docs-rounded docs-border">
<div class="docs-mb-4">
<h4 class="text-strong docs-mb-2">Page Anchors</h4>
<p class="docs-text-subtle-sm">
Defines the lightness range for the "Page" polarity.
</p>
</div>

<!-- Start Slider -->
<div class="docs-mb-4">
<div class="docs-flex-between docs-mb-2">
<span class="text-subtle">Start (Background)</span>
<span class="text-strong">0.98</span>
</div>
<div class="docs-slider-track">
<div class="docs-slider-fill" style="left: 0; width: 98%;"></div>
<div class="docs-slider-thumb right" style="right: 2%;"></div>
</div>
</div>

<!-- End Slider -->
<div>
<div class="docs-flex-between docs-mb-2">
<span class="text-subtle">End (Elevated)</span>
<span class="text-strong">0.12</span>
</div>
<div class="docs-slider-track">
<div class="docs-slider-fill" style="left: 0; width: 12%;"></div>
<div class="docs-slider-thumb left" style="left: 12%;"></div>
</div>
</div>
</div>
</div>

The solver takes these values and asks: **"Can I fit readable text inside this range?"**
If the answer is "No" (and the anchor is adjustable), the solver **moves the slider for you** until the text is readable.

### 2. Surfaces: The "Steps"

In the Theme Studio, you add **Surfaces** to a list.

<div class="not-content">
<div class="surface-workspace docs-p-4 docs-rounded docs-border">
<h4 class="text-strong docs-mb-4">Surfaces</h4>

<div class="docs-col">
<!-- Surface Item 1 -->
<div class="surface-card docs-p-2 docs-rounded docs-border docs-flex-center-gap">
<span class="text-strong docs-flex-1">Page</span>
<code class="text-subtle">.surface-page</code>
<span class="docs-badge-pass">Passes</span>
</div>

<!-- Surface Item 2 -->
<div class="surface-card docs-p-2 docs-rounded docs-border docs-flex-center-gap">
<span class="text-strong docs-flex-1">Card</span>
<code class="text-subtle">.surface-card</code>
<span class="docs-badge-pass">Passes</span>
</div>

<!-- Surface Item 3 -->
<div class="surface-card docs-p-2 docs-rounded docs-border docs-flex-center-gap">
<span class="text-strong docs-flex-1">Sidebar</span>
<code class="text-subtle">.surface-sidebar</code>
<span class="docs-badge-pass">Passes</span>
</div>

</div>
</div>
</div>

The solver's job is to place these surfaces evenly between your Start and End anchors.
It doesn't just divide the lightness evenly (e.g., 10%, 20%, 30%). It divides the **Contrast Space** evenly. This ensures that the visual "step" from Page to Card looks the same as the step from Card to Sidebar.

#### Why Contrast Space?

If we just divided the lightness values evenly (Linear Lightness), the steps would look uneven to the human eye. Dark colors bunch up, and light colors spread out. By dividing by **Contrast** (Linear Perception), every step feels visually consistent.

<div class="not-content">
<div class="docs-grid">

<!-- Linear Lightness -->
<div class="surface-workspace docs-p-4 docs-rounded docs-border">
<h4 class="text-strong docs-mb-4">Linear Lightness (Bad)</h4>
<div class="docs-col-gap-0">
<div class="docs-p-2 docs-step-95">Step 1 (95%)</div>
<div class="docs-p-2 docs-step-85">Step 2 (85%)</div>
<div class="docs-p-2 docs-step-75">Step 3 (75%)</div>
<div class="docs-p-2 docs-step-65">Step 4 (65%)</div>
<div class="docs-p-2 docs-step-55">Step 5 (55%)</div>
</div>
</div>

<!-- Linear Contrast -->
<div class="surface-workspace docs-p-4 docs-rounded docs-border">
<h4 class="text-strong docs-mb-4">Linear Contrast (Good)</h4>
<div class="docs-col-gap-0">
<div class="surface-page docs-p-2">Page (Start)</div>
<div class="surface-workspace docs-p-2">Workspace</div>
<div class="surface-card docs-p-2">Card</div>
<div class="surface-action docs-p-2">Action (End)</div>
</div>
</div>

</div>
</div>

### 3. The Result: Generated Tokens

Finally, the solver outputs the CSS tokens that the Theme Studio (and your app) uses.

<div class="not-content">
<div class="surface-workspace docs-p-4 docs-rounded docs-border">
<h4 class="text-strong docs-mb-4">Generated CSS</h4>
<pre class="docs-code-block"><code>--lightness-surface-page: light-dark(0.98, 0.12);
--lightness-surface-card: light-dark(0.95, 0.15);
--lightness-surface-sidebar: light-dark(0.92, 0.18);</code></pre>
</div>
</div>

## The Pipeline

When you run `npx axiomatic` (or change a setting in the Studio), this pipeline executes:

1.  **Hydrate**: Read your `color-config.json`.
2.  **Adjust Anchors**: Ensure the range supports High Contrast text.
3.  **Distribute**: Calculate the target contrast for each surface based on the available range and any `gapBefore` settings.
4.  **Solve Lightness**: Use binary search to find the exact lightness value that hits that contrast target.
5.  **Solve Text**: Find the text colors that sit accessibly on top of those surfaces (APCA-compliant).
6.  **Generate**: Write the CSS tokens.

### High Contrast Generation

The solver runs a second pass to generate a **High Contrast** variant (`@media (prefers-contrast: more)`).
In this pass:

- **Key Colors** are removed (forced to grayscale).
- **Anchors** are pushed to pure Black (0) and White (1).
- **Chroma** is disabled.

This ensures that users who need maximum legibility get a strictly accessible, high-contrast version of your theme automatically.
