# Implementation Plan - Phase 5: Holistic Review & Theme Builder Polish

## Goal

Ensure the entire documentation site and the Theme Builder UI work together cohesively to teach the user the system's mental model. We want to move from "functional" to "educational and intuitive."

## Strategy

1.  **Holistic Review (The "Fresh Eyes" Audit)**
    - **Objective**: Re-evaluate the system from the perspective of our Personas (Sarah, Alex, Jordan, etc.) given the recent changes (Astro migration, new features).
    - **Action**: Update `docs/design/fresh-eyes-review.md` with current findings.
    - **Focus Areas**:
        - **Navigation**: Is the "Theme Builder" easy to find?
        - **Cohesion**: Do the docs and the demo app feel like one product?
        - **Dogfooding**: Are there any hardcoded colors left in the docs?

2.  **Theme Builder Deep Dive**
    - **Objective**: Ensure the Theme Builder UI is professional and ergonomic.
    - **Action**: Audit the UI against the "Mental Model" described in the docs.
    - **Focus Areas**:
        - **Terminology**: Does the UI use the same terms as the docs (Anchors, Surfaces)?
        - **Feedback**: Is the "Live Solving" obvious?
        - **Mobile**: Does the layout work on smaller screens?

3.  **Execution (Polish)**
    - **Visuals**: Create new diagrams (using HTML/CSS/SVG) if concepts are abstract.
    - **UI Tweaks**: Rename labels, add tooltips, or rearrange controls to match the mental model.
    - **Content Updates**: Rewrite sections of the guide that are confusing or outdated.

## Output

- Updated `docs/design/fresh-eyes-review.md` with 2025 findings.
- A list of concrete "Action Items" (PRs) to address the findings.
- Updated documentation and UI code.
