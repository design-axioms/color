# Visual Description: Mobile Light (Index)

## Source Image

`mobile-light.png` (View) & `mobile-light-debug.png` (Debug)

## Layout & Geometry

- **Header**: Compact. Logo left, Search icon right.
- **Hero**: Centered stack.
  - **H1 Title**: "Axiomatic Color" is **VISIBLE** and centered. (Contrast with Desktop where it's missing).
  - **Actions**: All 3 actions are **VISIBLE** and stacked vertically.
- **Obstruction**: A dark, pill-shaped overlay (browser tool?) obscures the introductory paragraph in `view.png`.

## Debug Mode Findings (Violations)

The following elements are highlighted with **Red Dashed Borders**:

1.  **Primary Action**: The "Try the Studio" button is flagged.
2.  **Code Blocks**: Entire container flagged.
3.  **Feature Cards**: All 4 cards flagged.
4.  **Inputs**: Example inputs flagged.
5.  **Search Icon**: The search magnifying glass in the header is NOT flagged (unlike the desktop input bar).

## Reality Check

- **Status**: **Functional but Leaky**.
- **Good News**: The content (H1, Actions) that is broken on Desktop is **working correctly** on Mobile.
- **Bad News**: The same Starlight UI leaks (Button, Code, Cards) are present.
