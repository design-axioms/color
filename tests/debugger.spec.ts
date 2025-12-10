import { expect, test } from "@playwright/test";

// We need to inject the debugger code because it might not be active in the production build
// or the specific page we are testing.
// We'll read the source files directly.
// Note: This is a bit hacky because we are reading TS files.
// In a real scenario, we'd want the compiled JS.
// However, since we are in a dev environment, we might be able to rely on the fact
// that we can just define the custom element if we strip types or use a simple mock for the test.
// ACTUALLY: The `check-violations.ts` script uses `WALKER_LIBRARY`.
// Let's see if we can use a similar approach or just test the UI if it's already there.
// If the site is running in dev mode, it might have it?
// Let's assume we need to inject a simplified version or the real one if we can build it.

// For this test, let's try to verify the debugger IF it exists, or inject a mock one
// to test the interaction logic if we can't easily inject the full TS source.

// BETTER APPROACH: The `check-violations.ts` script constructs `INJECTED_SCRIPT`.
// We can use the same logic to inject the walker/resolver/overlay.
// But `overlay.ts` imports other files.
// Let's try to just test the *existence* of the debugger if the dev server includes it,
// OR, let's write a test that verifies the `check-violations` script logic itself?
// No, the user asked for `tests/debugger.spec.ts`.

// Let's try to inject the compiled output if available.
// `dist/lib/inspector/index.js` might exist?

test.describe("Axiomatic Debugger", () => {
  test("Debugger UI interactions", async ({ page }) => {
    await page.goto("/");

    // 1. Inject the Debugger
    // The custom element is already defined by the app bundle (as confirmed by the error).
    // We just need to add it to the DOM if it's not there.
    await page.evaluate(() => {
      if (!document.querySelector("axiomatic-debugger")) {
        document.body.appendChild(document.createElement("axiomatic-debugger"));
      }
    });

    // 2. Verify it's in the DOM
    const debuggerEl = page.locator("axiomatic-debugger");
    await expect(debuggerEl).toBeAttached();

    // 3. Interact with Shadow DOM
    // The real debugger uses Shadow DOM.
    const toggleBtn = debuggerEl.locator("#toggle-btn");
    await expect(toggleBtn).toBeVisible();

    // 4. Click Toggle to Enable
    await toggleBtn.click();

    // 4b. Hover over an element to trigger inspection
    // The debugger only shows the card when an element is inspected.
    const target = page.locator("h1").first();
    await target.hover();

    // 5. Verify Card Visibility
    // The real debugger uses popover API or display:block
    const infoCard = debuggerEl.locator("#info-card");

    // Check if it's visible. Note: popover visibility might be tricky to test with standard matchers
    // if the browser support in Playwright's bundled browser varies, but usually it works.
    // Alternatively check computed style.
    await expect(infoCard).toBeVisible();

    // 6. Click Toggle again
    await toggleBtn.click();
    await expect(infoCard).not.toBeVisible();
  });
});
