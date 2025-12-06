import { expect, test } from "@playwright/test";

test("Starlight variables should be mapped to Axiomatic tokens", async ({
  page,
}) => {
  await page.goto("/");
  await page.waitForSelector("body");

  const mappings = [
    { sl: "--sl-color-gray-1", axm: "--axm-text-high-token" },
    { sl: "--sl-color-gray-2", axm: "--axm-text-subtle-token" },
    { sl: "--sl-color-gray-3", axm: "--axm-text-subtlest-token" },
    { sl: "--sl-color-gray-4", axm: "--axm-border-int-token" },
    { sl: "--sl-color-gray-5", axm: "--axm-border-dec-token" },
    { sl: "--sl-color-gray-6", axm: "--axm-surface-token" },
  ];

  for (const { sl, axm } of mappings) {
    const values = await page.evaluate(
      ({ sl, axm }) => {
        function getResolvedColor(variableName: string): string {
          const el = document.createElement("div");
          el.style.color = `var(${variableName})`;
          el.style.display = "none";
          document.body.appendChild(el);
          const color = getComputedStyle(el).color;
          document.body.removeChild(el);
          return color;
        }
        return {
          slValue: getResolvedColor(sl),
          axmValue: getResolvedColor(axm),
        };
      },
      { sl, axm },
    );

    console.log(`Checking ${sl} -> ${axm}`);
    console.log(`  ${sl}: ${values.slValue}`);
    console.log(`  ${axm}: ${values.axmValue}`);

    expect(values.slValue).toBe(values.axmValue);
    expect(values.slValue).not.toBe("");
    expect(values.slValue).not.toBe("rgba(0, 0, 0, 0)");
  }
});

test("Sidebar links should use Axiomatic colors", async ({ page }) => {
  await page.goto("/");
  const sidebarLink = page.locator(".sidebar-content a").first();
  if ((await sidebarLink.count()) > 0) {
    const color = await sidebarLink.evaluate((el) => {
      return getComputedStyle(el).color;
    });

    const tokens = await page.evaluate(() => {
      function getResolvedColor(variableName: string): string {
        const el = document.createElement("div");
        el.style.color = `var(${variableName})`;
        document.body.appendChild(el);
        const color = getComputedStyle(el).color;
        document.body.removeChild(el);
        return color;
      }
      return [
        getResolvedColor("--axm-text-high-token"),
        getResolvedColor("--axm-text-subtle-token"),
        getResolvedColor("--axm-text-subtlest-token"),
      ];
    });

    console.log("Sidebar link color:", color);
    expect(tokens).toContain(color);
  }
});

test("Background color should be controlled by Axiomatic Engine", async ({
  page,
}) => {
  await page.goto("/");

  const values = await page.evaluate(() => {
    const bodyStyle = getComputedStyle(document.body);

    // Helper to resolve a variable
    function resolveVar(name: string): string {
      const el = document.createElement("div");
      el.style.backgroundColor = `var(${name})`;
      document.body.appendChild(el);
      const color = getComputedStyle(el).backgroundColor;
      document.body.removeChild(el);
      return color;
    }

    return {
      bodyBg: bodyStyle.backgroundColor,
      computedSurface: resolveVar("--computed-surface"),
      slBg: resolveVar("--sl-color-bg"),
    };
  });

  console.log("Body BG:", values.bodyBg);
  console.log("Computed Surface:", values.computedSurface);
  console.log("Starlight BG:", values.slBg);

  // 1. Body background should match the Axiomatic engine's computed surface
  expect(values.bodyBg).toBe(values.computedSurface);

  // 2. It should NOT match Starlight's default background variable (proving engine override)
  // Note: --sl-color-bg is oklch(1 0 5), computed surface is oklch(1 0.008 0)
  expect(values.bodyBg).not.toBe(values.slBg);
});
