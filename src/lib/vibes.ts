import type { DeepPartial, SolverConfig } from "./types.js";

/**
 * A recursive partial type that allows deep configuration overrides.
 * We use this instead of Partial<SolverConfig> because we want to allow
 * overriding just a single anchor value or typography setting without
 * providing the entire object.
 */
export type VibeConfig = DeepPartial<SolverConfig>;

export interface Vibe {
  name: string;
  description: string;
  config: VibeConfig;
}

export const VIBES: Record<string, Vibe> = {
  default: {
    name: "Default",
    description:
      "Balanced, modern, and flexible. The baseline system configuration.",
    config: {},
  },
  academic: {
    name: "Academic",
    description:
      "Serious, high-contrast, serif-based. Ideal for journals and documentation.",
    config: {
      palette: {
        targetChroma: 0.08,
      },
      hueShift: {
        maxRotation: 5,
      },
      presets: {
        typography: {
          fonts: {
            sans: '"Georgia", "Times New Roman", serif',
            heading: '"Georgia", "Times New Roman", serif',
          },
          scale: {
            minSize: 1, // Larger base size for reading
            maxSize: 2.5, // Smaller range (less dramatic)
            steps: 5,
            curve: { p1: [0.2, 0], p2: [0.8, 1] }, // Linear-ish
          },
        },
      },
      anchors: {
        page: {
          light: {
            start: { background: 0.99 }, // Paper white
            end: { background: 0.1 }, // Ink black
          },
          dark: {
            start: { background: 0.15 }, // Blackboard grey
            end: { background: 0.95 }, // Chalk white
          },
        },
      },
    },
  },
  vibrant: {
    name: "Vibrant",
    description:
      "Playful, high-chroma, geometric. Ideal for consumer apps and marketing.",
    config: {
      palette: {
        targetChroma: 0.18,
      },
      hueShift: {
        maxRotation: 45, // Aggressive hue shifting
      },
      presets: {
        typography: {
          fonts: {
            sans: '"Inter", "Roboto", "Helvetica Neue", sans-serif',
            heading: '"Inter", "Roboto", "Helvetica Neue", sans-serif',
          },
          weights: {
            heading: 800, // Heavy headings
          },
        },
      },
      anchors: {
        page: {
          light: {
            start: { background: 1.0 }, // Bright white
          },
          dark: {
            start: { background: 0.05 }, // Deep dark
          },
        },
      },
    },
  },
  corporate: {
    name: "Corporate",
    description:
      "Trustworthy, stable, standard. Ideal for enterprise software and dashboards.",
    config: {
      palette: {
        targetChroma: 0.1,
      },
      hueShift: {
        maxRotation: 15,
      },
      presets: {
        typography: {
          fonts: {
            sans: '"Arial", "Helvetica", sans-serif',
            heading: '"Arial", "Helvetica", sans-serif',
          },
        },
      },
      anchors: {
        page: {
          light: {
            start: { background: 0.98 }, // Slightly off-white
          },
          dark: {
            start: { background: 0.12 }, // Standard dark mode
          },
        },
      },
    },
  },
};

export type VibeName = keyof typeof VIBES;
