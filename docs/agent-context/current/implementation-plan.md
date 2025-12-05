# Implementation Plan - Epoch 32 Phase 3: High-Level Presets ("Vibes")

## Goal

Implement a "Vibes" system that allows users to select high-level presets (e.g., "Cozy", "Academic", "Vibrant") which configure multiple lower-level parameters (density, typography, colorfulness) simultaneously.

## User Story

As a user, I want to quickly change the "mood" of my theme without tweaking 50 individual sliders, so that I can find a good starting point for my project.

## Proposed Architecture

### 1. The `Vibe` Concept

A `Vibe` is a partial configuration that applies to:

- **Typography**: Font families, scale, weights.
- **Density**: Spacing scales, border radii.
- **Colorfulness**: Target chroma, hue shifts.
- **Physics**: Anchor positions (contrast).

### 2. Configuration Schema

Extend `SolverConfig` to support a `vibe` property (or `preset` expansion).

```typescript
type Vibe = "default" | "academic" | "cozy" | "vibrant" | "corporate";

interface SolverConfig {
  // ... existing
  vibe?: Vibe; // Applies defaults before other config
}
```

### 3. Implementation Steps

#### Step 1: Define Vibes

Create a registry of vibes in `src/lib/vibes.ts`.
Each vibe should define:

- `typography`: A `TypographyConfig`.
- `anchors`: Overrides for anchor points.
- `palette`: Target chroma/contrast.

#### Step 2: Solver Integration

Update `createTheme` (or the entry point) to merge the selected `Vibe` into the user's config _before_ solving.

- User config takes precedence over Vibe.
- Vibe takes precedence over System Defaults.

#### Step 3: Theme Builder UI

- Add a "Vibe Picker" (Select/Cards) to the top of the Theme Builder.
- When a vibe is selected, update the form state.
- _Challenge_: How to handle "dirty" state? If I pick "Cozy" then change the font, am I still "Cozy"?
  - _Solution_: Treat Vibe as a "Apply Preset" action that overwrites current settings, rather than a persistent mode.

## Task List

- [ ] Define `Vibe` type and registry in `src/lib/vibes.ts`.
- [ ] Implement `resolveVibe(config)` in the Solver pipeline.
- [ ] Add "Vibe Picker" to Theme Builder UI.
- [ ] Create 3 initial vibes:
  - **Academic**: Serif fonts, high contrast, lower chroma.
  - **Vibrant**: Higher target chroma, aggressive hue shifts.
  - **Corporate**: Neutral blues, standard sans-serif, safe contrast.
- [ ] Verify vibes in the Demo App.
