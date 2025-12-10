# Visual Description: Concepts Page (Desktop / Dark)

## 1. Context Visualizer (Interactive Demo)

- **Layout**: The "Page (Dark Context)" container is dark (almost black).
- **Nested Elements**:
  - **Card**: Correctly rendered as a nested surface (slightly lighter gray).
  - **Spotlight**: Correctly rendered as an **inverted** surface (Light/White box).
  - **Text**:
    - Text on Page: Light (Correct).
    - Text on Card: Light (Correct).
    - Text on Spotlight: Dark (Correct).
- **Issues**:
  - **Spotlight (Inverted)**: The "Spotlight" box is bright white. The text inside is dark. This inversion logic seems to be working correctly here, unlike the potential contrast issue in Light Mode.

## 2. Surface Hierarchy Grids

- **Layout**: Grid structure is preserved.
- **Surface Rendering**:
  - **Page**: Dark background.
  - **Workspace**: Slightly lighter/different tone.
  - **Card**: Dark gray with border.
  - **Tinted**: Dark with subtle tint.
  - **Action**: White/Light background (Inverted from Light Mode).
  - **Soft Action**: Dark gray.
  - **Spotlight**: Purple background (Brand).
- **Issues**:
  - **Action Button**: In Dark Mode, the "Action" button is often white/light gray with dark text. This needs to be verified against the design intent. If it's just "inverse", it's correct.
  - **Spotlight**: Purple background with white text. Contrast looks okay.

## 3. Typography & Content

- **Headings**: White/Light Gray. Readable.
- **Code Blocks**:
  - **Issue**: Similar to the Home Page, the code blocks likely have a background color (`#24292e`) that might not harmonize perfectly with the specific dark theme background of the docs site. It stands out as a "GitHub Dark" block on top of the site's dark theme.

## 4. Sidebar

- **Active State**: "Thinking in Surfaces" is highlighted.
- **Issue**: The blue highlight color (`rgb(61, 80, 245)`) might vibrate or have poor contrast against the dark background.

## Summary of Defects

1.  **Sidebar Highlight**: The active link color is likely hardcoded and may not pass contrast guidelines in Dark Mode.
2.  **Code Block Integration**: The Shiki theme background is distinct from the site theme, creating a "box" effect that might not be desired.
