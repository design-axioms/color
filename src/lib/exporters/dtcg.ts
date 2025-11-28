import type { ColorSpec, Mode, Theme } from "../types.ts";

interface DTCGToken {
  $type: "color" | "dimension" | "fontFamily" | "fontWeight" | "number";
  $value: string | number;
  $description?: string;
  $extensions?: Record<string, unknown>;
}

interface DTCGGroup {
  [key: string]: DTCGToken | DTCGGroup;
}

export function toDTCG(theme: Theme): Record<string, DTCGGroup> {
  const tokens: Record<string, DTCGGroup> = {
    light: {},
    dark: {},
  };

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

  for (const mode of ["light", "dark"] as Mode[]) {
    const modeGroup: DTCGGroup = {};

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

          // Clean up key name: "fg-high" -> "high"
          const cleanKey = key.replace("fg-", "");

          fgTokens[cleanKey] = {
            $type: "color",
            $value: formatFg(lightness),
          };
        }

        onSurfaceGroup[surface.slug] = fgTokens;
      }
    }

    modeGroup["surface"] = surfaceGroup;
    modeGroup["on-surface"] = onSurfaceGroup;

    tokens[mode] = modeGroup;
  }

  return tokens;
}
