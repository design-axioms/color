# Visual Description: Desktop Light (Index)

## Source Image

`desktop-light.png` (View) & `desktop-light-debug.png` (Debug)

## Layout & Geometry

- **Header**: Full width. Logo left, Search bar center/right, Social/Theme icons right.
- **Hero**: Two-column grid.
  - **Left Column**: Text & Actions.
  - **Right Column**: Robot Image.
- **Elements Visibility (Debug Mode)**:
  - **H1 Title**: "Axiomatic Color" is **VISIBLE** in the debug screenshot. (Note: Previous audit claimed it was missing in `view.png`. Discrepancy to investigate).
  - **Actions**: All three actions ("Try the Studio", "Open in StackBlitz", "Read the Philosophy") are **VISIBLE**.

## Debug Mode Findings (Violations)

The following elements are highlighted with **Red Dashed Borders**, indicating Starlight UI inheritance leaks or non-axiomatic surfaces:

1.  **Search Bar**: The input field in the header.
2.  **Code Blocks**: The entire code snippet container (including the filename header) is wrapped in a red dashed border.
3.  **Feature Cards**: In the "Why This Matters" section, each of the 4 cards has a red dashed border.

## Typography

- **Tagline**: Large, readable.
- **Body**: Readable.

## Reality Check

- **Status**: **Violations Detected**.
- **Critical Issues**:
  - Starlight UI Leaks in Search, Code Blocks, and Feature Cards.
  - Potential visibility inconsistency between View and Debug modes (H1/Actions).
