import { test, expect } from "@playwright/test";

type Sample = {
  border: string;
  bridge: string;
  fg: string;
  resolved: string | null;
  tau: string;
};

test("starlight chrome header border stays bridge-routed during theme flip", async ({
  page,
}) => {
  await page.goto("/concepts/thinking-in-surfaces/");

  await page.waitForFunction(() => {
    const header = document.querySelector(
      ".page.sl-flex > .header, header.axm-starlight-header, header.header",
    );
    return Boolean(header);
  });

  // Ensure deterministic transitions.
  await page.evaluate(() => {
    document.documentElement.setAttribute("data-axm-ready", "true");
    document.documentElement.setAttribute("data-theme", "light");
  });

  await page.waitForFunction(() => {
    return (
      document.documentElement.getAttribute("data-axm-resolved-mode") ===
      "light"
    );
  });

  const sample = async (): Promise<Sample> => {
    return await page.evaluate(() => {
      const header = document.querySelector(
        ".page.sl-flex > .header, header.axm-starlight-header, header.header",
      ) as HTMLElement | null;
      if (!header) throw new Error("missing header");

      const style = getComputedStyle(header);
      const rootStyle = getComputedStyle(document.documentElement);

      const resolveVarToBorderBottomColor = (varName: string): string => {
        const tmp = document.createElement("div");
        tmp.style.position = "fixed";
        tmp.style.left = "-9999px";
        tmp.style.top = "0";
        tmp.style.width = "1px";
        tmp.style.height = "1px";
        tmp.style.borderBottomStyle = "solid";
        tmp.style.borderBottomWidth = "1px";
        tmp.style.borderBottomColor = `var(${varName})`;
        header.appendChild(tmp);
        const out = getComputedStyle(tmp).borderBottomColor;
        tmp.remove();
        return out;
      };

      const resolveColorToBorderBottomColor = (color: string): string => {
        const tmp = document.createElement("div");
        tmp.style.position = "fixed";
        tmp.style.left = "-9999px";
        tmp.style.top = "0";
        tmp.style.width = "1px";
        tmp.style.height = "1px";
        tmp.style.borderBottomStyle = "solid";
        tmp.style.borderBottomWidth = "1px";
        tmp.style.borderBottomColor = color;
        header.appendChild(tmp);
        const out = getComputedStyle(tmp).borderBottomColor;
        tmp.remove();
        return out;
      };

      const border = style.borderBottomColor;
      const bridge = resolveVarToBorderBottomColor("--axm-bridge-border-int");
      const fg = resolveColorToBorderBottomColor(style.color);
      return {
        border,
        bridge,
        fg,
        resolved: document.documentElement.getAttribute(
          "data-axm-resolved-mode",
        ),
        tau: rootStyle.getPropertyValue("--tau").trim(),
      } satisfies Sample;
    });
  };

  const light = await sample();
  expect(light.border, JSON.stringify(light)).toBe(light.bridge);
  expect(
    light.border,
    "border should not equal text color in steady light",
  ).not.toBe(light.fg);

  // Flip theme and sample several frames; border must match bridge at every frame.
  const frames = await page.evaluate(async () => {
    document.documentElement.setAttribute("data-theme", "dark");

    const header = document.querySelector(
      ".page.sl-flex > .header, header.axm-starlight-header, header.header",
    ) as HTMLElement | null;
    if (!header) throw new Error("missing header");

    const resolveVarToBorderBottomColor = (varName: string): string => {
      const tmp = document.createElement("div");
      tmp.style.position = "fixed";
      tmp.style.left = "-9999px";
      tmp.style.top = "0";
      tmp.style.width = "1px";
      tmp.style.height = "1px";
      tmp.style.borderBottomStyle = "solid";
      tmp.style.borderBottomWidth = "1px";
      tmp.style.borderBottomColor = `var(${varName})`;
      header.appendChild(tmp);
      const out = getComputedStyle(tmp).borderBottomColor;
      tmp.remove();
      return out;
    };

    const resolveColorToBorderBottomColor = (color: string): string => {
      const tmp = document.createElement("div");
      tmp.style.position = "fixed";
      tmp.style.left = "-9999px";
      tmp.style.top = "0";
      tmp.style.width = "1px";
      tmp.style.height = "1px";
      tmp.style.borderBottomStyle = "solid";
      tmp.style.borderBottomWidth = "1px";
      tmp.style.borderBottomColor = color;
      header.appendChild(tmp);
      const out = getComputedStyle(tmp).borderBottomColor;
      tmp.remove();
      return out;
    };

    const out: Sample[] = [];
    for (let i = 0; i < 12; i++) {
      await new Promise((resolve) => requestAnimationFrame(resolve));
      const style = getComputedStyle(header);
      const rootStyle = getComputedStyle(document.documentElement);
      out.push({
        border: style.borderBottomColor,
        bridge: resolveVarToBorderBottomColor("--axm-bridge-border-int"),
        fg: resolveColorToBorderBottomColor(style.color),
        resolved: document.documentElement.getAttribute(
          "data-axm-resolved-mode",
        ),
        tau: rootStyle.getPropertyValue("--tau").trim(),
      });
    }
    return out;
  });

  for (const frame of frames) {
    expect(frame.border, JSON.stringify(frame)).toBe(frame.bridge);
  }

  await page.waitForFunction(() => {
    return (
      document.documentElement.getAttribute("data-axm-resolved-mode") === "dark"
    );
  });

  // Wait until tau reaches the endpoint.
  await page.waitForFunction(() => {
    return (
      getComputedStyle(document.documentElement)
        .getPropertyValue("--tau")
        .trim() === "-1"
    );
  });

  const dark = await sample();
  expect(dark.border, JSON.stringify(dark)).toBe(dark.bridge);
  expect(
    dark.border,
    "border should not equal text color in steady dark",
  ).not.toBe(dark.fg);
});
