# Visual Description: Mobile Layouts (Global)

## 1. Home Page (Mobile)

- **Hero Section**:
  - Title wraps onto multiple lines. Size is large but readable.
  - Buttons stack vertically. Spacing is adequate.
- **Features**:
  - Grid collapses to single column. Cards render correctly.
- **Issues**:
  - None critical. Standard responsive behavior observed.

## 2. Concepts Page (Mobile)

- **Context Visualizer**:
  - The nested boxes ("Page" -> "Card" -> "Spotlight") are very cramped.
  - The "Spotlight" box is barely wide enough to contain its label.
  - **Usability**: The visual hierarchy is harder to perceive when squashed.
- **Surface Grid**:
  - Collapsed to single column.
  - Buttons and cards look fine.

## 3. Tokens Page (Mobile)

- **Token Tables**:
  - **Major Issue**: The tables are struggling to fit the content.
  - The "Token" column takes up about 50% of the width because of the long variable names.
  - The "Description" column is squeezed, causing text to wrap aggressively (1-2 words per line in some cases).
  - **Readability**: Poor. It's hard to scan the table.
- **Code Blocks**:
  - Horizontally scrollable (standard behavior).

## Summary of Defects

1.  **Token Tables (Mobile)**: Poor readability due to narrow columns. Needs a responsive table solution (e.g., scrollable container or stacked view).
2.  **Context Visualizer (Mobile)**: Cramped layout reduces the educational value of the demo.
