# Project Personas

These personas represent the core audience for the Algebraic Color System. We use them to guide design decisions, prioritize features, and shape our documentation.

## 1. The Overwhelmed Pragmatist

_A front-end developer who knows they "should" do better with colors but is drowning in requirements._

- **Description**: They are building a product and just want to ship. They know hardcoding hex values is "technical debt," but the alternative (learning color theory, managing dark mode, checking contrast) feels like a massive distraction from their actual feature work.
- **Relationship to Axioms**:
  - **Laws of Architecture**: They rely on the system's taxonomy (`surface-card`, `text-subtle`) to make decisions for them. They don't want to think about _color_; they want to think about _structure_.
  - **Prime Directive**: They trust the system to handle accessibility compliance so they don't have to be an expert.
- **Needs**:
  - **Zero-Config Defaults**: A system that looks good immediately upon installation.
  - **"It Just Works" Dark Mode**: They don't want to configure it; they just want it to happen.
  - **Simple API**: Classes that explain _what_ they are, not _what color_ they are.
- **Focus**: The CLI (init command), the "Thinking in Surfaces" mental model (simplification), and copy-pasteable examples.

## 2. The Visual Tinkerer

_Interested in design, uses tools like Culori, but stuck at the "palette generation" stage._

- **Description**: They enjoy playing with colors and have likely used online generators to make nice 5-color palettes. However, they struggle to translate those static palettes into a full, accessible UI system. They often get stuck when their beautiful palette falls apart in Dark Mode.
- **Relationship to Axioms**:
  - **Laws of Physics**: They are constantly fighting the "Chroma is Expensive" law. The system helps them visualize _why_ their vibrant colors are failing contrast checks.
  - **No Magic Numbers**: They want to move from arbitrary hex codes to a system where they can tweak parameters (curves, anchors) to achieve their vision.
- **Needs**:
  - **Visual Feedback**: They need to see how their choices affect the UI in real-time (The Theme Builder).
  - **Bridge to Logic**: They need to understand _how_ to take their aesthetic intent and apply it systematically.
  - **Control**: They want to tweak hues and chroma, not just accept a black-box result.
- **Focus**: The Theme Builder, Hue Shifting (aesthetic control), and the "Physics of Light" concept (explaining the system visually).

## 3. The Accessibility Champion (formerly "The Conflicted Advocate")

_Empowered by the system to prove that accessibility and beauty are compatible._

- **Description**: They are the guardian of quality on their team. They used to be the "bad cop," constantly flagging contrast issues and fighting with designers. Now, they use the Color System as their "enforcer," allowing them to focus on higher-level UX issues.
- **Relationship to Axioms**:
  - **Prime Directive**: This is their manifesto. They love that the system treats accessibility as a _constraint_, not a feature.
  - **Code is Source of Truth**: They value that the system generates tokens deterministically, preventing regression.
- **Needs**:
  - **Proof of Robustness**: They need to trust that the system handles edge cases (High Contrast, Forced Colors) automatically.
  - **No-Compromise Solutions**: They want to see that accessible code can still be beautiful.
  - **Automation**: They want the system to be the "bad cop" so they don't have to be.
- **Focus**: The Solver's guarantee (APCA compliance), "Accessibility First" documentation, and automated contrast checking features.

## 4. The Color Scientist

_Immersed in color theory and a11y, excited for a tool that handles the math._

- **Description**: They know what OKLCH is, they understand gamut clipping, and they have strong opinions on perceptual uniformity. They are tired of building their own hacky scripts to manage this and are looking for a "Pro" tool.
- **Relationship to Axioms**:
  - **Laws of Physics**: They deeply appreciate the "Hue Rotates" (Bezold-Brücke) implementation and the use of OKLCH.
  - **No Magic Numbers**: They want to inspect the curves and verify the math.
- **Needs**:
  - **Deep Control**: Access to the raw math, curves, and anchors.
  - **Advanced Features**: P3 gamut support, custom interpolation curves.
  - **Transparency**: They need to know exactly how the solver works (no black boxes).
- **Focus**: "Solver Internals," advanced configuration options, and the raw token API.

## 5. The System Architect (formerly "The System Alumnus")

_Building the foundation for a team or organization._

- **Description**: They are responsible for the "Design System" of their company or project. They care about maintainability, scalability, and developer experience. They need a system that prevents "drift" and ensures consistency across a large codebase.
- **Relationship to Axioms**:
  - **Laws of Integration**: They are the primary beneficiary of "Code is Source of Truth". They need the system to integrate with Figma, Tailwind, and other tools.
  - **Laws of Architecture**: They use the "Surfaces are Containers" axiom to enforce consistent nesting rules across the team.
- **Needs**:
  - **Structure**: They miss the standardized naming conventions and reliability of their old system.
  - **Scalability**: They want a solution that feels "enterprise-grade" but fits in a side project.
  - **Documentation**: They expect high-quality docs like they had internally.
- **Focus**: The "Catalog" (standardized components), the token system structure, and the architectural philosophy.
