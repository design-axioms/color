# Axiom IX: The Law of "Just Enough" Configuration

## The Law

**We expose knobs for _intent_, not _implementation_.**

## The Rationale

A "Physics Engine" can be overwhelming if every variable is exposed. Users shouldn't need to know the coefficients of the APCA contrast algorithm to get a readable button. They should express their intent ("I want a high-contrast button") and let the system handle the math.

## The Implications

1.  **Semantic Configuration**: Config options should be named after the _effect_ they have (e.g., `targetContrast`), not the _mechanism_ they use.
2.  **Sensible Defaults**: The system should produce a beautiful, accessible result with zero configuration. Configuration is for _deviation_ from the norm.
3.  **Progressive Disclosure**: Advanced controls (like custom hue shift curves) should be available but tucked away, not presented as required inputs.
