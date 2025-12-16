import { expect, test } from "@playwright/test";

type BorderOwner = {
  tag: string;
  id: string | null;
  className: string;
  text: string;
  borderLeftWidth: string;
  borderLeftColor: string;
  borderLeftStyle: string;
  hairline: string;
  hairlineLight: string;
  bridgeDec: string;
  resolved: string | null;
  tau: string;
};

test("starlight sidebar section left borders stay bridge-routed during theme flip", async ({
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

  const sampleOwners = async (): Promise<BorderOwner[]> => {
    return await page.evaluate(() => {
      const sidebar = document.querySelector(
        "#starlight__sidebar",
      ) as HTMLElement | null;
      if (!sidebar) throw new Error("missing sidebar");

      const resolveVarToBorderLeftColor = (
        scope: HTMLElement,
        varName: string,
      ) => {
        const tmp = document.createElement("div");
        tmp.style.position = "fixed";
        tmp.style.left = "-9999px";
        tmp.style.top = "0";
        tmp.style.width = "1px";
        tmp.style.height = "1px";
        tmp.style.borderLeftStyle = "solid";
        tmp.style.borderLeftWidth = "1px";
        tmp.style.borderLeftColor = `var(${varName})`;
        scope.appendChild(tmp);
        const out = getComputedStyle(tmp).borderLeftColor;
        tmp.remove();
        return out;
      };

      const tau = getComputedStyle(document.documentElement)
        .getPropertyValue("--tau")
        .trim();
      const resolved = document.documentElement.getAttribute(
        "data-axm-resolved-mode",
      );

      const scope = sidebar;

      const all = Array.from(scope.querySelectorAll<HTMLElement>("*"));
      const owners: BorderOwner[] = [];

      for (const el of all) {
        const s = getComputedStyle(el);
        const w = Number.parseFloat(s.borderLeftWidth || "0");
        if (!Number.isFinite(w) || w <= 0) continue;
        if (s.borderLeftStyle === "none") continue;

        const rect = el.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) continue;

        const hairline = resolveVarToBorderLeftColor(el, "--sl-color-hairline");
        const hairlineLight = resolveVarToBorderLeftColor(
          el,
          "--sl-color-hairline-light",
        );
        const bridgeDec = resolveVarToBorderLeftColor(
          el,
          "--axm-bridge-border-dec",
        );

        owners.push({
          tag: el.tagName.toLowerCase(),
          id: el.id || null,
          className: el.className || "",
          text: (el.textContent || "").trim().slice(0, 80),
          borderLeftWidth: s.borderLeftWidth,
          borderLeftColor: s.borderLeftColor,
          borderLeftStyle: s.borderLeftStyle,
          hairline,
          hairlineLight,
          bridgeDec,
          resolved,
          tau,
        });
      }

      // Prefer the most "section-like" borders: larger blocks with borders.
      owners.sort((a, b) => {
        const aw = Number.parseFloat(a.borderLeftWidth);
        const bw = Number.parseFloat(b.borderLeftWidth);
        return bw - aw;
      });

      return owners.slice(0, 12);
    });
  };

  const lightOwners = await sampleOwners();

  // If this fails, keep the error payload small but actionable.
  expect(
    lightOwners.length,
    JSON.stringify(lightOwners, null, 2),
  ).toBeGreaterThan(0);

  // At steady light, these borders should route through hairline (which is mapped to bridgeDec)
  // OR directly through bridgeDec.
  for (const o of lightOwners) {
    const ok =
      o.borderLeftColor === o.hairline ||
      o.borderLeftColor === o.hairlineLight ||
      o.borderLeftColor === o.bridgeDec;
    expect(ok, JSON.stringify(o)).toBe(true);
  }

  const frames = await page.evaluate(async () => {
    document.documentElement.setAttribute("data-theme", "dark");

    const sidebar = document.querySelector(
      "#starlight__sidebar",
    ) as HTMLElement | null;
    if (!sidebar) throw new Error("missing sidebar");

    const resolveVarToBorderLeftColor = (
      scope: HTMLElement,
      varName: string,
    ) => {
      const tmp = document.createElement("div");
      tmp.style.position = "fixed";
      tmp.style.left = "-9999px";
      tmp.style.top = "0";
      tmp.style.width = "1px";
      tmp.style.height = "1px";
      tmp.style.borderLeftStyle = "solid";
      tmp.style.borderLeftWidth = "1px";
      tmp.style.borderLeftColor = `var(${varName})`;
      scope.appendChild(tmp);
      const out = getComputedStyle(tmp).borderLeftColor;
      tmp.remove();
      return out;
    };

    const sample = (): BorderOwner[] => {
      const tau = getComputedStyle(document.documentElement)
        .getPropertyValue("--tau")
        .trim();
      const resolved = document.documentElement.getAttribute(
        "data-axm-resolved-mode",
      );

      const scope = sidebar;

      const all = Array.from(scope.querySelectorAll<HTMLElement>("*"));
      const owners: BorderOwner[] = [];
      for (const el of all) {
        const s = getComputedStyle(el);
        const w = Number.parseFloat(s.borderLeftWidth || "0");
        if (!Number.isFinite(w) || w <= 0) continue;
        if (s.borderLeftStyle === "none") continue;
        const rect = el.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) continue;

        const hairline = resolveVarToBorderLeftColor(el, "--sl-color-hairline");
        const hairlineLight = resolveVarToBorderLeftColor(
          el,
          "--sl-color-hairline-light",
        );
        const bridgeDec = resolveVarToBorderLeftColor(
          el,
          "--axm-bridge-border-dec",
        );

        owners.push({
          tag: el.tagName.toLowerCase(),
          id: el.id || null,
          className: el.className || "",
          text: (el.textContent || "").trim().slice(0, 80),
          borderLeftWidth: s.borderLeftWidth,
          borderLeftColor: s.borderLeftColor,
          borderLeftStyle: s.borderLeftStyle,
          hairline,
          hairlineLight,
          bridgeDec,
          resolved,
          tau,
        });
      }
      owners.sort(
        (a, b) =>
          Number.parseFloat(b.borderLeftWidth) -
          Number.parseFloat(a.borderLeftWidth),
      );
      return owners.slice(0, 12);
    };

    const frames: BorderOwner[][] = [];
    for (let i = 0; i < 12; i++) {
      await new Promise((resolve) => requestAnimationFrame(resolve));
      frames.push(sample());
    }
    return frames;
  });

  for (const frame of frames) {
    for (const o of frame) {
      const ok =
        o.borderLeftColor === o.hairline ||
        o.borderLeftColor === o.hairlineLight ||
        o.borderLeftColor === o.bridgeDec;
      expect(ok, JSON.stringify(o)).toBe(true);
    }
  }
});
