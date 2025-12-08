import { expect, test } from "@playwright/test";

test("Brand button hover state retains chroma", async ({ page }) => {
  await page.goto("/catalog/actions");
  await page.waitForLoadState("networkidle");

  const button = page.getByRole("button", { name: "Brand Action" });
  await expect(button).toBeVisible();

  // Get initial background color
  const initialColor = await button.evaluate((el) => {
    return window.getComputedStyle(el).backgroundColor;
  });

  // Hover
  await button.hover();

  // Wait a bit for transition
  await page.waitForTimeout(300);

  // Get hover background color
  const hoverColor = await button.evaluate((el) => {
    return window.getComputedStyle(el).backgroundColor;
  });

  expect(initialColor).not.toBe(hoverColor);

  // Helper to check if color is grayscale
  const isGrayscale = (colorString: string): boolean => {
    // Handle rgb(r, g, b)
    const rgbMatch = colorString.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (rgbMatch) {
      const [_, r, g, b] = rgbMatch.map(Number);
      // Allow small difference due to rounding/color space conversion
      return Math.abs(r - g) < 3 && Math.abs(g - b) < 3 && Math.abs(r - b) < 3;
    }
    return false;
  };

  expect(isGrayscale(hoverColor)).toBe(false);
});
