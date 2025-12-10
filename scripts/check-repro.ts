import path from "path";
import { chromium } from "playwright";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

void (async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const reproPath = path.join(__dirname, "../repro-animation.html");
  await page.goto(`file://${reproPath}`);

  console.log("Initial state:");
  const initialColor = await page.evaluate(() => {
    const el = document.querySelector(".box-complex");
    if (!el) throw new Error("Element not found");
    return getComputedStyle(el).backgroundColor;
  });
  console.log("Box Color:", initialColor);

  console.log("Toggling theme...");
  await page.click("button");

  // Check interpolation
  console.log("Checking interpolation...");
  for (let i = 0; i < 10; i++) {
    await page.waitForTimeout(100);
    const color = await page.evaluate(() => {
      const el = document.querySelector(".box-complex");
      if (!el) throw new Error("Element not found");
      return getComputedStyle(el).backgroundColor;
    });
    const tau = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue("--tau"),
    );
    console.log(`Time ${i * 100}ms: Tau=${tau}, Color=${color}`);
  }

  await browser.close();
})();
