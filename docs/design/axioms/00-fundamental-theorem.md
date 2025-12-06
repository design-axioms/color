# The Fundamental Theorem

> **Axiom 0**: Color is a function of Context and Intent.

$$
Color = f(Context, Intent)
$$

## The Principle

In a static design system, a color is a value (e.g., `#3b82f6`).
In Axiomatic Color, a color is a **function**.

- **Intent**: The semantic role of the element (e.g., "Primary Action", "Surface", "Critical Alert").
- **Context**: The environment in which the element exists (e.g., "Light Mode", "Dark Mode", "Inside a Card", "On a Dark Header").

The final pixel value is only resolved when these two factors meet.

For a rigorous mathematical definition of this function and its operators, see [The Algebra of Color Design](../composition-algebra.md).

## The Reactive Pipeline

Modern reactivity is the efficient operationalization of a dependency graph. In our system, the browser's CSS engine is the reactive runtime.

- **Signals**: CSS Custom Properties (Variables) act as signals.
- **Derivations**: `calc()` and `light-dark()` are the derived values.
- **Effect**: The painted pixel is the side effect.

When the Context changes (e.g., user toggles Dark Mode, or an element is moved inside an inverted container), the function re-evaluates automatically.

## Implications

1.  **No Static Colors**: You cannot ask "What color is `surface.card`?" without specifying the context. You can only ask "What is the function for `surface.card`?"
2.  **Late Binding**: We defer the resolution of the color value as late as possible—ideally to the browser's paint cycle.
3.  **Context Flow**: Context must flow down the DOM tree. Parent elements establish context for their children.
