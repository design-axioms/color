# Selection vs. Focus

## The Problem

In complex creative tools like the Theme Builder, there are two distinct types of "attention" that the user directs at the interface:

1.  **Interaction Attention**: "Which element will receive my keyboard input if I type right now?"
2.  **Inspection Attention**: "Which element's properties am I currently viewing or editing in the inspector?"

In simple applications, these are often the same. If you click an input field, you are both inspecting its value and ready to type into it.

However, in a structural editor (like our Context Tree), these often diverge. You might be tabbing through the settings panel (Focus) while the "Card" surface remains selected in the tree (Selection). If both use the same visual language (e.g., a blue ring), the user loses context of what is being edited versus what is being operated on.

## Semantic Roles

### Focus (`focus`)

- **Role**: Interaction.
- **Behavior**: Ephemeral. Moves rapidly as the user tabs or clicks.
- **Scope**: The operating system or browser usually manages this state.
- **Visual**: Typically a ring or outline.
- **Token**: `focus.ring`.

### Selection (`highlight`)

- **Role**: Attention / Reference.
- **Behavior**: Persistent. Stays on an object until the user explicitly chooses another.
- **Scope**: The application state manages this.
- **Visual**: Can be a ring, a background, or a border.
- **Token**: `highlight.ring`, `highlight.surface`.

## Visual Language

To reinforce this distinction, we assign distinct hues to these roles.

- **Focus**: Uses the **Brand** color (Default: Blue, Hue 250). This aligns with standard browser behavior and indicates "active" state.
- **Highlight**: Uses a **Highlight** color (Default: Magenta, Hue 320). This is chosen specifically to be distinct from the Brand color while maintaining a similar level of visual weight. It is used for Selection, Search Results (`<mark>`), and other "pay attention to this" indicators.

## System Integration

We elevated `highlight` to a **Primitive** in the core design system (`@axiomatic-design/color`).

Why not just hardcode a pink color in the site's CSS?

1.  **Theming**: Users of the system might want to build their own tools or complex dashboards. They should be able to define what "Attention" looks like in their theme.
2.  **Consistency**: By making it a token (`--highlight-ring-color`), we ensure that the "Selection" state looks the same across the Context Tree, the Stage Preview, and any other inspection tools we build.
3.  **Accessibility**: The solver ensures that the generated highlight colors meet contrast requirements against the background, just like it does for the focus ring.

## Implementation Details

The `highlight` primitive generates two tokens:

- `--highlight-ring-color`: For outlines (e.g., the ring around the selected element in the Stage).
- `--highlight-surface-color`: For backgrounds (e.g., the background of the selected row in the Context Tree, or the `<mark>` element).

This allows us to handle both "overlay" style highlighting and "list item" style selection with a cohesive color story.
