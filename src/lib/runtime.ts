import { generateTokensCss } from "./generator.ts";
import { solve } from "./solver.ts";
import type { SolverConfig } from "./types.ts";

/**
 * Generates a CSS theme string from a SolverConfig.
 * This runs the full solver engine and token generator.
 *
 * It also extracts the average Chroma and Hue from the key colors
 * and sets them as --chroma-brand and --hue-brand.
 *
 * @param config The solver configuration
 * @param selector Optional CSS selector to scope the rules to (e.g. "#my-app")
 */
export function generateTheme(config: SolverConfig, selector?: string): string {
  const theme = solve(config);

  const css = generateTokensCss(
    config.groups,
    theme,
    config.borderTargets,
    {
      selector,
      prefix: "axm",
    },
    config.anchors.keyColors,
  );

  return css;
}

/**
 * Injects a CSS string into the DOM.
 * If target is provided, appends to that element (e.g. ShadowRoot).
 * Otherwise, appends to document.head.
 *
 * If existingElement is provided, it updates that element instead of creating a new one.
 */
export function injectTheme(
  css: string,
  target?: HTMLElement | ShadowRoot,
  existingElement?: HTMLStyleElement,
): HTMLStyleElement {
  const style = existingElement || document.createElement("style");
  style.textContent = css;

  if (!existingElement) {
    if (target) {
      target.appendChild(style);
    } else {
      document.head.appendChild(style);
    }
  }

  return style;
}
