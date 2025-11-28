# Future Ideas

## Infrastructure

- **CSS Bundling**: Currently, `scripts/update-docs.sh` uses `cat` to concatenate CSS files for the documentation. We should switch to a proper bundler like Lightning CSS to handle this more reliably and enable features like minification and transpilation if needed.

## Theme Builder UI Overhaul (V2)

The current Theme Builder UI is functional but sparse. It lacks data density and intuitive representations of the complex color relationships being manipulated.

- **Problem**:
  - Information is packed into cryptic icons (locks, warnings).
  - The "Surface List" is just a list of boxes.
  - There is no visual connection between the "Global Settings" (Anchors, Key Colors) and the resulting surfaces.
- **Goal**: Create a UI that _teaches_ the user how the system works while they use it.
- **Ideas**:
  - **Visualizer Graph**: A node-based or layer-based view showing how surfaces inherit and modify context.
  - **Data Density**: Show actual contrast ratios, lightness values, and hex codes inline without clutter.
  - **Intuitive Controls**: Instead of just sliders, use visual histograms or gradients to show where a surface sits in the gamut.
