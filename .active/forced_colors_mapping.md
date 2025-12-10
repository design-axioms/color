# Forced Colors Mapping Strategy

## Goal

Ensure the color system degrades gracefully in "Forced Colors" mode (Windows High Contrast), where the user's OS overrides all colors to a limited palette of "System Colors".

## The System Color Palette

These are the keywords available in CSS when `forced-colors: active` is true.

| Keyword         | Description                                     | Typical Use                         |
| :-------------- | :---------------------------------------------- | :---------------------------------- |
| `Canvas`        | Background of application content or documents. | Page backgrounds, Card backgrounds. |
| `CanvasText`    | Text in application content or documents.       | Body text, Headings.                |
| `LinkText`      | Text in non-active, non-visited links.          | Anchors.                            |
| `VisitedText`   | Text in visited links.                          | Visited Anchors.                    |
| `ActiveText`    | Text in active links.                           | Active Anchors.                     |
| `ButtonFace`    | Background of push buttons.                     | Button backgrounds.                 |
| `ButtonText`    | Text in push buttons.                           | Button labels.                      |
| `ButtonBorder`  | Border of push buttons.                         | Button borders.                     |
| `Field`         | Background of input fields.                     | Text inputs, Selects.               |
| `FieldText`     | Text in input fields.                           | Input text.                         |
| `Highlight`     | Background of selected text or items.           | Selection, Active states.           |
| `HighlightText` | Text of selected items.                         | Text on active states.              |
| `GrayText`      | Disabled text.                                  | Disabled buttons, hints.            |

## Proposed Mapping

### 1. Surfaces

In Forced Colors mode, subtle distinctions between "Page", "Workspace", and "Card" are intentionally flattened to ensure maximum contrast.

| Semantic Surface         | System Color | Rationale                                                                                                                                                                                                  |
| :----------------------- | :----------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `surface-page`           | `Canvas`     | Standard background.                                                                                                                                                                                       |
| `surface-workspace`      | `Canvas`     | Flattens to background.                                                                                                                                                                                    |
| `surface-card`           | `Canvas`     | Cards are containers, not buttons. They should match the background. Borders will define their edges.                                                                                                      |
| `surface-tinted`         | `Canvas`     | Tints are lost in forced colors.                                                                                                                                                                           |
| `surface-spotlight`      | `Canvas`     | Inverted sections usually flip to standard `Canvas` to respect user preference.                                                                                                                            |
| **Interactive Surfaces** | `ButtonFace` | If a surface acts as a button (e.g., a clickable card), it _could_ map to `ButtonFace`, but usually we rely on semantic HTML (`<button>`) to handle this. If we use `<div>` buttons, we must map manually. |

### 2. Text

| Semantic Text       | System Color | Rationale                                                                                                                |
| :------------------ | :----------- | :----------------------------------------------------------------------------------------------------------------------- |
| `text-strong`       | `CanvasText` | Primary content.                                                                                                         |
| `text-body`         | `CanvasText` | Paragraph content.                                                                                                       |
| `text-subtle`       | `CanvasText` | Opacity is ignored. We map to standard text to ensure legibility.                                                        |
| `text-subtlest`     | `CanvasText` | Mapping to `GrayText` implies "Disabled", which might be semantically incorrect for metadata. Safer to use `CanvasText`. |
| `text-on-spotlight` | `CanvasText` | Since spotlight background becomes `Canvas`, text must become `CanvasText`.                                              |

### 3. Borders

Borders become critical in Forced Colors mode because background differences (like shadows or slightly different shades) disappear.

| Semantic Border      | System Color | Rationale                                                 |
| :------------------- | :----------- | :-------------------------------------------------------- |
| `border-decorative`  | `CanvasText` | Defines the edges of cards/sections against the `Canvas`. |
| `border-interactive` | `Highlight`  | Indicates focus or active potential.                      |

### 4. Interactive States

| State       | System Color                  | Rationale                |
| :---------- | :---------------------------- | :----------------------- |
| `Focus`     | `Highlight` / `HighlightText` | Standard focus behavior. |
| `Selection` | `Highlight` / `HighlightText` | Standard selection.      |

## Gaps & Recommendations

### Gap 1: "Subtle" vs "Disabled"

- **Issue:** Our system has `text-subtle` and `text-subtlest` for hierarchy. In Forced Colors, these will look identical to `text-strong`.
- **Recommendation:** Accept this flattening. It is a feature, not a bug, of High Contrast mode. Do _not_ map `text-subtlest` to `GrayText` unless it is truly disabled/non-interactive.

### Gap 2: Card Edges

- **Issue:** We currently rely on shadows or lightness shifts to define cards. These vanish in Forced Colors.
- **Recommendation:** We MUST enforce a border on `surface-card` in Forced Colors mode, even if the design doesn't have one.
  - _Implementation:_ `@media (forced-colors: active) { .surface-card { border: 1px solid CanvasText; } }`

### Gap 3: Semantic Aliases (Success/Error)

- **Issue:** We plan to add `surface-error`.
- **Recommendation:** In Forced Colors, these distinct colors disappear. We must ensure that error messages include text labels (e.g., an icon or "Error:" prefix) because the red color will be gone.

## Taxonomy Alignment & Missing Concepts

## Taxonomy Alignment

## Philosophy: Taxonomy Alignment

> **Taxonomy Alignment:** The semantic "slots" in our color system should correspond 1:1 (or N:1) with the semantic "slots" in the System Color palette.

When this alignment is achieved, supporting High Contrast mode isn't about writing overrides; it's about **Natural Mapping**. If a developer correctly uses a semantic token (e.g., `surface-action`), the system _automatically_ maps it to the correct System Color (`ButtonFace`) because the concepts are aligned.

If we find ourselves writing complex overrides (e.g., "make this specific div look like a button in HC mode"), it is a smell that our taxonomy is missing a concept.

### Missing Concepts & Proposed Implementation

To achieve alignment, we must expand our taxonomy to include concepts that are distinct in the System Color palette but currently conflated or missing in our system.

| Concept            | System Color | Current Gap                                                                                                                                  | Proposed Implementation                                                                                                                                                         |
| :----------------- | :----------- | :------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Action Surface** | `ButtonFace` | We currently use `surface-card` or `surface-spotlight` for buttons. In HC mode, Cards flatten to `Canvas`, but Buttons must stay distinct.   | **New Surface:** `surface-action`. <br> **Solver:** High contrast, distinct from card. <br> **HC Map:** `ButtonFace`.                                                           |
| **Link Text**      | `LinkText`   | We rely on `<a>` tags inheriting `text-strong`. We lack a utility for "link-colored text" that isn't an anchor tag, or for explicit control. | **New Utility:** `.text-link`. <br> **CSS:** `color: var(--hue-brand)`. <br> **HC Map:** `LinkText`.                                                                            |
| **Disabled State** | `GrayText`   | We lack a standard "disabled" state.                                                                                                         | **New State:** `.state-disabled` (or `[disabled]`). <br> **CSS:** `opacity: 0.5; filter: grayscale(1)`. <br> **HC Map:** `color: GrayText; border-color: GrayText`.             |
| **Selected State** | `Highlight`  | We have `active` (pressed), but not `selected` (chosen/highlighted).                                                                         | **New State:** `.state-selected` (or `[aria-selected="true"]`). <br> **CSS:** Brand background + contrast text. <br> **HC Map:** `background: Highlight; color: HighlightText`. |

## Implementation Plan

We will execute this in three phases to ensure stability.

### Phase 1: Taxonomy Expansion (The "Slots")

Add the missing concepts to the system so they exist as valid tokens.

1.  Add `surface-action` to `surface-lightness.config.json`.
2.  Add `.text-link` to `utilities.css`.
3.  Add `.state-disabled` and `.state-selected` logic to `utilities.css`.

### Phase 2: Default Implementation (The "Look")

Define how these new concepts look in standard Light/Dark modes.

1.  `surface-action`: Should look clickable (perhaps slightly darker/lighter than card).
2.  `text-link`: Use brand hue.
3.  `state-disabled`: Visual graying out.
4.  `state-selected`: Brand highlight.

### Phase 3: System Color Mapping (The "Wiring")

Once the slots exist, wire them to the System Colors in `base.css`.

```css
@media (forced-colors: active) {
  /* ... global overrides ... */

  /* The Natural Mapping */
  .surface-action {
    background-color: ButtonFace;
    color: ButtonText;
  }
  .text-link {
    color: LinkText;
  }
  .state-disabled {
    color: GrayText;
    border-color: GrayText;
  }
  .state-selected {
    background-color: Highlight;
    color: HighlightText;
  }
}
```
