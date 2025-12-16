import { describe, it, expect, beforeAll, vi } from "vitest";
import * as fc from "fast-check";
import { findWinningRule } from "../src/lib/inspector/css-utils.ts";

// @vitest-environment jsdom

describe("findWinningRule (Property Tests)", () => {
  beforeAll(() => {
    // Mock matchMedia for jsdom
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: true, // Always match for simplicity
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    // Mock CSS.supports for jsdom
    global.CSS = {
      supports: vi.fn().mockReturnValue(true),
      escape: vi.fn((str) => str),
    } as any;
  });

  it("respects cascade (Importance > Specificity > Source Order)", () => {
    const element = document.createElement("div");
    element.id = "target";
    element.className = "target";
    document.body.appendChild(element);

    // Generators for selectors with known specificity
    const selectorGen = fc.oneof(
      fc.constant({ text: "#target", spec: 10000 }),
      fc.constant({ text: ".target", spec: 100 }),
      fc.constant({ text: "div", spec: 1 }),
      fc.constant({ text: "div.target", spec: 101 }),
      fc.constant({ text: "#target.target", spec: 10100 }),
      fc.constant({ text: "*", spec: 0 }),
    );

    // Generator for rules, optionally wrapped in @media/@supports
    const ruleGen = fc.record({
      selector: selectorGen,
      isImportant: fc.boolean(),
      wrapper: fc.constantFrom("none", "media", "supports", "layer"),
      // Use margin-top because jsdom has issues parsing !important on z-index/order
      value: fc.integer({ min: 1, max: 999999 }),
    });

    fc.assert(
      fc.property(
        fc.array(ruleGen, { minLength: 1 }),
        fc.boolean(),
        (rules, useShadow) => {
          // 1. Setup Element & Root
          document.body.innerHTML = ""; // Clear previous
          // Ensure we don't have multiple roots if happy-dom persists state
          // But document.body.innerHTML = "" should be enough for body children.

          const host = document.createElement("div");
          document.body.appendChild(host);

          let target: HTMLElement;
          let root: Document | ShadowRoot;

          if (useShadow) {
            root = host.attachShadow({ mode: "open" });
            target = document.createElement("div");
            target.id = "target";
            target.className = "target";
            root.appendChild(target);
          } else {
            root = document;
            target = host; // Host is the target in light dom case for simplicity, or create child
            target.id = "target";
            target.className = "target";
          }

          // 2. Apply Rules
          // We put all rules in a single style tag in the correct root

          let css = "";
          rules.forEach((r, i) => {
            let ruleText = `${r.selector.text} { margin-top: ${r.value}px ${r.isImportant ? "!important" : ""}; }`;

            if (r.wrapper === "media") {
              ruleText = `@media (min-width: 0px) { ${ruleText} }`;
            } else if (r.wrapper === "supports") {
              ruleText = `@supports (display: block) { ${ruleText} }`;
            } else if (r.wrapper === "layer") {
              ruleText = `@layer utilities { ${ruleText} }`;
            }

            css += `${ruleText} /* rule ${i} */\n`;
          });

          if (root === document) {
            const styleEl = document.createElement("style");
            styleEl.textContent = css;
            document.head.innerHTML = "";
            document.head.appendChild(styleEl);
          } else {
            // ShadowRoot
            // happy-dom doesn't support <style> in ShadowRoot populating styleSheets
            // So we use adoptedStyleSheets
            const sheet = new CSSStyleSheet();
            sheet.replaceSync(css);
            root.adoptedStyleSheets = [sheet];
          }

          // 3. Calculate Expected Winner
          // Sort by: Important DESC, Layer Logic, Specificity DESC, Index DESC
          const sortedRules = rules.map((r, i) => ({ ...r, index: i }));
          sortedRules.sort((a, b) => {
            // 1. Importance
            if (a.isImportant !== b.isImportant) return a.isImportant ? -1 : 1;

            // 2. Layers
            // Normal: Unlayered > Layered
            // Important: Layered > Unlayered
            const aIsLayered = a.wrapper === "layer";
            const bIsLayered = b.wrapper === "layer";

            if (aIsLayered !== bIsLayered) {
              if (a.isImportant) {
                // Important: Layered wins (comes first)
                return aIsLayered ? -1 : 1;
              } else {
                // Normal: Unlayered wins (comes first)
                return aIsLayered ? 1 : -1;
              }
            }

            // 3. Specificity
            if (a.selector.spec !== b.selector.spec)
              return b.selector.spec - a.selector.spec;

            // 4. Source Order
            return b.index - a.index;
          });
          const expectedWinner = sortedRules[0];
          expect(expectedWinner).toBeTruthy();

          // 4. Run System Under Test
          const winner = findWinningRule(target, "margin-top");

          // 5. Assert
          expect(winner).not.toBeNull();

          // Verify the winner matches the expected winner's properties
          // We check the value because it's the most unique identifier we generated
          expect(winner?.value).toBe(`${expectedWinner!.value}px`);
          expect(winner?.isImportant).toBe(expectedWinner!.isImportant);
          expect(winner?.selector).toBe(expectedWinner!.selector.text);
        },
      ),
    );
  });
});
