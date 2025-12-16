import { Rgba } from "./normalize.ts";
import type { MeasurementHost } from "./probes.ts";
import type { MeasurementPlan, PaintProperty } from "./spec.ts";

export type SnapshotElementPaint = {
  // Raw computed
  color: string;
  backgroundColor: string;
  borderTopColor: string;
  borderLeftColor: string;
  borderLeftWidth: string;
  borderRightColor: string;
  borderRightWidth: string;
  borderBottomColor: string;
  borderBottomWidth: string;
  outlineColor: string;
  outlineWidth: string;
  outlineStyle: string;
  outlineOffset: string;
  boxShadow: string;

  // Normalized
  colorRgba: string;
  bgRgba: string;
  borderTopRgba: string;
  borderLeftRgba: string;
  borderRightRgba: string;
  borderBottomRgba: string;
  outlineRgba: string;
};

export type SnapshotRecord = {
  t: number;
  tau: number;
  theme: string | null;
  watchedVars: Record<string, string>;
  bySelector: Record<string, SnapshotElementPaint>;
};

export type SnapshotDiff = {
  selector: string;
  property: PaintProperty;
  from: string;
  to: string;
  delta: number;
};

export class Snapshot {
  readonly record: SnapshotRecord;

  constructor(record: SnapshotRecord) {
    this.record = record;
  }

  diff(other: Snapshot, options: { threshold: number }): SnapshotDiff[] {
    const diffs: SnapshotDiff[] = [];

    const pushColor = (
      selector: string,
      property: PaintProperty,
      a: string,
      b: string,
    ) => {
      const delta = Rgba.distance(a, b);
      if (delta > options.threshold) {
        diffs.push({ selector, property, from: a, to: b, delta });
      }
    };

    const pushNumber = (
      selector: string,
      property: PaintProperty,
      a: string,
      b: string,
      epsilon = 0.25,
    ) => {
      const aa = Number.parseFloat(a);
      const bb = Number.parseFloat(b);
      if (!Number.isFinite(aa) || !Number.isFinite(bb)) return;
      const delta = Math.abs(aa - bb);
      if (delta > epsilon) {
        diffs.push({ selector, property, from: a, to: b, delta });
      }
    };

    const allSelectors = new Set<string>([
      ...Object.keys(this.record.bySelector),
      ...Object.keys(other.record.bySelector),
    ]);

    for (const selector of allSelectors) {
      const a = this.record.bySelector[selector];
      const b = other.record.bySelector[selector];
      if (!a || !b) continue;

      pushColor(selector, "background-color", a.bgRgba, b.bgRgba);
      pushColor(selector, "color", a.colorRgba, b.colorRgba);
      pushColor(selector, "border-top-color", a.borderTopRgba, b.borderTopRgba);
      pushColor(
        selector,
        "border-left-color",
        a.borderLeftRgba,
        b.borderLeftRgba,
      );
      pushColor(
        selector,
        "border-right-color",
        a.borderRightRgba,
        b.borderRightRgba,
      );
      pushColor(
        selector,
        "border-bottom-color",
        a.borderBottomRgba,
        b.borderBottomRgba,
      );
      pushColor(selector, "outline-color", a.outlineRgba, b.outlineRgba);

      pushNumber(
        selector,
        "border-left-width",
        a.borderLeftWidth,
        b.borderLeftWidth,
      );
      pushNumber(
        selector,
        "border-right-width",
        a.borderRightWidth,
        b.borderRightWidth,
      );
      pushNumber(
        selector,
        "border-bottom-width",
        a.borderBottomWidth,
        b.borderBottomWidth,
      );
      pushNumber(selector, "outline-width", a.outlineWidth, b.outlineWidth);
      pushNumber(selector, "outline-offset", a.outlineOffset, b.outlineOffset);

      if (a.outlineStyle !== b.outlineStyle) {
        diffs.push({
          selector,
          property: "outline-style",
          from: a.outlineStyle,
          to: b.outlineStyle,
          delta: 1,
        });
      }

      if (a.boxShadow !== b.boxShadow) {
        diffs.push({
          selector,
          property: "box-shadow",
          from: a.boxShadow,
          to: b.boxShadow,
          delta: 1,
        });
      }
    }

    return diffs;
  }
}

export class SnapshotProbe {
  readonly plan: MeasurementPlan;

  constructor(plan: MeasurementPlan) {
    this.plan = plan;
  }

  async run(
    host: MeasurementHost,
    options: {
      targetSelector?: string;
      includeCandidates?: boolean;
      focusProbe?: boolean;
      freezeMotion?: boolean;
    } = {},
  ): Promise<SnapshotRecord> {
    return host.evaluate(snapshotProbeBrowserMain, {
      plan: this.plan,
      targetSelector: options.targetSelector ?? null,
      includeCandidates: options.includeCandidates ?? true,
      focusProbe: options.focusProbe ?? false,
      freezeMotion: options.freezeMotion ?? false,
    });
  }
}

type BrowserArgs = {
  plan: MeasurementPlan;
  targetSelector: string | null;
  includeCandidates: boolean;
  focusProbe: boolean;
  freezeMotion: boolean;
};

async function snapshotProbeBrowserMain({
  plan,
  targetSelector,
  includeCandidates,
  focusProbe,
  freezeMotion,
}: BrowserArgs): Promise<SnapshotRecord> {
  const start = performance.now();

  const raf = async (): Promise<void> => {
    await new Promise((resolve) => requestAnimationFrame(resolve));
  };

  const root = document.documentElement;

  const readTau = (): number => {
    const tauRaw = getComputedStyle(root).getPropertyValue("--tau").trim();
    const tau = Number.parseFloat(tauRaw);
    return Number.isFinite(tau) ? tau : NaN;
  };

  const readVar = (name: string): string =>
    getComputedStyle(root).getPropertyValue(name).trim();

  if (focusProbe && plan.includeFocusProbeSelector) {
    const candidate = document.querySelector(
      'starlight-theme-select select, .sl-markdown-content a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])',
    ) as HTMLElement | null;

    if (candidate) {
      candidate.setAttribute("data-axiomatic-focus-probe", "");
      try {
        candidate.focus({ preventScroll: true });
      } catch {
        // Ignore.
      }
    }
  }

  // Ensure we are in the intended motion state (deterministic snapshots).
  const noMotionId = "axiomatic-check-violations-no-motion";
  let injectedNoMotion = false;
  if (freezeMotion) {
    let style = document.getElementById(noMotionId) as HTMLStyleElement | null;
    if (!style) {
      style = document.createElement("style");
      style.id = noMotionId;
      document.head.appendChild(style);
      injectedNoMotion = true;
    }
    style.textContent = `
      * { transition: none !important; animation: none !important; }
      html, html[data-theme], :root, :root[data-theme] {
        transition: none !important;
        animation: none !important;
      }
    `;
  } else {
    document.getElementById(noMotionId)?.remove();
  }

  const tmp = document.createElement("div");
  tmp.style.position = "fixed";
  tmp.style.left = "-9999px";
  tmp.style.top = "-9999px";
  tmp.style.width = "1px";
  tmp.style.height = "1px";
  document.body.appendChild(tmp);

  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });

  const colorToRgba = (value: string): [number, number, number, number] => {
    if (!ctx) return [0, 0, 0, 0];
    ctx.clearRect(0, 0, 1, 1);
    ctx.globalAlpha = 1;

    try {
      ctx.fillStyle = value;
    } catch {
      return [0, 0, 0, 0];
    }

    ctx.fillRect(0, 0, 1, 1);
    const data = ctx.getImageData(0, 0, 1, 1).data;
    return [data[0] ?? 0, data[1] ?? 0, data[2] ?? 0, (data[3] ?? 0) / 255];
  };

  const toRgbaString = (
    kind: "color" | "background-color",
    value: string,
  ): string => {
    if (kind === "color") tmp.style.color = value;
    else tmp.style.backgroundColor = value;

    const cs = getComputedStyle(tmp);
    const raw = kind === "color" ? cs.color : cs.backgroundColor;
    const [r, g, b, a] = colorToRgba(raw);
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  };

  const parseAlpha = (rgbaString: string): number => {
    const m = rgbaString.match(/^rgba\(\d+, \d+, \d+, ([0-9.]+)\)$/);
    if (!m) return 1;
    return Number(m[1]);
  };

  const primary: Array<{ selector: string; el: Element }> = [];

  for (const selector of plan.primarySelectors) {
    const el = document.querySelector(selector);
    if (el) primary.push({ selector, el });
  }

  if (plan.includeFocusProbeSelector) {
    const el = document.querySelector("[data-axiomatic-focus-probe]");
    if (el) primary.push({ selector: "[data-axiomatic-focus-probe]", el });
  }

  if (targetSelector) {
    const el = document.querySelector(targetSelector);
    if (el) primary.push({ selector: targetSelector, el });
  }

  const candidates: Array<{ selector: string; el: Element }> = [];

  if (includeCandidates) {
    const all = Array.from(document.body.querySelectorAll("*"));

    for (const el of all) {
      if (!(el instanceof HTMLElement)) continue;
      if (el.tagName === "AXIOMATIC-DEBUGGER") continue;
      if (el.getClientRects().length === 0) continue;

      const cs = getComputedStyle(el);
      const bgRgba = toRgbaString("background-color", cs.backgroundColor);
      const a = parseAlpha(bgRgba);
      if (a < plan.visibleSampleAlphaCutoff) continue;

      const selector = el.id
        ? `#${CSS.escape(el.id)}`
        : el.classList.length > 0
          ? `${el.tagName.toLowerCase()}.${Array.from(el.classList)
              .slice(0, 2)
              .map((c) => CSS.escape(c))
              .join(".")}`
          : el.tagName.toLowerCase();

      candidates.push({ selector, el });
      if (candidates.length >= plan.elementCap) break;
    }
  }

  const seen = new Set<Element>();
  const elements: Array<{ selector: string; el: Element }> = [];

  for (const entry of [...primary, ...candidates]) {
    if (seen.has(entry.el)) continue;
    seen.add(entry.el);
    elements.push(entry);
  }

  // Allow one frame for style to settle.
  await raf();

  const now = performance.now();

  const bySelector: Record<string, SnapshotElementPaint> = {};

  for (const { selector, el } of elements) {
    const cs = getComputedStyle(el);

    const color = cs.color;
    const backgroundColor = cs.backgroundColor;
    const borderTopColor = cs.borderTopColor;
    const borderLeftColor = cs.borderLeftColor;
    const borderLeftWidth = cs.borderLeftWidth;
    const borderRightColor = cs.borderRightColor;
    const borderRightWidth = cs.borderRightWidth;
    const borderBottomColor = cs.borderBottomColor;
    const borderBottomWidth = cs.borderBottomWidth;
    const outlineColor = cs.outlineColor;
    const outlineWidth = cs.outlineWidth;
    const outlineStyle = cs.outlineStyle;
    const outlineOffset = cs.outlineOffset;
    const boxShadow = cs.boxShadow;

    const colorRgba = toRgbaString("color", color);
    const bgRgba = toRgbaString("background-color", backgroundColor);
    const borderTopRgba = toRgbaString("background-color", borderTopColor);
    const borderLeftRgba = toRgbaString("background-color", borderLeftColor);
    const borderRightRgba = toRgbaString("background-color", borderRightColor);
    const borderBottomRgba = toRgbaString(
      "background-color",
      borderBottomColor,
    );
    const outlineRgba = toRgbaString("background-color", outlineColor);

    bySelector[selector] = {
      color,
      backgroundColor,
      borderTopColor,
      borderLeftColor,
      borderLeftWidth,
      borderRightColor,
      borderRightWidth,
      borderBottomColor,
      borderBottomWidth,
      outlineColor,
      outlineWidth,
      outlineStyle,
      outlineOffset,
      boxShadow,
      colorRgba,
      bgRgba,
      borderTopRgba,
      borderLeftRgba,
      borderRightRgba,
      borderBottomRgba,
      outlineRgba,
    };
  }

  const watchedVars: Record<string, string> = {};
  for (const name of plan.watchVars) watchedVars[name] = readVar(name);

  const record: SnapshotRecord = {
    t: now - start,
    tau: readTau(),
    theme: root.getAttribute("data-theme"),
    watchedVars,
    bySelector,
  };

  tmp.remove();

  if (injectedNoMotion) {
    document.getElementById(noMotionId)?.remove();
  }

  return record;
}
