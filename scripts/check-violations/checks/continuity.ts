import type { CheckViolationsSession } from "../session.ts";
import type { CheckViolationsCliOptions } from "../cli.ts";
import type { ObservationLog, RunConfig } from "../observation-log.ts";
import type { CheckAnalyzeResult, CheckModule } from "./types.ts";
import { asObservationLog, findLastEvent } from "./log-utils.ts";

export type ContinuityScenarioOptions = {
  runConfig: RunConfig;
};

export type ContinuityAnalyzeOptions = {
  printDebug: boolean;
};

export type ContinuityReport =
  | { kind: "missing" }
  | {
      kind: "continuity";
      debug: ContinuityDebug | null;
      violations: ContinuityRow[];
    };

export type ContinuityRow = {
  Tag: string;
  ID: string;
  Classes: string;
  Reason: string;
};

type ContinuityDebug = unknown;

function analyzeContinuityFromLog(
  log: ObservationLog,
  analyzeOptions: ContinuityAnalyzeOptions,
): CheckAnalyzeResult<ContinuityReport> {
  const ev = findLastEvent(log, "measure:continuity");
  if (!ev) {
    return {
      ok: false,
      reason: "continuity",
      details: {
        message: "No measure:continuity event found in ObservationLog.",
      },
      report: { kind: "missing" },
    };
  }

  const violations = (ev.result.violations ?? []) as ContinuityRow[];
  const report: ContinuityReport = {
    kind: "continuity",
    debug: analyzeOptions.printDebug
      ? (ev.result.debug as ContinuityDebug)
      : null,
    violations,
  };

  if (violations.length === 0) return { ok: true, report };
  return { ok: false, reason: "continuity", details: violations, report };
}

export const continuityCheck: CheckModule<
  CheckViolationsSession,
  ContinuityScenarioOptions,
  CheckViolationsCliOptions,
  RunConfig,
  ContinuityAnalyzeOptions,
  ContinuityReport
> = {
  name: "continuity",

  scenarioOptions: ({ runConfig }) => ({ runConfig }),

  analyzeOptions: () => ({ printDebug: true }),

  print(result): void {
    if (result.report.kind === "missing") {
      if (!result.ok) console.log(JSON.stringify(result.details, null, 2));
      return;
    }

    if (result.report.debug !== null) {
      console.log("Continuity debug (computed):");
      console.log(JSON.stringify(result.report.debug, null, 2));
    }

    if (result.report.violations.length === 0) {
      console.log("✅ No Continuity Violations found.");
      return;
    }

    console.log(
      `🚫 Continuity Violations Detected (${result.report.violations.length})`,
    );
    console.log(JSON.stringify(result.report.violations, null, 2));
  },

  async scenario(ctx, options): Promise<void> {
    const { session } = ctx;

    const debug = await session.page.evaluate(async () => {
      const raf2 = async (): Promise<void> => {
        await new Promise((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(resolve)),
        );
      };

      const snapshot = (el: Element | null) => {
        if (!el) return null;
        const cs = getComputedStyle(el);
        return {
          tau: cs.getPropertyValue("--tau").trim(),
          modeMix: cs.getPropertyValue("--_axm-mode-mix").trim(),
          axmSurfaceToken: cs.getPropertyValue("--axm-surface-token").trim(),
          axmComputedSurface: cs
            .getPropertyValue("--_axm-computed-surface")
            .trim(),
          backgroundColor: cs.backgroundColor,
        };
      };

      const root = document.documentElement;

      // Mirror ContinuityChecker setup but also capture key computed values.
      const style = document.createElement("style");
      style.innerHTML = `
        * { transition: none !important; animation: none !important; }
        html, html[data-theme], :root, :root[data-theme] {
          transition: none !important;
          animation: none !important;
        }
      `;
      document.head.appendChild(style);
      await raf2();

      const computedTau0 = getComputedStyle(root)
        .getPropertyValue("--tau")
        .trim();
      if (computedTau0) {
        root.style.setProperty("--tau", computedTau0, "important");
      }
      root.style.setProperty("--tau", "0", "important");
      await raf2();
      const inlineTau0 = root.style.getPropertyValue("--tau").trim();
      const inlineTau0Priority = root.style.getPropertyPriority("--tau");

      root.setAttribute("data-theme", "light");
      await raf2();
      const tauA = getComputedStyle(root).getPropertyValue("--tau").trim();
      const inlineTauA = root.style.getPropertyValue("--tau").trim();
      const inlineTauAPriority = root.style.getPropertyPriority("--tau");
      const bodyEl = document.body;
      const pageEl = document.querySelector(
        ".page.sl-flex",
      ) as HTMLElement | null;
      const surfaceSample = document.querySelector(
        ".surface-page",
      ) as HTMLElement | null;

      const bgA = surfaceSample
        ? getComputedStyle(surfaceSample).backgroundColor
        : null;
      const stateLight = {
        root: snapshot(root),
        body: snapshot(bodyEl),
        page: snapshot(pageEl),
        firstSurfacePage: snapshot(surfaceSample),
      };

      root.setAttribute("data-theme", "dark");
      await raf2();
      const tauB = getComputedStyle(root).getPropertyValue("--tau").trim();
      const inlineTauB = root.style.getPropertyValue("--tau").trim();
      const inlineTauBPriority = root.style.getPropertyPriority("--tau");
      const bgB = surfaceSample
        ? getComputedStyle(surfaceSample).backgroundColor
        : null;
      const stateDark = {
        root: snapshot(root),
        body: snapshot(bodyEl),
        page: snapshot(pageEl),
        firstSurfacePage: snapshot(surfaceSample),
      };

      root.removeAttribute("data-theme");
      root.style.removeProperty("--tau");
      document.head.removeChild(style);

      return {
        inlineTau0,
        inlineTau0Priority,
        tauA,
        tauB,
        inlineTauA,
        inlineTauAPriority,
        inlineTauB,
        inlineTauBPriority,
        bgA,
        bgB,
        stateLight,
        stateDark,
      };
    });

    const violations = await session.page.evaluate(async () => {
      const el = document.querySelector("axiomatic-debugger") as
        | (HTMLElement & { engine?: unknown })
        | null;

      const engine = (el as unknown as { engine?: unknown } | null)?.engine as
        | {
            checkContinuity?: (
              ignoreContainer?: HTMLElement,
            ) => Promise<unknown>;
          }
        | undefined;

      if (!el || !engine?.checkContinuity) return [];

      const raw = (await engine.checkContinuity(el)) as Array<
        | {
            tagName?: string;
            id?: string;
            classes?: string;
            reason?: string;
          }
        | undefined
      >;

      return (Array.isArray(raw) ? raw : [])
        .filter((v): v is NonNullable<typeof v> => !!v)
        .map((v) => ({
          Tag: v.tagName ?? "",
          ID: v.id ?? "",
          Classes: v.classes ?? "",
          Reason: v.reason ?? "",
        }));
    });

    session.logRecorder?.record({
      type: "measure:continuity",
      schemaVersion: 1,
      runConfig: options.runConfig,
      result: {
        debug: debug as ContinuityDebug,
        violations: violations as ContinuityRow[],
      },
    });
  },

  analyze(
    logValue: unknown,
    options: ContinuityAnalyzeOptions,
  ): CheckAnalyzeResult<ContinuityReport> {
    const log = asObservationLog(logValue);
    if (!log) {
      return {
        ok: false,
        reason: "continuity",
        details: { message: "Invalid ObservationLog JSON." },
        report: { kind: "missing" },
      };
    }

    return analyzeContinuityFromLog(log, options);
  },
};
