import type { DebugContext, ResolvedToken } from "./types.ts";

// Known tokens to check against
const TOKENS = [
  { name: "text-high", var: "--axm-text-high-token" },
  { name: "text-subtle", var: "--axm-text-subtle-token" },
  { name: "text-subtlest", var: "--axm-text-subtlest-token" },
  { name: "surface", var: "--axm-surface-token" },
  { name: "border-dec", var: "--axm-border-dec-token" },
  { name: "border-int", var: "--axm-border-int-token" },
];

export function resolveTokens(
  element: HTMLElement,
  context: DebugContext,
): ResolvedToken[] {
  const style = getComputedStyle(element);
  const contextStyle = getComputedStyle(context.element);
  const tokens: ResolvedToken[] = [];

  // Helper to find a matching token name
  const findMatch = (value: string): string | null => {
    if (!value || value === "transparent" || value === "rgba(0, 0, 0, 0)")
      return null;

    for (const token of TOKENS) {
      const tokenValue = contextStyle.getPropertyValue(token.var).trim();
      // Simple string equality check.
      // Browsers typically normalize computed color values consistently.
      if (tokenValue === value) {
        return token.name;
      }
    }
    return null;
  };

  // 1. Resolve Text Lightness Source
  const lightnessSource = style
    .getPropertyValue("--text-lightness-source")
    .trim();
  if (lightnessSource) {
    const match = findMatch(lightnessSource);
    tokens.push({
      intent: "Text Source",
      value: lightnessSource,
      sourceVar: "--text-lightness-source",
      sourceValue: match || "Custom/Inherited",
    });
  }

  // 2. Resolve Computed Foreground
  const fgColor = style.getPropertyValue("--computed-fg-color").trim();
  if (fgColor && fgColor !== "transparent") {
    tokens.push({
      intent: "Final Text Color",
      value: fgColor,
      sourceVar: "--computed-fg-color",
      sourceValue: "Calculated",
    });
  }

  // 3. Resolve Computed Surface
  // We check this on the context element, or the current element if it is the context
  const surfaceColor = style.getPropertyValue("--computed-surface").trim();
  if (surfaceColor && surfaceColor !== "transparent") {
    tokens.push({
      intent: "Surface Color",
      value: surfaceColor,
      sourceVar: "--computed-surface",
      sourceValue: "Calculated",
    });
  }

  return tokens;
}
