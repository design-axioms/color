import { chromium } from "playwright";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

void (async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  const reproPath = path.join(__dirname, "../repro-starlight.html");
  await page.goto(`file://${reproPath}`);

  console.log("Initial state:");
  let tau = await page.evaluate(() =>
    getComputedStyle(document.documentElement).getPropertyValue("--tau"),
  );
  console.log(`Tau: ${tau}`);

  console.log("Toggling theme...");
  await page.click("#toggle");

  // Check interpolation
  for (let i = 0; i < 5; i++) {
    await page.waitForTimeout(50);
    tau = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue("--tau"),
    );
    console.log(`Time ${i * 50}ms: Tau=${tau}`);
  }

  await page.waitForTimeout(500);
  tau = await page.evaluate(() =>
    getComputedStyle(document.documentElement).getPropertyValue("--tau"),
  );
  console.log(`Final Tau: ${tau}`);

  await browser.close();
})();
