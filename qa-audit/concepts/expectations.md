# Visual Expectations: Concepts (Thinking in Surfaces)

## Source

`site/src/content/docs/concepts/thinking-in-surfaces.mdx`

## Interactive Components

- **Context Visualizer**:
  - **Container**: Should be clearly demarcated.
  - **Interactivity**: "Click on any surface..." instruction implies clickable areas.
  - **Visuals**:
    - **Page**: Base background.
    - **Card**: Distinct from Page.
    - **Spotlight**: High contrast, inverted polarity (Dark box on Light page).
    - **Text**: Must be legible on all surfaces.

## Surface Hierarchy Grids

- **Layout**:
  - **Grid**: 2 columns on Desktop/Tablet, 1 column on Mobile.
  - **Gap**: `gap-4` (1rem). Items must NOT touch.
- **Surface Previews**:
  - **Canvas**:
    - `surface-page`: Should look like the default background.
    - `surface-workspace`: Should look slightly different (sidebar/tool area).
  - **Objects**:
    - `surface-card`: Standard card appearance (border/shadow/bg).
    - `Tinted Card`: Should show a subtle brand hue.
  - **Interactors**:
    - `surface-action`: Primary button style.
    - `surface-action-soft`: Secondary/Ghost button style.
  - **Spotlights**:
    - `surface-spotlight`: **Critical**. Must be inverted. If the page is Light, this box must be Dark. Text inside must be Light.

## Typography & Content

- **Headings**: Clear hierarchy.
- **"Note on Inversion"**: Should be visually distinct from body text.
- **Readability**: Line length should be constrained (standard Starlight layout).

## Axiomatic Fidelity

- **Inversion**: The `surface-spotlight` is the key test here. It proves the "Context Engine" works.
- **Nesting**: The visualizer demonstrates nesting. The inner elements must have correct contrast.
