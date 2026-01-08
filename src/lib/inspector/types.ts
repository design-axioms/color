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
  /** The element that supplied this token */
  element?: HTMLElement;
  /** Whether the element is the same as the inspected element */
  isLocal?: boolean;
  /** Whether this is an internal plumbing token */
  isPrivate?: boolean;
  /** The CSS class likely responsible for this token (e.g., "theme-red") */
  responsibleClass?: string;
  /** Whether the token is defined via inline style */
  isInline?: boolean;
  /** Whether the token matches the system default (initial-value) */
  isDefault?: boolean;
}

export interface ElementDebugInfo {
  context: DebugContext;
  resolvedTokens: ResolvedToken[];
}

export interface CSSRuleMatch {
  selector: string;
  value: string;
  specificity: number;
  stylesheet: string | null;
  isImportant: boolean;
  isLayered: boolean;
  scopeProximity: number;
  rule: CSSStyleRule | null;
}

/**
 * A violation detected by the inspector.
 */
export interface Violation {
  element: HTMLElement;
  tagName: string;
  id: string;
  classes: string;
  reason: string;
  surface?: string;
  actual?: string;
}

/**
 * Result of a framework contract scan.
 */
export interface FrameworkContractResult {
  violations: Violation[];
  metrics: {
    scannedSheets: number;
    scannedRules: number;
    shadowRoots: number;
  };
}

/**
 * Options for framework contract scanning.
 */
export interface FrameworkContractScanOptions {
  /** Container element to ignore during scanning */
  ignoreContainer?: HTMLElement;
}

/**
 * Adapter interface for framework-specific contract validation.
 *
 * Framework adapters implement CSSOM-based scanning to detect violations
 * of the framework's integration contract with Axiomatic. This enables
 * the inspector engine to remain framework-agnostic while supporting
 * framework-specific rules.
 *
 * @example
 * ```ts
 * const adapter = createStarlightContractAdapter();
 * const result = engine.scanForFrameworkContractViolations(adapter);
 * ```
 */
export interface FrameworkContractAdapter {
  /** Human-readable name of the framework (e.g., "Starlight") */
  readonly name: string;

  /**
   * Scan for violations of the framework's integration contract.
   *
   * @param options - Scan configuration options
   * @returns Violations found and scan metrics
   */
  scan(options?: FrameworkContractScanOptions): FrameworkContractResult;
}
