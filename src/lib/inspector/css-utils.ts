import { compareRules } from "./cascade.ts";
import { collectMatchingRules } from "./collector.ts";
import { formatSpecificity } from "./specificity.ts";
import type { CSSRuleMatch } from "./types.ts";

export { formatSpecificity };

/**
 * Find the winning (active) CSS rule for a property on an element.
 *
 * Rules with inactive conditional contexts (e.g., container queries that
 * don't match) are excluded from consideration.
 *
 * @param element - The element to check
 * @param property - The CSS property name
 * @returns The winning rule, or null if none found
 */
export function findWinningRule(
  element: HTMLElement,
  property: string,
): CSSRuleMatch | null {
  if (element.style.getPropertyValue(property)) {
    return {
      selector: "element.style",
      value: element.style.getPropertyValue(property),
      specificity: 999999,
      stylesheet: "inline",
      isImportant: element.style.getPropertyPriority(property) === "important",
      isLayered: false,
      scopeProximity: Infinity,
      rule: null,
    };
  }

  const matches = collectMatchingRules(element, property);

  if (matches.length === 0) return null;

  // Filter out inactive conditional rules (they can't be the winning rule)
  const activeMatches = matches.filter(
    (m) => !m.conditional || m.conditional.active,
  );

  if (activeMatches.length === 0) return null;

  // Reverse to ensure later rules (higher source order) come first when specificity is equal
  // (relying on stable sort)
  activeMatches.reverse();

  activeMatches.sort(compareRules);

  return activeMatches[0] ?? null;
}

/**
 * Find all matching CSS rules for a property on an element.
 *
 * Returns all rules including inactive ones (for diagnostic display).
 *
 * @param element - The element to check
 * @param property - The CSS property name
 * @returns All matching rules, sorted by cascade order
 */
export function findAllMatchingRules(
  element: HTMLElement,
  property: string,
): CSSRuleMatch[] {
  const matches = collectMatchingRules(element, property);

  if (matches.length === 0) return [];

  // Reverse to ensure later rules (higher source order) come first when specificity is equal
  // (relying on stable sort)
  matches.reverse();

  matches.sort(compareRules);

  return matches;
}
