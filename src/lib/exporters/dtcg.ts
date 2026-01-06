import { converter } from "culori";
import { AxiomaticError } from "../errors.ts";
import type { ColorSpec, Mode, SolverConfig, Theme } from "../types.ts";

const toOklch = converter("oklch");

function requireFiniteNumber(
  value: unknown,
  message: string,
  details: Record<string, unknown>,
): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new AxiomaticError("DTCG_INVALID", message, details);
  }
  return value;
}

interface DTCGToken {
  $type:
    | "color"
    | "dimension"
    | "fontFamily"
    | "fontWeight"
    | "number"
    | "other";
  $value: string | number;
  $description?: string;
  $extensions?: Record<string, unknown>;
}

interface DTCGGroup {
  [key: string]: DTCGToken | DTCGGroup;
}

export type DTCGFile = DTCGGroup;

export interface DTCGExport {
  files: Record<string, DTCGFile>;
}

// Helper to format color as OKLCH CSS string
const formatColor = (spec: ColorSpec): string => {
  const l = spec.l.toFixed(4);
  const c = spec.c.toFixed(4);
  const h = spec.h.toFixed(4);
  return `oklch(${l} ${c} ${h})`;
};

// Helper to format foreground color (neutral)
const formatFg = (lightness: number): string => {
  const l = lightness.toFixed(4);
  return `oklch(${l} 0 0)`;
};

function generatePrimitives(config: SolverConfig): DTCGFile {
  const primitives: DTCGGroup = {};
  const colorGroup: DTCGGroup = {};

  // Key Colors
  for (const [name, value] of Object.entries(config.anchors.keyColors)) {
    const oklch = toOklch(value);
    if (!oklch) {
      throw new AxiomaticError(
        "DTCG_INVALID",
        `Key color ${name} is not parseable as OKLCH.`,
        { name, value },
      );
    }

    const val = `oklch(${oklch.l.toFixed(4)} ${oklch.c.toFixed(4)} ${
      oklch.h?.toFixed(4) ?? 0
    })`;

    colorGroup[name] = {
      $type: "color",
      $value: val,
    };
  }

  if (Object.keys(colorGroup).length > 0) {
    primitives["color"] = colorGroup;
  }

  return primitives;
}

function generateMode(theme: Theme, mode: Mode): DTCGFile {
  const root: DTCGGroup = {};
  const colorGroup: DTCGGroup = {};

  // 1. Surfaces
  const surfaceGroup: DTCGGroup = {};
  const onSurfaceGroup: DTCGGroup = {};

  for (const surface of theme.surfaces) {
    const bgSpec = theme.backgrounds.get(surface.slug)?.[mode];
    if (!bgSpec) continue;

    // Background Token
    surfaceGroup[surface.slug] = {
      $type: "color",
      $value: formatColor(bgSpec),
      $description: surface.description || surface.label,
    };

    // Foreground Tokens
    const fgSpec = surface.computed?.[mode];
    if (fgSpec) {
      const fgTokens: DTCGGroup = {};

      // Map internal names to semantic names
      // "fg-high", "fg-strong", etc.
      for (const [key, lightness] of Object.entries(fgSpec)) {
        if (key === "background") continue; // Skip background as it's redundant
        if (key === "debug") continue; // Skip debug info

        // Clean up key name: "fg-high" -> "high"
        const cleanKey = key.replace("fg-", "");

        const lightnessNumber = requireFiniteNumber(
          lightness,
          `DTCG export expected numeric lightness for ${surface.slug}.${mode}.${key}.`,
          {
            surface: surface.slug,
            mode,
            key,
            value: lightness,
          },
        );

        fgTokens[cleanKey] = {
          $type: "color",
          $value: formatFg(lightnessNumber),
        };
      }

      onSurfaceGroup[surface.slug] = fgTokens;
    }
  }

  colorGroup["surface"] = surfaceGroup;
  colorGroup["on-surface"] = onSurfaceGroup;

  // 2. Charts
  const chartGroup: DTCGGroup = {};
  theme.charts.forEach((chart, index) => {
    const spec = chart[mode];
    chartGroup[(index + 1).toString()] = {
      $type: "color",
      $value: formatColor(spec),
    };
  });
  colorGroup["chart"] = chartGroup;

  // 3. Primitives
  // Shadows
  const shadowGroup: DTCGGroup = {};
  for (const [size, token] of Object.entries(theme.primitives.shadows)) {
    shadowGroup[size] = {
      $type: "other",
      $value: token[mode],
      $description: "CSS box-shadow value",
    };
  }
  root["shadow"] = shadowGroup;

  // Focus
  const focusGroup: DTCGGroup = {};
  focusGroup["ring"] = {
    $type: "color",
    $value: theme.primitives.focus.ring[mode],
  };
  colorGroup["focus"] = focusGroup;

  // Highlight
  const highlightGroup: DTCGGroup = {};
  highlightGroup["ring"] = {
    $type: "color",
    $value: theme.primitives.highlight.ring[mode],
    $description:
      "High-visibility outline for selected or highlighted elements.",
  };
  highlightGroup["surface"] = {
    $type: "color",
    $value: theme.primitives.highlight.surface[mode],
    $description: "Background for selected items in lists/trees.",
  };
  colorGroup["highlight"] = highlightGroup;

  root["color"] = colorGroup;

  return root;
}

export function toDTCG(theme: Theme, config: SolverConfig): DTCGExport {
  return {
    files: {
      "primitives.json": generatePrimitives(config),
      "light.json": generateMode(theme, "light"),
      "dark.json": generateMode(theme, "dark"),
    },
  };
}
