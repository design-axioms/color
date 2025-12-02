# Phase 3: Design & Concept

## Goals

- Audit the current design of the Theme Builder.
- Incorporate user feedback on aesthetics and usability.
- Explore new conceptual models for the UI if necessary.
- Review the underlying architecture to ensure it supports the desired design.

## Tasks

### Design Council Directives (New)

- [x] **Highlight Token**: Add a semantic token for selection/highlighting (`highlight`).
- [x] **Native Mapping**: Map `highlight` token to `<mark>` and `::selection` in `engine.css`.
- [x] **Accessibility**: Ensure `highlight` colors are accessible for text backgrounds (Verified in `solver.ts`).

### UX/UI Components

- [ ] **Dual-Thumb Slider**: Refactor separate start/end sliders into a single dual-thumb slider for lightness anchors.
- [ ] **Custom Color Picker**: Replace the browser's default color picker with a custom OKLCH-based picker that visualizes the color space better.
- [ ] **Inspector Panes**: Refactor the Inspector panel to use collapsible panes (accordion style) to manage space better and prevent APCA results from hiding global settings.
- [ ] **Hue Curve Editor**: Implement a dedicated pane for editing the hue shift curve.

### Functionality

- [ ] **Multiple Key Colors**: Update the system to support multiple key colors (primary, secondary, etc.) instead of a single one.
- [ ] **Dark Mode Linking**: Add UI controls to explicitly link/unlink dark mode anchors from light mode, with visual indicators (lock icon).
- [ ] **Context Tree Editing**: Allow users to add and remove surfaces/elements directly from the context tree.
- [ ] **Selection & Highlighting**:
  - Implement persistent selection state in the Context Tree.
  - Highlight the selected element in the Stage preview.

### Content & Polish

- [ ] **Anchor Prose**: Add explanatory text or tooltips to clarify what "anchors" are and how they define contrast ranges.
- [ ] **Abstract View**: Fix spacing issues and clarify the purpose of the Abstract View (structural visualization).
- [ ] **Audit View**: Define and implement the content for the Audit section (e.g., accessibility report, gamut check, palette visualization).
