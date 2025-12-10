import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const BASE_URL = "https://color-system.localhost";
const OUTPUT_ROOT = path.join(process.cwd(), "qa-audit");

const PAGES = [
  { name: "index", path: "/" },
  { name: "concepts", path: "/concepts/thinking-in-surfaces/" },
  { name: "tokens", path: "/reference/tokens/" },
];

const VIEWPORTS = [
  { name: "mobile", width: 375, height: 667 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1440, height: 900 },
];

const THEMES = ["light", "dark"];

async function run(): Promise<void> {
  console.log("📸 Starting QA Screenshot Run...");

  // Ensure output root exists
  if (!fs.existsSync(OUTPUT_ROOT)) {
    fs.mkdirSync(OUTPUT_ROOT, { recursive: true });
  }

  const browser = await chromium.launch();
  const context = await browser.newContext({
    ignoreHTTPSErrors: true,
  });
  const page = await context.newPage();

  for (const pageConfig of PAGES) {
    console.log(`\nProcessing Page: ${pageConfig.name}`);
    const pageDir = path.join(OUTPUT_ROOT, pageConfig.name);

    if (!fs.existsSync(pageDir)) {
      fs.mkdirSync(pageDir, { recursive: true });
    }

    for (const viewport of VIEWPORTS) {
      for (const theme of THEMES) {
        const shotDir = path.join(pageDir, viewport.name, theme);
        if (!fs.existsSync(shotDir)) {
          fs.mkdirSync(shotDir, { recursive: true });
        }

        const filename = "view.png";
        const filePath = path.join(shotDir, filename);

        console.log(`  Capturing ${viewport.name}/${theme}/${filename}...`);

        // Set viewport
        await page.setViewportSize({
          width: viewport.width,
          height: viewport.height,
        });

        // Navigate
        await page.goto(`${BASE_URL}${pageConfig.path}`, {
          waitUntil: "networkidle",
        });

        // Set theme
        await page.evaluate((t) => {
          document.documentElement.setAttribute("data-theme", t);
          if (t === "dark") document.documentElement.classList.add("dark");
          else document.documentElement.classList.remove("dark");
        }, theme);

        // Wait a bit for transitions
        await page.waitForTimeout(500);

        // Take screenshot
        await page.screenshot({ path: filePath, fullPage: true });

        // Enable Violations Mode
        try {
          const toggleInspector = page.getByLabel("Toggle Inspector");
          if (await toggleInspector.isVisible()) {
            console.log(`    Capturing ${viewport.name}/${theme}/debug.png...`);
            await toggleInspector.click();

            // Wait for the violations button to appear (it animates in)
            const toggleViolations = page.getByLabel("Toggle Violations");
            await toggleViolations.waitFor({ state: "visible", timeout: 2000 });
            await toggleViolations.click();

            // Wait for violations to render
            await page.waitForTimeout(500);

            const debugFilename = "debug.png";
            const debugFilePath = path.join(shotDir, debugFilename);
            await page.screenshot({ path: debugFilePath, fullPage: true });
          }
        } catch (e) {
          console.log(
            `    Failed to capture debug screenshot: ${e instanceof Error ? e.message : String(e)}`,
          );
        }
      }
    }
  }

  await browser.close();
  console.log(`\n✅ Done! Screenshots saved to ${OUTPUT_ROOT}`);
}

run().catch(console.error);
