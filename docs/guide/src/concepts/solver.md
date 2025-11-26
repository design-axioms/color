# The Solver

The **Solver** is the engine that powers the color system. It takes your high-level **Intent** and turns it into precise **CSS Tokens**.

You can interact with the Theme Builder in two ways:

1.  **The UI**: The interactive web interface (for exploration).
2.  **The CLI**: The `color-system` command line tool (for production).

Both use the exact same "Solver" logic under the hood.

## The "Theme Builder" Model

To understand the solver, it helps to think about the controls you see in the Theme Builder UI. The solver is simply the code that runs every time you move a slider or add a surface.

### 1. Anchors: Defining the Playing Field

In the Theme Builder, you set the **Anchors**. These are the boundaries of your color system.

<div class="surface-workspace docs-p-4 docs-rounded docs-border">
  <div class="docs-mb-4">
    <h4 class="text-strong" style="margin: 0 0 0.5rem 0">Page Anchors</h4>
    <p class="text-subtle" style="margin: 0; font-size: 0.9rem">
      Defines the lightness range for the "Page" polarity.
    </p>
  </div>
  
  <!-- Start Slider -->
  <div class="docs-mb-4">
    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
      <span class="text-subtle">Start (Background)</span>
      <span class="text-strong">0.98</span>
    </div>
    <div style="height: 6px; background: var(--border-subtle-token); border-radius: 3px; position: relative;">
      <div style="position: absolute; left: 0; top: 0; bottom: 0; width: 98%; background: var(--text-subtle-token); opacity: 0.2; border-radius: 3px;"></div>
      <div style="position: absolute; right: 2%; top: 50%; transform: translate(50%, -50%); width: 16px; height: 16px; background: var(--text-strong-token); border-radius: 50%; border: 2px solid var(--surface-token);"></div>
    </div>
  </div>

  <!-- End Slider -->
  <div>
    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
      <span class="text-subtle">End (Elevated)</span>
      <span class="text-strong">0.12</span>
    </div>
    <div style="height: 6px; background: var(--border-subtle-token); border-radius: 3px; position: relative;">
      <div style="position: absolute; left: 0; top: 0; bottom: 0; width: 12%; background: var(--text-subtle-token); opacity: 0.2; border-radius: 3px;"></div>
      <div style="position: absolute; left: 12%; top: 50%; transform: translate(-50%, -50%); width: 16px; height: 16px; background: var(--text-strong-token); border-radius: 50%; border: 2px solid var(--surface-token);"></div>
    </div>
  </div>
</div>

The solver takes these values and asks: **"Can I fit readable text inside this range?"**
If the answer is "No" (and the anchor is adjustable), the solver **moves the slider for you** until the text is readable.

### 2. Surfaces: The "Steps"

In the Theme Builder, you add **Surfaces** to a list.

<div class="surface-workspace docs-p-4 docs-rounded docs-border">
  <h4 class="text-strong" style="margin: 0 0 1rem 0">Surfaces</h4>
  
  <div class="docs-col">
    <!-- Surface Item 1 -->
    <div class="surface-card docs-p-2 docs-rounded docs-border" style="display: flex; align-items: center; gap: 1rem;">
      <span class="text-strong" style="flex: 1;">Page</span>
      <code class="text-subtle">.surface-page</code>
      <span style="font-size: 0.8em; background: #dcfce7; color: #166534; padding: 2px 6px; border-radius: 4px;">Passes</span>
    </div>
    
    <!-- Surface Item 2 -->
    <div class="surface-card docs-p-2 docs-rounded docs-border" style="display: flex; align-items: center; gap: 1rem;">
      <span class="text-strong" style="flex: 1;">Card</span>
      <code class="text-subtle">.surface-card</code>
      <span style="font-size: 0.8em; background: #dcfce7; color: #166534; padding: 2px 6px; border-radius: 4px;">Passes</span>
    </div>

    <!-- Surface Item 3 -->
    <div class="surface-card docs-p-2 docs-rounded docs-border" style="display: flex; align-items: center; gap: 1rem;">
      <span class="text-strong" style="flex: 1;">Sidebar</span>
      <code class="text-subtle">.surface-sidebar</code>
      <span style="font-size: 0.8em; background: #dcfce7; color: #166534; padding: 2px 6px; border-radius: 4px;">Passes</span>
    </div>

  </div>
</div>

The solver's job is to place these surfaces evenly between your Start and End anchors.
It doesn't just divide the lightness evenly (e.g., 10%, 20%, 30%). It divides the **Contrast Space** evenly. This ensures that the visual "step" from Page to Card looks the same as the step from Card to Sidebar.

#### Why Contrast Space?

If we just divided the lightness values evenly (Linear Lightness), the steps would look uneven to the human eye. Dark colors bunch up, and light colors spread out. By dividing by **Contrast** (Linear Perception), every step feels visually consistent.

<div class="docs-grid">
  <div class="docs-p-4 docs-rounded docs-border">
    <strong class="docs-mb-2" style="display: block">Linear Lightness (Bad)</strong>
    <div style="display: flex; height: 50px; border-radius: 4px; overflow: hidden;">
      <div style="flex: 1; background: oklch(95% 0 0);"></div>
      <div style="flex: 1; background: oklch(85% 0 0);"></div>
      <div style="flex: 1; background: oklch(75% 0 0);"></div>
      <div style="flex: 1; background: oklch(65% 0 0);"></div>
      <div style="flex: 1; background: oklch(55% 0 0);"></div>
    </div>
    <div class="text-subtle docs-mt-2" style="font-size: 0.9em">
      Mathematically equal steps (-10%). To the eye, the lighter steps feel too jumpy, while the darker steps blend together.
    </div>
  </div>
  <div class="docs-p-4 docs-rounded docs-border">
    <strong class="docs-mb-2" style="display: block">Linear Contrast (Good)</strong>
    <div style="display: flex; height: 50px; border-radius: 4px; overflow: hidden;">
      <div style="flex: 1; background: oklch(98% 0 0);"></div>
      <div style="flex: 1; background: oklch(92% 0 0);"></div>
      <div style="flex: 1; background: oklch(84% 0 0);"></div>
      <div style="flex: 1; background: oklch(74% 0 0);"></div>
      <div style="flex: 1; background: oklch(62% 0 0);"></div>
    </div>
    <div class="text-subtle docs-mt-2" style="font-size: 0.9em">
      Perceptually equal steps. The solver makes larger adjustments to the darker shades to ensure every step feels distinct.
    </div>
  </div>
</div>

### 3. The Result: Generated Tokens

Finally, the solver outputs the CSS tokens that the Theme Builder (and your app) uses.

<div class="surface-workspace docs-p-4 docs-rounded docs-border">
  <h4 class="text-strong" style="margin: 0 0 1rem 0">Generated CSS</h4>
  <pre style="background: var(--surface-token); padding: 1rem; border-radius: 4px; overflow-x: auto;"><code>--lightness-surface-page: light-dark(0.98, 0.12);
--lightness-surface-card: light-dark(0.95, 0.15);
--lightness-surface-sidebar: light-dark(0.92, 0.18);</code></pre>
</div>

## The Pipeline

When you run `pnpm solve` (or change a setting in the Builder), this pipeline executes:

1.  **Hydrate**: Read your config.
2.  **Adjust Anchors**: Ensure the range supports High Contrast text.
3.  **Distribute**: Calculate the target contrast for each surface.
4.  **Solve Lightness**: Use binary search to find the exact lightness value that hits that contrast target.
5.  **Solve Text**: Find the text colors that sit accessibly on top of those surfaces.
6.  **Generate**: Write the CSS.
