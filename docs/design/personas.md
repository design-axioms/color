# Project Personas

These personas represent the core audience for the Algebraic Color System. We use them to guide design decisions, prioritize features, and shape our documentation.

## 1. The Overwhelmed Pragmatist
*A front-end developer who knows they "should" do better with colors but is drowning in requirements.*

-   **Description**: They are building a product and just want to ship. They know hardcoding hex values is "technical debt," but the alternative (learning color theory, managing dark mode, checking contrast) feels like a massive distraction from their actual feature work.
-   **Needs**:
    -   **Zero-Config Defaults**: A system that looks good immediately upon installation.
    -   **"It Just Works" Dark Mode**: They don't want to configure it; they just want it to happen.
    -   **Simple API**: Classes like `text-subtle` that explain *what* they are, not *what color* they are.
-   **Frustrations**:
    -   Complex setup processes.
    -   Reading long treatises on color theory just to pick a button color.
    -   Tools that require them to make design decisions they don't feel qualified to make.
-   **Focus**: The CLI (init command), the "Thinking in Surfaces" mental model (simplification), and copy-pasteable examples.

## 2. The Visual Tinkerer
*Interested in design, uses tools like Culori, but stuck at the "palette generation" stage.*

-   **Description**: They enjoy playing with colors and have likely used online generators to make nice 5-color palettes. However, they struggle to translate those static palettes into a full, accessible UI system. They often get stuck when their beautiful palette falls apart in Dark Mode.
-   **Needs**:
    -   **Visual Feedback**: They need to see how their choices affect the UI in real-time (The Theme Builder).
    -   **Bridge to Logic**: They need to understand *how* to take their aesthetic intent and apply it systematically.
    -   **Control**: They want to tweak hues and chroma, not just accept a black-box result.
-   **Frustrations**:
    -   "Magic" tools that ruin their specific aesthetic choices.
    -   The gap between "a nice palette" and "a working UI."
-   **Focus**: The Theme Builder, Hue Shifting (aesthetic control), and the "Physics of Light" concept (explaining the system visually).

## 3. The Conflicted Advocate
*Cares about accessibility but is burnt out by the difficulty of manual compliance.*

-   **Description**: They know accessibility is important, but they've been burned by the friction of maintaining it. They are constantly fighting with designers or their own desire for "pretty" UI vs. "accessible" UI. They are on the fence: "Is it worth the effort if it makes everything look like a government form?"
-   **Needs**:
    -   **Proof of Robustness**: They need to trust that the system handles edge cases (High Contrast, Forced Colors) automatically.
    -   **No-Compromise Solutions**: They want to see that accessible code can still be beautiful.
    -   **Automation**: They want the system to be the "bad cop" so they don't have to be.
-   **Frustrations**:
    -   Manual contrast checking.
    -   False positives in linting tools.
    -   The feeling that accessibility is a tax on creativity.
-   **Focus**: The Solver's guarantee (APCA compliance), "Accessibility First" documentation, and automated contrast checking features.

## 4. The Color Scientist
*Immersed in color theory and a11y, excited for a tool that handles the math.*

-   **Description**: They know what OKLCH is, they understand gamut clipping, and they have strong opinions on perceptual uniformity. They are tired of building their own hacky scripts to manage this and are looking for a "Pro" tool.
-   **Needs**:
    -   **Deep Control**: Access to the raw math, curves, and anchors.
    -   **Advanced Features**: P3 gamut support, custom interpolation curves.
    -   **Transparency**: They need to know exactly how the solver works (no black boxes).
-   **Frustrations**:
    -   Simplistic tools that hide the details ("dumbed down").
    -   Incorrect math or bad interpolation in other tools.
-   **Focus**: "Solver Internals," advanced configuration options, and the raw token API.

## 5. The System Alumnus
*Used to a corporate design system, now realizing how hard it is to build one from scratch.*

-   **Description**: They previously worked at a Big Tech company where "Dark Mode" and "Theming" were solved problems provided by a platform team. Now working on a startup or side project, they are shocked by the complexity of recreating that infrastructure.
-   **Needs**:
    -   **Structure**: They miss the standardized naming conventions and reliability of their old system.
    -   **Scalability**: They want a solution that feels "enterprise-grade" but fits in a side project.
    -   **Documentation**: They expect high-quality docs like they had internally.
-   **Frustrations**:
    -   Reinventing the wheel.
    -   Messy, unorganized CSS variables.
    -   Lack of standardization in open-source tools.
-   **Focus**: The "Catalog" (standardized components), the token system structure, and the architectural philosophy.
