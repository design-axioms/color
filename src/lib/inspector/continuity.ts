import { converter } from "culori";
import { requireDocumentBody, requireDocumentHead } from "../dom.ts";
import { findWinningRule, formatSpecificity } from "./css-utils.ts";
import type { AxiomaticInspectorEngine, Violation } from "./engine.ts";
import { parseNumberOrThrow } from "./guards.ts";

const toRgb = converter("rgb");

function colorsVisuallyEqual(a: string, b: string): boolean {
  const aa = a.trim();
  const bb = b.trim();

  if (aa === bb) return true;

  const isTransparent = (v: string): boolean =>
    v === "transparent" || v === "rgba(0, 0, 0, 0)";
  if (isTransparent(aa) && isTransparent(bb)) return true;

  const ra = toRgb(aa);
  const rb = toRgb(bb);
  if (!ra || !rb) return false;

  const eps = 1e-6;
  const eq = (x: number | undefined, y: number | undefined): boolean => {
    if (x === undefined && y === undefined) return true;
    if (x === undefined || y === undefined) return false;
    return Math.abs(x - y) <= eps;
  };

  return (
    eq(ra.r, rb.r) && eq(ra.g, rb.g) && eq(ra.b, rb.b) && eq(ra.alpha, rb.alpha)
  );
}

export class ContinuityChecker {
  private engine: AxiomaticInspectorEngine;

  constructor(engine: AxiomaticInspectorEngine) {
    this.engine = engine;
  }

  public async check(
    ignoreContainer?: HTMLElement,
    options?: {
      tauSamples?: number[];
      signal?: AbortSignal;
    },
  ): Promise<Violation[]> {
    const signal = options?.signal;
    const abortIfNeeded = (): void => {
      if (signal?.aborted) {
        throw new DOMException("Aborted", "AbortError");
      }
    };

    const raf2 = async (): Promise<void> => {
      await new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      );
    };

    // 1. Freeze Time (Set tau to 0)
    const style = document.createElement("style");
    // Some integrations (including Starlight) can inject constructed stylesheets late,
    // after we append this <style>, re-introducing transitions. We use BOTH:
    //  - a broad CSS override (covers most elements and pseudo styles), and
    //  - inline style overrides (highest priority) for deterministic freezing.
    style.innerHTML = `
      * { transition: none !important; animation: none !important; }
      html, html[data-theme], :root, :root[data-theme] {
        transition: none !important;
        animation: none !important;
      }
    `;
    requireDocumentHead("ContinuityChecker.check").appendChild(style);

    const root = document.documentElement;
    let originalTheme: string | null = null;

    const body = requireDocumentBody("ContinuityChecker.check");
    const allElements = Array.from(body.querySelectorAll("*"));
    const motionOverrides: Array<{
      el: HTMLElement | SVGElement;
      transition: string;
      animation: string;
    }> = [];

    const applyNoMotionInline = (el: HTMLElement | SVGElement): void => {
      motionOverrides.push({
        el,
        transition: el.style.transition,
        animation: el.style.animation,
      });
      el.style.setProperty("transition", "none", "important");
      el.style.setProperty("animation", "none", "important");
    };

    const tauSamplesRaw = options?.tauSamples;
    const tauSamples =
      Array.isArray(tauSamplesRaw) && tauSamplesRaw.length > 0
        ? tauSamplesRaw
        : [-1, 0, 1];

    try {
      // Ensure our override CSS applies before changing `--tau`; otherwise, an
      // integration-level `transition: --tau ...` can start animating immediately.
      abortIfNeeded();
      await raf2();
      abortIfNeeded();

      // Inline no-motion for deterministic behavior even if late stylesheets land.
      applyNoMotionInline(root);
      for (const element of allElements) {
        if (element instanceof HTMLElement || element instanceof SVGElement) {
          applyNoMotionInline(element);
        }
      }

      originalTheme = root.getAttribute("data-theme");
      const violations: Violation[] = [];

      // Cancel any in-flight tau transitions by locking to the current computed value
      // first (with transitions/animations disabled). We'll then iterate fixed samples.
      const computedTau = getComputedStyle(root)
        .getPropertyValue("--tau")
        .trim();
      if (computedTau) {
        root.style.setProperty("--tau", computedTau, "important");
      }
      abortIfNeeded();
      await raf2();

      for (const tau of tauSamples) {
        abortIfNeeded();
        // Freeze `--tau` for this sample.
        root.style.setProperty("--tau", String(tau), "important");
        await raf2();

        abortIfNeeded();

        // Best-effort enforcement: if some late-running code overwrote the style attr,
        // re-apply once more before taking measurements.
        const parsedTau = parseNumberOrThrow(
          getComputedStyle(root).getPropertyValue("--tau").trim(),
          "ContinuityChecker.check --tau",
        );
        if (!(Math.abs(parsedTau - tau) < 1e-6)) {
          root.style.setProperty("--tau", String(tau), "important");
          await raf2();
        }

        // Capture State A (Light Mode + Tau=tau)
        root.setAttribute("data-theme", "light");
        await raf2();

        abortIfNeeded();

        const stateA: Array<{
          bg: string;
          color: string;
          borderTopColor: string;
          borderTopWidth: string;
          borderLeftColor: string;
          borderLeftWidth: string;
          borderRightColor: string;
          borderRightWidth: string;
          borderBottomColor: string;
          borderBottomWidth: string;
          outlineColor: string;
          outlineWidth: string;
        }> = [];

        for (let i = 0; i < allElements.length; i += 1) {
          if (i % 50 === 0) abortIfNeeded();
          const el = allElements[i];
          if (!el) continue;
          const style = getComputedStyle(el);
          stateA.push({
            bg: style.backgroundColor,
            color: style.color,
            borderTopColor: style.borderTopColor,
            borderTopWidth: style.borderTopWidth,
            borderLeftColor: style.borderLeftColor,
            borderLeftWidth: style.borderLeftWidth,
            borderRightColor: style.borderRightColor,
            borderRightWidth: style.borderRightWidth,
            borderBottomColor: style.borderBottomColor,
            borderBottomWidth: style.borderBottomWidth,
            outlineColor: style.outlineColor,
            outlineWidth: style.outlineWidth,
          });
        }

        // Toggle Theme (Dark Mode + Tau=tau)
        root.setAttribute("data-theme", "dark");
        await raf2();

        abortIfNeeded();

        // Compare
        for (let i = 0; i < allElements.length; i += 1) {
          if (i % 50 === 0) abortIfNeeded();
          const element = allElements[i];
          if (!(element instanceof HTMLElement)) continue;
          if (element.getClientRects().length === 0) continue;
          if (element.tagName === "AXIOMATIC-DEBUGGER") continue;
          if (ignoreContainer && ignoreContainer.contains(element)) continue;

          const a = stateA[i];
          if (!a) continue;

          const style = getComputedStyle(element);
          const b = {
            bg: style.backgroundColor,
            color: style.color,
            borderTopColor: style.borderTopColor,
            borderTopWidth: style.borderTopWidth,
            borderLeftColor: style.borderLeftColor,
            borderLeftWidth: style.borderLeftWidth,
            borderRightColor: style.borderRightColor,
            borderRightWidth: style.borderRightWidth,
            borderBottomColor: style.borderBottomColor,
            borderBottomWidth: style.borderBottomWidth,
            outlineColor: style.outlineColor,
            outlineWidth: style.outlineWidth,
          };

          if (a.bg === "rgba(0, 0, 0, 0)" && b.bg === "rgba(0, 0, 0, 0)") {
            // Ignore transparent
          } else if (!colorsVisuallyEqual(a.bg, b.bg)) {
            const winningRule = findWinningRule(element, "background-color");
            let culprit = "Unknown Selector";

            if (winningRule) {
              if (winningRule.selector === "element.style") {
                culprit = "Inline `style` attribute";
              } else {
                const file = winningRule.stylesheet
                  ? winningRule.stylesheet.split("/").pop()
                  : "unknown file";
                const specificity = formatSpecificity(winningRule.specificity);
                culprit = `CSS Rule: ${winningRule.selector} (${file}) [${specificity}]`;
              }
            } else {
              const { tokens } = this.engine.inspect(element);
              const bgToken = tokens.find(
                (t) => t.intent === "Actual Background",
              );

              if (bgToken && bgToken.sourceVar.startsWith("--")) {
                culprit = `Variable ${bgToken.sourceVar}`;
              } else {
                culprit = "User Agent default or Inherited";
              }
            }

            violations.push({
              element,
              tagName: element.tagName.toLowerCase(),
              id: element.id,
              classes: element.className,
              reason: `Continuity Violation (tau=${tau}) (Background): Snapped from ${a.bg} to ${b.bg}. Culprit: ${culprit}`,
              surface: "N/A",
              actual: b.bg,
            });
          } else if (!colorsVisuallyEqual(a.color, b.color)) {
            violations.push({
              element,
              tagName: element.tagName.toLowerCase(),
              id: element.id,
              classes: element.className,
              reason: `Continuity Violation (tau=${tau}) (Foreground): Snapped from ${a.color} to ${b.color}.`,
              surface: "N/A",
              actual: b.color,
            });
          } else {
            const borderHasPaint =
              parseFloat(a.borderTopWidth) > 0 ||
              parseFloat(b.borderTopWidth) > 0;
            if (
              borderHasPaint &&
              !colorsVisuallyEqual(a.borderTopColor, b.borderTopColor)
            ) {
              const winningRule = findWinningRule(element, "border-top-color");
              let culprit = "Unknown Selector";

              if (winningRule) {
                if (winningRule.selector === "element.style") {
                  culprit = "Inline `style` attribute";
                } else {
                  const file = winningRule.stylesheet
                    ? winningRule.stylesheet.split("/").pop()
                    : "unknown file";
                  const specificity = formatSpecificity(
                    winningRule.specificity,
                  );
                  culprit = `CSS Rule: ${winningRule.selector} (${file}) [${specificity}]`;
                }
              }

              violations.push({
                element,
                tagName: element.tagName.toLowerCase(),
                id: element.id,
                classes: element.className,
                reason: `Continuity Violation (tau=${tau}) (Border): Snapped from ${a.borderTopColor} to ${b.borderTopColor}. Culprit: ${culprit}`,
                surface: "N/A",
                actual: b.borderTopColor,
              });
              continue;
            }

            const borderLeftHasPaint =
              parseFloat(a.borderLeftWidth) > 0 ||
              parseFloat(b.borderLeftWidth) > 0;
            if (
              borderLeftHasPaint &&
              !colorsVisuallyEqual(a.borderLeftColor, b.borderLeftColor)
            ) {
              const winningRule = findWinningRule(element, "border-left-color");
              let culprit = "Unknown Selector";

              if (winningRule) {
                if (winningRule.selector === "element.style") {
                  culprit = "Inline `style` attribute";
                } else {
                  const file = winningRule.stylesheet
                    ? winningRule.stylesheet.split("/").pop()
                    : "unknown file";
                  const specificity = formatSpecificity(
                    winningRule.specificity,
                  );
                  culprit = `CSS Rule: ${winningRule.selector} (${file}) [${specificity}]`;
                }
              }

              violations.push({
                element,
                tagName: element.tagName.toLowerCase(),
                id: element.id,
                classes: element.className,
                reason: `Continuity Violation (tau=${tau}) (Border-Left): Snapped from ${a.borderLeftColor} to ${b.borderLeftColor}. Culprit: ${culprit}`,
                surface: "N/A",
                actual: b.borderLeftColor,
              });
              continue;
            }

            const borderRightHasPaint =
              parseFloat(a.borderRightWidth) > 0 ||
              parseFloat(b.borderRightWidth) > 0;
            if (
              borderRightHasPaint &&
              !colorsVisuallyEqual(a.borderRightColor, b.borderRightColor)
            ) {
              const winningRule = findWinningRule(
                element,
                "border-right-color",
              );
              let culprit = "Unknown Selector";

              if (winningRule) {
                if (winningRule.selector === "element.style") {
                  culprit = "Inline `style` attribute";
                } else {
                  const file = winningRule.stylesheet
                    ? winningRule.stylesheet.split("/").pop()
                    : "unknown file";
                  const specificity = formatSpecificity(
                    winningRule.specificity,
                  );
                  culprit = `CSS Rule: ${winningRule.selector} (${file}) [${specificity}]`;
                }
              }

              violations.push({
                element,
                tagName: element.tagName.toLowerCase(),
                id: element.id,
                classes: element.className,
                reason: `Continuity Violation (tau=${tau}) (Border-Right): Snapped from ${a.borderRightColor} to ${b.borderRightColor}. Culprit: ${culprit}`,
                surface: "N/A",
                actual: b.borderRightColor,
              });
              continue;
            }

            const borderBottomHasPaint =
              parseFloat(a.borderBottomWidth) > 0 ||
              parseFloat(b.borderBottomWidth) > 0;
            if (
              borderBottomHasPaint &&
              !colorsVisuallyEqual(a.borderBottomColor, b.borderBottomColor)
            ) {
              const winningRule = findWinningRule(
                element,
                "border-bottom-color",
              );
              let culprit = "Unknown Selector";

              if (winningRule) {
                if (winningRule.selector === "element.style") {
                  culprit = "Inline `style` attribute";
                } else {
                  const file = winningRule.stylesheet
                    ? winningRule.stylesheet.split("/").pop()
                    : "unknown file";
                  const specificity = formatSpecificity(
                    winningRule.specificity,
                  );
                  culprit = `CSS Rule: ${winningRule.selector} (${file}) [${specificity}]`;
                }
              }

              violations.push({
                element,
                tagName: element.tagName.toLowerCase(),
                id: element.id,
                classes: element.className,
                reason: `Continuity Violation (tau=${tau}) (Border-Bottom): Snapped from ${a.borderBottomColor} to ${b.borderBottomColor}. Culprit: ${culprit}`,
                surface: "N/A",
                actual: b.borderBottomColor,
              });
              continue;
            }

            const outlineHasPaint =
              parseFloat(a.outlineWidth) > 0 || parseFloat(b.outlineWidth) > 0;
            if (
              outlineHasPaint &&
              !colorsVisuallyEqual(a.outlineColor, b.outlineColor)
            ) {
              violations.push({
                element,
                tagName: element.tagName.toLowerCase(),
                id: element.id,
                classes: element.className,
                reason: `Continuity Violation (tau=${tau}) (Outline): Snapped from ${a.outlineColor} to ${b.outlineColor}.`,
                surface: "N/A",
                actual: b.outlineColor,
              });
            }
          }
        }

        // If we found anything at this tau, don't waste cycles sampling more.
        if (violations.length > 0) break;
      }

      return violations;
    } finally {
      // Cleanup
      if (originalTheme) {
        root.setAttribute("data-theme", originalTheme);
      } else {
        root.removeAttribute("data-theme");
      }

      document.head.removeChild(style);
      root.style.removeProperty("--tau");

      // Restore inline motion styles (only the inline values we changed).
      for (let i = motionOverrides.length - 1; i >= 0; i -= 1) {
        const entry = motionOverrides[i];
        if (!entry) continue;
        if (entry.transition) {
          entry.el.style.transition = entry.transition;
        } else {
          entry.el.style.removeProperty("transition");
        }

        if (entry.animation) {
          entry.el.style.animation = entry.animation;
        } else {
          entry.el.style.removeProperty("animation");
        }
      }
    }

    // Should be unreachable: all paths return from the try block.
    // Keep TypeScript happy with a fallback.
    return [];
  }
}
