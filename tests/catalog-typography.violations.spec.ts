import { test, expect } from "@playwright/test";
import { InspectorHelper } from "./helpers/inspector.js";

test("/catalog/typography has no inspector violations", async ({ page }) => {
  const inspector = new InspectorHelper(page);
  await page.goto("/catalog/typography/");

  // Wait for Starlight chrome to finish picking a surface/context.
  await expect
    .poll(async () => {
      return await page.evaluate(() => {
        const header = document.querySelector(
          "header.axm-starlight-header",
        ) as HTMLElement | null;
        if (!header) return { ready: false };

        const hasSurfaceClass = Array.from(header.classList).some((c) =>
          c.startsWith("surface-"),
        );

        return { ready: hasSurfaceClass };
      });
    })
    .toMatchObject({ ready: true });

  // Wait for the adapter mapping (foreign palette -> bridge exports) to settle.
  // Never assert private variable strings; assert computed equivalence.
  await expect
    .poll(async () => {
      return await page.evaluate(() => {
        const mk = (cssColor: string) => {
          const el = document.createElement("span");
          el.style.color = cssColor;
          el.style.position = "absolute";
          el.style.left = "-9999px";
          el.style.top = "-9999px";
          el.textContent = "probe";
          document.body.appendChild(el);
          return el;
        };

        const a = mk("var(--sl-color-text)");
        const b = mk("var(--axm-bridge-fg)");
        try {
          const ca = getComputedStyle(a).color;
          const cb = getComputedStyle(b).color;
          return { ca, cb, equal: ca === cb };
        } finally {
          a.remove();
          b.remove();
        }
      });
    })
    .toMatchObject({ equal: true });

  await inspector.open();
  await inspector.runViolationCheck();

  const violationsReport = await page.evaluate(() => {
    const report = (globalThis as any)
      .__AXIOMATIC_INSPECTOR_VIOLATIONS__ as unknown;
    return Array.isArray(report) ? report : null;
  });

  if (Array.isArray(violationsReport) && violationsReport.length > 0) {
    console.log(
      "Typography inspector violations (first 10):",
      violationsReport.slice(0, 10),
    );
  }

  await expect
    .poll(async () => {
      return await page.evaluate(() => {
        const report = (globalThis as any)
          .__AXIOMATIC_INSPECTOR_VIOLATIONS__ as unknown;
        if (!Array.isArray(report)) return null;
        return report.length;
      });
    })
    .toBe(0);

  await expect(await inspector.getViolations()).toHaveCount(0);
});
