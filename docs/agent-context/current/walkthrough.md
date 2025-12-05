# Walkthrough: Epoch 32 Phase 3 - High-Level Presets ("Vibes")

## Goal

The goal of this phase was to introduce "Vibes" — high-level configuration presets that allow users to quickly apply a distinct look and feel to their theme without manually tuning every parameter.

## Implementation Details

### 1. Vibe Registry (`src/lib/vibes.ts`)

We defined a `Vibe` interface and a `VibeConfig` type. `VibeConfig` is a `DeepPartial<SolverConfig>`, allowing vibes to override specific parts of the configuration (like anchor values, typography, or hue shift settings) while inheriting the rest from system defaults.

We implemented four initial vibes:

- **Default**: The baseline system configuration.
- **Academic**: High contrast, serif fonts, low chroma (0.08), minimal hue shift. Ideal for journals.
- **Vibrant**: High chroma (0.18), aggressive hue shift (45deg), geometric sans-serif. Ideal for consumer apps.
- **Corporate**: Standard chroma (0.1), moderate hue shift, standard sans-serif. Trustworthy and stable.

### 2. Resolution Logic (`src/lib/resolve.ts`)

We created a `resolveConfig` function that implements a 3-layer merge strategy:

1.  **System Defaults**: The hardcoded defaults in `src/lib/defaults.ts`.
2.  **Vibe Defaults**: The configuration from the selected vibe (if any).
3.  **User Config**: The user's `color-config.json` overrides.

This ensures that a user can select "Vibrant" but still override specific values (like a key color) in their config file.

### 3. CLI Updates

We updated the CLI commands (`build`, `export`, `audit`) to use `resolveConfig` instead of using the raw config directly.

- **Audit Command**: We updated the schema validation to use `UserConfig` (where `anchors` and `groups` are optional) instead of `SolverConfig`. This allows users to have a minimal config file like `{ "vibe": "vibrant" }`.

### 4. UI Integration

We updated the Theme Builder (`site/src/components/builder-v2/`) to support vibes.

- **ConfigState**: Updated to load vibes using `resolveConfig`.
- **VibePicker**: Added a dropdown in the sidebar to switch between vibes.

## Key Decisions

- **Terminology**: We chose "Vibe" over "Preset" to distinguish these high-level "feel" settings from lower-level component presets (like "Border Preset").
- **Deep Merge**: We implemented a custom `deepMerge` to ensure that nested properties (like `anchors.page.light.start`) are merged correctly without wiping out sibling properties.
- **0-1 Range**: We aligned the anchor values in vibes to use the 0-1 range (e.g., 0.99) used by the system internals, correcting an initial mismatch where 0-100 was used.

## Verification

- **CLI**: Verified that `axiomatic audit` passes with a minimal config file `{ "vibe": "vibrant" }`.
- **Build**: Verified that the package and site build successfully.
