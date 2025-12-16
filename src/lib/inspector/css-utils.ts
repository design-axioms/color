import type { CSSRuleMatch } from "./types.ts";
import { collectMatchingRules } from "./collector.ts";
import { compareRules } from "./cascade.ts";
import { formatSpecificity } from "./specificity.ts";

export { formatSpecificity };

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

  // Reverse to ensure later rules (higher source order) come first when specificity is equal
  // (relying on stable sort)
  matches.reverse();

  matches.sort(compareRules);

  return matches[0] ?? null;
}
