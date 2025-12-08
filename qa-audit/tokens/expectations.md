# Visual Expectations: Token Reference

## Source

`site/src/content/docs/reference/tokens.md`

## Tables (The Core Content)

- **Structure**: Standard Markdown tables.
- **Columns**: "Token" (Code) and "Description" (Text).
- **Visuals**:
  - **Headers**: Distinct from data rows.
  - **Rows**: Sufficient padding. Text should not touch borders.
  - **Responsiveness**: Tables should scroll horizontally on mobile if needed, NOT break layout.
- **Token Names**:
  - Rendered as inline code (`code` tag).
  - **Look & Feel**: Should look like a technical identifier. Monospace font, subtle background, rounded corners.

## Code Blocks

- **Example**: `<button class="surface-action hue-highlight">Click Me</button>`
- **Highlighting**: Syntax highlighting should be active.
- **Container**: Should have a distinct background (usually dark in both modes or adaptive).

## Typography

- **Headings**: H2 ("Surface Tokens", "Global Tokens") and H3 ("Usage", "Context Accessors").
- **Readability**: Descriptions in tables should be legible.

## Axiomatic Fidelity

- **"Premium" Tables**:
  - Are the tables cramped?
  - Is the inline code style consistent with the rest of the site?
  - Do the tables look like "Data Surfaces" or just raw HTML tables?
