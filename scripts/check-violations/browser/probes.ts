import { Rgba } from "./normalize.ts";
import type { MeasurementPlan, PaintProperty } from "./spec.ts";

export type MeasurementHost = {
  evaluate<T, A>(fn: (arg: A) => T | Promise<T>, arg: A): Promise<T>;
};

export type TimelineFrame = {
  t: number;
  tau: number;
  bySelector: Record<
    string,
    {
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
      borderRgba: string;
      borderLeftRgba: string;
      borderRightRgba: string;
      borderBottomRgba: string;
      outlineRgba: string;
    }
  >;
};

export type SnapsProbeResult = {
  transitionInfo: {
    transitionProperty: string;
    transitionDuration: string;
    transitionTimingFunction: string;
  };
  initialTheme: string | null;
  enterTransitionDetected: boolean;
  enterSamples: number[];
  variablesBefore: Record<string, string>;
  variablesAfterImmediate: Record<string, string>;
  frames: TimelineFrame[];
};

export type SnapEvent = {
  selector: string;
  property: PaintProperty;
  timeMs: number;
  tau: number;
  from: string;
  to: string;
  delta: number;
};

export type SnapPaintSample = {
  colorRgba: string;
  bgRgba: string;
  borderRgba: string;
  borderLeftRgba: string;
  borderRightRgba: string;
  borderBottomRgba: string;
  outlineRgba: string;
  borderLeftWidth: string;
  borderRightWidth: string;
  borderBottomWidth: string;
  outlineWidth: string;
  outlineStyle: string;
  outlineOffset: string;
  boxShadow: string;
};

export type SnapFrame = {
  t: number;
  tau: number;
  bySelector: Record<string, SnapPaintSample>;
};

export function findTauStableSnaps(
  frames: ReadonlyArray<SnapFrame>,
  options: { threshold: number; tauStableEpsilon: number },
): SnapEvent[] {
  const { threshold, tauStableEpsilon } = options;
  const snaps: SnapEvent[] = [];

  const getPaintValue = (
    frame: SnapFrame,
    selector: string,
    property: PaintProperty,
  ): string | null => {
    const sample = frame.bySelector[selector];
    if (!sample) return null;
    switch (property) {
      case "background-color":
        return sample.bgRgba;
      case "color":
        return sample.colorRgba;
      case "border-top-color":
        return sample.borderRgba;
      case "border-left-color":
        return sample.borderLeftRgba;
      case "border-right-color":
        return sample.borderRightRgba;
      case "border-bottom-color":
        return sample.borderBottomRgba;
      case "outline-color":
        return sample.outlineRgba;
      default:
        return null;
    }
  };

  const isColorLike = (property: PaintProperty): boolean => {
    return (
      property === "background-color" ||
      property === "color" ||
      property === "border-top-color" ||
      property === "border-left-color" ||
      property === "border-right-color" ||
      property === "border-bottom-color" ||
      property === "outline-color"
    );
  };

  // A "snap" is a large jump that then *stabilizes* quickly.
  // This avoids misclassifying the steep tail of an easing curve as a snap.
  const looksLikeStepThenStable = (
    startIndex: number,
    selector: string,
    property: PaintProperty,
    settledValue: string,
  ): boolean => {
    const lookaheadFrames = 4;
    const stableThreshold = 6;

    const available = frames.length - (startIndex + 1);
    if (available < 2) return false;

    let checked = 0;
    for (
      let j = 1;
      j <= lookaheadFrames && startIndex + j < frames.length;
      j++
    ) {
      const cur = frames[startIndex + j];
      const prev = frames[startIndex + j - 1];
      if (!cur || !prev) continue;

      const tau = Number.isFinite(cur.tau) ? cur.tau : 0;
      const prevTau = Number.isFinite(prev.tau) ? prev.tau : tau;
      if (Math.abs(tau - prevTau) > tauStableEpsilon) return false;

      const v = getPaintValue(cur, selector, property);
      if (!v) return false;

      if (Rgba.distance(settledValue, v) > stableThreshold) return false;
      checked++;
    }

    return checked >= 2;
  };

  for (let i = 1; i < frames.length; i++) {
    const prev = frames[i - 1];
    const cur = frames[i];
    if (!prev || !cur) continue;

    const tau = Number.isFinite(cur.tau) ? cur.tau : 0;
    const prevTau = Number.isFinite(prev.tau) ? prev.tau : tau;
    const tauStable = Math.abs(tau - prevTau) <= tauStableEpsilon;
    if (!tauStable) continue;

    for (const selector of Object.keys(cur.bySelector)) {
      const a = prev.bySelector[selector];
      const b = cur.bySelector[selector];
      if (!a || !b) continue;

      const push = (property: PaintProperty, from: string, to: string) => {
        const delta = Rgba.distance(from, to);
        if (delta > threshold) {
          if (isColorLike(property)) {
            // Only count it as a snap if it quickly settles.
            if (!looksLikeStepThenStable(i, selector, property, to)) return;
          }
          snaps.push({
            selector,
            property,
            timeMs: cur.t,
            tau,
            from,
            to,
            delta,
          });
        }
      };

      push("background-color", a.bgRgba, b.bgRgba);
      push("color", a.colorRgba, b.colorRgba);
      push("border-top-color", a.borderRgba, b.borderRgba);

      const aLeftW = Number.parseFloat(a.borderLeftWidth);
      const bLeftW = Number.parseFloat(b.borderLeftWidth);
      if (
        (Number.isFinite(aLeftW) && aLeftW > 0) ||
        (Number.isFinite(bLeftW) && bLeftW > 0)
      ) {
        push("border-left-color", a.borderLeftRgba, b.borderLeftRgba);
      }

      const aRightW = Number.parseFloat(a.borderRightWidth);
      const bRightW = Number.parseFloat(b.borderRightWidth);
      if (
        (Number.isFinite(aRightW) && aRightW > 0) ||
        (Number.isFinite(bRightW) && bRightW > 0)
      ) {
        push("border-right-color", a.borderRightRgba, b.borderRightRgba);
      }

      const aBottomW = Number.parseFloat(a.borderBottomWidth);
      const bBottomW = Number.parseFloat(b.borderBottomWidth);
      if (
        (Number.isFinite(aBottomW) && aBottomW > 0) ||
        (Number.isFinite(bBottomW) && bBottomW > 0)
      ) {
        push("border-bottom-color", a.borderBottomRgba, b.borderBottomRgba);
      }

      push("outline-color", a.outlineRgba, b.outlineRgba);

      const aOutlineW = Number.parseFloat(a.outlineWidth);
      const bOutlineW = Number.parseFloat(b.outlineWidth);
      if (
        Number.isFinite(aOutlineW) &&
        Number.isFinite(bOutlineW) &&
        Math.abs(aOutlineW - bOutlineW) > 0.25
      ) {
        snaps.push({
          selector,
          property: "outline-width",
          timeMs: cur.t,
          tau,
          from: a.outlineWidth,
          to: b.outlineWidth,
          delta: Math.abs(aOutlineW - bOutlineW),
        });
      }

      if (a.outlineStyle !== b.outlineStyle) {
        snaps.push({
          selector,
          property: "outline-style",
          timeMs: cur.t,
          tau,
          from: a.outlineStyle,
          to: b.outlineStyle,
          delta: 1,
        });
      }

      const aOutlineOffset = Number.parseFloat(a.outlineOffset);
      const bOutlineOffset = Number.parseFloat(b.outlineOffset);
      if (
        Number.isFinite(aOutlineOffset) &&
        Number.isFinite(bOutlineOffset) &&
        Math.abs(aOutlineOffset - bOutlineOffset) > 0.25
      ) {
        snaps.push({
          selector,
          property: "outline-offset",
          timeMs: cur.t,
          tau,
          from: a.outlineOffset,
          to: b.outlineOffset,
          delta: Math.abs(aOutlineOffset - bOutlineOffset),
        });
      }

      if (a.boxShadow !== b.boxShadow) {
        snaps.push({
          selector,
          property: "box-shadow",
          timeMs: cur.t,
          tau,
          from: a.boxShadow,
          to: b.boxShadow,
          delta: 1,
        });
      }

      const aBottomWidth = Number.parseFloat(a.borderBottomWidth);
      const bBottomWidth = Number.parseFloat(b.borderBottomWidth);
      if (
        Number.isFinite(aBottomWidth) &&
        Number.isFinite(bBottomWidth) &&
        Math.abs(aBottomWidth - bBottomWidth) > 0.25
      ) {
        snaps.push({
          selector,
          property: "border-bottom-width",
          timeMs: cur.t,
          tau,
          from: a.borderBottomWidth,
          to: b.borderBottomWidth,
          delta: Math.abs(aBottomWidth - bBottomWidth),
        });
      }
    }
  }

  return snaps;
}

export class Timeline {
  readonly frames: TimelineFrame[];

  constructor(frames: TimelineFrame[]) {
    this.frames = frames;
  }

  findTauStableSnaps(options: {
    threshold: number;
    tauStableEpsilon: number;
  }): SnapEvent[] {
    return findTauStableSnaps(this.frames as unknown as SnapFrame[], options);
  }
}

export class SnapsProbe {
  readonly plan: MeasurementPlan;

  constructor(plan: MeasurementPlan) {
    this.plan = plan;
  }

  async run(
    host: MeasurementHost,
    options: { snapsFocus: boolean },
  ): Promise<SnapsProbeResult> {
    return host.evaluate(snapsProbeBrowserMain, {
      plan: this.plan,
      snapsFocus: options.snapsFocus,
    });
  }
}

type BrowserArgs = {
  plan: MeasurementPlan;
  snapsFocus: boolean;
};

async function snapsProbeBrowserMain({
  plan,
  snapsFocus,
}: BrowserArgs): Promise<SnapsProbeResult> {
  const raf = async (): Promise<void> => {
    await new Promise((resolve) => requestAnimationFrame(resolve));
  };

  const root = document.documentElement;

  const readVar = (name: string): string =>
    getComputedStyle(root).getPropertyValue(name).trim();

  if (snapsFocus && plan.includeFocusProbeSelector) {
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

  document.getElementById("axiomatic-check-violations-no-motion")?.remove();

  const tmp = document.createElement("div");
  tmp.style.position = "fixed";
  tmp.style.left = "-9999px";
  tmp.style.top = "-9999px";
  tmp.style.width = "1px";
  tmp.style.height = "1px";
  // IMPORTANT: We cannot reliably observe the *interpolated* value of `--tau`
  // via `getComputedStyle(root).getPropertyValue("--tau")` during a transition;
  // browsers may report the target value even while the transition is still
  // in flight. Instead, we derive tau from an animatable real property.
  const tauCssVar = ["--", "tau"].join("");
  tmp.style.opacity = `calc((var(${tauCssVar}) + 1) / 2)`;
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

  const primarySelectors = plan.primarySelectors;
  const focusSelector = "[data-axiomatic-focus-probe]";
  const primary = [
    ...primarySelectors,
    ...(plan.includeFocusProbeSelector ? [focusSelector] : []),
  ]
    .map((selector) => ({ selector, el: document.querySelector(selector) }))
    .filter((x) => !!x.el) as Array<{ selector: string; el: Element }>;

  const all = Array.from(document.body.querySelectorAll("*"));
  const candidates: Array<{ selector: string; el: Element }> = [];

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

  const seen = new Set<Element>();
  const elements: Array<{ selector: string; el: Element }> = [];
  for (const entry of [...primary, ...candidates]) {
    if (seen.has(entry.el)) continue;
    seen.add(entry.el);
    elements.push(entry);
  }

  const transitionInfo = (() => {
    const cs = getComputedStyle(root);
    return {
      transitionProperty: cs.transitionProperty,
      transitionDuration: cs.transitionDuration,
      transitionTimingFunction: cs.transitionTimingFunction,
    };
  })();

  const initialTheme = root.getAttribute("data-theme");
  const readTau = (): number => {
    const raw = getComputedStyle(tmp).opacity;
    const op = Number.parseFloat(raw);
    if (!Number.isFinite(op)) return NaN;
    // Inverse of: opacity = (tau + 1) / 2
    return op * 2 - 1;
  };

  const enterSamples: number[] = [];
  for (let i = 0; i < 10; i++) {
    await raf();
    enterSamples.push(readTau());
  }

  let enterTransitionDetected = false;
  if (initialTheme === "dark" || initialTheme === "light") {
    const target = initialTheme === "dark" ? -1 : 1;
    const first = enterSamples.find((v) => Number.isFinite(v));
    const last = [...enterSamples].reverse().find((v) => Number.isFinite(v));
    if (
      first !== undefined &&
      last !== undefined &&
      Math.abs(first - target) > 0.1 &&
      Math.abs(last - target) < Math.abs(first - target) - 0.05
    ) {
      enterTransitionDetected = true;
    }
  }

  root.setAttribute("data-theme", "light");
  root.style.setProperty("--tau", "1");
  await raf();
  await raf();

  const variablesBefore: Record<string, string> = {};
  for (const name of plan.watchVars) variablesBefore[name] = readVar(name);

  const frames: TimelineFrame[] = [];

  const start = performance.now();

  const sampleFrame = (): TimelineFrame => {
    const now = performance.now();
    const tau = readTau();

    const bySelector: TimelineFrame["bySelector"] = {};

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
      const borderRgba = toRgbaString("background-color", borderTopColor);
      const borderLeftRgba = toRgbaString("background-color", borderLeftColor);
      const borderRightRgba = toRgbaString(
        "background-color",
        borderRightColor,
      );
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
        borderRgba,
        borderLeftRgba,
        borderRightRgba,
        borderBottomRgba,
        outlineRgba,
      };
    }

    return { t: now - start, tau, bySelector };
  };

  frames.push(sampleFrame());

  // Toggle + time-zero sample (mandatory).
  root.setAttribute("data-theme", "dark");
  root.style.setProperty("--tau", "-1");
  frames.push(sampleFrame());

  const variablesAfterImmediate: Record<string, string> = {};
  for (const name of plan.watchVars)
    variablesAfterImmediate[name] = readVar(name);

  // Continue sampling until tau reaches endpoint or we hit a frame cap.
  // Cap is derived from existing behavior (approx 180 frames) but can be extended later.
  let postEndpointFramesRemaining = 0;
  for (let i = 0; i < 180; i++) {
    await raf();
    frames.push(sampleFrame());

    const last = frames[frames.length - 1];
    if (postEndpointFramesRemaining > 0) {
      postEndpointFramesRemaining--;
      if (postEndpointFramesRemaining === 0) break;
      continue;
    }

    if (last && Number.isFinite(last.tau) && Math.abs(last.tau + 1) < 1e-3) {
      // Capture a few extra stable-endpoint frames so we can detect late
      // palette flips / constructed stylesheet changes that happen *after* tau
      // has reached its terminal value.
      postEndpointFramesRemaining = 12;
    }
  }

  tmp.remove();

  return {
    transitionInfo,
    initialTheme,
    enterTransitionDetected,
    enterSamples,
    variablesBefore,
    variablesAfterImmediate,
    frames,
  };
}
