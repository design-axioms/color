import { test, expect } from "@playwright/test";
import { InspectorHelper } from "./helpers/inspector.js";

test("disabling inspector mid-continuity audit stops theme flashing", async ({
  page,
}) => {
  const inspector = new InspectorHelper(page);
  await page.goto("/");

  const setThemeModeViaThemeManager = async (
    mode: "light" | "dark",
  ): Promise<void> => {
    await page.waitForSelector("axiomatic-debugger");

    // Wait for Starlight chrome to be Axiomatic-wired (classes applied).
    // We no longer rely on inline `--sl-*` locks; the adapter is CSS-only.
    await page.waitForFunction(() => {
      const body = document.body;
      const headerEl = document.querySelector(
        "header.axm-starlight-header",
      ) as HTMLElement | null;

      const hasSurface = (el: HTMLElement | null): boolean =>
        !!el && Array.from(el.classList).some((c) => c.startsWith("surface-"));

      return !!body && !!headerEl && hasSurface(headerEl);
    });

    await page.waitForFunction(() => {
      const debuggerEl = document.querySelector("axiomatic-debugger");
      return !!debuggerEl?.shadowRoot?.getElementById("theme-toggle-main");
    });

    for (let i = 0; i < 4; i += 1) {
      const current = await page.evaluate(() =>
        document.documentElement.getAttribute("data-theme"),
      );
      if (current === mode) return;

      await page.evaluate(() => {
        const debuggerEl = document.querySelector("axiomatic-debugger");
        const button = debuggerEl?.shadowRoot?.getElementById(
          "theme-toggle-main",
        ) as HTMLButtonElement | null;
        if (!button) {
          throw new Error(
            "Axiomatic debugger theme toggle not found (#theme-toggle-main).",
          );
        }
        button.click();
      });

      await page.waitForTimeout(700);
    }

    const now = await page.evaluate(() =>
      document.documentElement.getAttribute("data-theme"),
    );
    throw new Error(
      `Failed to set theme mode via ThemeManager. Expected '${mode}', got '${now}'.`,
    );
  };

  // Start from a deterministic theme.
  await setThemeModeViaThemeManager("light");

  // Create enough DOM that continuity takes long enough to abort mid-run.
  await page.addStyleTag({
    content: `
      #abort-test-grid {
        display: grid;
        grid-template-columns: repeat(50, 10px);
        gap: 2px;
      }
      #abort-test-grid > div {
        width: 10px;
        height: 10px;
        background: transparent;
      }
    `,
  });

  await page.evaluate(() => {
    const grid = document.createElement("div");
    grid.id = "abort-test-grid";

    for (let i = 0; i < 3000; i += 1) {
      const el = document.createElement("div");
      el.className = "surface-card";
      el.textContent = "x";
      grid.appendChild(el);
    }

    document.body.appendChild(grid);
  });

  await inspector.open();

  // Track theme flips on the root.
  await page.evaluate(() => {
    (globalThis as any).__AXM_THEME_FLIPS__ = [] as Array<{
      t: number;
      theme: string | null;
    }>;

    const root = document.documentElement;
    const obs = new MutationObserver(() => {
      (globalThis as any).__AXM_THEME_FLIPS__.push({
        t: performance.now(),
        theme: root.getAttribute("data-theme"),
      });
    });

    obs.observe(root, { attributes: true, attributeFilter: ["data-theme"] });
    (globalThis as any).__AXM_THEME_FLIPS_OBS__ = obs;
  });

  // Kick off continuity, then disable quickly to abort.
  await inspector.continuityBtn.click();
  await page.waitForTimeout(50);
  await inspector.toggleBtn.click();

  const disableStart = await page.evaluate(() => performance.now());

  // Give the abort a moment to propagate/cleanup.
  await page.waitForTimeout(300);

  const { flipsAfterDisable, tauPriority, tauValue, themeNow } =
    await page.evaluate((disableAt) => {
      const flips = ((globalThis as any).__AXM_THEME_FLIPS__ ?? []) as Array<{
        t: number;
        theme: string | null;
      }>;

      const root = document.documentElement;
      return {
        flipsAfterDisable: flips.filter((f) => f.t >= disableAt).length,
        tauPriority: root.style.getPropertyPriority("--tau"),
        tauValue: root.style.getPropertyValue("--tau"),
        themeNow: root.getAttribute("data-theme"),
      };
    }, disableStart);

  // Disabling mid-audit should stop any further theme flashing.
  // Allow a single cleanup flip (restoring the original theme).
  expect(flipsAfterDisable).toBeLessThanOrEqual(1);
  expect(tauPriority).not.toBe("important");
  expect(tauValue.trim()).toBe("1");
  expect(themeNow).toBe("light");
});
