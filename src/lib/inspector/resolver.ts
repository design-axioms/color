import type { DebugContext, ResolvedToken } from "./types.ts";
import { findVariableSource } from "./walker.ts";
import { converter, formatCss } from "culori";

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

const RESOLVED_COLOR_CACHE = new WeakMap<HTMLElement, Map<string, string>>();

const toRgb = converter("rgb");

function canonicalizeColor(value: string): string {
  const v = value.trim();
  if (!v) return v;
  const rgb = toRgb(v);
  if (!rgb) return v;

  // Normalize floating-point noise so comparisons are stable.
  // Computed styles are often quantized; culori conversions can produce values like
  // 0.9999999999999999 which should be treated as 1.
  const clamp01 = (n: number): number => {
    const eps = 1e-9;
    if (n < eps) return 0;
    if (n > 1 - eps) return 1;
    return n;
  };

  const round = (n: number): number => Math.round(n * 1e6) / 1e6;

  return formatCss({
    mode: "rgb",
    r: round(clamp01(rgb.r)),
    g: round(clamp01(rgb.g)),
    b: round(clamp01(rgb.b)),
    alpha: rgb.alpha === undefined ? undefined : round(clamp01(rgb.alpha)),
  });
}

function resolveColorInContext(
  contextElement: HTMLElement,
  property: "color" | "background-color",
  value: string,
): string {
  const contextComputedStyle = getComputedStyle(contextElement);

  const isVoidElement = (el: HTMLElement): boolean => {
    // HTML void elements cannot reliably host child nodes for probing.
    // https://html.spec.whatwg.org/multipage/syntax.html#void-elements
    switch (el.tagName) {
      case "AREA":
      case "BASE":
      case "BR":
      case "COL":
      case "EMBED":
      case "HR":
      case "IMG":
      case "INPUT":
      case "LINK":
      case "META":
      case "PARAM":
      case "SOURCE":
      case "TRACK":
      case "WBR":
        return true;
      default:
        return false;
    }
  };

  let cache = RESOLVED_COLOR_CACHE.get(contextElement);
  if (!cache) {
    cache = new Map<string, string>();
    RESOLVED_COLOR_CACHE.set(contextElement, cache);
  }

  // IMPORTANT: this resolution depends on dynamic state (e.g. `--tau` + `color-scheme`).
  // The inspector can scan multiple modes in a single session, so the cache must be
  // state-scoped or it will return stale results.
  const tau = contextComputedStyle.getPropertyValue("--tau").trim();
  const colorScheme = contextComputedStyle.colorScheme;
  const stateKey = `${tau}|${colorScheme}`;

  const key = `${stateKey}:${property}:${value}`;
  const cached = cache.get(key);
  if (cached) return cached;

  const probe = document.createElement("div");
  probe.style.position = "absolute";
  probe.style.visibility = "hidden";
  probe.style.pointerEvents = "none";
  probe.style.width = "0";
  probe.style.height = "0";
  probe.style.overflow = "hidden";
  // `light-dark()` is resolved based on the element's computed `color-scheme`.
  // `color-scheme` is not reliably inherited in a way that's useful for probing,
  // so explicitly mirror the context element's computed scheme.
  if (colorScheme) probe.style.setProperty("color-scheme", colorScheme);
  probe.style.setProperty(property, value);

  const probeHost = isVoidElement(contextElement)
    ? contextElement.parentElement || contextElement
    : contextElement;

  // If we can't probe as a child of the target element, mirror the class and any
  // inline custom properties so CSS variable resolution still matches closely.
  if (probeHost !== contextElement) {
    probe.className = contextElement.className;

    for (const name of Array.from(contextElement.style)) {
      if (!name.startsWith("--")) continue;
      const v = contextElement.style.getPropertyValue(name);
      if (v) probe.style.setProperty(name, v);
    }
  }

  probeHost.appendChild(probe);
  const resolved = getComputedStyle(probe).getPropertyValue(property).trim();
  probe.remove();

  const canonical = canonicalizeColor(resolved);
  cache.set(key, canonical);
  return canonical;
}

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
    const canonicalValue =
      intent === "Final Text Color" ||
      intent === "Surface Color" ||
      intent === "Actual Background" ||
      intent === "Actual Text Color"
        ? canonicalizeColor(value)
        : value;
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
      value: canonicalValue,
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

      // Surfaces commonly establish a default text source via
      // `--_axm-text-lightness-source` without applying an explicit `text-*`
      // class. This is an intentional pattern in the system.
      // Treat those as a connected default so the inspector doesn't report a
      // “Private Token” violation for an otherwise-valid surface default.
      if (
        !responsibleClass &&
        classList.some((c) => c.startsWith("surface-"))
      ) {
        if (lightnessSource.includes("--axm-text-high-token")) {
          responsibleClass = "text-high (surface default)";
        } else if (lightnessSource.includes("--axm-text-subtle-token")) {
          responsibleClass = "text-subtle (surface default)";
        } else if (lightnessSource.includes("--axm-text-subtlest-token")) {
          responsibleClass = "text-subtlest (surface default)";
        } else if (lightnessSource.includes("--axm-text-body-token")) {
          responsibleClass = "text-body (surface default)";
        } else {
          responsibleClass = "text (surface default)";
        }
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
    // IMPORTANT: the computed foreground can vary per-element (e.g. `text-subtle`).
    // Resolve in the element's own cascade context, not just the surface root.
    const resolved = resolveColorInContext(
      element,
      "color",
      "var(--_axm-computed-fg-color)",
    );
    addToken("Final Text Color", resolved, "--_axm-computed-fg-color", fgColor);
  }

  // 3. Resolve Computed Surface
  // We check this on the context element, or the current element if it is the context
  const surfaceColor = style.getPropertyValue("--_axm-computed-surface").trim();
  if (surfaceColor && surfaceColor !== "transparent") {
    // IMPORTANT: `--_axm-computed-surface` can vary per-element (nested surfaces).
    // Resolve it in the element's own cascade context so it matches computed
    // `background-color` on the same element.
    const resolved = resolveColorInContext(
      element,
      "background-color",
      "var(--_axm-computed-surface)",
    );
    addToken(
      "Surface Color",
      resolved,
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

  // 5. Resolve Actual Text Color
  // This helps identify when a utility class (like text-white) overrides the axiomatic text
  const textColor = style.color;
  if (textColor && textColor !== "transparent") {
    addToken("Actual Text Color", textColor, "color", textColor);
  }

  return tokens;
}
