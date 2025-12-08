# The Law of Static Projection

> **Axiom 6**: Static exports are snapshots, not the system.

## The Principle

Because the Fundamental Theorem states that $Color = f(Context, Intent)$, any format that cannot execute this function (like a JSON file or a PDF) is merely a **projection** of the system.

## The Projection Rule

> "Any export to a static format is a projection of the system at a specific point in time or context. It is a snapshot, not the system itself."

## Implications

1.  **Lossiness is Acceptable**: We accept that a JSON export cannot "react" to a new background color like the runtime engine can. It is a "baked" version of the system.
2.  **Exhaustive Enumeration**: Since the external tool can't calculate values on the fly, we must **pre-calculate** the common states (e.g., Light Mode, Dark Mode, High Contrast).
3.  **Source of Truth**: The TypeScript/Math logic remains the Single Source of Truth. The JSON is a build artifact, never the source.
