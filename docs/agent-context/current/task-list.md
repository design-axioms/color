# Phase Task List: Algebra Page Polish

## Goal

Refine the visual presentation of the "Algebra of Color Design" page to match its academic nature and address specific formatting issues.

## Tasks

### 1. "In Plain English" Callout

- [x] **Redesign Component**: Create a custom `Aside` variant or a new component for "In Plain English" sections.
- [x] **List Formatting**: Convert the inline list to a proper bulleted list.
- [x] **Visual Style**: Reduce the "garishness" (likely the background color/border). Aim for a cleaner, more academic look (e.g., subtle gray background, serif font for the "plain english" text).

### 2. Academic Typography

- [x] **Page-Specific CSS**: Apply specific styles to `site/src/content/docs/theory/algebra.mdx` (using a wrapper class or similar).
- [x] **Headings**: Adjust heading sizes and spacing to be more balanced and "academic".
- [x] **Body Text**: Consider using a serif font for the body text of this specific page to differentiate it as a "theoretical" document.

### 3. Math Formatting

- [x] **Block Formulas**: Ensure `$$` block formulas are properly centered and offset. Check CSS for `.katex-display`.
- [x] **Header Math**: Investigate why math symbols in headers (e.g., `($\Sigma$)`) are not rendering correctly in the TOC or the header itself.
  - _Hypothesis_: The TOC generator might be stripping the math markup or the font doesn't support the symbols.
  - _Fix_: Ensure the TOC supports HTML/Math or use a workaround (e.g., plain text in header, math in content).

### 4. General Polish

- [x] **Review**: Verify the page against the "academic" aesthetic goal.
