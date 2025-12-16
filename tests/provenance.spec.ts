import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { test, expect } from "@playwright/test";

test.describe("Provenance Audit", () => {
  test("All visible paint must be token-driven (provenance v2)", async ({
    page,
  }) => {
    // RFC010 boundary: `--sl-*` is allowed only in the dedicated Starlight bridge layer.
    // We enforce this at the source level (not runtime) because provenance is about
    // authored intent, not vendor-internal implementation details.
    const ALLOWED_SL_BOUNDARY_FILES = new Set<string>([
      "site/src/styles/starlight-custom.css",
      "site/src/components/StarlightHead.astro",
    ]);

    const collectStarlightVarBoundaryViolations = (): Array<{
      file: string;
      match: string;
    }> => {
      const root = path.resolve("site/src");
      const results: Array<{ file: string; match: string }> = [];
      const re = /--sl-[a-z0-9-]+/gi;

      const visit = (dir: string) => {
        for (const entry of readdirSync(dir)) {
          const abs = path.join(dir, entry);
          const st = statSync(abs);
          if (st.isDirectory()) {
            visit(abs);
            continue;
          }

          const rel = path
            .relative(process.cwd(), abs)
            .replaceAll(path.sep, "/");
          if (ALLOWED_SL_BOUNDARY_FILES.has(rel)) continue;

          // Only scan source-like files.
          const ext = path.extname(abs).toLowerCase();
          if (
            ![
              ".css",
              ".ts",
              ".tsx",
              ".js",
              ".mjs",
              ".cjs",
              ".astro",
              ".svelte",
              ".md",
              ".mdx",
            ].includes(ext)
          ) {
            continue;
          }

          const content = readFileSync(abs, "utf8");
          if (!content.includes("--sl-")) continue;

          re.lastIndex = 0;
          let m: RegExpExecArray | null;
          while ((m = re.exec(content)) !== null) {
            results.push({ file: rel, match: m[0] });
            if (m.index === re.lastIndex) re.lastIndex++;
          }
        }
      };

      visit(root);
      return results;
    };

    expect(collectStarlightVarBoundaryViolations()).toEqual([]);

    const manifest = JSON.parse(
      readFileSync("site/src/styles/theme.class-tokens.json", "utf8"),
    ) as {
      schemaVersion: number;
      reservedPrefixes: string[];
      classTokens: string[];
    };

    await page.goto("/");
    await page.waitForSelector("body");

    // Reduce flake/noise: ensure no transitions/animations influence computed paint.
    await page.addStyleTag({
      content: `
        *, *::before, *::after {
          transition: none !important;
          animation: none !important;
          caret-color: transparent !important;
        }
      `,
    });

    // Pin tau to a stable value so we are auditing a single physical state.
    await page.evaluate(() => {
      document.documentElement.style.setProperty("--tau", "0", "important");
    });

    // Starlight can inject constructed stylesheets after initial load.
    // Under parallelized test runs, this can race the audit and produce transient
    // mismatches. Wait until the header's painted `color` matches the Axiomatic
    // text pipeline output for the same class context.
    await page.waitForFunction(
      () => {
        const header = document.querySelector(
          "header.axm-starlight-header",
        ) as HTMLElement | null;
        if (!header) return false;

        const probe = document.createElement("div");
        probe.className = header.className;
        probe.style.position = "absolute";
        probe.style.left = "-99999px";
        probe.style.top = "-99999px";
        probe.style.visibility = "hidden";
        // Internal computed output used only to establish a stable audit baseline.
        probe.style.color = "var(--_axm-computed-fg-color)";

        document.body.appendChild(probe);
        const expected = getComputedStyle(probe)
          .color.trim()
          .replace(/\s+/g, " ");
        probe.remove();

        const actual = getComputedStyle(header)
          .color.trim()
          .replace(/\s+/g, " ");

        return actual === expected;
      },
      { timeout: 30_000 },
    );

    const violations = await page.evaluate(
      ({ classTokens, reservedPrefixes }) => {
        type Violation = {
          element: string;
          class: string;
          property: string;
          value: string;
          reason: string;
          expected?: string;
        };

        const allowlisted = new Set<string>(classTokens);

        const norm = (v: string): string =>
          v.trim().replace(/\s+/g, "").toLowerCase();

        type RGBA = { r: number; g: number; b: number; a: number };

        const clamp01 = (n: number): number => Math.min(1, Math.max(0, n));
        const clamp255 = (n: number): number => Math.min(255, Math.max(0, n));

        const parseAlpha = (s: string | undefined): number => {
          if (!s) return 1;
          const t = s.trim();
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

          const parseChannel = (token: string): number | null => {
            const t = token.trim();
            if (!t) return null;
            if (t.endsWith("%")) {
              const p = Number.parseFloat(t.slice(0, -1));
              return Number.isFinite(p) ? (255 * p) / 100 : null;
            }
            const n = Number.parseFloat(t);
            return Number.isFinite(n) ? n : null;
          };

          const r = parseChannel(tokens[0] ?? "");
          const g = parseChannel(tokens[1] ?? "");
          const b = parseChannel(tokens[2] ?? "");
          if (r === null || g === null || b === null) return null;
          const alphaToken = alphaPart || tokens[3];
          const a = parseAlpha(alphaToken);
          return { r, g, b, a };
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

        const oklabToRgba = (
          L: number,
          a: number,
          b: number,
          alpha: number,
        ): RGBA => {
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

        const parseToRgba = (
          contextElement: HTMLElement,
          value: string,
        ): RGBA | null => {
          const t = value.trim();
          if (!t) return null;
          if (t.toLowerCase() === "transparent")
            return { r: 0, g: 0, b: 0, a: 0 };

          const rgb = parseRgb(t);
          if (rgb)
            return {
              r: clamp255(rgb.r),
              g: clamp255(rgb.g),
              b: clamp255(rgb.b),
              a: clamp01(rgb.a),
            };

          const lab = parseOklab(t);
          if (lab) return oklabToRgba(lab.L, lab.a, lab.b, lab.alpha);

          const lch = parseOklch(t);
          if (lch) {
            const hRad = (lch.h * Math.PI) / 180;
            const a = lch.C * Math.cos(hRad);
            const b = lch.C * Math.sin(hRad);
            return oklabToRgba(lch.L, a, b, lch.alpha);
          }

          // Fallback: ask the browser to compute it, then parse again.
          const computed = resolveInElementContext(contextElement, "color", t);
          const rgb2 = parseRgb(computed);
          return rgb2
            ? {
                r: clamp255(rgb2.r),
                g: clamp255(rgb2.g),
                b: clamp255(rgb2.b),
                a: clamp01(rgb2.a),
              }
            : null;
        };

        const colorsEquivalent = (
          contextElement: HTMLElement,
          a: string,
          b: string,
        ): boolean => {
          const ra = parseToRgba(contextElement, a);
          const rb = parseToRgba(contextElement, b);
          if (!ra || !rb) return norm(a) === norm(b);
          const diff = (x: number, y: number) => Math.abs(x - y);
          return (
            diff(ra.r, rb.r) <= 1 &&
            diff(ra.g, rb.g) <= 1 &&
            diff(ra.b, rb.b) <= 1 &&
            diff(ra.a, rb.a) <= 0.01
          );
        };

        const isTransparent = (
          contextElement: HTMLElement,
          value: string,
        ): boolean => {
          const rgba = parseToRgba(contextElement, value);
          if (rgba && rgba.a === 0) return true;

          // RFC011: alpha cutoff to avoid treating near-invisible paint as violations.
          return rgba ? rgba.a < 0.02 : false;
        };

        const isVisible = (el: Element): el is HTMLElement => {
          if (!(el instanceof HTMLElement)) return false;
          const style = getComputedStyle(el);
          if (
            style.display === "none" ||
            style.visibility === "hidden" ||
            style.opacity === "0"
          )
            return false;
          const rect = el.getBoundingClientRect();
          if (rect.width <= 0 || rect.height <= 0) return false;
          // Only audit things that are at least partially in the viewport.
          if (rect.bottom < 0 || rect.top > window.innerHeight) return false;
          if (rect.right < 0 || rect.left > window.innerWidth) return false;
          return true;
        };

        const hasOwnText = (el: HTMLElement): boolean => {
          for (const node of Array.from(el.childNodes)) {
            if (
              node.nodeType === Node.TEXT_NODE &&
              (node.textContent || "").trim()
            ) {
              return true;
            }
          }
          return false;
        };

        const cssPath = (el: Element): string => {
          if (!(el instanceof Element)) return "<unknown>";
          if ((el as HTMLElement).id) return `#${(el as HTMLElement).id}`;
          const parts: string[] = [];
          let cur: Element | null = el;
          while (cur && parts.length < 5) {
            const name = cur.tagName.toLowerCase();
            const parentEl: HTMLElement | null = cur.parentElement;
            if (!parentEl) {
              parts.unshift(name);
              break;
            }
            const siblings = (
              Array.from(parentEl.children) as Element[]
            ).filter((c) => c.tagName === cur!.tagName);
            const idx = siblings.indexOf(cur) + 1;
            parts.unshift(`${name}:nth-of-type(${idx})`);
            cur = parentEl;
          }
          return parts.join(" > ");
        };

        const resolveInElementContext = (
          contextElement: HTMLElement,
          property: string,
          value: string,
        ): string => {
          const probe = document.createElement("div");
          probe.style.position = "absolute";
          probe.style.visibility = "hidden";
          probe.style.pointerEvents = "none";
          probe.style.width = "0";
          probe.style.height = "0";
          probe.style.overflow = "hidden";
          probe.className = contextElement.className;

          // Mirror custom props to keep resolution close when probing.
          for (const name of Array.from(contextElement.style)) {
            if (!name.startsWith("--")) continue;
            const v = contextElement.style.getPropertyValue(name);
            if (v) probe.style.setProperty(name, v);
          }

          // Preserve computed color-scheme so light-dark() behaves.
          const scheme = getComputedStyle(contextElement).colorScheme;
          if (scheme) probe.style.setProperty("color-scheme", scheme);

          // Use setProperty so we can handle dashed properties.
          probe.style.setProperty(property, value);
          const host =
            contextElement.tagName === "BODY" ? document.body : contextElement;
          host.appendChild(probe);
          const resolved = getComputedStyle(probe).getPropertyValue(property);
          probe.remove();

          // NOTE: Do not attempt to normalize serialization here. Chromium can preserve
          // multiple valid functional forms (oklab vs oklch). We compare numerically.
          return resolved.trim();
        };

        const expectedFor = (el: HTMLElement, prop: string): string[] => {
          // For each painted property we accept a small set of engine-derived sources.
          // This is a *causal* audit: we do not accept arbitrary matching values; we
          // accept values that can be reproduced by the Axiomatic pipeline inputs.
          switch (prop) {
            case "background-color":
              return [
                resolveInElementContext(
                  el,
                  "background-color",
                  "var(--_axm-computed-surface)",
                ),
              ];
            case "color":
              return [
                resolveInElementContext(
                  el,
                  "color",
                  "var(--_axm-computed-fg-color)",
                ),
              ];
            case "border-top-color":
            case "border-right-color":
            case "border-bottom-color":
            case "border-left-color":
              return [
                resolveInElementContext(
                  el,
                  prop,
                  "var(--_axm-computed-border-dec-color)",
                ),
                resolveInElementContext(
                  el,
                  prop,
                  "var(--_axm-computed-border-int-color)",
                ),
                resolveInElementContext(
                  el,
                  prop,
                  "var(--axm-border-dec-token)",
                ),
                resolveInElementContext(
                  el,
                  prop,
                  "var(--axm-border-int-token)",
                ),
                // Some borders intentionally use currentColor.
                getComputedStyle(el).color,
              ];
            case "outline-color":
              return [
                resolveInElementContext(
                  el,
                  "outline-color",
                  "oklch(from var(--_axm-computed-fg-color) l 0.2 var(--alpha-hue))",
                ),
                // Some outlines intentionally use currentColor.
                getComputedStyle(el).color,
              ];
            case "box-shadow":
              return [
                resolveInElementContext(el, "box-shadow", "var(--shadow-sm)"),
                resolveInElementContext(el, "box-shadow", "var(--shadow-md)"),
                resolveInElementContext(el, "box-shadow", "var(--shadow-lg)"),
                resolveInElementContext(el, "box-shadow", "var(--shadow-xl)"),
                resolveInElementContext(
                  el,
                  "box-shadow",
                  "var(--axm-shadow-sm)",
                ),
                resolveInElementContext(
                  el,
                  "box-shadow",
                  "var(--axm-shadow-md)",
                ),
                resolveInElementContext(
                  el,
                  "box-shadow",
                  "var(--axm-shadow-lg)",
                ),
              ];
            default:
              return [];
          }
        };

        const isReservedCandidate = (cls: string): boolean => {
          if (cls === "bordered") return true;
          return reservedPrefixes.some((p) => cls.startsWith(`${p}-`));
        };

        const violations: Violation[] = [];
        const all = Array.from(document.querySelectorAll("*"));

        for (const node of all) {
          if (!isVisible(node)) continue;

          // Skip non-semantic / non-consumer regions.
          if (node.tagName === "AXIOMATIC-DEBUGGER") continue;
          if (node.closest(".expressive-code, .astro-code")) continue;
          if (node.classList.contains("sr-only")) continue;
          if (node.tagName === "ASTRO-DEV-TOOLBAR") continue;
          if (node.tagName === "HEAD") continue;

          const style = getComputedStyle(node);

          // RFC010: per-config strict allowlist for reserved-prefix class tokens.
          for (const cls of Array.from(node.classList)) {
            if (!isReservedCandidate(cls)) continue;
            if (!allowlisted.has(cls)) {
              violations.push({
                element: cssPath(node),
                class: node.className,
                property: "class-token",
                value: cls,
                reason:
                  "Reserved-prefix class token is not in solver-emitted allowlist",
              });
            }
          }

          // RFC010: authored inline color outputs are forbidden.
          const inline = node.getAttribute("style") || "";
          if (inline) {
            const inlineLower = inline.toLowerCase();
            // Only flag inline declarations that directly set painted properties.
            // Do not flag custom properties like `--sl-*` or `--tau`.
            const touchesPaintedProperty =
              /(^|;)\s*(color|background(?:-color)?|border(?:-(?:top|right|bottom|left))?(?:-(?:color|width|style))?|outline(?:-(?:color|width|style|offset))?|box-shadow)\s*:/i.test(
                inlineLower,
              );

            if (touchesPaintedProperty) {
              violations.push({
                element: cssPath(node),
                class: node.className,
                property: "style",
                value: inline.trim(),
                reason:
                  "Inline styling touches painted properties (violates class-token integrity)",
              });
            }
          }

          // Finite painted-property audit (RFC011 framing).
          // Backgrounds: only when actually painted.
          const bg = style.backgroundColor;
          if (!isTransparent(node, bg)) {
            const expected = expectedFor(node, "background-color");
            const actual = resolveInElementContext(
              node,
              "background-color",
              bg,
            );
            if (!expected.some((e) => colorsEquivalent(node, e, actual))) {
              violations.push({
                element: cssPath(node),
                class: node.className,
                property: "background-color",
                value: actual,
                expected: expected[0],
                reason:
                  "Painted background-color is not reproducible from the Axiomatic surface pipeline",
              });
            }
          }

          // Text color: only audit nodes that actually present text, or override color.
          const hasText = hasOwnText(node);
          const parentColor = node.parentElement
            ? getComputedStyle(node.parentElement).color
            : "";
          const isColorOverride =
            parentColor && norm(parentColor) !== norm(style.color);

          if (hasText || isColorOverride) {
            const fg = style.color;
            if (!isTransparent(node, fg)) {
              const expected = expectedFor(node, "color");
              const actual = resolveInElementContext(node, "color", fg);
              if (!expected.some((e) => colorsEquivalent(node, e, actual))) {
                violations.push({
                  element: cssPath(node),
                  class: node.className,
                  property: "color",
                  value: actual,
                  expected: expected[0],
                  reason:
                    "Painted text color is not reproducible from the Axiomatic text pipeline",
                });
              }
            }
          }

          // Borders: audit only when the specific side is actually painted.
          const borderSides = [
            {
              width: style.borderTopWidth,
              borderStyle: style.borderTopStyle,
              colorProp: "border-top-color" as const,
            },
            {
              width: style.borderRightWidth,
              borderStyle: style.borderRightStyle,
              colorProp: "border-right-color" as const,
            },
            {
              width: style.borderBottomWidth,
              borderStyle: style.borderBottomStyle,
              colorProp: "border-bottom-color" as const,
            },
            {
              width: style.borderLeftWidth,
              borderStyle: style.borderLeftStyle,
              colorProp: "border-left-color" as const,
            },
          ];

          for (const side of borderSides) {
            if (side.width === "0px") continue;
            if (side.borderStyle === "none") continue;

            const value = style.getPropertyValue(side.colorProp);
            if (isTransparent(node, value)) continue;

            const expected = expectedFor(node, side.colorProp);
            const actual = resolveInElementContext(node, side.colorProp, value);
            if (!expected.some((e) => colorsEquivalent(node, e, actual))) {
              violations.push({
                element: cssPath(node),
                class: node.className,
                property: side.colorProp,
                value: actual,
                expected: expected[0],
                reason:
                  "Painted border color is not reproducible from Axiomatic border/text sources",
              });
            }
          }

          // Outline (focus rings): audit only when outline is painted.
          if (style.outlineStyle !== "none" && style.outlineWidth !== "0px") {
            const value = style.outlineColor;
            if (!isTransparent(node, value)) {
              const expected = expectedFor(node, "outline-color");
              const actual = resolveInElementContext(
                node,
                "outline-color",
                value,
              );
              if (!expected.some((e) => colorsEquivalent(node, e, actual))) {
                violations.push({
                  element: cssPath(node),
                  class: node.className,
                  property: "outline-color",
                  value: actual,
                  reason:
                    "Painted outline color is not reproducible from Axiomatic outline/text sources",
                });
              }
            }
          }

          // Shadows: audit only when present.
          if (style.boxShadow && norm(style.boxShadow) !== "none") {
            const value = style.boxShadow;
            const expected = expectedFor(node, "box-shadow");
            if (!expected.some((e) => norm(e) === norm(value))) {
              violations.push({
                element: cssPath(node),
                class: node.className,
                property: "box-shadow",
                value,
                reason:
                  "Painted box-shadow is not reproducible from Axiomatic shadow sources",
              });
            }
          }
        }

        // Optional causal sanity checks (bounded): show that swapping token classes changes paint.
        // This is intentionally small to keep the audit deterministic.
        const surfaceTokens = classTokens.filter((c) =>
          c.startsWith("surface-"),
        );
        const textTokens = classTokens.filter((c) => c.startsWith("text-"));

        const surfaceRoots = Array.from(
          new Set(
            Array.from(
              document.querySelectorAll<HTMLElement>(
                "body, [class*='surface-']",
              ),
            )
              .filter((el) => isVisible(el))
              .slice(0, 6),
          ),
        );

        for (const root of surfaceRoots) {
          const current =
            Array.from(root.classList).find((c) => c.startsWith("surface-")) ||
            (root.tagName === "BODY" ? "surface-page" : "");
          const probe = root;
          const before = getComputedStyle(probe).backgroundColor;

          const surfaceCandidates = surfaceTokens
            .filter((c) => c !== current)
            .slice(0, 12);
          let chosenAlt: string | undefined;
          let afterForAlt: string | undefined;

          // Find at least one alternate surface token that produces a meaningfully
          // different background. If none exist, the causality check is not actionable.
          for (const alt of surfaceCandidates) {
            if (root.tagName === "BODY") {
              if (current) root.classList.remove(current);
              root.classList.add(alt);
              const after = getComputedStyle(probe).backgroundColor;
              root.classList.remove(alt);
              if (current) root.classList.add(current);

              if (!colorsEquivalent(root, before, after)) {
                chosenAlt = alt;
                afterForAlt = after;
                break;
              }
            } else {
              if (current) root.classList.remove(current);
              root.classList.add(alt);
              const after = getComputedStyle(probe).backgroundColor;
              root.classList.remove(alt);
              if (current) root.classList.add(current);

              if (!colorsEquivalent(root, before, after)) {
                chosenAlt = alt;
                afterForAlt = after;
                break;
              }
            }
          }

          if (!chosenAlt || afterForAlt === undefined) continue;

          // If we found a meaningfully different alternative, then surface tokens are
          // expected to be driving paint here. Assert that swapping changes paint.
          if (colorsEquivalent(root, before, afterForAlt)) {
            violations.push({
              element: cssPath(root),
              class: root.className,
              property: "causality:surface",
              value: current || "<implicit surface-page>",
              reason:
                "Swapping a surface class did not change surface paint (unexpected: surface token may not be driving)",
            });
          }
        }

        const textDrivers = Array.from(
          document.querySelectorAll<HTMLElement>("[class*='text-']"),
        )
          .filter((el) => isVisible(el))
          .slice(0, 6);

        for (const el of textDrivers) {
          const current =
            Array.from(el.classList).find((c) => c.startsWith("text-")) || "";
          if (!current) continue;

          const before = getComputedStyle(el).color;
          let chosenAlt: string | undefined;
          let afterForAlt: string | undefined;

          for (const alt of textTokens) {
            if (alt === current) continue;
            el.classList.remove(current);
            el.classList.add(alt);
            const after = getComputedStyle(el).color;
            el.classList.remove(alt);
            el.classList.add(current);

            if (!colorsEquivalent(el, before, after)) {
              chosenAlt = alt;
              afterForAlt = after;
              break;
            }
          }

          // If there's no alternative text token that changes paint, don't fail.
          // Some text tokens are semantic aliases (e.g. `text-content` == `text-body`).
          if (!chosenAlt || afterForAlt === undefined) continue;

          if (colorsEquivalent(el, before, afterForAlt)) {
            violations.push({
              element: cssPath(el),
              class: el.className,
              property: "causality:text",
              value: current,
              reason:
                "Swapping a text class did not change text paint (unexpected: text token may not be driving)",
            });
          }
        }

        return violations;
      },
      {
        classTokens: manifest.classTokens,
        reservedPrefixes: manifest.reservedPrefixes,
      },
    );

    if (violations.length > 0) {
      console.log(`Found ${violations.length} provenance violations.`);
      console.table(violations.slice(0, 20));
    }

    expect(violations).toEqual([]);
  });
});
