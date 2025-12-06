# Design: High-Level Presets ("Vibes")

## Overview

"Vibes" are high-level configuration presets that allow users to quickly establish a mood for their theme. A Vibe is a partial `SolverConfig` that provides opinionated defaults for typography, color physics, and density.

## The Vibe Registry

We will implement the following initial vibes:

### 1. Default ("Neutral")

The baseline system configuration. Balanced, modern, and flexible.

- **Typography**: System Sans (`system-ui`, `sans-serif`).
- **Chroma**: Moderate (`0.12` target).
- **Contrast**: Standard APCA targets.
- **Hue Shift**: Subtle (`15deg`).

### 2. Academic ("Serious")

Designed for information-heavy, reading-focused applications (journals, documentation, wikis).

- **Typography**:
  - Headings: Serif (`Georgia`, `Times New Roman`, `serif`).
  - Body: Serif or Humanist Sans.
  - Scale: Traditional (smaller base, moderate ratio).
- **Chroma**: Low (`0.08`). Colors should be muted and serious.
- **Contrast**: High. Text legibility is paramount.
- **Hue Shift**: Minimal (`5deg`). Stability over playfulness.
- **Anchors**:
  - Light Mode: Paper-white background (`99`), Ink-black text (`10`).
  - Dark Mode: Blackboard grey (`15`), Chalk white (`95`).

### 3. Vibrant ("Playful")

Designed for consumer apps, marketing sites, and creative tools.

- **Typography**:
  - Headings: Geometric Sans (`Inter`, `Roboto`, `sans-serif`) with tighter tracking.
  - Weights: Heavier headings (`800`).
- **Chroma**: High (`0.18`). Colors should pop.
- **Hue Shift**: Aggressive (`45deg`). Shadows and highlights should shift significantly in hue to create depth and energy.
- **Anchors**:
  - Light Mode: Bright white (`100`).
  - Dark Mode: Deep, saturated darks (not just grey).

### 4. Corporate ("Trustworthy")

Designed for enterprise software, dashboards, and fintech.

- **Typography**:
  - Standard Sans (`Arial`, `Helvetica`, `sans-serif`).
  - High legibility, neutral character.
- **Chroma**: Moderate-Low (`0.10`). Safe, "Blue" bias.
- **Hue Shift**: Standard (`15deg`).
- **Key Colors**: Defaults to a "Trust Blue" if no brand color is provided.

## Technical Implementation

### Type Definition

```typescript
export interface Vibe {
  name: string;
  description: string;
  config: Partial<SolverConfig>;
}
```

### Resolution Logic

The solver will apply configurations in this order (last wins):

1.  **System Defaults** (Hardcoded in `defaults.ts`)
2.  **Selected Vibe** (from `vibes.ts`)
3.  **User Config** (from `color-config.json`)

This allows the user to select "Academic" but still override the font family if they have a specific webfont they want to use.

### Vibe Parameters

| Parameter             | Default     | Academic | Vibrant        | Corporate   |
| :-------------------- | :---------- | :------- | :------------- | :---------- |
| **Font Family**       | System Sans | Serif    | Geometric Sans | System Sans |
| **Target Chroma**     | `0.12`      | `0.08`   | `0.18`         | `0.10`      |
| **Hue Shift**         | `15deg`     | `5deg`   | `45deg`        | `15deg`     |
| **Bg Anchor (Light)** | `98`        | `99`     | `100`          | `98`        |
| **Bg Anchor (Dark)**  | `10`        | `15`     | `5`            | `12`        |

## Future Vibes

- **Terminal**: Monospace everything, high contrast, neon accents.
- **Cyberpunk**: Dark mode only, neon colors, glitchy typography.
- **Nature**: Earth tones, organic curves, low contrast.
