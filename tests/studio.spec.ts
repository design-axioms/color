import { test, expect } from "@playwright/test";

test.describe("Theme Studio (Epoch 2)", () => {
  test("mode switch updates semantic + vendor signals", async ({ page }) => {
    await page.goto("/studio");

    const modeSelect = page.getByTestId("studio-theme-mode");
    await expect(modeSelect).toBeVisible();

    await modeSelect.selectOption("dark");
    await expect
      .poll(async () =>
        page.evaluate(() => {
          const root = document.documentElement;
          return {
            axm: root.getAttribute("data-axm-mode"),
            theme: root.getAttribute("data-theme"),
          };
        }),
      )
      .toEqual({ axm: "dark", theme: "dark" });

    await modeSelect.selectOption("system");
    await expect
      .poll(async () =>
        page.evaluate(() => {
          const root = document.documentElement;
          return {
            axm: root.getAttribute("data-axm-mode"),
            hasTheme: root.hasAttribute("data-theme"),
          };
        }),
      )
      .toEqual({ axm: "system", hasTheme: false });
  });

  test("exports and imports color-config.json with schema validation", async ({
    page,
  }) => {
    await page.goto("/studio");

    await page.getByRole("button", { name: "Export" }).click();

    await page.getByRole("button", { name: "Config (JSON)" }).click();

    const output = page.getByTestId("studio-export-output");
    await expect(output).toContainText('"$schema"');
    await expect(output).toContainText('"anchors"');
    await expect(output).toContainText('"groups"');

    const configJson = await output.textContent();
    expect(configJson).toBeTruthy();

    // Happy path: re-import the exported config.
    const importer = page.getByTestId("studio-config-import");
    await importer.setInputFiles({
      name: "color-config.json",
      mimeType: "application/json",
      buffer: Buffer.from(configJson ?? "", "utf8"),
    });

    await expect(page.getByTestId("studio-config-notice")).toContainText(
      "Loaded configuration",
    );

    // Sad path: invalid JSON.
    await importer.setInputFiles({
      name: "broken.json",
      mimeType: "application/json",
      buffer: Buffer.from("{not-json", "utf8"),
    });

    await expect(page.getByTestId("studio-config-error")).toContainText(
      "Failed to load configuration",
    );
  });
});
