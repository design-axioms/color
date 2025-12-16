import { test, expect } from "@playwright/test";

type BorderSample = {
  target: string;
  border: string;
  fg: string;
  bridgeInt: string;
  bridgeDec: string;
  resolved: string | null;
  tau: string;
};

test("starlight sidebar divider stays bridge-routed during theme flip", async ({
  page,
}) => {
  await page.goto("/concepts/thinking-in-surfaces/");

  await page.waitForFunction(() => {
    const sidebar = document.querySelector("#starlight__sidebar");
    return Boolean(sidebar);
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

  const sample = async (): Promise<BorderSample> => {
    return await page.evaluate(() => {
      const host = document.querySelector(
        "#starlight__sidebar",
      ) as HTMLElement | null;
      if (!host) throw new Error("missing sidebar host");

      const candidates: Array<{ name: string; el: HTMLElement }> = [
        { name: "#starlight__sidebar", el: host },
      ];

      const inner = host.querySelector(
        ":scope > .axm-starlight-sidebar",
      ) as HTMLElement | null;
      if (inner) {
        candidates.push({
          name: "#starlight__sidebar > .axm-starlight-sidebar",
          el: inner,
        });
      }

      let target = candidates[0]!;
      for (const c of candidates) {
        const s = getComputedStyle(c.el);
        const w = Number.parseFloat(s.borderRightWidth || "0");
        if (Number.isFinite(w) && w > 0) {
          target = c;
          break;
        }
      }

      const resolveVarToBorderRightColor = (varName: string): string => {
        const tmp = document.createElement("div");
        tmp.style.position = "fixed";
        tmp.style.left = "-9999px";
        tmp.style.top = "0";
        tmp.style.width = "1px";
        tmp.style.height = "1px";
        tmp.style.borderRightStyle = "solid";
        tmp.style.borderRightWidth = "1px";
        tmp.style.borderRightColor = `var(${varName})`;
        target.el.appendChild(tmp);
        const out = getComputedStyle(tmp).borderRightColor;
        tmp.remove();
        return out;
      };

      const resolveColorToBorderRightColor = (color: string): string => {
        const tmp = document.createElement("div");
        tmp.style.position = "fixed";
        tmp.style.left = "-9999px";
        tmp.style.top = "0";
        tmp.style.width = "1px";
        tmp.style.height = "1px";
        tmp.style.borderRightStyle = "solid";
        tmp.style.borderRightWidth = "1px";
        tmp.style.borderRightColor = color;
        target.el.appendChild(tmp);
        const out = getComputedStyle(tmp).borderRightColor;
        tmp.remove();
        return out;
      };

      const style = getComputedStyle(target.el);
      const rootStyle = getComputedStyle(document.documentElement);

      const border = style.borderRightColor;
      const fg = resolveColorToBorderRightColor(style.color);
      const bridgeInt = resolveVarToBorderRightColor("--axm-bridge-border-int");
      const bridgeDec = resolveVarToBorderRightColor("--axm-bridge-border-dec");

      return {
        target: target.name,
        border,
        fg,
        bridgeInt,
        bridgeDec,
        resolved: document.documentElement.getAttribute(
          "data-axm-resolved-mode",
        ),
        tau: rootStyle.getPropertyValue("--tau").trim(),
      } satisfies BorderSample;
    });
  };

  const light = await sample();

  expect(
    [light.bridgeInt, light.bridgeDec],
    `sidebar divider must match bridge int/dec: ${JSON.stringify(light)}`,
  ).toContain(light.border);

  const expectedFamily: "int" | "dec" =
    light.border === light.bridgeInt ? "int" : "dec";

  expect(
    light.border,
    `border should not equal text color in steady light: ${JSON.stringify(light)}`,
  ).not.toBe(light.fg);

  const frames = await page.evaluate(async () => {
    document.documentElement.setAttribute("data-theme", "dark");

    const host = document.querySelector(
      "#starlight__sidebar",
    ) as HTMLElement | null;
    if (!host) throw new Error("missing sidebar host");

    const candidates: Array<{ name: string; el: HTMLElement }> = [
      { name: "#starlight__sidebar", el: host },
    ];

    const inner = host.querySelector(
      ":scope > .axm-starlight-sidebar",
    ) as HTMLElement | null;
    if (inner) {
      candidates.push({
        name: "#starlight__sidebar > .axm-starlight-sidebar",
        el: inner,
      });
    }

    let target = candidates[0]!;
    for (const c of candidates) {
      const s = getComputedStyle(c.el);
      const w = Number.parseFloat(s.borderRightWidth || "0");
      if (Number.isFinite(w) && w > 0) {
        target = c;
        break;
      }
    }

    const resolveVarToBorderRightColor = (varName: string): string => {
      const tmp = document.createElement("div");
      tmp.style.position = "fixed";
      tmp.style.left = "-9999px";
      tmp.style.top = "0";
      tmp.style.width = "1px";
      tmp.style.height = "1px";
      tmp.style.borderRightStyle = "solid";
      tmp.style.borderRightWidth = "1px";
      tmp.style.borderRightColor = `var(${varName})`;
      target.el.appendChild(tmp);
      const out = getComputedStyle(tmp).borderRightColor;
      tmp.remove();
      return out;
    };

    const resolveColorToBorderRightColor = (color: string): string => {
      const tmp = document.createElement("div");
      tmp.style.position = "fixed";
      tmp.style.left = "-9999px";
      tmp.style.top = "0";
      tmp.style.width = "1px";
      tmp.style.height = "1px";
      tmp.style.borderRightStyle = "solid";
      tmp.style.borderRightWidth = "1px";
      tmp.style.borderRightColor = color;
      target.el.appendChild(tmp);
      const out = getComputedStyle(tmp).borderRightColor;
      tmp.remove();
      return out;
    };

    const out: BorderSample[] = [];
    for (let i = 0; i < 12; i++) {
      await new Promise((resolve) => requestAnimationFrame(resolve));
      const style = getComputedStyle(target.el);
      const rootStyle = getComputedStyle(document.documentElement);
      out.push({
        target: target.name,
        border: style.borderRightColor,
        fg: resolveColorToBorderRightColor(style.color),
        bridgeInt: resolveVarToBorderRightColor("--axm-bridge-border-int"),
        bridgeDec: resolveVarToBorderRightColor("--axm-bridge-border-dec"),
        resolved: document.documentElement.getAttribute(
          "data-axm-resolved-mode",
        ),
        tau: rootStyle.getPropertyValue("--tau").trim(),
      });
    }
    return out;
  });

  for (const frame of frames) {
    const expected =
      expectedFamily === "int" ? frame.bridgeInt : frame.bridgeDec;
    expect(frame.border, JSON.stringify({ expectedFamily, frame })).toBe(
      expected,
    );
  }

  await page.waitForFunction(() => {
    return (
      document.documentElement.getAttribute("data-axm-resolved-mode") === "dark"
    );
  });

  await page.waitForFunction(() => {
    return (
      getComputedStyle(document.documentElement)
        .getPropertyValue("--tau")
        .trim() === "-1"
    );
  });

  const dark = await sample();
  const expected = expectedFamily === "int" ? dark.bridgeInt : dark.bridgeDec;
  expect(dark.border, JSON.stringify({ expectedFamily, dark })).toBe(expected);
  expect(
    dark.border,
    `border should not equal text color in steady dark: ${JSON.stringify(dark)}`,
  ).not.toBe(dark.fg);
});
