import type { CSSRuleMatch } from "./types.ts";
import { calculateSpecificity } from "./specificity.ts";
import { getEffectiveStyleSheets } from "./sheets.ts";
import { evaluateScope } from "./scope.ts";

export function collectMatchingRules(
  element: HTMLElement,
  property: string,
): CSSRuleMatch[] {
  const matches: CSSRuleMatch[] = [];
  const sheets = getEffectiveStyleSheets(element);

  for (const sheet of sheets) {
    try {
      const rules = sheet.cssRules;
      for (let j = 0; j < rules.length; j++) {
        const rule = rules[j];
        if (rule) processRule(rule, sheet, element, property, matches);
      }
    } catch {
      // CORS or access denied
    }
  }

  return matches;
}

function processRule(
  rule: CSSRule,
  sheet: CSSStyleSheet,
  element: HTMLElement,
  property: string,
  matches: CSSRuleMatch[],
  context: { isLayered: boolean; scopeProximity: number } = {
    isLayered: false,
    scopeProximity: Infinity,
  },
): void {
  // 1. Style Rule (The Leaf)
  if (rule instanceof CSSStyleRule) {
    if (element.matches(rule.selectorText)) {
      const value = rule.style.getPropertyValue(property);
      if (value) {
        matches.push({
          selector: rule.selectorText,
          value: value,
          specificity: calculateSpecificity(rule.selectorText),
          stylesheet: sheet.href || "constructed",
          isImportant: rule.style.getPropertyPriority(property) === "important",
          isLayered: context.isLayered,
          scopeProximity: context.scopeProximity,
          rule: rule,
        });
      }
    }
    return;
  }

  // 2. Grouping Rules (The Branches)
  // We handle Media, Supports, Layer, Scope, and Container
  if (
    rule instanceof CSSMediaRule ||
    rule instanceof CSSSupportsRule ||
    (typeof CSSLayerBlockRule !== "undefined" &&
      rule instanceof CSSLayerBlockRule) ||
    (typeof CSSScopeRule !== "undefined" && rule instanceof CSSScopeRule) ||
    (typeof CSSContainerRule !== "undefined" &&
      rule instanceof CSSContainerRule)
  ) {
    let isActive = true;
    const nextContext = { ...context };

    // A. Evaluate Conditions
    if (rule instanceof CSSMediaRule) {
      isActive = window.matchMedia(rule.conditionText).matches;
    } else if (rule instanceof CSSSupportsRule) {
      isActive = CSS.supports(rule.conditionText);
    } else if (
      typeof CSSContainerRule !== "undefined" &&
      rule instanceof CSSContainerRule
    ) {
      // TODO: Implement Container Query evaluation
      // For now, we assume true to at least traverse, but this is a gap.
      isActive = true;
    }

    // B. Update Context (Layers)
    if (
      typeof CSSLayerBlockRule !== "undefined" &&
      rule instanceof CSSLayerBlockRule
    ) {
      nextContext.isLayered = true;
    }

    // C. Update Context (Scope)
    if (typeof CSSScopeRule !== "undefined" && rule instanceof CSSScopeRule) {
      const scopeEval = evaluateScope(
        rule,
        element,
        nextContext.scopeProximity,
      );
      isActive = isActive && scopeEval.isActive;
      nextContext.scopeProximity = scopeEval.proximity;
    }

    // D. Recurse
    if (isActive) {
      // cssRules exists on grouping rules
      for (let k = 0; k < rule.cssRules.length; k++) {
        const subRule = rule.cssRules[k];
        if (subRule)
          processRule(subRule, sheet, element, property, matches, nextContext);
      }
    }
  }
}
