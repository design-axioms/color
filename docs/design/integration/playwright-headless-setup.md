# Headless Debugging with Playwright

When debugging complex browser interactions or hydration issues, manually refreshing a browser window can be tedious and intrusive (stealing focus). Setting up a headless testing workflow allows you to verify fixes rapidly in the background.

## Installation

In a `pnpm` workspace, install Playwright and the browser binaries at the root.

```bash
# Install Playwright package
pnpm add -D -w playwright

# Install browser binaries (Chromium is usually sufficient for debugging)
pnpm exec playwright install chromium
```

## Creating a Check Script

Create a Node.js script (e.g., `scripts/repro-check.mjs`) to launch the browser, visit your local dev server, and perform checks.

### Basic Template

```javascript
import { chromium } from "playwright";

async function checkPage(url) {
  console.log(`Checking ${url}...`);
  // Launch headless (set headless: false to see the browser UI)
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // 1. Capture Console Logs
  page.on("console", (msg) => {
    console.log(`[Browser] ${msg.type()}: ${msg.text()}`);
  });

  // 2. Capture Uncaught Errors
  page.on("pageerror", (err) => {
    console.error(`[Page Error] ${err.message}`);
  });

  try {
    // Navigate to your local dev server
    await page.goto(url, { waitUntil: "networkidle" });

    // 3. Interact with Elements
    // Use standard CSS selectors
    const input = await page.$("#my-input");

    if (input) {
      // Type or fill values
      await input.fill("100");

      // Force an event if necessary (sometimes needed for framework reactivity)
      await input.evaluate((el) =>
        el.dispatchEvent(new Event("input", { bubbles: true })),
      );

      // Wait for the UI to update
      await page.waitForTimeout(100);

      // 4. Verify State
      const display = await page.$(".value-display");
      const text = await display.innerText();

      if (text === "100") {
        console.log("✅ Success: State updated.");
      } else {
        console.log(`❌ Failure: Expected '100', got '${text}'`);
      }
    } else {
      console.log("⚠️ Input not found");
    }
  } catch (e) {
    console.error("Script failed:", e);
  } finally {
    await browser.close();
  }
}

// Run against your local server port
checkPage("http://localhost:4321/my-page");
```

## Running the Check

1.  **Start your Dev Server**:
    ```bash
    pnpm dev
    ```
2.  **Run the Script**:
    ```bash
    node scripts/repro-check.mjs
    ```

## Tips for Debugging

- **`headless: false`**: If the script fails and you don't know why, change `headless: true` to `false` in the `launch` config to watch the browser execute the actions.
- **`page.pause()`**: Insert `await page.pause()` in your script to freeze execution and open the Playwright Inspector for manual debugging.
- **Selectors**: Playwright has powerful selectors. You can use text (`text="Submit"`), CSS (`.class`), or XPath.
- **Waiting**: Use `await page.waitForSelector('.my-element')` instead of hardcoded timeouts (`waitForTimeout`) for more robust tests.
