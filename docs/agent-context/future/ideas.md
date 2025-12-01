# Future Ideas

## Infrastructure

- **CSS Bundling**: Currently, `scripts/update-docs.sh` uses `cat` to concatenate CSS files for the documentation. We should switch to a proper bundler like Lightning CSS to handle this more reliably and enable features like minification and transpilation if needed.

## Theme Builder UI Overhaul (V2) & Integration

The current Theme Builder UI is functional but sparse. It lacks data density and intuitive representations of the complex color relationships being manipulated. Additionally, it currently lives as a separate SPA in `/demo`, which creates a disjointed experience from the documentation.

- **Problem**:
  - Information is packed into cryptic icons (locks, warnings).
  - The "Surface List" is just a list of boxes.
  - There is no visual connection between the "Global Settings" (Anchors, Key Colors) and the resulting surfaces.
  - **Architecture**: It is a separate build artifact from the Astro site.
- **Goal**: Create a UI that _teaches_ the user how the system works while they use it, and fully integrate it into the Astro site architecture.
- **Ideas**:
  - **Full Integration**: Move the Theme Builder from `demo/` into a route within the Astro site (e.g., `site/src/pages/builder.astro` or similar), sharing the same layout and navigation as the docs.
  - **Visualizer Graph**: A node-based or layer-based view showing how surfaces inherit and modify context.
  - **Data Density**: Show actual contrast ratios, lightness values, and hex codes inline without clutter.
  - **Intuitive Controls**: Instead of just sliders, use visual histograms or gradients to show where a surface sits in the gamut.

## UI/UX

- **Density Setting**: A "density" setting (similar to Gmail's comfort settings) that adjusts spacing scales. This would allow for a more compact UI without breaking the relative scaling of the system.

## Ecosystem

- **`@algebraic-systems/layout`**: A companion layout system to complement the color system. This should likely follow similar principles (semantic, constraint-based, runtime-aware).
