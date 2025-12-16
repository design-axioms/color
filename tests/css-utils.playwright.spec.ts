import { test, expect } from "@playwright/test";
import * as fc from "fast-check";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the library file we want to test
// We will load this via Vite's /@fs/ endpoint
const libPath = path.resolve(__dirname, "../src/lib/inspector/css-utils.ts");

test.describe("CSS Utils Property Tests (Browser)", () => {
  test("findWinningRule respects cascade", async ({ page }) => {
    // 1. Setup Page
    // We must visit the app so Vite is serving
    await page.goto("/");

    // Load the module dynamically from the Vite server
    await page.evaluate(async (importPath) => {
      const mod = await import(importPath);
      // @ts-ignore
      window.findWinningRule = mod.findWinningRule;
      // @ts-ignore
      window.formatSpecificity = mod.formatSpecificity;
    }, `/@fs${libPath}`);

    // 2. Define Generators (same as unit test)
    const selectorGen = fc.oneof(
      fc.constant({ text: "#target", spec: 10000 }),
      fc.constant({ text: ".target", spec: 100 }),
      fc.constant({ text: "div", spec: 1 }),
      fc.constant({ text: "div.target", spec: 101 }),
      fc.constant({ text: "#target.target", spec: 10100 }),
      fc.constant({ text: "*", spec: 0 }),
      // Baseline 2025 / Modern Specificity
      fc.constant({ text: ":where(#target)", spec: 0 }),
      fc.constant({ text: ":is(.target, #target)", spec: 10000 }),
      fc.constant({ text: ":not(#other)", spec: 10000 }),
    );

    const ruleGen = fc.record({
      selector: selectorGen,
      isImportant: fc.boolean(),
      wrapper: fc.constantFrom(
        "none",
        "media",
        "supports",
        "layer",
        "scope_wrapper",
        "scope_target",
      ),
      value: fc.integer({ min: 1, max: 999999 }),
    });

    // 3. Run Property Test
    await fc.assert(
      fc.asyncProperty(
        fc.array(ruleGen, { minLength: 1 }),
        fc.boolean(),
        async (rules, useShadow) => {
          // Run the test logic inside the browser
          const result = await page.evaluate(
            ({ rules, useShadow }) => {
              // Setup DOM
              document.body.innerHTML = "";
              const host = document.createElement("div");
              document.body.appendChild(host);

              let target;
              let root;
              let wrapper;

              if (useShadow) {
                root = host.attachShadow({ mode: "open" });
                wrapper = document.createElement("div");
                wrapper.className = "wrapper";
                root.appendChild(wrapper);

                target = document.createElement("div");
                target.id = "target";
                target.className = "target";
                wrapper.appendChild(target);
              } else {
                root = document;
                wrapper = document.createElement("div");
                wrapper.className = "wrapper";
                host.appendChild(wrapper);

                target = document.createElement("div");
                target.id = "target";
                target.className = "target";
                wrapper.appendChild(target);
              }

              // Apply Rules
              let css = "";
              rules.forEach((r, i) => {
                let ruleText = `${r.selector.text} { z-index: ${r.value} ${r.isImportant ? "!important" : ""}; }`;

                if (r.wrapper === "media") {
                  ruleText = `@media (min-width: 0px) { ${ruleText} }`;
                } else if (r.wrapper === "supports") {
                  ruleText = `@supports (display: block) { ${ruleText} }`;
                } else if (r.wrapper === "layer") {
                  ruleText = `@layer utilities { ${ruleText} }`;
                } else if (r.wrapper === "scope_wrapper") {
                  ruleText = `@scope (.wrapper) { ${ruleText} }`;
                } else if (r.wrapper === "scope_target") {
                  ruleText = `@scope (#target) { ${ruleText} }`;
                }

                css += `${ruleText} /* rule ${i} */\n`;
              });

              if (root === document) {
                const styleEl = document.createElement("style");
                styleEl.textContent = css;
                document.head.innerHTML = "";
                document.head.appendChild(styleEl);
              } else {
                const sheet = new CSSStyleSheet();
                sheet.replaceSync(css);
                root.adoptedStyleSheets = [sheet];
              }

              // @ts-ignore
              const winner = window.findWinningRule(target, "z-index");

              return {
                winner: winner
                  ? {
                      value: winner.value,
                      isImportant: winner.isImportant,
                      selector: winner.selector,
                    }
                  : null,
              };
            },
            { rules, useShadow },
          );

          // Calculate Expected Winner in Node
          const sortedRules = rules.map((r, i) => ({ ...r, index: i }));
          sortedRules.sort((a, b) => {
            // 1. Importance
            if (a.isImportant !== b.isImportant) return a.isImportant ? -1 : 1;

            // 2. Layers
            const aIsLayered = a.wrapper === "layer";
            const bIsLayered = b.wrapper === "layer";

            if (aIsLayered !== bIsLayered) {
              if (a.isImportant) {
                return aIsLayered ? -1 : 1;
              } else {
                return aIsLayered ? 1 : -1;
              }
            }

            // 3. Scope Proximity
            const getProx = (w: string) => {
              if (w === "scope_target") return 0;
              if (w === "scope_wrapper") return 1;
              return Infinity;
            };

            const aProx = getProx(a.wrapper);
            const bProx = getProx(b.wrapper);

            if (aProx !== bProx) return aProx - bProx;

            // 4. Specificity
            if (a.selector.spec !== b.selector.spec)
              return b.selector.spec - a.selector.spec;

            // 5. Source Order
            return b.index - a.index;
          });
          const expectedWinner = sortedRules[0];

          // Assert
          expect(result.winner).not.toBeNull();
          if (expectedWinner) {
            expect(result.winner?.value).toBe(expectedWinner.value.toString());
            expect(result.winner?.isImportant).toBe(expectedWinner.isImportant);
            expect(result.winner?.selector).toBe(expectedWinner.selector.text);
          }
        },
      ),
      { numRuns: 50 },
    );
  });
});
