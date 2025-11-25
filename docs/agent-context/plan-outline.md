# Project Plan Outline

## Epoch 1: Packaging & Consumption (Completed)

- **Goal**: Make the system usable by others as an NPM package.
- **Key Deliverables**: `tsup` build, CLI `init` command, published package.

## Epoch 2: The Theme Builder (Completed)

- **Goal**: Create a visual editor for `color-config.json`.
- **Key Deliverables**:
  - Isomorphic Runtime (Live Solving).
  - Global Controls (Anchors, Key Colors).
  - Surface Management (CRUD).
  - Export (JSON/CSS).

## Epoch 3: Polish & Persistence (Planned)

- **Goal**: Refine the Theme Builder into a production-grade tool.
- **Key Deliverables**:
  - Persistence (localStorage).
  - Templates / Presets.
  - Contrast Validation.
  - Framework Integration (Optional).

## Epoch 4: System Completeness (Planned)

- **Goal**: Ensure the system behaves correctly in all browser environments and modes.
- **Key Deliverables**:
  - **Browser Integration**:
    - `meta theme-color` sync (Address bar).
    - `color-scheme` & `scrollbar-color`.
    - **Dynamic Favicons**: Real-time generation based on system state.
  - **Forced Colors**: Windows High Contrast support (Taxonomy Alignment).
  - **P3 Gamut**: Support for `color(display-p3 ...)` output.
  - **Print Styles**: Graceful degradation for printing.
  - **Accessibility Preferences**: `prefers-contrast`, `prefers-reduced-motion`.

## Epoch 5: Design System Primitives (Planned)

- **Goal**: Complete the "System" aspect by adding missing UI primitives.
- **Key Deliverables**:
  - **Shadows/Elevation**: An elevation system derived from contrast/lightness.
  - **Focus Rings**: Accessibility-critical indicators that adapt to the surface.
  - **Data Visualization**: Distinct palettes for charts that harmonize with the theme.
