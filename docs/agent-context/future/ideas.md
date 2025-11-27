# Future Ideas

## Infrastructure

- **CSS Bundling**: Currently, `scripts/update-docs.sh` uses `cat` to concatenate CSS files for the documentation. We should switch to a proper bundler like Lightning CSS to handle this more reliably and enable features like minification and transpilation if needed.

## Deployment

1. We should figure out how to make the demo and mdbook part of the same logical deployed site.
   1. I'm not saying that the demo needs to live inside the book, but it should be easy to link from one to the other.
   2. In development, a single command should be able to start both the demo and the book server, and links to the demo from the book (and vice versa) should work seamlessly.
2. Possibly use GitHub Pages to host both.
3. Automate deployment via GitHub Actions on `main` branch updates.

I'd like us to make a plan for this as a new Epoch before Epoch 7. I probably didn't spell out all of the details clearly, so I'd like you to think through what I've said and make some suggestions, fleshing out the details and proposing a plan.

## Architecture Migration: Astro Starlight

Migrate the documentation site from `mdbook` to **Astro Starlight**.

- **Why**:

  - **Unified Codebase**: The documentation and the demo app (React/Preact) can live in the same project.
  - **Interactive Documentation**: We can import actual components from the design system directly into the markdown (MDX) files. This allows for "Live Examples" where users can play with contrast, theme settings, or components right inside the guide.
  - **Modern Tooling**: Astro uses Vite under the hood, which aligns with our current demo app stack.
  - **Better DX**: No need to run two separate servers (mdbook + vite) and proxy between them. One `pnpm dev` command runs everything.

- **Plan**:
  1.  **Scaffold**: Initialize a new Starlight project in `docs/`.
  2.  **Port Content**: Move existing markdown files from `docs/guide/src` to `docs/src/content/docs`. Starlight's structure is very similar to mdbook's.
  3.  **Integrate Demo**: Move the `demo/` components into the Astro project (or configure Astro to import from the workspace).
  4.  **Enhance**: Replace static screenshots with live React components.

## Theme Builder UI Overhaul

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
