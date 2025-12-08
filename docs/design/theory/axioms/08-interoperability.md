# Axiom VIII: The Law of Lossless Interoperability

> **Related Documents**: [Interoperability Strategy](../../../integration/interoperability-strategy.md)

## The Law

**We export to other formats without losing semantic meaning.**

Axiomatic Color aims to be the "Source of Truth" for a design system. This means it cannot be an island. It must play nicely with the broader ecosystem of design tools and frameworks.

## The Rationale

Most interoperability layers degrade data. Exporting to Tailwind often means flattening dynamic tokens into static hex codes. Exporting to Figma often means losing the logic of _why_ a color is what it is. We reject this degradation.

## The Implications

1.  **Semantic Transport**: We prioritize formats that preserve the _semantics_ of the system, not just the values.
2.  **Reactive Exports**: When exporting to frameworks like Tailwind, we map to our reactive CSS variables, ensuring that the "Late Binding" axiom survives the export.
3.  **Round-Trip Capability**: Ideally, the system should be able to hydrate its configuration from external sources (like DTCG tokens) if they preserve enough semantic fidelity.
