export interface DebugContext {
  /** The name of the surface (e.g., "card", "layer-1") */
  surface: string | null;
  /** The polarity of the context */
  polarity: "light" | "dark" | null;
  /** The resolved background color of the surface */
  backgroundColor: string | null;
  /** The element that defines this context */
  element: HTMLElement;
}

export interface ResolvedToken {
  /** The semantic intent (e.g., "subtle", "strong") */
  intent: string;
  /** The resolved value (e.g., "oklch(0.6 0 0)") */
  value: string;
  /** The CSS variable that sources this value (e.g., "--text-lightness-source") */
  sourceVar: string;
  /** The raw value of the source variable (e.g., "0.6") */
  sourceValue: string;
}

export interface ElementDebugInfo {
  context: DebugContext;
  resolvedTokens: ResolvedToken[];
}
