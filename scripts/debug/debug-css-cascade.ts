/* eslint-disable */
import { chromium } from "playwright";
import { WALKER_LIBRARY } from "../utils/walker.ts";

async function debugCascade() {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.error(
      "Usage: pnpm exec tsx scripts/debug-css-cascade.ts <url> <selector> [property...|auto]",
    );
    process.exit(1);
  }

  const [url, selector, ...properties] = args;
  const isAuto = properties.length === 0 || properties[0] === "auto";

  // Check for pseudo-state argument (e.g., :hover, :focus)
  const pseudoStateArg = properties.find((p) => p.startsWith(":"));
  const pseudoState = pseudoStateArg ? pseudoStateArg.substring(1) : null;

  // Filter properties, excluding "auto" and the pseudo-state
  const filterProps = new Set(
    properties.filter((p) => p !== "auto" && !p.startsWith(":")),
  );
  if (isAuto) {
    // If auto was the only arg (or with pseudo), clear the set so we default to auto logic
    filterProps.clear();
  }

  const browser = await chromium.launch();
  const context = await browser.newContext({ ignoreHTTPSErrors: true });
  const page = await context.newPage();

  try {
    console.log(`Navigating to ${url}...`);
    await page.goto(url, { waitUntil: "domcontentloaded" });

    // Wait for the element to be present
    try {
      await page.waitForSelector(selector, { timeout: 5000 });
    } catch (e) {
      console.error(`Element not found: ${selector}`);
      await browser.close();
      process.exit(1);
    }

    // --- Semantic Analysis (Auto Mode) ---
    if (isAuto) {
      console.log("\n--- Semantic Analysis ---");
      const analysis = await page.evaluate(
        (args) => {
          // @ts-ignore
          const { WALKER_LIBRARY, selector } = args;
          // Evaluate the library in this scope
          eval(WALKER_LIBRARY);

          const element = document.querySelector(selector);
          if (!element) return null;

          // @ts-ignore
          const context = findContextRoot(element);
          // @ts-ignore
          const tokens = resolveTokens(element, context);

          const surfaceToken = tokens.find(
            (t: any) => t.intent === "Surface Color",
          );
          const bgToken = tokens.find(
            (t: any) => t.intent === "Actual Background",
          );

          const hasSurfaceMismatch =
            surfaceToken && bgToken && surfaceToken.value !== bgToken.value;
          const privateTokens = tokens.filter(
            (t: any) =>
              t.isLocal && t.isPrivate && !t.responsibleClass && !t.isInline,
          );

          return {
            context,
            tokens,
            hasSurfaceMismatch,
            privateTokens,
            surfaceToken,
            bgToken,
          };
        },
        { WALKER_LIBRARY, selector },
      );

      if (analysis) {
        console.log(
          `Context: ${analysis.context.polarity} (${analysis.context.surface})`,
        );
        console.log(`Surface Token: ${analysis.surfaceToken?.value || "None"}`);
        console.log(`Actual Background: ${analysis.bgToken?.value || "None"}`);

        if (analysis.hasSurfaceMismatch) {
          console.log("⚠️  VIOLATION: Surface Mismatch Detected!");
          filterProps.add("background-color");
          filterProps.add("--axm-surface-token");
          filterProps.add("--_axm-computed-surface");
        }

        if (analysis.privateTokens.length > 0) {
          console.log("⚠️  VIOLATION: Private Tokens Used Directly!");
          analysis.privateTokens.forEach((t: any) => {
            console.log(`   - ${t.sourceVar}`);
            filterProps.add(t.sourceVar);
          });
        }

        if (
          !analysis.hasSurfaceMismatch &&
          analysis.privateTokens.length === 0
        ) {
          console.log("✅ No semantic violations found.");
          // Default properties to inspect if no violations
          filterProps.add("color");
          filterProps.add("background-color");
        }
      } else {
        console.log("Failed to perform semantic analysis.");
      }
    }

    const session = await context.newCDPSession(page);
    await session.send("DOM.enable");
    await session.send("CSS.enable");

    const doc = await session.send("DOM.getDocument");
    const { nodeId } = await session.send("DOM.querySelector", {
      nodeId: doc.root.nodeId,
      selector: selector,
    });

    if (!nodeId) {
      console.error(`CDP failed to find node for selector: ${selector}`);
      await browser.close();
      process.exit(1);
    }

    // Force pseudo-state if requested
    if (pseudoState) {
      console.log(`Forcing pseudo-state: :${pseudoState}`);
      await session.send("CSS.forcePseudoState", {
        nodeId,
        forcedPseudoClasses: [pseudoState],
      });
    }

    const { inlineStyle, matchedCSSRules } = await session.send(
      "CSS.getMatchedStylesForNode",
      { nodeId },
    );

    const { computedStyle } = await session.send(
      "CSS.getComputedStyleForNode",
      {
        nodeId,
      },
    );

    // Process computed styles to get the final values
    const computedMap = new Map<string, string>();
    for (const prop of computedStyle) {
      computedMap.set(prop.name, prop.value);
    }

    // Determine which properties to show
    let propsToShow: string[] = [];
    if (filterProps.size > 0) {
      propsToShow = Array.from(filterProps);
    } else {
      // Collect all properties defined in matched rules
      const allProps = new Set<string>();
      if (inlineStyle && inlineStyle.cssProperties) {
        inlineStyle.cssProperties.forEach((p: any) => allProps.add(p.name));
      }
      if (matchedCSSRules) {
        matchedCSSRules.forEach((match: any) => {
          match.rule.style.cssProperties.forEach((p: any) =>
            allProps.add(p.name),
          );
        });
      }
      propsToShow = Array.from(allProps).sort();
    }

    console.log(`\n--- Cascade Report for: ${selector} ---`);
    console.log(`URL: ${url}`);

    for (const propName of propsToShow) {
      console.log(`\nProperty: ${propName}`);
      console.log(`Computed: ${computedMap.get(propName) || "unset"}`);
      console.log(`Cascade (Winner to Loser):`);

      let foundWinner = false;

      // 1. Inline Styles (Highest Priority)
      if (inlineStyle && inlineStyle.cssProperties) {
        const prop = inlineStyle.cssProperties.find(
          (p: any) => p.name === propName,
        );
        if (prop && !prop.disabled && !prop.implicit) {
          const status = foundWinner ? "Overridden" : "Winner";
          console.log(`  1. [${status}] element.style`);
          console.log(`     Value: ${prop.value}`);
          if (!foundWinner) foundWinner = true;
        }
      }

      // 2. Matched Rules (Reverse order: most specific/last defined first)
      if (matchedCSSRules) {
        const reversedRules = [...matchedCSSRules].reverse();
        let index = 2;

        for (const match of reversedRules) {
          const rule = match.rule;
          const prop = rule.style.cssProperties.find(
            (p: any) => p.name === propName,
          );

          if (prop && !prop.disabled && !prop.implicit) {
            // Get the specific selector that matched
            const selectorIndex = match.matchingSelectors[0];
            const selectorText =
              rule.selectorList.selectors[selectorIndex]?.text ||
              rule.selectorList.text;

            const isImportant = prop.important;
            // Note: This simple logic doesn't fully account for !important overriding inline styles
            // or specificity battles within the same cascade layer, but it's good for debugging.
            // CDP returns matchedCSSRules in cascade order (ascending), so reversing gives us
            // the likely winner first.

            const status = foundWinner ? "Overridden" : "Winner";

            console.log(`  ${index}. [${status}] ${selectorText}`);
            console.log(
              `     Value: ${prop.value} ${isImportant ? "!important" : ""}`,
            );

            // Try to find source
            if (rule.styleSheetId) {
              // We could fetch the header, but for now just say "Stylesheet"
              // console.log(`     Source: Stylesheet ${rule.styleSheetId}`);
            }

            if (!foundWinner) foundWinner = true;
            index++;
          }
        }
      }

      if (!foundWinner) {
        console.log("  (No explicit rules found for this property)");
      }
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await browser.close();
  }
}

debugCascade();
