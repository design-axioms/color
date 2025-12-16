import {
  STARLIGHT_CHROME_CONTRACT,
  type StarlightChromeContractSpec,
} from "../integrations/starlight/chrome-contract-spec.ts";
import type { Violation } from "./engine.ts";

type CssomViolation = {
  sheet: string;
  origin: string;
  selector: string;
  property: string;
  value: string;
  reason: string;
  rootLabel: string;
};

function sheetHint(
  sheet: CSSStyleSheet,
  origin: string,
  index: number,
): string {
  const anySheet = sheet as unknown as { href?: string | null };
  const href = typeof anySheet.href === "string" ? anySheet.href : null;
  if (href && href.length > 0) return href;
  return `(${origin} constructed #${index})`;
}

function walkRules(
  rules: CSSRuleList,
  onStyleRule: (rule: CSSStyleRule) => void,
): number {
  let count = 0;
  for (const rule of Array.from(rules)) {
    // STYLE_RULE
    if (rule instanceof CSSStyleRule) {
      count++;
      onStyleRule(rule);
      continue;
    }

    // Grouping rules (media/supports/layer/scope/container/etc).
    const anyRule = rule as unknown as { cssRules?: CSSRuleList };
    if (anyRule.cssRules) count += walkRules(anyRule.cssRules, onStyleRule);
  }
  return count;
}

function collectShadowRoots(root: Document | ShadowRoot): ShadowRoot[] {
  const out: ShadowRoot[] = [];
  const walker = document.createTreeWalker(
    root instanceof Document ? root.documentElement : root,
    NodeFilter.SHOW_ELEMENT,
  );

  let node = walker.currentNode as Element | null;
  while (node) {
    const anyEl = node as unknown as { shadowRoot?: ShadowRoot | null };
    if (anyEl.shadowRoot) out.push(anyEl.shadowRoot);
    node = walker.nextNode() as Element | null;
  }

  return out;
}

function collectSheetGroups(
  root: Document | ShadowRoot,
): Array<{ sheets: CSSStyleSheet[]; origin: string; rootLabel: string }> {
  const groups: Array<{
    sheets: CSSStyleSheet[];
    origin: string;
    rootLabel: string;
  }> = [];

  const rootLabel = root instanceof Document ? "document" : "shadow";

  const styleSheets = ((): CSSStyleSheet[] => {
    try {
      return Array.from((root as unknown as Document).styleSheets);
    } catch {
      return [];
    }
  })();

  if (styleSheets.length > 0) {
    groups.push({
      sheets: styleSheets as unknown as CSSStyleSheet[],
      origin: root instanceof Document ? "document" : "shadow",
      rootLabel,
    });
  }

  const adopted = (root as unknown as { adoptedStyleSheets?: CSSStyleSheet[] })
    .adoptedStyleSheets;
  if (Array.isArray(adopted) && adopted.length > 0) {
    groups.push({
      sheets: adopted,
      origin: root instanceof Document ? "document-adopted" : "shadow-adopted",
      rootLabel,
    });
  }

  return groups;
}

function isChromeSelector(
  selector: string,
  spec: StarlightChromeContractSpec,
): boolean {
  return spec.chromeSelectorHints.some((hint) => selector.includes(hint));
}

function isAllowedBorderValue(
  value: string,
  spec: StarlightChromeContractSpec,
): boolean {
  const v = value.trim();
  if (
    v === "" ||
    v === "none" ||
    v === "transparent" ||
    v === "initial" ||
    v === "inherit" ||
    v === "unset"
  ) {
    return true;
  }

  for (const name of spec.allowedBorderVarNames) {
    if (v.includes(`var(${name}`) || v.includes(`var(${name})`)) return true;
  }
  return false;
}

function forbiddenTransitionReason(
  value: string,
  spec: StarlightChromeContractSpec,
): string | null {
  const v = value.toLowerCase();
  for (const entry of spec.forbiddenTransitionSubstrings) {
    if (v.includes(entry.substring.toLowerCase())) return entry.reason;
  }
  return null;
}

function selectorToQueryable(selectorText: string): string | null {
  let s = selectorText;

  // Drop pseudo-elements (querySelectorAll doesn't accept them).
  if (s.includes("::")) {
    s = s.split("::")[0] || "";
  }

  // Best-effort: remove dynamic pseudo-classes that commonly appear in vendor CSS.
  // If the selector still isn't queryable, we catch and ignore.
  s = s.replace(
    /:(hover|active|focus|focus-visible|focus-within|visited|link|target|disabled|enabled)\b/g,
    "",
  );

  s = s.trim();
  return s.length > 0 ? s : null;
}

function mapCssomViolationsToElements(options: {
  violations: CssomViolation[];
  ignoreContainer?: HTMLElement;
  maxElementsPerRule: number;
}): Violation[] {
  const { violations, ignoreContainer, maxElementsPerRule } = options;
  const out: Violation[] = [];

  for (const v of violations) {
    const queryable = selectorToQueryable(v.selector);
    if (!queryable) continue;

    const pushForElement = (element: HTMLElement): void => {
      if (element.tagName === "AXIOMATIC-DEBUGGER") return;
      if (ignoreContainer && ignoreContainer.contains(element)) return;

      out.push({
        element,
        tagName: element.tagName.toLowerCase(),
        id: element.id,
        classes: element.className,
        reason: `Starlight Chrome Contract: ${v.reason} | ${v.property}: ${JSON.stringify(v.value)} | selector: ${JSON.stringify(v.selector)} | sheet: ${v.sheet} (${v.origin})`,
      });
    };

    // Document scope
    try {
      const matches = Array.from(document.querySelectorAll(queryable)).filter(
        (el): el is HTMLElement => el instanceof HTMLElement,
      );
      for (const el of matches.slice(0, maxElementsPerRule)) pushForElement(el);
    } catch {
      // ignore
    }

    // Shadow scope (open shadow roots only)
    const shadowRoots = collectShadowRoots(document);
    for (const sr of shadowRoots) {
      try {
        const matches = Array.from(sr.querySelectorAll(queryable)).filter(
          (el): el is HTMLElement => el instanceof HTMLElement,
        );
        for (const el of matches.slice(0, maxElementsPerRule))
          pushForElement(el);
      } catch {
        // ignore
      }
    }
  }

  return out;
}

export function scanStarlightChromeContractViolations(options?: {
  ignoreContainer?: HTMLElement;
  spec?: StarlightChromeContractSpec;
  maxElementsPerRule?: number;
}): {
  violations: Violation[];
  metrics: { scannedSheets: number; scannedRules: number; shadowRoots: number };
} {
  const spec = options?.spec ?? STARLIGHT_CHROME_CONTRACT;
  const maxElementsPerRule = options?.maxElementsPerRule ?? 6;

  const paintRelevantProps = new Set(spec.paintRelevantProps);

  const rawViolations: CssomViolation[] = [];

  const roots: Array<{ root: Document | ShadowRoot; label: string }> = [
    { root: document, label: "document" },
  ];
  const shadowRoots = collectShadowRoots(document);
  for (const sr of shadowRoots) roots.push({ root: sr, label: "shadow" });

  let scannedSheets = 0;
  let scannedRules = 0;

  for (const { root } of roots) {
    const groups = collectSheetGroups(root);
    for (const group of groups) {
      let index = 0;
      for (const sheet of group.sheets) {
        scannedSheets++;
        const hint = sheetHint(sheet, group.origin, index++);

        let rules: CSSRuleList;
        try {
          rules = sheet.cssRules;
        } catch {
          continue;
        }

        scannedRules += walkRules(rules, (styleRule) => {
          const selector = styleRule.selectorText;
          if (!selector || !isChromeSelector(selector, spec)) return;

          const style = styleRule.style;
          for (const prop of Array.from(style)) {
            if (!paintRelevantProps.has(prop)) continue;

            const value = style.getPropertyValue(prop).trim();
            if (!value) continue;

            if (prop === "transition" || prop === "transition-property") {
              const reason = forbiddenTransitionReason(value, spec);
              if (reason) {
                rawViolations.push({
                  sheet: hint,
                  origin: group.origin,
                  selector,
                  property: prop,
                  value,
                  reason,
                  rootLabel: group.rootLabel,
                });
              }
              continue;
            }

            if (/\bcurrentcolor\b/i.test(value)) {
              rawViolations.push({
                sheet: hint,
                origin: group.origin,
                selector,
                property: prop,
                value,
                reason: "chrome-border-uses-currentColor",
                rootLabel: group.rootLabel,
              });
              continue;
            }

            if (!isAllowedBorderValue(value, spec)) {
              rawViolations.push({
                sheet: hint,
                origin: group.origin,
                selector,
                property: prop,
                value,
                reason: "chrome-border-not-bridge-routed",
                rootLabel: group.rootLabel,
              });
            }
          }
        });
      }
    }
  }

  const violations = mapCssomViolationsToElements({
    violations: rawViolations,
    ignoreContainer: options?.ignoreContainer,
    maxElementsPerRule,
  });

  return {
    violations,
    metrics: {
      scannedSheets,
      scannedRules,
      shadowRoots: shadowRoots.length,
    },
  };
}
