import { test, expect } from "@playwright/test";

type RGBA = { r: number; g: number; b: number; a: number };

const clamp01 = (n: number): number => Math.max(0, Math.min(1, n));
const clamp255 = (n: number): number => Math.max(0, Math.min(255, n));

const parseAlpha = (token: string | undefined): number => {
  if (!token) return 1;
  const t = token.trim();
  if (!t) return 1;
  if (t.endsWith("%")) {
    const p = Number.parseFloat(t.slice(0, -1));
    return Number.isFinite(p) ? clamp01(p / 100) : 1;
  }
  const n = Number.parseFloat(t);
  return Number.isFinite(n) ? clamp01(n) : 1;
};

const parseOklabLightness = (token: string): number | null => {
  const t = token.trim();
  if (!t) return null;
  if (t.endsWith("%")) {
    const p = Number.parseFloat(t.slice(0, -1));
    return Number.isFinite(p) ? p / 100 : null;
  }
  const n = Number.parseFloat(t);
  return Number.isFinite(n) ? n : null;
};

const parseRgb = (value: string): RGBA | null => {
  const m = /^rgba?\(([^)]+)\)$/i.exec(value.trim());
  if (!m) return null;
  const body = m[1];
  if (!body) return null;
  const partsRaw = body
    .trim()
    .split("/")
    .map((p) => p.trim());
  const left = partsRaw[0] ?? "";
  const alphaPart = partsRaw[1];
  const tokens = left.replace(/,/g, " ").split(/\s+/).filter(Boolean);
  if (tokens.length < 3) return null;

  const toNumber = (token: string): number | null => {
    const t = token.trim();
    if (!t) return null;
    if (t.endsWith("%")) {
      const p = Number.parseFloat(t.slice(0, -1));
      return Number.isFinite(p) ? (255 * p) / 100 : null;
    }
    const n = Number.parseFloat(t);
    return Number.isFinite(n) ? n : null;
  };

  const r = toNumber(tokens[0] ?? "");
  const g = toNumber(tokens[1] ?? "");
  const b = toNumber(tokens[2] ?? "");
  if (r === null || g === null || b === null) return null;

  const alphaToken = alphaPart || tokens[3];
  const a = parseAlpha(alphaToken);
  return {
    r: clamp255(Math.round(r)),
    g: clamp255(Math.round(g)),
    b: clamp255(Math.round(b)),
    a,
  };
};

const parseOklch = (
  value: string,
): { L: number; C: number; h: number; alpha: number } | null => {
  const m = /^oklch\((.+)\)$/i.exec(value.trim());
  if (!m) return null;
  const body = m[1];
  if (!body) return null;
  const partsRaw = body.split("/").map((p) => p.trim());
  const left = partsRaw[0] ?? "";
  const alphaPart = partsRaw[1];
  const parts = left.split(/\s+/).filter(Boolean);
  if (parts.length < 3) return null;
  const L = parseOklabLightness(parts[0] ?? "");
  const C = Number.parseFloat(parts[1] ?? "");
  const h = Number.parseFloat(parts[2] ?? "");
  if (L === null) return null;
  if (![C, h].every((n) => Number.isFinite(n))) return null;
  return { L, C, h, alpha: parseAlpha(alphaPart) };
};

const parseOklab = (
  value: string,
): { L: number; a: number; b: number; alpha: number } | null => {
  const m = /^oklab\((.+)\)$/i.exec(value.trim());
  if (!m) return null;
  const body = m[1];
  if (!body) return null;
  const partsRaw = body.split("/").map((p) => p.trim());
  const left = partsRaw[0] ?? "";
  const alphaPart = partsRaw[1];
  const parts = left.split(/\s+/).filter(Boolean);
  if (parts.length < 3) return null;
  const L = parseOklabLightness(parts[0] ?? "");
  const a = Number.parseFloat(parts[1] ?? "");
  const b = Number.parseFloat(parts[2] ?? "");
  if (L === null) return null;
  if (![a, b].every((n) => Number.isFinite(n))) return null;
  return { L, a, b, alpha: parseAlpha(alphaPart) };
};

const oklabToRgba = (L: number, a: number, b: number, alpha: number): RGBA => {
  // OKLab → linear sRGB → sRGB (D65), per Björn Ottosson.
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;

  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;

  let rLin = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  let gLin = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  let bLin = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;

  const toSrgb = (c: number): number => {
    c = clamp01(c);
    if (c <= 0.0031308) return 12.92 * c;
    return 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
  };

  const r = clamp255(Math.round(255 * toSrgb(rLin)));
  const g = clamp255(Math.round(255 * toSrgb(gLin)));
  const bb = clamp255(Math.round(255 * toSrgb(bLin)));
  return { r, g, b: bb, a: clamp01(alpha) };
};

const parseToRgba = (value: string): RGBA | null => {
  const t = value.trim();
  if (!t) return null;
  if (t.toLowerCase() === "transparent") return { r: 0, g: 0, b: 0, a: 0 };

  const rgb = parseRgb(t);
  if (rgb) return rgb;

  const lab = parseOklab(t);
  if (lab) {
    return oklabToRgba(lab.L, lab.a, lab.b, lab.alpha);
  }

  const lch = parseOklch(t);
  if (lch) {
    const hRad = (lch.h * Math.PI) / 180;
    const a = lch.C * Math.cos(hRad);
    const b = lch.C * Math.sin(hRad);
    return oklabToRgba(lch.L, a, b, lch.alpha);
  }

  return null;
};

test("theme toggle stays coherent (no mixed white-canvas state)", async ({
  page,
}) => {
  await page.goto("/");

  await page.waitForFunction(() => {
    const header = document.querySelector(
      "header.header, .page > .header, .axm-starlight-header",
    );
    return Boolean(header);
  });

  const setTheme = async (theme: "light" | "dark" | "system") => {
    await page.evaluate((t) => {
      const root = document.documentElement;
      if (t === "system") root.removeAttribute("data-theme");
      else root.setAttribute("data-theme", t);
    }, theme);

    if (theme === "system") {
      await page.waitForFunction(() => {
        const v = document.documentElement.getAttribute("data-axm-mode");
        return v === "system";
      });
      await page.waitForFunction(() => {
        const v = document.documentElement.getAttribute(
          "data-axm-resolved-mode",
        );
        return v === "light" || v === "dark";
      });
    } else {
      await page.waitForFunction((t) => {
        return (
          document.documentElement.getAttribute("data-axm-resolved-mode") === t
        );
      }, theme);

      // Ensure CSS has actually applied the derived mode → --tau mapping.
      const expectedTau = theme === "dark" ? "-1" : "1";
      await page.waitForFunction((tau) => {
        const v = getComputedStyle(document.documentElement)
          .getPropertyValue("--tau")
          .trim();
        return v === tau;
      }, expectedTau);
    }
  };

  const snapshot = async () => {
    return page.evaluate(() => {
      const root = document.documentElement;
      const painted =
        (document.querySelector(".page.sl-flex") as HTMLElement | null) ||
        (document.querySelector(".axm-starlight-page") as HTMLElement | null) ||
        document.body;

      const style = getComputedStyle(painted);
      const rootStyle = getComputedStyle(root);
      return {
        mode: root.getAttribute("data-axm-mode"),
        resolved: root.getAttribute("data-axm-resolved-mode"),
        tau: rootStyle.getPropertyValue("--tau"),
        tauInline: root.style.getPropertyValue("--tau"),
        tauInlinePriority: root.style.getPropertyPriority("--tau"),
        modeMix: style.getPropertyValue("--_axm-mode-mix"),
        bg: style.backgroundColor,
        fg: style.color,
      };
    });
  };

  await setTheme("light");
  const light = await snapshot();

  await setTheme("dark");
  const dark = await snapshot();

  expect(
    light.tauInlinePriority,
    `unexpected inline tau priority: ${JSON.stringify(light)}`,
  ).not.toBe("important");
  expect(
    dark.tauInlinePriority,
    `unexpected inline tau priority: ${JSON.stringify(dark)}`,
  ).not.toBe("important");

  const lbg = parseToRgba(light.bg);
  const lfg = parseToRgba(light.fg);
  const dbg = parseToRgba(dark.bg);
  const dfg = parseToRgba(dark.fg);

  expect(lbg, `unparseable light bg: ${light.bg}`).not.toBeNull();
  expect(lfg, `unparseable light fg: ${light.fg}`).not.toBeNull();
  expect(dbg, `unparseable dark bg: ${dark.bg}`).not.toBeNull();
  expect(dfg, `unparseable dark fg: ${dark.fg}`).not.toBeNull();

  expect(lbg!.a).toBeGreaterThan(0.02);
  expect(dbg!.a).toBeGreaterThan(0.02);

  // Prevent "blank canvas" (fg ~= bg)
  expect(`${light.bg}/${light.fg}`).not.toBe(`${light.fg}/${light.bg}`);
  expect(`${dark.bg}/${dark.fg}`).not.toBe(`${dark.fg}/${dark.bg}`);

  // A real toggle should change at least the background.
  expect(
    dark.bg,
    `bg did not change; snapshots: ${JSON.stringify({ light, dark })}`,
  ).not.toBe(light.bg);
});
