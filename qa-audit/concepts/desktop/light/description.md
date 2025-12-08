# Visual Description: Concepts Page (Desktop / Light)

## 1. Context Visualizer (Interactive Demo)

- **Layout**: The "Page (Light Context)" container is clearly visible with a white background.
- **Nested Elements**:
  - **Card**: Correctly rendered as a nested surface (slightly darker/grayer than page).
  - **Spotlight**: Correctly rendered as an **inverted** surface (Dark box).
  - **Text**:
    - Text on Page: Dark (Correct).
    - Text on Card: Dark (Correct).
    - Text on Spotlight: Light (Correct).
- **Issues**:
  - The "Spotlight (Inverted Context)" text inside the dark box seems to have very low contrast or is using a font weight that makes it hard to read against the dark background in the screenshot. It looks like "Ghost Text".

## 2. Surface Hierarchy Grids

- **Layout**: The grid layout is working (2 columns).
- **Spacing**: `gap-4` appears sufficient.
- **Surface Rendering**:
  - **Page**: White.
  - **Workspace**: Light Gray (distinct from Page).
  - **Card**: White with border/shadow.
  - **Tinted**: Subtle purple tint is visible.
  - **Action**: Black background (Brand/Primary).
  - **Soft Action**: Light gray/tinted background.
  - **Spotlight**: Purple background (Brand).
- **Issues**:
  - **Action Button**: The text "Action" inside the black button is white, which is correct.
  - **Soft Action**: The text is dark, correct.
  - **Spotlight**: The text "Spotlight" is white on purple, correct.

## 3. Typography & Content

- **Headings**: Clear hierarchy (H1, H2, H3).
- **Code Blocks**:
  - Inline code (`.card`, `.text`) has a light gray background.
  - Block code (`.text-strong ...`) has a light background that blends well.
- **Readability**: Good line length and spacing.

## 4. Sidebar

- **Active State**: The "Thinking in Surfaces" link is highlighted in blue.
- **Issue**: As noted in the programmatic audit, the blue color (`rgb(61, 80, 245)`) might not be a system token.

## Summary of Defects

1.  **Spotlight Text Contrast**: The text inside the "Spotlight" box in the interactive demo looks potentially too faint or thin.
2.  **Sidebar Color**: Non-system blue color for active state.
