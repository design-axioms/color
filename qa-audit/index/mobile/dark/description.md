# Visual Description: Mobile Dark (Index)

## Source Image

`mobile-dark.png` (View) & `mobile-dark-debug.png` (Debug)

## Layout & Geometry

- **Header**: Compact. Logo left, Search icon right.
- **Hero**: Centered stack.
  - **H1 Title**: "Axiomatic Color" is **VISIBLE** and centered.
  - **Actions**: All 3 actions are **VISIBLE** and stacked vertically.
- **Obstruction**: The debug overlay is present.

## Debug Mode Findings (Violations)

The following elements are highlighted with **Red Dashed Borders**:

1.  **Primary Action**: The "Try the Studio" button is flagged.
2.  **Code Blocks**: Entire container flagged.
3.  **Feature Cards**: All 4 cards flagged.
4.  **Inputs**: Example inputs flagged.

## Color & Contrast

- **Background**: Deep dark gray/black.
- **Text**: White/Light Gray. Good contrast.
- **Code Blocks**:
  - **Issue**: Low contrast against the background. They look flat.
- **Step 3 Button**:
  - "Click Me" button is Black with a white border. Visually heavy.

## Reality Check

- **Status**: **Functional but Leaky**.
- **Consistency**: Mobile Dark matches Mobile Light in layout (correct) and Desktop Dark in styling issues (leaks, contrast).
