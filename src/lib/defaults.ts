import type { SolverConfig } from "./types.ts";

export const DEFAULT_CONFIG: SolverConfig = {
  anchors: {
    page: {
      light: {
        start: { background: 1 },
        end: { adjustable: true, background: 0.9 },
      },
      dark: {
        start: { background: 0.1 },
        end: { adjustable: true, background: 0.4 },
      },
    },
    inverted: {
      light: {
        start: { adjustable: true, background: 0.1 },
        end: { background: 0 },
      },
      dark: {
        start: { adjustable: true, background: 0.9 },
        end: { background: 1 },
      },
    },
    keyColors: {
      brand: "#6e56cf",
      success: "#22c55e",
      warning: "#eab308",
      error: "#ef4444",
    },
  },
  hueShift: {
    curve: { p1: [0.5, 0], p2: [0.5, 1] },
    maxRotation: 5,
  },
  borderTargets: {
    decorative: 10,
    interactive: 30,
    critical: 80,
  },
  palette: {
    targetChroma: 0.14,
    targetContrast: 60,
    // Standard categorical hues (approximate D3/Tableau)
    // Shuffled to maximize distinctiveness between adjacent colors
    hues: [25, 190, 45, 250, 85, 280, 125, 320, 150, 360],
  },
  options: {
    prefix: "axm",
    selector: ":root",
  },
  groups: [
    {
      name: "Base",
      surfaces: [
        {
          slug: "page",
          label: "Surface Page",
          description: "The base background of the application.",
          polarity: "page",
        },
        {
          slug: "workspace",
          label: "Surface Workspace",
          description:
            "A very light elevated surface, used for the main workspace area.",
          polarity: "page",
        },
      ],
    },
    {
      name: "Content",
      surfaces: [
        {
          slug: "card",
          label: "Surface Card",
          description: "A card-like element.",
          polarity: "page",
          contrastOffset: { light: 15, dark: 15 },
          states: [
            { name: "hover", offset: -5 },
            { name: "active", offset: -10 },
          ],
        },
        {
          slug: "action",
          label: "Surface Action",
          description: "A clickable action surface (e.g. button).",
          polarity: "page",
          contrastOffset: { light: 25, dark: 25 },
          states: [
            { name: "hover", offset: -5 },
            { name: "active", offset: -10 },
          ],
        },
      ],
    },
    {
      name: "Spotlight",
      surfaces: [
        {
          slug: "spotlight",
          label: "Surface Spotlight",
          description: "The darkest surface.",
          polarity: "inverted",
        },
      ],
    },
    {
      name: "Status",
      surfaces: [
        {
          slug: "status-success",
          label: "Success",
          description: "Positive status feedback.",
          polarity: "page",
          hue: "success",
          targetChroma: 0.15,
        },
        {
          slug: "status-warning",
          label: "Warning",
          description: "Warning status feedback.",
          polarity: "page",
          hue: "warning",
          targetChroma: 0.15,
        },
        {
          slug: "status-error",
          label: "Error",
          description: "Error status feedback.",
          polarity: "page",
          hue: "error",
          targetChroma: 0.2,
        },
      ],
    },
  ],
};
