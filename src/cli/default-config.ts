import type { SolverConfig } from "../lib/types.ts";

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
  ],
};
