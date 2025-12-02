import { generateTokensCss } from "./generator.ts";
import { getKeyColorStats, solve } from "./solver.ts";
import type { SolverConfig } from "./types.ts";

export { toHighContrast } from "./generator.ts";

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
  const stats = getKeyColorStats(config.anchors.keyColors);

  let css = generateTokensCss(config.groups, theme, config.borderTargets, {
    selector,
  });

  // Prepend variables if key colors exist
  if (stats.chroma !== undefined || stats.hue !== undefined) {
    const vars: string[] = [];
    if (stats.chroma !== undefined)
      vars.push(`  --chroma-brand: ${stats.chroma};`);
    if (stats.hue !== undefined) vars.push(`  --hue-brand: ${stats.hue};`);

    if (vars.length > 0) {
      const scope = selector || ":root";
      css = `${scope} {\n${vars.join("\n")}\n}\n\n` + css;
    }
  }

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
