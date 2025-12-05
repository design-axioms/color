import { converter } from "culori";
import type {
  PolarityAnchors,
  SolverConfig,
  SurfaceConfig,
  SurfaceGroup,
} from "../types.js";

const toOklch = converter("oklch");

interface DTCGToken {
  $value?: string | number;
  $type?: string;
  value?: string | number;
  type?: string;
  [key: string]: unknown;
}

interface FlattenedToken {
  path: string[];
  value: string;
  type?: string;
}

export class DTCGImporter {
  private tokens: FlattenedToken[] = [];

  parse(json: string): SolverConfig {
    const raw = JSON.parse(json) as unknown;
    this.tokens = this.flatten(raw);

    const keyColors = this.extractKeyColors();
    const anchors = this.extractAnchors();
    const groups = this.extractSurfaces();

    return {
      anchors: {
        ...anchors,
        keyColors,
      },
      groups,
      // Defaults
      hueShift: {
        curve: { p1: [0.5, 0], p2: [0.5, 1] },
        maxRotation: 60,
      },
      borderTargets: {
        decorative: 0.2,
        interactive: 0.5,
        critical: 0.8,
      },
    };
  }

  private flatten(
    obj: unknown,
    path: string[] = [],
    res: FlattenedToken[] = [],
  ): FlattenedToken[] {
    if (typeof obj !== "object" || obj === null) return res;

    const record = obj as Record<string, unknown>;

    for (const key in record) {
      if (key.startsWith("$")) continue; // Skip metadata at this level if mixed

      const value = record[key];
      const currentPath = [...path, key];

      // Check if it's a token
      // A token has a value property ($value or value)
      const tokenCandidate = value as DTCGToken;
      const hasValue =
        tokenCandidate.$value !== undefined ||
        tokenCandidate.value !== undefined;

      if (hasValue) {
        const val = tokenCandidate.$value ?? tokenCandidate.value;
        const type = tokenCandidate.$type ?? tokenCandidate.type ?? "color";

        if (
          val !== undefined &&
          (typeof val === "string" || typeof val === "number")
        ) {
          res.push({
            path: currentPath,
            value: val.toString(),
            type: type,
          });
        }
      } else if (typeof value === "object" && value !== null) {
        // Recurse
        this.flatten(value, currentPath, res);
      }
    }
    return res;
  }

  private extractKeyColors(): Record<string, string> {
    const keyColors: Record<string, string> = {};
    const keywords: Record<string, string[]> = {
      brand: ["brand", "primary", "accent"],
      success: ["success", "positive", "green"],
      warning: ["warning", "caution", "yellow", "orange"],
      danger: ["danger", "error", "critical", "red"],
      info: ["info", "blue"],
    };

    for (const [semantic, aliases] of Object.entries(keywords)) {
      // Find all tokens that match one of the aliases
      const matches = this.tokens.filter(
        (t) =>
          t.type === "color" &&
          aliases.some((alias) =>
            t.path.some((p) => p.toLowerCase().includes(alias)),
          ),
      );

      if (matches.length > 0) {
        // Heuristic: If multiple matches, prefer the one with "500" or "main" or "base"
        // Or just pick the one with the highest chroma?
        // Let's try to find a "middle" value if it looks like a scale
        const bestMatch = this.pickBestColor(matches);
        if (bestMatch) {
          keyColors[semantic] = bestMatch.value;
        }
      }
    }

    return keyColors;
  }

  private pickBestColor(tokens: FlattenedToken[]): FlattenedToken | null {
    if (tokens.length === 0) return null;

    // 1. Prefer exact matches for "main", "base", "500"
    const priority = ["500", "main", "base", "primary", "DEFAULT"];
    for (const p of priority) {
      const match = tokens.find((t) =>
        t.path.some((part) => part.toLowerCase() === p.toLowerCase()),
      );
      if (match) return match;
    }

    // 2. Fallback: Pick the one with the highest Chroma
    let maxChroma = -1;
    let best: FlattenedToken | null = null;

    for (const t of tokens) {
      const color = toOklch(t.value);
      if (color) {
        if (color.c > maxChroma) {
          maxChroma = color.c;
          best = t;
        }
      }
    }

    return best || tokens[0] || null;
  }

  private extractAnchors(): Omit<PolarityAnchors, "keyColors"> {
    // Default anchors
    const defaults: Omit<PolarityAnchors, "keyColors"> = {
      page: {
        light: { start: { background: 0.98 }, end: { background: 0.1 } },
        dark: { start: { background: 0.1 }, end: { background: 0.98 } },
      },
      inverted: {
        light: { start: { background: 0.1 }, end: { background: 0.98 } },
        dark: { start: { background: 0.98 }, end: { background: 0.1 } },
      },
    };

    // Look for neutral scale
    const neutralKeywords = [
      "gray",
      "grey",
      "neutral",
      "slate",
      "zinc",
      "mono",
      "sand",
    ];
    const neutralTokens = this.tokens.filter(
      (t) =>
        t.type === "color" &&
        neutralKeywords.some((k) =>
          t.path.some((p) => p.toLowerCase().includes(k)),
        ),
    );

    if (neutralTokens.length < 2) return defaults;

    // Find min/max lightness
    let minL = 1;
    let maxL = 0;

    for (const t of neutralTokens) {
      const color = toOklch(t.value);
      if (color) {
        if (color.l < minL) minL = color.l;
        if (color.l > maxL) maxL = color.l;
      }
    }

    // Sanity check: If range is too small, ignore
    if (maxL - minL < 0.5) return defaults;

    return {
      page: {
        light: {
          start: { background: parseFloat(maxL.toFixed(3)) },
          end: { background: parseFloat(minL.toFixed(3)) },
        },
        dark: {
          start: { background: parseFloat(minL.toFixed(3)) },
          end: { background: parseFloat(maxL.toFixed(3)) },
        },
      },
      inverted: {
        light: {
          start: { background: parseFloat(minL.toFixed(3)) },
          end: { background: parseFloat(maxL.toFixed(3)) },
        },
        dark: {
          start: { background: parseFloat(maxL.toFixed(3)) },
          end: { background: parseFloat(minL.toFixed(3)) },
        },
      },
    };
  }

  private extractSurfaces(): SurfaceGroup[] {
    // 1. Look for explicit surfaces
    const surfaceTokens = this.tokens.filter((t) =>
      t.path.some((p) => p.toLowerCase() === "surface"),
    );

    const surfaces: SurfaceConfig[] = [];

    if (surfaceTokens.length > 0) {
      // Try to map them
      for (const t of surfaceTokens) {
        const name = t.path[t.path.length - 1];
        if (!name) continue;
        if (name === "surface") continue; // Skip the group name itself

        surfaces.push({
          slug: name,
          label: this.capitalize(name),
          polarity: "page", // Default
          // We can't easily guess overrides or offsets, so we leave them blank
          // The solver will calculate them based on the anchors
        });
      }
    }

    // 2. If no explicit surfaces, look for background tokens
    if (surfaces.length === 0) {
      const bgTokens = this.tokens.filter((t) =>
        t.path.some(
          (p) =>
            p.toLowerCase().includes("bg") ||
            p.toLowerCase().includes("background"),
        ),
      );

      for (const t of bgTokens) {
        const name = t.path[t.path.length - 1];
        if (!name) continue;
        // Filter out common non-surface backgrounds
        if (["transparent", "none", "current"].includes(name.toLowerCase()))
          continue;

        surfaces.push({
          slug: name,
          label: this.capitalize(name),
          polarity: "page",
        });
      }
    }

    // 3. Fallback
    if (surfaces.length === 0) {
      surfaces.push({
        slug: "card",
        label: "Card",
        polarity: "page",
      });
    }

    return [
      {
        name: "Imported",
        surfaces,
      },
    ];
  }

  private capitalize(s: string): string {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }
}
