import { ContinuityChecker } from "./continuity.ts";
import { resolveTokens } from "./resolver.ts";
import type {
  DebugContext,
  FrameworkContractAdapter,
  FrameworkContractResult,
  FrameworkContractScanOptions,
  ResolvedToken,
  Violation,
} from "./types.ts";
import { findContextRoot } from "./walker.ts";
import { starlightContractAdapter } from "../integrations/starlight/contract-adapter.ts";

// Re-export Violation from types for backward compatibility
export type { Violation } from "./types.ts";

export interface InspectionResult {
  context: DebugContext;
  tokens: ResolvedToken[];
  hasMismatch: boolean;
  surfaceToken?: ResolvedToken;
  bgToken?: ResolvedToken;
}

export class AxiomaticInspectorEngine {
  public inspect(element: HTMLElement): InspectionResult {
    const context = findContextRoot(element);
    const tokens = resolveTokens(element, context);

    const surfaceToken = tokens.find((t) => t.intent === "Surface Color");
    const bgToken = tokens.find((t) => t.intent === "Actual Background");
    const fgToken = tokens.find((t) => t.intent === "Final Text Color");
    const actualFgToken = tokens.find((t) => t.intent === "Actual Text Color");

    const hasSurfaceMismatch =
      !!surfaceToken && !!bgToken && surfaceToken.value !== bgToken.value;

    const hasTextMismatch =
      !!fgToken && !!actualFgToken && fgToken.value !== actualFgToken.value;

    const hasMismatch = hasSurfaceMismatch || hasTextMismatch;

    return {
      context,
      tokens,
      hasMismatch,
      surfaceToken,
      bgToken,
    };
  }

  public scanForViolations(
    root: HTMLElement | Document = document,
    ignoreContainer?: HTMLElement,
  ): Violation[] {
    const allElements = root.querySelectorAll("*");
    const violations: Violation[] = [];

    for (const element of Array.from(allElements)) {
      if (element instanceof HTMLElement) {
        // Skip the document root; it often has UA-driven defaults and is not a
        // meaningful consumer-authored surface/text target.
        if (element.tagName === "HTML") continue;

        // Skip generated/foreign regions that intentionally manage their own colors.
        // This keeps the violation report focused on consumer-authored styling.
        if (element.closest(".expressive-code, .astro-code")) continue;
        if (element.classList.contains("sr-only")) continue;
        if (element.tagName === "ASTRO-DEV-TOOLBAR") continue;

        // Skip hidden elements
        const style = getComputedStyle(element);
        if (
          style.display === "none" ||
          style.visibility === "hidden" ||
          style.opacity === "0"
        )
          continue;

        // Skip the debugger itself
        if (element.tagName === "AXIOMATIC-DEBUGGER") continue;
        if (ignoreContainer && ignoreContainer.contains(element)) continue;

        const { hasMismatch, surfaceToken, bgToken, tokens } =
          this.inspect(element);

        const hasUnconnectedPrivateToken = tokens.some(
          (t) => t.isLocal && t.isPrivate && !t.responsibleClass && !t.isInline,
        );

        if (hasMismatch || hasUnconnectedPrivateToken) {
          let reason = "";
          if (hasMismatch) reason = "Axiom Mismatch";
          if (hasUnconnectedPrivateToken)
            reason = reason ? `${reason} & Private Token` : "Private Token";

          // Determine which mismatch occurred for the report
          const surfaceMismatch =
            !!surfaceToken && !!bgToken && surfaceToken.value !== bgToken.value;
          const fgToken = tokens.find((t) => t.intent === "Final Text Color");
          const actualFgToken = tokens.find(
            (t) => t.intent === "Actual Text Color",
          );
          const textMismatch =
            !!fgToken &&
            !!actualFgToken &&
            fgToken.value !== actualFgToken.value;

          let expected: string | undefined;
          let actual: string | undefined;

          if (textMismatch) {
            expected = fgToken.value;
            actual = actualFgToken.value;
          } else if (surfaceMismatch) {
            expected = surfaceToken.value;
            actual = bgToken.value;
          } else {
            expected = fgToken?.value;
            actual = actualFgToken?.value;
          }

          violations.push({
            element,
            tagName: element.tagName.toLowerCase(),
            id: element.id,
            classes: element.className,
            reason,
            surface: expected,
            actual: actual,
          });
        }
      }
    }

    return violations;
  }

  /**
   * Scan for violations of a framework's integration contract.
   *
   * This is a generic method that accepts any framework adapter. For Starlight,
   * use `scanForStarlightChromeContractViolations()` as a convenience wrapper.
   *
   * @param adapter - The framework contract adapter to use
   * @param options - Scan configuration options
   * @returns Full result including violations and scan metrics
   */
  public scanForFrameworkContractViolations(
    adapter: FrameworkContractAdapter,
    options?: FrameworkContractScanOptions,
  ): FrameworkContractResult {
    return adapter.scan(options);
  }

  /**
   * Starlight-specific continuity contract check.
   *
   * This is intentionally rule-focused (CSSOM scan) rather than DOM-wide.
   * It is designed to complement (not replace) the generic Axiomatic mismatch scan.
   *
   * This is a convenience wrapper around `scanForFrameworkContractViolations()`
   * with the Starlight adapter.
   */
  public scanForStarlightChromeContractViolations(options?: {
    ignoreContainer?: HTMLElement;
  }): Violation[] {
    return this.scanForFrameworkContractViolations(
      starlightContractAdapter,
      options,
    ).violations;
  }

  public async checkContinuity(
    ignoreContainer?: HTMLElement,
    options?: {
      tauSamples?: number[];
      signal?: AbortSignal;
    },
  ): Promise<Violation[]> {
    const checker = new ContinuityChecker(this);
    return checker.check(ignoreContainer, options);
  }
}
