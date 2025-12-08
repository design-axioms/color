import type { DebugContext, ResolvedToken } from "./types.ts";
import { findVariableSource } from "./walker.ts";

// Known tokens to check against
const TOKENS = [
  { name: "text-high", var: "--axm-text-high-token" },
  { name: "text-subtle", var: "--axm-text-subtle-token" },
  { name: "text-subtlest", var: "--axm-text-subtlest-token" },
  { name: "surface", var: "--axm-surface-token" },
  { name: "border-dec", var: "--axm-border-dec-token" },
  { name: "border-int", var: "--axm-border-int-token" },
];

// Known defaults from engine.css
const DEFAULTS: Record<string, number> = {
  "--alpha-hue": 0,
  "--alpha-beta": 0.008,
};

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

  const addToken = (
    intent: string,
    value: string,
    sourceVar: string,
    sourceValue: string,
  ): void => {
    // For background-color, it's not inherited, so the source is always the element itself
    // unless explicitly set to inherit, but we assume local for now.
    // For CSS vars, we walk up.
    let sourceElement: HTMLElement | null = element;

    if (sourceVar.startsWith("--")) {
      sourceElement = findVariableSource(element, sourceVar);
    }

    // Check for system default
    let isDefault = false;
    const defaultValue = DEFAULTS[sourceVar];
    if (defaultValue !== undefined) {
      const numValue = parseFloat(value);
      if (!isNaN(numValue) && Math.abs(numValue - defaultValue) < 0.0001) {
        isDefault = true;
      }
    }

    // Try to identify the responsible class
    let responsibleClass: string | undefined;
    if (sourceElement && !isDefault) {
      const classList = Array.from(sourceElement.classList);

      // Heuristics for finding the responsible class
      if (intent === "Context Hue" || intent === "Context Chroma") {
        responsibleClass = classList.find(
          (c) => c.startsWith("theme-") || c.startsWith("hue-"),
        );
      } else if (intent === "Surface Color") {
        responsibleClass = classList.find((c) => c.startsWith("surface-"));
        // If we are on the body and no explicit surface class is found,
        // it is implicitly the Page Surface.
        if (!responsibleClass && sourceElement.tagName === "BODY") {
          responsibleClass = "surface-page";
        }
      } else if (intent === "Text Source" || intent === "Final Text Color") {
        responsibleClass = classList.find((c) => c.startsWith("text-"));
        // If we are on the body and no explicit text class is found,
        // it is implicitly the default text color (text-high).
        if (!responsibleClass && sourceElement.tagName === "BODY") {
          responsibleClass = "text-high (default)";
        }
      } else if (intent === "Actual Background") {
        responsibleClass = classList.find((c) => c.startsWith("bg-"));
      }

      // Fallback: Look for any relevant utility if specific one not found
      if (!responsibleClass) {
        responsibleClass = classList.find(
          (c) =>
            c.startsWith("theme-") ||
            c.startsWith("hue-") ||
            c.startsWith("surface-") ||
            c.startsWith("text-") ||
            c.startsWith("bg-"),
        );
      }
    }

    // Check for inline style
    const isInline = sourceElement
      ? sourceElement.style.getPropertyValue(sourceVar) !== ""
      : false;

    // EXCEPTION: "Final Text Color" and "Surface Color" are semantically public
    // even if they use private variables for implementation.
    const isSemanticallyPublic =
      intent === "Final Text Color" || intent === "Surface Color";

    tokens.push({
      intent,
      value,
      sourceVar,
      sourceValue,
      element: sourceElement || undefined,
      isLocal: sourceElement === element,
      isPrivate:
        !isSemanticallyPublic &&
        (sourceVar.startsWith("--_") || sourceVar.startsWith("--axm-computed")),
      responsibleClass,
      isInline,
      isDefault,
    });
  };

  // 0. Resolve Context Hue & Chroma (The "DNA" of the color)
  const hue = style.getPropertyValue("--alpha-hue").trim();
  if (hue) {
    addToken("Context Hue", hue, "--alpha-hue", hue);
  }

  const chroma = style.getPropertyValue("--alpha-beta").trim();
  if (chroma) {
    addToken("Context Chroma", chroma, "--alpha-beta", chroma);
  }

  // 1. Resolve Text Lightness Source
  const lightnessSource = style
    .getPropertyValue("--_axm-text-lightness-source")
    .trim();
  if (lightnessSource) {
    const match = findMatch(lightnessSource);
    // If we found a matching token, we treat this as a Public intent (the token usage).
    // If not, it's a raw private variable usage.
    const isPublic = !!match;

    const sourceVar = "--_axm-text-lightness-source";
    const sourceElement = findVariableSource(element, sourceVar);

    let responsibleClass: string | undefined;
    if (sourceElement) {
      const classList = Array.from(sourceElement.classList);
      responsibleClass = classList.find((c) => c.startsWith("text-"));
      // If we are on the body and no explicit text class is found,
      // it is implicitly the default text color (text-high).
      if (!responsibleClass && sourceElement.tagName === "BODY") {
        responsibleClass = "text-high (default)";
      }
    }

    tokens.push({
      intent: "Text Source",
      value: lightnessSource,
      sourceVar,
      sourceValue: match || "Custom/Inherited",
      isPrivate: !isPublic,
      element: sourceElement || undefined,
      isLocal: sourceElement === element,
      responsibleClass,
    });
  }

  // 2. Resolve Computed Foreground
  const fgColor = style.getPropertyValue("--_axm-computed-fg-color").trim();
  if (fgColor && fgColor !== "transparent") {
    addToken("Final Text Color", fgColor, "--_axm-computed-fg-color", fgColor);
  }

  // 3. Resolve Computed Surface
  // We check this on the context element, or the current element if it is the context
  const surfaceColor = style.getPropertyValue("--_axm-computed-surface").trim();
  if (surfaceColor && surfaceColor !== "transparent") {
    addToken(
      "Surface Color",
      surfaceColor,
      "--_axm-computed-surface",
      surfaceColor,
    );
  }

  // 4. Resolve Actual Background
  // This helps identify when a utility class overrides the axiomatic surface
  const bgColor = style.backgroundColor;
  if (bgColor && bgColor !== "transparent" && bgColor !== "rgba(0, 0, 0, 0)") {
    addToken("Actual Background", bgColor, "background-color", bgColor);
  }

  return tokens;
}
