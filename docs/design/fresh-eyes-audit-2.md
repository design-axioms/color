# Fresh Eyes Audit (Epoch 11)

> **Date**: 2025-11-28
> **Focus**: Alignment with Axioms & Personas

This audit simulates the user journey for our key personas to identify friction points and opportunities for improvement.

## 1. The Overwhelmed Pragmatist (Getting Started)

**Goal**: Install the system and get a working theme with zero configuration.

### Findings

- [ ] **CLI Init**: The `init` command is simple but assumes `color-config.json` as the filename. It doesn't prompt for a location.
- [ ] **CLI Build**: The documentation references a `build` command (`npx color-system build`) and flags like `--out` and `--watch`, but **these do not exist** in the CLI code. The CLI only accepts positional arguments.
- [ ] **Package Name**: The documentation uses `@algebraic/color-system`, but the `package.json` name is `color-system`. This will cause installation failures.
- [ ] **Output Path**: The default output is `theme.css` in the CWD, which might clutter the root.

## 2. The Visual Tinkerer (Customization)

**Goal**: Create a highly stylized "Cyberpunk" theme using the Theme Builder.

### Findings

- [ ] **Hue Shifting**: The "Physics of Light" documentation explains anchors well but **omits Hue Shifting**, a critical feature for "Cyberpunk" aesthetics (cool shadows, warm lights). The rationale was archived, but the concept needs to be surfaced in the "Advanced" or "Concepts" section.
- [ ] **Visual Feedback**: The `SystemDemo` component is good, but we need to ensure the "Hue Shift" visualizer is easily accessible to this persona.

## 3. The System Architect (Integration)

**Goal**: Integrate the system into a complex stack (Figma + Tailwind).

### Findings

- [ ] **DTCG Export Data Loss**: The DTCG exporter converts all colors to **Hex**, losing P3 gamut data. This violates the "Baseline Newly Available" policy for modern tools.
- [ ] **DTCG Foregrounds**: The exporter assumes all foregrounds (text) are neutral (chroma 0). It fails to export colored text (like `text-link`).
- [ ] **Missing Tokens**: The exporter does not include the Data Viz palette (`--chart-*`) tokens.

## Summary of Priorities

1.  **Fix CLI & Docs Mismatch**: The documentation describes a CLI that doesn't exist. We must align them (implement `build`, `--out`, `--watch` or update docs).
2.  **Correct Package Name**: Fix the package name in the documentation.
3.  **Upgrade DTCG Exporter**: Support P3 (oklch) output and colored text in the export.
4.  **Restore Hue Shift Docs**: Add a section on Hue Shifting to the "Physics of Light" or a dedicated "Advanced Color" page.
