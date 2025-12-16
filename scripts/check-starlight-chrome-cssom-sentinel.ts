/**
 * Starlight chrome continuity sentinel (CSSOM-based).
 *
 * Goal: catch regressions where effective CSS rules for Starlight chrome
 * introduce border "popping" risk:
 *
 * - Chrome borders coupled to text color (`currentColor`).
 * - Chrome borders painted via non-contract variables (not `--axm-bridge-border-*`
 *   and not approved Starlight border vars).
 * - Chrome transitions that animate `border*`, `outline*`, `box-shadow`, or
 *   any `--axm-bridge-*` custom property.
 *
 * This intentionally scans CSS rules (CSSOM) rather than walking the full DOM.
 * For Shadow DOM, the scan includes open shadow roots + adopted stylesheets.
 */

import { spawn } from "node:child_process";
import process from "node:process";
import { chromium } from "playwright";
import {
  STARLIGHT_CHROME_CONTRACT,
  type StarlightChromeContractSpec,
} from "../src/lib/integrations/starlight/chrome-contract-spec.ts";

function logStep(message: string): void {
  console.log(`[starlight-cssom-sentinel] ${message}`);
}

async function tryRunLocaldUp(): Promise<boolean> {
  logStep("locald not reachable; attempting `locald up`...");

  try {
    await new Promise<void>((resolve, reject) => {
      const child = spawn("locald", ["up"], {
        stdio: "inherit",
        shell: false,
      });
      child.on("error", (err: unknown) => reject(err));
      child.on("exit", (code: number | null) => {
        if (code === 0) resolve();
        else reject(new Error(`locald up failed (code ${String(code)})`));
      });
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error(
      `\n[starlight-cssom-sentinel] Failed to run \`locald up\`: ${msg}\n` +
        "If you don't have locald installed in this environment, start the docs server another way and set AXM_CSSOM_URL to its URL.\n",
    );
    return false;
  }

  return true;
}

type CssomViolation = {
  sheet: string;
  origin: string;
  selector: string;
  property: string;
  value: string;
  reason: string;
};

type CssomScanResult = {
  scannedSheets: number;
  scannedRules: number;
  shadowRootsFound: number;
  unreadableSheets: Array<{ sheet: string; origin: string; error: string }>;
  violations: CssomViolation[];
};

function printResult(result: CssomScanResult): void {
  const header =
    result.violations.length === 0
      ? "✅ [starlight-cssom-sentinel]"
      : "❌ [starlight-cssom-sentinel]";

  console.log(
    `${header} scannedSheets=${result.scannedSheets} scannedRules=${result.scannedRules} shadowRoots=${result.shadowRootsFound} unreadableSheets=${result.unreadableSheets.length}`,
  );

  if (result.unreadableSheets.length > 0) {
    console.log("\nUnreadable stylesheets (best-effort; may be cross-origin):");
    for (const e of result.unreadableSheets.slice(0, 10)) {
      console.log(`- ${e.origin} ${e.sheet}: ${e.error}`);
    }
    if (result.unreadableSheets.length > 10) {
      console.log(`- (+${result.unreadableSheets.length - 10} more)`);
    }
  }

  if (result.violations.length === 0) return;

  console.log("\nViolations:");
  const max = 30;
  for (const v of result.violations.slice(0, max)) {
    console.log(
      `- ${v.reason} | ${v.property}: ${JSON.stringify(v.value)} | selector: ${JSON.stringify(v.selector)} | sheet: ${v.sheet} (${v.origin})`,
    );
  }
  if (result.violations.length > max) {
    console.log(`- (+${result.violations.length - max} more)`);
  }

  console.log(
    "\nFix: route chrome borders through `--axm-bridge-border-*` (or approved `--sl-*` border vars mapped to them) and avoid transitioning borders/bridge vars independently of `--tau`.\n",
  );
}

async function main(): Promise<void> {
  const targetUrl =
    process.env.AXM_CSSOM_URL?.trim() || "https://color-system.localhost/";
  const navTimeoutMs = Number(process.env.AXM_CSSOM_NAV_TIMEOUT_MS || 12_000);

  const browser = await chromium.launch();
  const page = await browser.newPage({ ignoreHTTPSErrors: true });

  try {
    logStep(`navigating: ${targetUrl}`);

    let navigated = false;
    try {
      await page.goto(targetUrl, {
        waitUntil: "domcontentloaded",
        timeout: navTimeoutMs,
      });
      navigated = true;
    } catch {
      // If locald isn't up yet, bring it up once and retry.
      const didUp = await tryRunLocaldUp();
      if (didUp) {
        await page.goto(targetUrl, {
          waitUntil: "domcontentloaded",
          timeout: navTimeoutMs,
        });
        navigated = true;
      }
    }

    if (!navigated) {
      process.exitCode = 1;
      return;
    }

    // Give constructed/adopted stylesheets a moment to attach.
    await page.waitForTimeout(250);

    // Best-effort: wait for StarlightHead surface classes (avoids scanning
    // during initialization on slower machines). Do not allow long stalls.
    try {
      await page.waitForFunction(
        () => {
          const pageEl = document.querySelector(".page.sl-flex");
          const headerEl = document.querySelector(".page > .header");
          return (
            !!pageEl &&
            pageEl.classList.contains("surface-page") &&
            !!headerEl &&
            headerEl.classList.contains("surface-page")
          );
        },
        undefined,
        { timeout: 5_000 },
      );
    } catch {
      // Non-fatal: scanning rules is still useful even if the DOM wiring hasn't
      // landed yet.
    }

    const spec = STARLIGHT_CHROME_CONTRACT;

    const result = await page.evaluate((spec): CssomScanResult => {
      const chromeSelectorHints = spec.chromeSelectorHints;
      const allowedBorderVarNames = spec.allowedBorderVarNames;
      const paintRelevantProps = new Set(spec.paintRelevantProps);

      const violations: CssomViolation[] = [];
      const unreadableSheets: Array<{
        sheet: string;
        origin: string;
        error: string;
      }> = [];

      const isChromeSelector = (selector: string): boolean => {
        return chromeSelectorHints.some((hint) => selector.includes(hint));
      };

      const isPaintRelevantProperty = (prop: string): boolean => {
        return paintRelevantProps.has(prop);
      };

      const isAllowedBorderValue = (value: string): boolean => {
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
        for (const name of allowedBorderVarNames) {
          if (v.includes(`var(${name}`) || v.includes(`var(${name})`))
            return true;
        }
        return false;
      };

      const hasForbiddenTransition = (value: string): string | null => {
        const v = value.toLowerCase();
        for (const entry of spec.forbiddenTransitionSubstrings) {
          if (v.includes(entry.substring.toLowerCase())) return entry.reason;
        }
        return null;
      };

      const sheetHint = (
        sheet: CSSStyleSheet,
        origin: string,
        index: number,
      ): string => {
        const anySheet = sheet as unknown as { href?: string | null };
        const href = typeof anySheet.href === "string" ? anySheet.href : null;
        if (href && href.length > 0) return href;
        return `(${origin} constructed #${index})`;
      };

      const walkRules = (
        rules: CSSRuleList,
        onStyleRule: (rule: CSSStyleRule) => void,
      ): number => {
        let count = 0;
        for (const rule of Array.from(rules)) {
          // STYLE_RULE
          if (rule.type === 1) {
            count++;
            onStyleRule(rule as CSSStyleRule);
            continue;
          }

          // Grouping rules (media/supports/layer/etc).
          const anyRule = rule as unknown as { cssRules?: CSSRuleList };
          if (anyRule && anyRule.cssRules) {
            count += walkRules(anyRule.cssRules, onStyleRule);
          }
        }
        return count;
      };

      const collectShadowRoots = (
        root: Document | ShadowRoot,
      ): ShadowRoot[] => {
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
      };

      const collectSheets = (
        root: Document | ShadowRoot,
      ): Array<{
        sheets: CSSStyleSheet[];
        origin: string;
      }> => {
        const groups: Array<{ sheets: CSSStyleSheet[]; origin: string }> = [];

        const styleSheets = ((): CSSStyleSheet[] => {
          try {
            return Array.from((root as unknown as Document).styleSheets || []);
          } catch {
            return [];
          }
        })();

        if (styleSheets.length > 0) {
          groups.push({
            sheets: styleSheets as unknown as CSSStyleSheet[],
            origin: root instanceof Document ? "document" : "shadow",
          });
        }

        const adopted = (
          root as unknown as { adoptedStyleSheets?: CSSStyleSheet[] }
        ).adoptedStyleSheets;
        if (Array.isArray(adopted) && adopted.length > 0) {
          groups.push({
            sheets: adopted,
            origin:
              root instanceof Document ? "document-adopted" : "shadow-adopted",
          });
        }

        return groups;
      };

      const roots: Array<{ root: Document | ShadowRoot; label: string }> = [
        { root: document, label: "document" },
      ];

      const shadowRoots = collectShadowRoots(document);
      for (const sr of shadowRoots) roots.push({ root: sr, label: "shadow" });

      let scannedSheets = 0;
      let scannedRules = 0;

      for (const { root } of roots) {
        const sheetGroups = collectSheets(root);

        for (const group of sheetGroups) {
          let index = 0;
          for (const sheet of group.sheets) {
            scannedSheets++;
            const hint = sheetHint(sheet, group.origin, index++);

            let rules: CSSRuleList;
            try {
              rules = sheet.cssRules;
            } catch (e) {
              unreadableSheets.push({
                sheet: hint,
                origin: group.origin,
                error: e instanceof Error ? e.message : String(e),
              });
              continue;
            }

            scannedRules += walkRules(rules, (styleRule) => {
              const selector = styleRule.selectorText;
              if (!selector || !isChromeSelector(selector)) return;

              const style = styleRule.style;
              for (const prop of Array.from(style)) {
                if (!isPaintRelevantProperty(prop)) continue;

                const value = style.getPropertyValue(prop).trim();
                if (!value) continue;

                if (prop === "transition" || prop === "transition-property") {
                  const reason = hasForbiddenTransition(value);
                  if (reason) {
                    violations.push({
                      sheet: hint,
                      origin: group.origin,
                      selector,
                      property: prop,
                      value,
                      reason,
                    });
                  }
                  continue;
                }

                if (/\bcurrentcolor\b/i.test(value)) {
                  violations.push({
                    sheet: hint,
                    origin: group.origin,
                    selector,
                    property: prop,
                    value,
                    reason: "chrome-border-uses-currentColor",
                  });
                  continue;
                }

                if (!isAllowedBorderValue(value)) {
                  violations.push({
                    sheet: hint,
                    origin: group.origin,
                    selector,
                    property: prop,
                    value,
                    reason: "chrome-border-not-bridge-routed",
                  });
                }
              }
            });
          }
        }
      }

      return {
        scannedSheets,
        scannedRules,
        shadowRootsFound: shadowRoots.length,
        unreadableSheets,
        violations,
      };
    }, spec as StarlightChromeContractSpec);

    printResult(result);

    if (result.violations.length > 0) {
      process.exitCode = 1;
    }
  } finally {
    await page.close();
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
