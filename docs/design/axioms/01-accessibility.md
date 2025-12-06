# Axiom I: The Prime Directive

**Accessibility is the Foundation of Aesthetics.**

> A design cannot be beautiful if it cannot be perceived.

We reject the idea that accessibility and aesthetics are in conflict; instead, we treat accessibility as the physical medium upon which beauty is built. Just as an architect must respect gravity before designing a spire, a color system must respect human perception before defining a palette.

## Implications

### Constraint, Not Feature

Accessibility is not a "nice to have" or a compliance checklist item to be addressed at the end of the project. It is the **mathematical constraint solver** that generates the palette.

- We do not pick colors and then check if they pass.
- We define contrast ratios (APCA/WCAG) and generate colors that satisfy them.

### Universal Perception

We design for the human eye in all its variations, not just the designer's monitor or the "average" user.

- **Aging**: As lenses yellow with age, blue/purple distinction fades.
- **Color Blindness**: Red/Green distinction is common.
- **Low Vision**: Contrast sensitivity drops.
- **Environment**: Glare, dim screens, and night mode are "situational disabilities" that affect everyone.

### The "Safe Zone"

The system defines a "Safe Zone" of contrast. Colors outside this zone are not just "discouraged"; they are mathematically impossible to generate within the standard solver configuration. To break accessibility, you must explicitly override the system (e.g., `force: true`).
