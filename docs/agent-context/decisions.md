# Decision Log

This file tracks key architectural and design decisions made throughout the project. It serves as a reference to understand _why_ things are the way they are and prevents re-litigating settled issues without new information.

## Format

### [Date] Title of Decision

- **Context**: What was the problem or situation?
- **Decision**: What did we decide to do?
- **Rationale**: Why did we choose this path? What alternatives were considered?

### [2025-11-25] Defer Framework Integration

- **Context**: We planned to add React/Vue hooks in Epoch 3.
- **Decision**: Defer this work.
- **Rationale**: The core library should remain framework-agnostic. The hooks are trivial to implement by consumers (`useMemo(() => solve(config), [config])`). Adding them now would complicate the build/test setup without significant value.

### [2025-11-25] Vendor Mermaid.js for Documentation

- **Context**: We needed to render Mermaid diagrams in `mdbook`. The standard solution is `mdbook-mermaid`, a Rust binary.
- **Decision**: Vendor `mermaid.min.js` and inject it via a custom script.
- **Rationale**:
  - **Portability**: Avoids requiring a Rust toolchain (`cargo install`) for documentation contributors.
  - **Simplicity**: Keeps the project focused on Web technologies (JS/CSS).
  - **Control**: Allows us to update the script version easily via `scripts/update-mermaid.sh`.

### [2025-11-25] Live CSS for Documentation Visualizations

- **Context**: We needed to explain complex color concepts (polarity, hue shifting) in the documentation. Static images are hard to maintain and don't show the "real" system.
- **Decision**: Inject the actual system CSS (`tokens`, `engine`, `utilities`) into the documentation site and use HTML/CSS for diagrams.
- **Rationale**: Ensures documentation is always up-to-date with the code. Demonstrates the system's capabilities directly in the guide.

### [2025-11-25] Documentation Architecture Split

- **Context**: The "Runtime" documentation was confusing because it mixed static CSS concepts (Context Variables) with dynamic JavaScript APIs (Engine).
- **Decision**: Split documentation into "CSS Architecture" (Static) and "Runtime API" (Dynamic).
- **Rationale**: Clarifies the mental model. Most users only need to understand the CSS Architecture to _use_ the system. The Runtime API is only for advanced users building dynamic tools.

### [2025-11-25] Rename "Solver" to "Theme Builder" in Docs

- **Context**: Users were confused by the term "Solver" when the UI is called "Theme Builder".
- **Decision**: Rename the documentation chapter to "Theme Builder" and frame the "Solver" as the internal engine.
- **Rationale**: Aligns documentation with the product UI. Reduces cognitive load by using consistent terminology.

### [2025-11-25] Align Taxonomy with System Colors

- **Context**: We needed a robust way to support Windows High Contrast (Forced Colors) mode.
- **Decision**: Explicitly map our semantic roles (Surface, Action, etc.) to CSS System Colors (`Canvas`, `ButtonFace`, etc.) via a variable swap in `engine.css`.
- **Rationale**: Provides automatic, platform-native accessibility support without requiring users to write manual media queries for every surface.

### [2025-11-25] Keep "Solver" Terminology for API

- **Context**: We considered renaming the `solve()` function to `build()` or `ThemeBuilder` to match the UI.
- **Decision**: Keep `Solver` and `solve()` for the core API.
- **Rationale**:
  - **Precision**: "Solve" accurately describes the constraint-based mathematical process (APCA contrast). "Build" implies simple assembly.
  - **Separation**: Distinguishes the calculation phase (`solve`) from the output generation phase (`generateTokensCss`).
  - **Clarity**: Avoids naming conflicts with the `ThemeBuilder` UI component in the demo.

### Browser Integration (Epoch 5: Phase 1)

- **Unified Theme Manager**: We decided to centralize all theme-related side effects (DOM classes, meta tags, favicons) into a single `ThemeManager` class rather than having disparate utilities. This ensures a single source of truth for the current mode.
- **Event-Driven Sync**: We chose to use `requestAnimationFrame` and event listeners for syncing theme changes instead of `MutationObserver` or polling. This is more performant and less prone to race conditions.
- **Native UI Primitives**: We opted to use standard CSS properties (`color-scheme`, `scrollbar-color`) for native UI integration, ensuring that the system plays nicely with the browser's built-in form controls and scrollbars without requiring custom JavaScript for every element.
