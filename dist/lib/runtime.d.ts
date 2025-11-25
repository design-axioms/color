import { SolverConfig } from './types.js';

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
declare function generateTheme(config: SolverConfig, selector?: string): string;
/**
 * Injects a CSS string into the DOM.
 * If target is provided, appends to that element (e.g. ShadowRoot).
 * Otherwise, appends to document.head.
 *
 * If existingElement is provided, it updates that element instead of creating a new one.
 */
declare function injectTheme(css: string, target?: HTMLElement | ShadowRoot, existingElement?: HTMLStyleElement): HTMLStyleElement;

export { generateTheme, injectTheme };
