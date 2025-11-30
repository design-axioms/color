# Fresh Eyes Audit 4: The "Missing Features" Review

> **Date**: November 29, 2025
> **Focus**: Uniformity, Smoothness, and "Missing Features" by Persona.

## Introduction

This audit adopts the perspective of our five personas to identify "missing features"—capabilities that a user would reasonably expect to exist given the current feature set, but which are absent or obscured. The goal is to ensure a uniform level of abstraction and a smooth user journey.

## 1. Sarah (The Overwhelmed Pragmatist)

**Expectation**: "I just want to drop this in and have it work."

- **The "Copy-Paste" Gap**: Sarah sees the "Catalog" in the docs, but she can't just copy-paste a "Card" component. She has to manually apply `surface-card`, `text-strong`, `bordered`, etc.
  - _Missing Feature_: A **Snippet Library** or **Component Gallery** (HTML/React/Svelte) that demonstrates how to compose the tokens into common UI patterns.
- **The "Dark Mode Toggle" Gap**: The system generates the _colors_ for dark mode, but Sarah has to write the JS to toggle the `data-theme` or `class="dark"`.
  - _Missing Feature_: A tiny, copy-pasteable `<script>` tag or a `color-system-toggle` web component that handles the system preference matching and toggling.
- **The "Reset" Gap**: She installs the system, but her browser's default styles (margins, fonts) make it look bad.
  - _Missing Feature_: A `base.css` or `reset.css` that sets up the typography and box-sizing to match the system's assumptions. (We have `utilities.css`, but is it enough?)

## 2. Alex (The Visual Tinkerer)

**Expectation**: "I want to tweak it until it feels right."

- **The "Brand Override" Gap**: Alex wants his "Action" buttons to be his brand color, but the system forces them to be a specific lightness for contrast. He tries to change the hue, but the lightness remains locked.
  - _Missing Feature_: A clear "Override" or "Soft Constraint" mode in the Theme Builder where he can say "I know this fails APCA, but I want this specific hex for the background," and the system adjusts the _text_ to match, rather than forcing the background.
- **The "Texture" Gap**: He wants to add noise, gradients, or background images to his surfaces. The system only thinks in flat colors.
  - _Missing Feature_: Support for `background-image` or "Texture Tokens" within the Surface definition.

## 3. Jordan (The Accessibility Champion)

**Expectation**: "Prove it's accessible."

- **The "Audit Report" Gap**: Jordan trusts the system, but his boss needs a report. He has to manually check the contrast in the browser.
  - _Missing Feature_: `color-system audit` command that outputs a JSON/HTML report of all surface/text combinations and their APCA scores.
- **The "Why" Gap**: When a color is shifted for contrast, Jordan wants to know _how much_.
  - _Missing Feature_: Debug metadata in the generated CSS (e.g., `--debug-contrast-ratio: 4.5`) or a "Debug Mode" overlay in the browser.

## 4. Dr. Chen (The Color Scientist)

**Expectation**: "Let me control the math."

- **The "Curve Control" Gap**: The system uses a standard curve for lightness scaling. Dr. Chen wants to use a custom Bezier curve or a specific easing function.
  - _Missing Feature_: `interpolation` options in the `color-config.json` (e.g., `linear`, `ease-in`, `custom-bezier`).
- **The "Gamut Mapping" Gap**: She wants to choose _how_ colors are clipped to sRGB (Oklch chroma reduction vs. hue shifting).
  - _Missing Feature_: `gamutMapping` strategy configuration.

## 5. Marcus (The System Architect)

**Expectation**: "This needs to fit into my existing pipeline."

- **The "Prefix" Gap**: Marcus's company uses `acme-` as a prefix for all CSS variables. The system hardcodes `surface-`, `text-`, etc.
  - _Missing Feature_: A `prefix` option in `color-config.json` or the CLI.
- **The "Scoped Build" Gap**: He wants to generate a theme _only_ for a specific sub-part of his app (e.g., a "Marketing Theme" that lives alongside the "App Theme").
  - _Missing Feature_: Scoping options (e.g., wrapping everything in a specific selector like `.theme-marketing`).
- **The "Type Safety" Gap**: He uses TypeScript and wants generated types for his tokens so he gets autocomplete in `style={{ color: theme.text.strong }}`.
  - _Missing Feature_: `color-system export --format typescript` (We have DTCG, but a direct TS object is often preferred for CSS-in-JS).

## Summary of Priorities

1.  **High (Friction)**:

    - **Prefix/Scoping** (Marcus): Essential for integration.
    - **Snippet/Component Examples** (Sarah): Essential for adoption.
    - **Audit Report** (Jordan): High value differentiator.

2.  **Medium (Power)**:

    - **TypeScript Export** (Marcus).
    - **Texture/Gradient Support** (Alex).

3.  **Low (Niche)**:
    - **Custom Interpolation** (Dr. Chen).
    - **Dark Mode Toggle Script** (Sarah) - easy to find elsewhere.

## Next Steps

To address these gaps, we propose the following roadmap for the next Epoch:

1.  **Phase 1: The "Marcus" Update (Integration)**

    - Expose `prefix` and `selector` options in `color-config.json`.
    - Implement `typescript` export format.
    - Add `exclude` pattern to config to allow partial builds.

2.  **Phase 2: The "Sarah" Update (Usability)**

    - Create a `snippets/` directory in the repo with copy-pasteable HTML/CSS examples.
    - Add a "Component Gallery" page to the docs.
    - Publish a `@algebraic-systems/web-components` package (or just a script) for the Theme Toggle.

3.  **Phase 3: The "Jordan" Update (Compliance)**

    - Implement `color-system audit` command.
    - Add `--debug` flag to `build` to inject contrast metadata into CSS comments.

4.  **Phase 4: The "Alex" Update (Creativity)**
    - Prototype "Texture Tokens" (maybe just CSS variable hooks like `--surface-texture`).
    - Add "Override" capability to the Theme Builder (allow manual hex entry with warning).
