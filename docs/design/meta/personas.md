# Project Personas

> **Status**: Living Document
> **Version**: 1.2 (Epoch 19)

These personas represent the core audience for Axiomatic Color. We use them to guide design decisions, prioritize features, and shape our documentation.

## 1. The Overwhelmed Pragmatist (Sarah)

_A front-end developer who knows they "should" do better with colors but is drowning in requirements._

- **Description**: Sarah is building a product and just wants to ship. She knows hardcoding hex values is "technical debt," but the alternative (learning color theory, managing dark mode, checking contrast) feels like a massive distraction. She is highly sensitive to friction—if the CLI fails or the docs are wrong, she bails.
- **Relationship to Axioms**:
  - **Laws of Architecture**: She relies on the Axiomatic taxonomy (`surface-card`, `text-subtle`) to make decisions for her. She doesn't want to think about _color_; she wants to think about _structure_.
  - **Prime Directive**: She trusts Axiomatic to handle accessibility compliance so she doesn't have to be an expert.
- **Needs**:
  - **Reliability**: The CLI must work exactly as documented. No "command not found" or confusing flags.
  - **Zero-Config Defaults**: A system that looks good immediately upon installation.
  - **"It Just Works" Dark Mode**: She doesn't want to configure it; she just wants it to happen.
  - **Simple API**: Classes that explain _what_ they are, not _what color_ they are.
- **Focus**: The CLI (`init`, `build`), the "Thinking in Surfaces" mental model (simplification), and copy-pasteable examples.

## 2. The Visual Tinkerer (Alex)

_Frontend specialist, design-eye, learns by poking._

- **Description**: Alex enjoys playing with colors and has likely used online generators to make nice 5-color palettes. However, he struggles to translate those static palettes into a full, accessible UI system. He learns by doing and wants immediate visual feedback.
- **Relationship to Axioms**:
  - **Laws of Physics**: He is constantly fighting the "Chroma is Expensive" law. The system helps him visualize _why_ his vibrant colors are failing contrast checks.
  - **No Magic Numbers**: He wants to move from arbitrary hex codes to a system where he can tweak parameters (curves, anchors) to achieve his vision.
- **Needs**:
  - **Immediate Feedback**: He needs to see how his choices affect the UI in real-time (The Theme Builder).
  - **Playgrounds**: Small, interactive demos in the docs to test concepts (like Hue Shifting) in isolation.
  - **Bridge to Logic**: He needs to understand _how_ to take his aesthetic intent and apply it systematically.
- **Focus**: The Theme Builder, Hue Shifting (aesthetic control), and the "Physics of Light" concept (explaining the system visually).

## 3. The Accessibility Champion (Jordan)

_Empowered by the system to prove that accessibility and beauty are compatible._

- **Description**: Jordan is the guardian of quality on their team. They used to be the "bad cop," constantly flagging contrast issues and fighting with designers. Now, they use the Color System as their "enforcer," allowing them to focus on higher-level UX issues.
- **Relationship to Axioms**:
  - **Prime Directive**: This is their manifesto. They love that the system treats accessibility as a _constraint_, not a feature.
  - **Code is Source of Truth**: They value that the system generates tokens deterministically, preventing regression.
- **Needs**:
  - **Proof of Compliance**: They need explicit mapping between the system's APCA targets and WCAG 2.1/3.0 standards to satisfy legal requirements.
  - **Robustness**: They need to trust that the system handles edge cases (High Contrast, Forced Colors) automatically.
  - **Automation**: They want the system to be the "bad cop" so they don't have to be.
- **Focus**: The Solver's guarantee (APCA compliance), "Accessibility First" documentation, and automated contrast checking features.

## 4. The Color Scientist (Dr. Chen)

_Immersed in color theory and a11y, excited for a tool that handles the math._

- **Description**: Dr. Chen knows what OKLCH is, understands gamut clipping, and has strong opinions on perceptual uniformity. She is tired of building her own hacky scripts to manage this and is looking for a "Pro" tool that respects the math.
- **Relationship to Axioms**:
  - **Laws of Physics**: She deeply appreciates the "Hue Rotates" (Bezold-Brücke) implementation and the use of OKLCH.
  - **No Magic Numbers**: She wants to inspect the curves and verify the math.
- **Needs**:
  - **Deep Control**: Access to the raw math, curves, and anchors.
  - **Advanced Features**: P3 gamut support, custom interpolation curves.
  - **Transparency**: She needs to know exactly how the solver works (no black boxes).
- **Focus**: "Solver Internals," advanced configuration options, and the raw token API.

## 5. The System Architect (Marcus)

_Building the foundation for a team or organization._

- **Description**: Marcus is responsible for the "Design System" of his company. He cares about maintainability, scalability, and developer experience. He needs a system that prevents "drift" and ensures consistency across a large codebase and multiple tools (Figma, Code).
- **Relationship to Axioms**:
  - **Laws of Integration**: He is the primary beneficiary of "Code is Source of Truth". He needs the system to integrate with Figma, Tailwind, and other tools without data loss.
  - **Laws of Architecture**: He uses the "Surfaces are Containers" axiom to enforce consistent nesting rules across the team.
- **Needs**:
  - **Lossless Interoperability**: Exports (DTCG, Tailwind) must preserve the full fidelity of the system (P3 colors, semantic tokens).
  - **Structure**: He misses the standardized naming conventions and reliability of his old system.
  - **Scalability**: He wants a solution that feels "enterprise-grade" but fits in a side project.
- **Focus**: The "Catalog" (standardized components), the token system structure, and the architectural philosophy.
