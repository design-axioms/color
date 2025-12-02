# Phase 3 Implementation Plan: Design & Concept

This plan addresses the design and usability feedback gathered in Phase 2, focusing on making the Theme Builder a more powerful, intuitive, and educational tool.

## 0. Design Council Directives (New)

### Highlight Primitive Refinement

- **Directive**: Broaden definition to "Color of Attention/Reference".
- **Directive**: Map to native `<mark>` and `::selection` elements.
- **Directive**: Ensure accessibility for text backgrounds.

## 1. UX/UI Component Refactoring

### Dual-Thumb Slider for Anchors

- **Problem**: Separate sliders for "Start" and "End" lightness are clunky and don't visually represent a "range."
- **Solution**: Implement a custom dual-thumb slider.
- **Details**:
  - Visualizes the contrast range (Start to End) as a single bar.
  - Allows dragging the entire range or individual endpoints.
  - **Constraint**: Ensure "Start" cannot cross "End" (or handle the crossover gracefully by swapping).

### Inspector Panes (Accordion Layout)

- **Problem**: The Inspector is becoming crowded. APCA results often push configuration controls off-screen.
- **Solution**: Refactor the Inspector into collapsible panes.
- **Structure**:
  - **Global Settings**: Key colors, mode toggles.
  - **Anchors**: Light/Dark mode contrast range settings.
  - **Curve Editor**: (New) Hue shift configuration.
  - **Element Config**: Settings for the currently selected element.
  - **Analysis**: APCA scores and contrast reports.
- **Behavior**: "Accordion" style—clicking a header expands that section. Consider allowing multiple open or enforcing single-open based on screen space.

### Custom OKLCH Color Picker

- **Problem**: Standard browser color pickers operate in sRGB/Hex, which disconnects the user from the perceptual L/C/H model of the system.
- **Solution**: Build a custom color picker tailored to the system.
- **Features**:
  - **L/C/H Sliders**: Direct manipulation of perceptual channels.
  - **Gamut Visualization**: Show valid colors within the target gamut (P3/sRGB).
  - **Palette Context**: Show the selected color relative to the generated palette.

## 2. Core Functionality Enhancements

### Multiple Key Colors

- **Problem**: Apps rarely have just one "Key Color." They often have Primary, Secondary, Tertiary, or Semantic brand colors.
- **Solution**: Update the configuration model to support a collection of key colors.
- **Implementation**:
  - **State**: Update `ConfigState` to store an array or map of key colors.
  - **UI**: Add "Add Color" button in the Global Settings pane.
  - **Solver**: Ensure the solver generates scales for all defined key colors.

### Dark Mode Linking

- **Problem**: Dark mode anchors are often just an inversion of light mode, but currently require manual setup.
- **Solution**: Explicit "Link" state between modes.
- **UI**:
  - **Lock Icon**: Indicates Dark Mode is derived from Light Mode.
  - **Linked State**: Dark mode controls are disabled/greyed out.
  - **Unlinked State**: Full manual control for Dark Mode anchors.

### Context Tree Editing & Selection

- **Problem**: The builder is currently read-only regarding the structure.
- **Solution**: Enable structural editing.
- **Features**:
  - **Selection**: Clicking a node in the tree selects it.
  - **Persistence**: Selection state is stored in `BuilderState`.
  - **CRUD**: "Add Child Surface" / "Remove Surface" buttons in the tree item context menu or toolbar.

### Stage Highlighting

- **Problem**: It's hard to tell which element in the preview corresponds to the selection.
- **Solution**: Visual highlighting in the Stage.
- **Implementation**:
  - Overlay or border effect on the selected component in the `ComponentView`.
  - **System Token**: Introduce a `surface.highlight` or `state.selected` token to the core system to style this, avoiding hardcoded values.

## 3. Content & Polish

### Explanatory Prose

- **Problem**: Terms like "Anchors" are jargon-heavy.
- **Solution**: Add micro-copy.
- **Details**:
  - Short description above the Anchor slider: "Defines the lightness range for surfaces in this mode."
  - Tooltips for "Chroma", "Hue Shift", etc.

### Abstract View Refinement

- **Problem**: Spacing is off, and purpose is unclear.
- **Solution**:
  - Fix CSS Grid/Flex gaps.
  - Add labels indicating "Nesting Level" or "Surface Role."

### Audit View Implementation

- **Problem**: Currently a placeholder.
- **Content**:
  - **Contrast Matrix**: A grid showing APCA scores for all text tokens against all surface tokens.
  - **Gamut Report**: List colors that fall outside sRGB (for web safety awareness).

## 4. Execution Strategy

We will tackle this in sub-phases to maintain stability:

1.  **Foundation (System & State)**:
    - [x] Add `highlight` token.
    - [x] Refine `highlight` semantics (Docs & Native Mapping).
    - [x] Implement Selection state in `BuilderState`.
    - [x] Update `ConfigState` for multiple key colors.
2.  **UI Components (The "Builder" Feel)**:
    - [x] Implement Inspector Accordion.
    - [x] Implement Dual-Thumb Slider.
    - [x] Implement Context Tree Editing.
3.  **Advanced Features**:
    - [x] Dark Mode Linking logic.
    - [x] Custom Color Picker.
    - [x] Hue Curve Editor pane.
4.  **Polish**:
    - [x] Prose, Tooltips, and Audit View.
