# Remediation Plan & Roadmap (Epoch 34+)

## Overview

The "Conceptual Integrity Review" (Epoch 33) concluded that the system's architecture is sound. The "Remediation" phase is therefore focused on prioritizing future enhancements and paying down minor technical debt, rather than fixing critical architectural flaws.

## Prioritized Work (Epoch 34 Candidates)

### 1. Simplify Token Surface (Architecture)

- **Problem**: Special tokens like `highlight-surface-color` exist outside the standard "Surface" model, creating inconsistency.
- **Solution**: Refactor these into standard surfaces (e.g., `.surface-highlight`) that leverage the core composition engine.
- **Benefit**: "Everything is a surface". Reduces special cases in the generator and improves predictability.

### 2. Interactive Tutorials (Education)

- **Problem**: The system is powerful but complex. Users need guidance on concepts like "Contrast Space" and "Surface Context".
- **Solution**: Build guided walkthroughs within the Theme Builder.
- **Benefit**: Increases adoption and understanding.

### 3. CSS Bundling (Infrastructure)

- **Problem**: We currently use `cat` to bundle CSS. This is fragile and lacks optimization.
- **Solution**: Migrate to Lightning CSS.
- **Benefit**: Better performance (minification), safer dependency management, and future-proofing.

## Deferred / Low Priority

- **CSP Reporting**: Valuable for production security, but not blocking current development.
- **`@algebraic-systems/layout`**: A massive undertaking. Should be its own Epoch/Project.

## Recommendation

**Epoch 34** should focus on **"Refinement & Education"**.

1.  **Phase 1**: Infrastructure (CSS Bundling). Get the build system rock solid.
2.  **Phase 2**: Architecture (Simplify Token Surface). Clean up the last bits of "magic" tokens.
3.  **Phase 3**: Education (Interactive Tutorials). Teach the world how to use it.
