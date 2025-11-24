import { generateTokensCss } from "./generator.ts";
import { getKeyColorStats, solve } from "./index.ts";
import type { SolverConfig } from "./types.ts";

/**
 * Generates a CSS theme string from a SolverConfig.
 * This runs the full solver engine and token generator.
 *
 * It also extracts the average Chroma and Hue from the key colors
 * and sets them as --base-chroma and --base-hue.
 */
export function generateTheme(config: SolverConfig): string {
  const { backgrounds } = solve(config);
  const stats = getKeyColorStats(config.anchors.keyColors);

  let css = generateTokensCss(
    config.groups,
    backgrounds,
    config.hueShift,
    config.borderTargets
  );

  // Prepend root variables if key colors exist
  if (stats.chroma !== undefined || stats.hue !== undefined) {
    const vars: string[] = [];
    if (stats.chroma !== undefined)
      vars.push(`  --base-chroma: ${stats.chroma};`);
    if (stats.hue !== undefined) vars.push(`  --base-hue: ${stats.hue};`);

    if (vars.length > 0) {
      css = `:root {\n${vars.join("\n")}\n}\n\n` + css;
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
  existingElement?: HTMLStyleElement
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
