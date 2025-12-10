# Visual Expectations: Home Page

## Source

`site/src/content/docs/index.mdx`

## Global Layout

- **Template**: Splash (Full width, no sidebar).
- **Theme**: Should support both Light and Dark modes seamlessly.

## Hero Section

- **Typography**: Large, bold title "Axiomatic Color". Tagline "Stop picking colors. Start defining intent." should be legible and subordinate.
- **Actions**:
  - **Primary**: "Try the Studio" - Should be the most prominent button (Brand color?).
  - **Secondary**: "Open in StackBlitz" - Less prominent than primary.
  - **Minimal**: "Read the Philosophy" - Least prominent, likely a text link or ghost button.
  - **Spacing**: Buttons should have adequate gap, not touching.

## "At a Glance" Tutorial Section

- **Structure**: Vertical flow of steps (Step 1 -> Step 4).
- **Components**: `<Snippet />`
  - **Container**: Should have a border and rounded corners.
  - **Header**: "Preview" label, distinct background.
  - **Preview Area**:
    - Background: `surface-workspace` (Neutral, distinct from page background).
    - Content:
      - `surface-card`: Should look elevated or bordered.
      - `surface-action`: Button should have clear affordance.
      - `surface-input`: Input field should be clearly defined.
  - **Code Area**: Syntax highlighted HTML.
  - **Spacing**: Snippets should have vertical margin from text.

## "Why This Matters" Section

- **Layout**: `<CardGrid stagger>`
  - **Desktop**: Grid layout (2x2 or similar).
  - **Mobile**: Stacked layout.
- **Cards**:
  - **Visuals**: Should look like "Surfaces" (Border/Background).
  - **Icons**: Visible, aligned with title.
  - **Content**: Title bold, description readable.
  - **Stagger**: Visual interest in the grid layout.

## Axiomatic Fidelity

- **Surfaces**: The "Preview" areas are the most critical. They demonstrate the system. They must look "designed", not just default HTML.
- **Contrast**: Text in all sections must pass APCA/WCAG.
