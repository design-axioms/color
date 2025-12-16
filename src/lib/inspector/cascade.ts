import type { CSSRuleMatch } from "./types.ts";

export function compareRules(a: CSSRuleMatch, b: CSSRuleMatch): number {
  // 1. Importance
  if (a.isImportant !== b.isImportant) return a.isImportant ? -1 : 1;

  // 2. Layers
  // Normal: Unlayered > Layered
  // Important: Layered > Unlayered
  if (a.isLayered !== b.isLayered) {
    if (a.isImportant) {
      return a.isLayered ? -1 : 1;
    } else {
      return a.isLayered ? 1 : -1;
    }
  }

  // 3. Scope Proximity (Lower wins)
  if (a.scopeProximity !== b.scopeProximity) {
    return a.scopeProximity - b.scopeProximity;
  }

  // 4. Specificity
  if (a.specificity > b.specificity) return -1;
  if (a.specificity < b.specificity) return 1;

  // 5. Source Order (handled by array reverse before sort usually, or explicit index)
  // If we rely on stable sort and reverse, we return 0 here.
  return 0;
}
