import { test, expect } from "@playwright/test";

const pages = [
  { name: "index", path: "/" },
  { name: "studio", path: "/studio" },
  { name: "catalog-surfaces", path: "/catalog/surfaces" },
  { name: "catalog-actions", path: "/catalog/actions" },
  { name: "catalog-typography", path: "/catalog/typography" },
  { name: "catalog-data-viz", path: "/catalog/data-viz" },
  { name: "concepts-physics-of-light", path: "/concepts/physics-of-light" },
  {
    name: "concepts-thinking-in-surfaces",
    path: "/concepts/thinking-in-surfaces",
  },
  { name: "advanced-hue-shifting", path: "/advanced/hue-shifting" },
];

for (const { name, path } of pages) {
  test(`visual regression: ${name}`, async ({ page }) => {
    await page.goto(path);
    // Wait for fonts and hydration
    await page.waitForLoadState("networkidle");

    // Hide dynamic elements that might cause flakiness (like cursors or random data)
    await page.addStyleTag({
      content: `
        *, *::before, *::after {
          animation-play-state: paused !important;
          caret-color: transparent !important;
        }
      `,
    });

    await expect(page).toHaveScreenshot(`${name}.png`, {
      fullPage: true,
      maxDiffPixelRatio: 0.02,
      animations: "disabled",
    });
  });
}
