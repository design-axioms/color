# Axiom X: The Law of Semantic Continuity

**Transitions between states must preserve the semantic intent of the endpoints, even if it requires a longer path through the solution space.**

## The Principle

In a digital system, the "shortest path" between two values is often mathematically simple (linear interpolation) but semantically incorrect.

- **Math**: The shortest distance between Blue (260°) and Orange (40°) is through Green (150°).
- **Intent**: The semantic transition from "Cool Shadow" to "Warm Highlight" implies passing through Purple/Red (350°), not Green.

We reject "default" interpolation when it violates the semantic intent of the design.

## Applications

### 1. Hue Shifting (The "Long Way" Rule)

When shifting hues across a lightness gradient, we do not simply take the shortest path around the color wheel. We define a **Semantic Path** (e.g., "Cool to Warm") and force the interpolation to follow it, even if it means traversing a larger arc.

### 2. Animation (Morphing)

When morphing between shapes or states, we prioritize the preservation of meaning over the minimization of pixel delta.

- A "Menu" becoming a "Close Icon" should animate in a way that explains the transformation, not just fades pixels.

### 3. Theme Switching (Contrast Preservation)

When switching from Light to Dark mode, we do not simply invert values. We preserve the **Contrast Ratio** (the semantic relationship) between foreground and background.

- A surface that is "dim" in Light mode might need to be "bright" in Dark mode to maintain the same semantic hierarchy, even if the linear inversion suggests otherwise.

## The Corollary of Visualization

**If a semantic path cannot be visualized clearly, the design is ambiguous.**

We must build tools (like the Hue Shift Visualizer) that expose the _actual_ path taken by the system, not an idealized or simplified version. If the visualization looks "wrong" (e.g., a linear gradient that skips the intended hue), it reveals a flaw in the implementation or the mental model.
