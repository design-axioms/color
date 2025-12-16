import { DEFAULT_CONFIG } from "./defaults.ts";
import type { SolverConfig } from "./types.ts";

export interface Preset {
  id: string;
  name: string;
  description: string;
  config: SolverConfig;
}

export const PRESETS: Preset[] = [
  {
    id: "default",
    name: "Default",
    description: "The default configuration.",
    config: DEFAULT_CONFIG,
  },
  {
    id: "high-contrast",
    name: "High Contrast",
    description: "Maximized contrast for accessibility.",
    config: {
      ...DEFAULT_CONFIG,
      anchors: {
        ...DEFAULT_CONFIG.anchors,
        page: {
          light: {
            start: { background: 1 },
            end: { adjustable: true, background: 1 },
          },
          dark: {
            start: { background: 0 },
            end: { adjustable: true, background: 0 },
          },
        },
      },
    },
  },
  {
    id: "soft",
    name: "Soft",
    description: "Lower contrast for a gentler look.",
    config: {
      ...DEFAULT_CONFIG,
      anchors: {
        ...DEFAULT_CONFIG.anchors,
        page: {
          light: {
            start: { background: 0.98 },
            end: { adjustable: true, background: 0.85 },
          },
          dark: {
            start: { background: 0.15 },
            end: { adjustable: true, background: 0.3 },
          },
        },
      },
    },
  },
  {
    id: "vercel",
    name: "Vercel",
    description: "A Vercel-inspired theme with cool grays and high contrast.",
    config: {
      ...DEFAULT_CONFIG,
      anchors: {
        ...DEFAULT_CONFIG.anchors,
        keyColors: {
          ...DEFAULT_CONFIG.anchors.keyColors,
          brand: "oklch(0.5 0.18 260)",
          neutral: "oklch(0.5 0.005 260)",
        },
        page: {
          light: {
            start: { background: 1 },
            end: { adjustable: true, background: 1 },
          },
          dark: {
            start: { background: 0 },
            end: { adjustable: true, background: 0 },
          },
        },
      },
    },
  },
];
