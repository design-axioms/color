# Visual Description: Desktop Dark (Index)

## Source Image

`desktop-dark.png` (View) & `desktop-dark-debug.png` (Debug)

## Layout & Geometry

- **Identical to Desktop Light**:
  - **Missing H1**: The "Axiomatic Color" title is missing in BOTH View and Debug modes.
  - **Missing Actions**: Only "Try the Studio" is visible. The other two are missing in BOTH modes.

## Debug Mode Findings (Violations)

The following elements are highlighted with **Red Dashed Borders**:

1.  **Search Bar**: Header input.
2.  **Primary Action**: The "Try the Studio" button itself is flagged! This suggests it's using a Starlight button class or not properly using `surface-action`.
3.  **Code Blocks**: Entire container flagged.
4.  **Feature Cards**: All 4 cards flagged.
5.  **Step 4 Input**: The text input example is flagged.

## Color & Contrast

- **Background**: Deep dark gray/black.
- **Text**: White/Light Gray. Good contrast.
- **Code Blocks**:
  - Background: Very similar to page background.
  - Border: Thin, subtle.
  - **Issue**: They lack distinctiveness. They look like "holes" in the page rather than "surfaces".
- **Step 3 Button**:
  - "Click Me" button is Black (or very dark) with a white border?
  - Contrast against the dark card background is... okay, but visually heavy.

## Reality Check

- **Status**: **BROKEN** & **VIOLATIONS DETECTED**.
- **Critical Issues**:
  - Missing H1 & Actions (Confirmed).
  - Starlight UI Leaks (Search, Button, Code, Cards, Input).
  - Low contrast on Code Blocks.
