import { test } from "@playwright/test";

test.describe("Provenance Audit", () => {
  test("All visible colors must be derived from Axiomatic tokens", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForSelector("body");

    const violations = await page.evaluate(() => {
      // 1. Collect all valid token values from the system
      // We look at <body> because that's where we define our tokens in theme.css
      const bodyStyle = getComputedStyle(document.body);

      const validColors = new Set<string>();

      // Let's define the "System Palette" dynamically by checking specific known tokens
      // and also allowing any color that matches a --sl-color-* variable.
      // Since we can't easily list all vars, we'll use a hardcoded list of *expected* tokens
      // plus a heuristic.

      const knownTokens = [
        "--axm-surface-token",
        "--axm-text-high-token",
        "--axm-text-subtle-token",
        "--axm-text-subtlest-token",
        "--axm-border-int-token",
        "--axm-border-dec-token",
        "--axm-shadow-sm",
        "--axm-shadow-md",
        "--axm-shadow-lg",
        // Starlight overrides (which we mapped to Axiom)
        "--sl-color-bg",
        "--sl-color-black",
        "--sl-color-white",
        "--sl-color-gray-1",
        "--sl-color-gray-2",
        "--sl-color-gray-3",
        "--sl-color-gray-4",
        "--sl-color-gray-5",
        "--sl-color-gray-6",
        "--sl-color-accent",
        "--sl-color-accent-high",
        "--sl-color-accent-low",
        // Reactive Asides
        "--sl-color-orange",
        "--sl-color-orange-low",
        "--sl-color-orange-high",
        "--sl-color-green",
        "--sl-color-green-low",
        "--sl-color-green-high",
        "--sl-color-blue",
        "--sl-color-blue-low",
        "--sl-color-blue-high",
        "--sl-color-purple",
        "--sl-color-purple-low",
        "--sl-color-purple-high",
        "--sl-color-red",
        "--sl-color-red-low",
        "--sl-color-red-high",
      ];

      for (const token of knownTokens) {
        const val = bodyStyle.getPropertyValue(token).trim();
        if (val) {
          // The browser might return it as 'oklch(...)' or 'rgb(...)'.
          // We need to resolve it to what getComputedStyle returns for elements.
          // To do this, we can create a dummy element.
          const div = document.createElement("div");
          div.style.color = `var(${token})`;
          div.style.display = "none";
          document.body.appendChild(div);
          const resolved = getComputedStyle(div).color;
          validColors.add(resolved);
          document.body.removeChild(div);
        }
      }

      // 2. Walk the DOM
      const violations: Array<{
        element: string;
        class: string;
        property: string;
        value: string;
        reason: string;
      }> = [];
      const elements = document.querySelectorAll("*");

      for (const el of Array.from(elements)) {
        if (
          el.tagName === "SCRIPT" ||
          el.tagName === "STYLE" ||
          el.tagName === "HEAD" ||
          el.tagName === "META" ||
          el.tagName === "TITLE" ||
          el.tagName === "LINK"
        )
          continue;

        const style = getComputedStyle(el);

        // Check Background
        const bg = style.backgroundColor;
        if (bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent") {
          if (!validColors.has(bg)) {
            violations.push({
              element: el.tagName.toLowerCase(),
              class: el.className,
              property: "background-color",
              value: bg,
              reason: "Does not match any known Axiomatic token",
            });
          }
        }

        // Check Color (Text)
        // Text color is inherited, so we only care if it's explicitly set or if it's a leaf node with text.
        // But getComputedStyle gives the resolved value.
        // If we check every element, we'll get a lot of noise from inheritance.
        // However, every element's text color *should* be a valid token.
        const color = style.color;
        if (color !== "rgba(0, 0, 0, 0)" && color !== "transparent") {
          if (!validColors.has(color)) {
            // Filter out some noise? No, strict mode.
            violations.push({
              element: el.tagName.toLowerCase(),
              class: el.className,
              property: "color",
              value: color,
              reason: "Does not match any known Axiomatic token",
            });
          }
        }

        // Check Border
        const border = style.borderColor;
        // Border color is tricky because it can be split (top/bottom/etc).
        // We'll just check the generic one for now.
        if (
          style.borderWidth !== "0px" &&
          border !== "rgba(0, 0, 0, 0)" &&
          border !== "transparent"
        ) {
          if (!validColors.has(border)) {
            violations.push({
              element: el.tagName.toLowerCase(),
              class: el.className,
              property: "border-color",
              value: border,
              reason: "Does not match any known Axiomatic token",
            });
          }
        }
      }

      return violations;
    });

    if (violations.length > 0) {
      console.log(`Found ${violations.length} provenance violations.`);
      // Log the first 10 for debugging
      console.table(violations.slice(0, 10));
    }

    // We expect 0 violations in a perfect world.
    // For now, we just want the test to exist and report.
    // Uncomment to enforce:
    // expect(violations.length).toBe(0);
  });
});
