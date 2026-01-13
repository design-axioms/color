import { evaluateScope } from "./scope.ts";
import { getEffectiveStyleSheets } from "./sheets.ts";
import { calculateSpecificity } from "./specificity.ts";
import type { CSSRuleMatch, ConditionalContext } from "./types.ts";

/**
 * Find the first CSSStyleRule inside a conditional rule.
 * This is used to inject our sentinel property for probe-based evaluation.
 */
function findFirstStyleRule(rule: CSSRule): CSSStyleRule | null {
  if (rule instanceof CSSStyleRule) {
    return rule;
  }
  if ("cssRules" in rule) {
    const groupRule = rule as CSSGroupingRule;
    for (let i = 0; i < groupRule.cssRules.length; i++) {
      const subRule = groupRule.cssRules[i];
      if (subRule) {
        const found = findFirstStyleRule(subRule);
        if (found) return found;
      }
    }
  }
  return null;
}

/**
 * Probe whether a container rule is currently active for an element.
 *
 * Instead of parsing and evaluating condition syntax ourselves, we use the
 * browser's own evaluation: inject a temporary CSS custom property into the
 * rule, then check if getComputedStyle sees it on the target element.
 *
 * This approach:
 * - Is 100% accurate (uses browser's native evaluation)
 * - Handles complex conditions (and, or, not) automatically
 * - Supports future CSS syntax we don't know about yet
 *
 * @param element - The element to test against
 * @param rule - The container rule to evaluate
 * @returns true if the rule's condition is currently satisfied
 */
export function isContainerRuleActive(
  element: Element,
  rule: CSSContainerRule,
): boolean {
  // Generate a unique sentinel property name
  const sentinel = `--_axm-probe-${Math.random().toString(36).slice(2, 10)}`;
  const sentinelValue = "active";

  // Find a style rule to inject into
  const styleRule = findFirstStyleRule(rule);
  if (!styleRule) {
    // No style rule inside = can't probe, assume active (conservative)
    return true;
  }

  try {
    // Inject sentinel
    styleRule.style.setProperty(sentinel, sentinelValue);

    // Check if computed style sees it
    const computed = getComputedStyle(element)
      .getPropertyValue(sentinel)
      .trim();
    const isActive = computed === sentinelValue;

    // Clean up
    styleRule.style.removeProperty(sentinel);

    return isActive;
  } catch {
    // If anything fails, assume active (conservative)
    return true;
  }
}

/**
 * Evaluate a conditional rule for an element.
 *
 * Uses the most reliable evaluation method for each rule type:
 * - `@media`: window.matchMedia() - widely supported, works in test environments
 * - `@supports`: CSS.supports() - widely supported, works in test environments
 * - `@container`: Probe technique - uses browser's native evaluation via style injection
 *
 * @param element - The element being inspected
 * @param rule - The conditional rule to evaluate
 * @returns ConditionalContext with evaluation result, or undefined if not conditional
 */
function evaluateConditionalRule(
  element: Element,
  rule: CSSRule,
): ConditionalContext | undefined {
  // @media - use matchMedia API
  if (rule instanceof CSSMediaRule) {
    const condition = rule.conditionText;
    const active = window.matchMedia(condition).matches;
    return { type: "media", condition, active, evaluated: true };
  }

  // @supports - use CSS.supports API
  if (rule instanceof CSSSupportsRule) {
    const condition = rule.conditionText;
    const active = CSS.supports(condition);
    return { type: "supports", condition, active, evaluated: true };
  }

  // @container - use probe technique (only way to evaluate accurately)
  if (
    typeof CSSContainerRule !== "undefined" &&
    rule instanceof CSSContainerRule
  ) {
    const condition = rule.conditionText;
    const active = isContainerRuleActive(element, rule);
    return { type: "container", condition, active, evaluated: true };
  }

  return undefined;
}

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
  context: {
    isLayered: boolean;
    scopeProximity: number;
    conditional?: ConditionalContext;
  } = {
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
          conditional: context.conditional,
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
    let shouldTraverse = true;
    const nextContext = { ...context };

    // A. Evaluate Conditional Rules using probe technique
    // This works for @container, @media, and @supports uniformly
    const conditionalResult = evaluateConditionalRule(element, rule);
    if (conditionalResult) {
      nextContext.conditional = conditionalResult;
      // Always traverse conditional rules so we can show inactive rules
      shouldTraverse = true;
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
      nextContext.scopeProximity = scopeEval.proximity;
      if (!scopeEval.isActive) {
        shouldTraverse = false;
      }
    }

    // D. Recurse
    // For container rules, always traverse but mark as inactive
    // For other rules, only traverse if active
    if (shouldTraverse) {
      // cssRules exists on grouping rules
      for (let k = 0; k < rule.cssRules.length; k++) {
        const subRule = rule.cssRules[k];
        if (subRule)
          processRule(subRule, sheet, element, property, matches, nextContext);
      }
    }
  }
}
