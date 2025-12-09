import { chromium } from "playwright";

async function debugHero(): Promise<void> {
  console.log("Launching browser...");
  const browser = await chromium.launch();
  console.log("Browser launched. Creating context...");
  const context = await browser.newContext({ ignoreHTTPSErrors: true });
  console.log("Context created. Creating page...");
  const page = await context.newPage();

  console.log("Navigating to home page...");

  const maxRetries = 5;
  let connected = false;

  for (let i = 0; i < maxRetries; i++) {
    try {
      // Short timeout for connection check
      await page.goto("https://color-system.localhost/", {
        timeout: 5000,
        waitUntil: "domcontentloaded",
      });
      connected = true;
      break;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.log(
        `Connection attempt ${i + 1} failed (${msg.split("\n")[0]}). Retrying in 2s...`,
      );
      await new Promise((r) => setTimeout(r, 2000));
    }
  }

  if (!connected) {
    console.error(
      "Failed to connect to server. Please ensure locald is running.",
    );
    await browser.close();
    process.exit(1);
  }

  // Set viewport to desktop
  await page.setViewportSize({ width: 1440, height: 900 });

  async function checkState(mode: string): Promise<void> {
    console.log(`\n--- Checking ${mode} Mode ---`);

    await page.evaluate((m) => {
      document.documentElement.setAttribute("data-theme", m);
    }, mode);

    // Allow CSS to apply
    await page.waitForTimeout(500);

    const bodyInfo = await page.evaluate(() => {
      const style = window.getComputedStyle(document.body);
      return {
        backgroundColor: style.backgroundColor,
        colorScheme: style.colorScheme,
      };
    });
    console.log(`Body Info:`, bodyInfo);

    const h1 = page.locator("h1#_top");
    if ((await h1.count()) > 0) {
      const style = await h1.evaluate((el) => {
        const s = window.getComputedStyle(el);
        return { color: s.color, opacity: s.opacity, visibility: s.visibility };
      });
      console.log(`H1 Style:`, style);

      // Check parent (Hero) background
      const parentStyle = await h1.evaluate((el) => {
        const p = el.parentElement?.parentElement; // .hero-content -> .hero (approx)
        if (!p) return null;
        const s = window.getComputedStyle(p);
        return {
          className: p.className,
          backgroundColor: s.backgroundColor,
          colorScheme: s.colorScheme,
        };
      });
      console.log(`Hero Parent Style:`, parentStyle);
    }

    const buttons = page.locator(".actions a");
    const count = await buttons.count();
    console.log(`Found ${count} buttons.`);
    for (let i = 0; i < count; i++) {
      const btn = buttons.nth(i);
      const text = await btn.innerText();
      const style = await btn.evaluate((el) => {
        const s = window.getComputedStyle(el);
        return { color: s.color, backgroundColor: s.backgroundColor };
      });
      console.log(
        `Button "${text}": Color=${style.color}, Bg=${style.backgroundColor}`,
      );
    }
  }

  await checkState("light");
  await checkState("dark");

  await browser.close();
}

debugHero().catch(console.error);
