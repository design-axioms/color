# Axiom III: The Laws of Architecture (Surfaces)

These axioms describe how the system organizes UI elements, moving from "Pages" to "Compositions".

## 4. Surfaces are Containers

Every visible element lives on a **Surface**.

### No Floating Content

Text, icons, and borders never exist in a vacuum. They are always "on" something.

- If you place text directly on `<body>`, you are implicitly placing it on the `Page` surface.
- The system models this relationship explicitly: `Surface -> Content`.

### Taxonomy

We define a strict taxonomy of surfaces based on semantic role:

- **Canvas**: The infinite backdrop (`page`, `workspace`).
- **Object**: A contained element (`card`, `tinted`, `layer`).
- **Action**: An interactive element (`action`, `button`).
- **Spotlight**: A high-emphasis element (`spotlight`, `banner`).

## 5. Context Flows Down

A surface establishes the **Context** for its children.

### Inheritance

When you nest a Card on a Page, the Card consumes the Page's context and creates a new context for its contents.

- **Input**: Parent Context (Mode, Polarity).
- **Transformation**: Surface Logic (e.g., "I am a Card, so I should be slightly lighter/darker than my parent").
- **Output**: New Context for children.

### Automatic Adjustment

The system automatically adjusts contrast and polarity based on the nesting level.

- You don't manually pick "Dark Card" or "Light Card".
- You just pick "Card". The system decides if it needs to be light or dark based on where it sits.

## 6. Text is Relative

Text color is defined by the surface it sits on, not by global variables.

### Context Consumers

Text tokens (`text-strong`, `text-subtle`) are abstract requests for contrast.

- They do not hold color values.
- They hold **Intent** (e.g., "I need high contrast").

### Inversion

- `text-strong` on a light surface is dark.
- `text-strong` on a dark surface is light.
- The component doesn't know or care; it just asks for "Strong Text".
- This decoupling allows components to be portable across any surface without modification.
