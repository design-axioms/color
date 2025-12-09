import { expect, test } from "@playwright/test";

test.describe("Continuity Audit", () => {
  test("No visual snapping when toggling theme (Continuity Check)", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForSelector("body");

    // 1. Freeze Time (Set tau to 0)
    // We force tau to 0 so we are in the "middle" of the transition.
    // If the theme toggle causes a snap, it means the variables themselves changed value
    // or the element swapped variables.
    await page.evaluate(() => {
      document.documentElement.style.setProperty("--tau", "0");
      // Disable transitions to ensure instant updates for this test
      const style = document.createElement("style");
      style.innerHTML = `* { transition: none !important; }`;
      document.head.appendChild(style);
    });

    // 2. Capture State A (Light Mode + Tau=0)
    await page.evaluate(() => {
      document.documentElement.setAttribute("data-theme", "light");
    });
    const stateA = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll("*"));
      return elements.map((el) => {
        const style = getComputedStyle(el);
        return {
          tag: el.tagName,
          class: el.className,
          bg: style.backgroundColor,
          color: style.color,
          border: style.borderColor,
        };
      });
    });

    // 3. Toggle Theme (Dark Mode + Tau=0)
    await page.evaluate(() => {
      document.documentElement.setAttribute("data-theme", "dark");
    });

    // 4. Capture State B
    const stateB = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll("*"));
      return elements.map((el) => {
        const style = getComputedStyle(el);
        return {
          tag: el.tagName,
          class: el.className,
          bg: style.backgroundColor,
          color: style.color,
          border: style.borderColor,
        };
      });
    });

    // 5. Compare
    // In a perfect Axiomatic system, if tau is constant, the theme attribute
    // should NOT change the visual appearance. The theme attribute only drives tau.
    // If changing the attribute changes the color, it means we have a "Leak".
    let violations = 0;
    for (let i = 0; i < stateA.length; i++) {
      const a = stateA[i];
      const b = stateB[i];

      if (!a || !b) continue;

      // Ignore transparent backgrounds as they are often noisy or irrelevant
      if (a.bg === "rgba(0, 0, 0, 0)" && b.bg === "rgba(0, 0, 0, 0)") continue;

      if (a.bg !== b.bg) {
        console.log(
          `Violation [BG]: <${a.tag} class="${a.class}"> snapped from ${a.bg} to ${b.bg}`,
        );
        violations++;
      }
      if (a.color !== b.color) {
        console.log(
          `Violation [FG]: <${a.tag} class="${a.class}"> snapped from ${a.color} to ${b.color}`,
        );
        violations++;
      }
    }

    expect(violations).toBe(0);
  });
});
