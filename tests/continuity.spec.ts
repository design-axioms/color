import { expect, test } from "@playwright/test";
import { converter } from "culori";

const toRgb = converter("rgb");

function colorsVisuallyEqual(a: string, b: string): boolean {
  const aa = a.trim();
  const bb = b.trim();

  if (aa === bb) return true;

  const isTransparent = (v: string): boolean =>
    v === "transparent" || v === "rgba(0, 0, 0, 0)";
  if (isTransparent(aa) && isTransparent(bb)) return true;

  const ra = toRgb(aa);
  const rb = toRgb(bb);
  if (!ra || !rb) return false;

  const eps = 1e-6;
  const eq = (x: number | undefined, y: number | undefined): boolean => {
    if (x === undefined && y === undefined) return true;
    if (x === undefined || y === undefined) return false;
    return Math.abs(x - y) <= eps;
  };

  return (
    eq(ra.r, rb.r) && eq(ra.g, rb.g) && eq(ra.b, rb.b) && eq(ra.alpha, rb.alpha)
  );
}

test.describe("Continuity Audit", () => {
  test("No visual snapping when toggling theme (Continuity Check)", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForSelector("body");

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
          !!el &&
          Array.from(el.classList).some((c) => c.startsWith("surface-"));

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

        // Theme toggling is animated (~600ms). Wait for the endpoint sync.
        await page.waitForTimeout(700);
      }

      const now = await page.evaluate(() =>
        document.documentElement.getAttribute("data-theme"),
      );
      throw new Error(
        `Failed to set theme mode via ThemeManager. Expected '${mode}', got '${now}'.`,
      );
    };

    // 1. Freeze Time (Set tau to 0)
    // We force tau to 0 so we are in the "middle" of the transition.
    // If the theme toggle causes a snap, it means the variables themselves changed value
    // or the element swapped variables.
    await page.evaluate(() => {
      // Disable transitions BEFORE setting `--tau`.
      // `--tau` is a registered custom property and is transitioned in `css/engine.css`.
      // If we set it first, the browser may start animating toward `0`, and
      // `getComputedStyle()` will see an in-between value.
      const style = document.createElement("style");
      style.innerHTML = `
        *, :root {
          transition: none !important;
          animation: none !important;
        }

        /* Override Starlight chrome rules that set transition: ... !important; */
        :root .page.sl-flex.axm-starlight-page,
        :root .page.sl-flex > .header.axm-starlight-header,
        :root .page.sl-flex > .header.axm-starlight-header.axm-starlight-header {
          transition: none !important;
          animation: none !important;
        }
      `;
      document.head.appendChild(style);

      document.documentElement.style.setProperty("--tau", "0", "important");
    });

    await page.waitForFunction(() => {
      const root = document.documentElement;
      const body = document.body;
      const tauRoot = getComputedStyle(root).getPropertyValue("--tau").trim();
      const tauBody = body
        ? getComputedStyle(body).getPropertyValue("--tau").trim()
        : null;
      return tauRoot === "0" && (tauBody === null || tauBody === "0");
    });

    const tauLock = await page.evaluate(() => {
      const root = document.documentElement;
      return {
        inlineValue: root.style.getPropertyValue("--tau").trim(),
        inlinePriority: root.style.getPropertyPriority("--tau"),
        computedValue: getComputedStyle(root).getPropertyValue("--tau").trim(),
      };
    });
    expect(tauLock.inlinePriority).toBe("important");
    expect(tauLock.inlineValue).toBe("0");

    // 2. Capture State A (Light Mode + Tau=0)
    await setThemeModeViaThemeManager("light");

    // Sanity: tau lock must still be active after any theme manager work.
    const tauAfterLight = await page.evaluate(() => {
      const root = document.documentElement;
      const body = document.body;
      const sampleSurface = document.querySelector(
        ".surface-page",
      ) as HTMLElement | null;
      return {
        inlineValue: root.style.getPropertyValue("--tau").trim(),
        inlinePriority: root.style.getPropertyPriority("--tau"),
        computedValue: getComputedStyle(root).getPropertyValue("--tau").trim(),
        bodyComputed: body
          ? getComputedStyle(body).getPropertyValue("--tau").trim()
          : null,
        surfaceComputed: sampleSurface
          ? getComputedStyle(sampleSurface).getPropertyValue("--tau").trim()
          : null,
      };
    });
    expect(tauAfterLight.inlinePriority).toBe("important");
    expect(tauAfterLight.inlineValue).toBe("0");
    expect(tauAfterLight.bodyComputed).toBe("0");
    if (tauAfterLight.surfaceComputed !== null) {
      expect(tauAfterLight.surfaceComputed).toBe("0");
    }

    const stateA = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll("*"));

      const cssPath = (el: Element): string => {
        const parts: string[] = [];
        let node: Element | null = el;
        while (
          node &&
          node.nodeType === 1 &&
          node !== document.documentElement
        ) {
          const tag = node.tagName.toLowerCase();
          const parentEl: HTMLElement | null = node.parentElement;
          if (!parentEl) {
            parts.push(tag);
            break;
          }
          const siblings = (Array.from(parentEl.children) as Element[]).filter(
            (c) => c.tagName === node!.tagName,
          );
          const index = siblings.indexOf(node) + 1;
          parts.push(`${tag}:nth-of-type(${index})`);
          node = parentEl;
        }
        parts.push("html");
        return parts.reverse().join(" > ");
      };

      // Assign stable ids so DOM insertions during theme toggles don't cause
      // false positives from index-based comparisons.
      for (let i = 0; i < elements.length; i += 1) {
        const el = elements[i];
        if (!el) continue;
        if (!el.hasAttribute("data-axm-continuity-id")) {
          el.setAttribute("data-axm-continuity-id", String(i));
        }
      }

      return elements.map((el) => {
        const style = getComputedStyle(el);
        return {
          id: el.getAttribute("data-axm-continuity-id"),
          path: cssPath(el),
          tag: el.tagName,
          class: el.getAttribute("class") ?? "",
          bg: style.backgroundColor,
          color: style.color,
          border: style.borderColor,
        };
      });
    });

    // 3. Toggle Theme (Dark Mode + Tau=0)
    await setThemeModeViaThemeManager("dark");

    const tauAfterThemeToggle = await page.evaluate(() => {
      const root = document.documentElement;
      return {
        inlineValue: root.style.getPropertyValue("--tau").trim(),
        inlinePriority: root.style.getPropertyPriority("--tau"),
        computedValue: getComputedStyle(root).getPropertyValue("--tau").trim(),
      };
    });
    expect(tauAfterThemeToggle.inlinePriority).toBe("important");
    expect(tauAfterThemeToggle.inlineValue).toBe("0");

    // 4. Capture State B
    const stateB = await page.evaluate(() => {
      const elements = Array.from(
        document.querySelectorAll("[data-axm-continuity-id]"),
      );

      const cssPath = (el: Element): string => {
        const parts: string[] = [];
        let node: Element | null = el;
        while (
          node &&
          node.nodeType === 1 &&
          node !== document.documentElement
        ) {
          const tag = node.tagName.toLowerCase();
          const parentEl: HTMLElement | null = node.parentElement;
          if (!parentEl) {
            parts.push(tag);
            break;
          }
          const siblings = (Array.from(parentEl.children) as Element[]).filter(
            (c) => c.tagName === node!.tagName,
          );
          const index = siblings.indexOf(node) + 1;
          parts.push(`${tag}:nth-of-type(${index})`);
          node = parentEl;
        }
        parts.push("html");
        return parts.reverse().join(" > ");
      };

      return elements.map((el) => {
        const style = getComputedStyle(el);
        return {
          id: el.getAttribute("data-axm-continuity-id"),
          path: cssPath(el),
          tag: el.tagName,
          class: el.getAttribute("class") ?? "",
          bg: style.backgroundColor,
          color: style.color,
          border: style.borderColor,
        };
      });
    });

    // 5. Compare
    // In a perfect Axiomatic system, if tau is constant, the theme attribute
    // should NOT change the visual appearance. The theme attribute only drives tau.
    // If changing the attribute changes the color, it means we have a "Leak".
    const byIdB = new Map<string, (typeof stateB)[number]>();
    for (const b of stateB) {
      if (b?.id) byIdB.set(b.id, b);
    }

    let violations = 0;
    for (const a of stateA) {
      if (!a?.id) continue;
      const b = byIdB.get(a.id);
      if (!b) continue;

      // Ignore transparent backgrounds as they are often noisy or irrelevant
      if (a.bg === "rgba(0, 0, 0, 0)" && b.bg === "rgba(0, 0, 0, 0)") continue;

      if (!colorsVisuallyEqual(a.bg, b.bg)) {
        console.log(
          `Violation [BG]: ${a.path} <${a.tag} class="${a.class}"> snapped from ${a.bg} to ${b.bg}`,
        );
        violations++;
      }
      if (!colorsVisuallyEqual(a.color, b.color)) {
        console.log(
          `Violation [FG]: ${a.path} <${a.tag} class="${a.class}"> snapped from ${a.color} to ${b.color}`,
        );
        violations++;
      }
    }

    expect(violations).toBe(0);
  });
});
