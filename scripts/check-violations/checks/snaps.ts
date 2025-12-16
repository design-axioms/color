import { MeasurementSpec } from "../browser/spec.ts";
import {
  SnapsProbe,
  findTauStableSnaps,
  type SnapEvent,
} from "../browser/probes.ts";
import { SnapshotProbe } from "../browser/snapshot.ts";
import {
  toSnapshotLogRecord,
  toSnapsLogResult,
} from "../browser/log-codecs.ts";
import type { CheckViolationsSession } from "../session.ts";
import type { ObservationLog, RunConfig } from "../observation-log.ts";
import type { CheckViolationsCliOptions } from "../cli.ts";
import type { CheckModule, CheckAnalyzeResult } from "./types.ts";
import {
  asObservationLog,
  findLastEvent,
  listMeasurementTypes,
} from "./log-utils.ts";

export type SnapsScenarioOptions = {
  snapsFocus: boolean;
  runConfig: RunConfig;
};

export type SnapsAnalyzeOptions = {
  threshold: number;
  tauStableEpsilon: number;
};

export type SnapsReport =
  | { kind: "missing" }
  | { kind: "enter-transition" }
  | {
      kind: "snaps";
      snaps: SnapEvent[];
    };

function analyzeSnapsFromLog(
  log: ObservationLog,
  analyzeOptions: SnapsAnalyzeOptions,
): CheckAnalyzeResult<SnapsReport> {
  const ev = findLastEvent(log, "measure:snaps");
  if (!ev) {
    const wantSnaps = (log.runConfig as any)?.wantSnaps;
    const measurements = listMeasurementTypes(log);
    return {
      ok: false,
      reason: "snaps",
      details: {
        message: "No measure:snaps event found in ObservationLog.",
        runConfigWantSnaps:
          typeof wantSnaps === "boolean" ? wantSnaps : undefined,
        measurementTypes: measurements,
      },
      report: { kind: "missing" },
    };
  }

  const snaps: SnapEvent[] = findTauStableSnaps(ev.result.frames, {
    threshold: analyzeOptions.threshold,
    tauStableEpsilon: analyzeOptions.tauStableEpsilon,
  });

  if (ev.result.enterTransitionDetected) {
    return {
      ok: false,
      reason: "enter-transition",
      details: {
        initialTheme: ev.result.initialTheme,
        enterSamples: ev.result.enterSamples,
      },
      report: { kind: "enter-transition" },
    };
  }

  if (snaps.length === 0) {
    return { ok: true, report: { kind: "snaps", snaps: [] } };
  }

  return {
    ok: false,
    reason: "snaps",
    details: {
      transitionInfo: ev.result.transitionInfo,
      variablesBefore: ev.result.variablesBefore,
      variablesAfterImmediate: ev.result.variablesAfterImmediate,
      frameCount: ev.result.frames.length,
      snaps,
    },
    report: { kind: "snaps", snaps },
  };
}

export const snapsCheck: CheckModule<
  CheckViolationsSession,
  SnapsScenarioOptions,
  CheckViolationsCliOptions,
  RunConfig,
  SnapsAnalyzeOptions,
  SnapsReport
> = {
  name: "snaps",

  scenarioOptions: ({ cliOptions, runConfig }) => {
    return {
      snapsFocus: cliOptions.snapsFocus,
      runConfig,
    };
  },

  analyzeOptions: () => ({
    threshold: 35,
    tauStableEpsilon: 0.001,
  }),

  print(result): void {
    if (result.ok) {
      console.log("✅ No transition-time snaps detected.");
      return;
    }

    if (result.report.kind === "missing") {
      console.log(JSON.stringify(result.details, null, 2));
      return;
    }

    if (result.reason === "enter-transition") {
      console.log("🚫 Enter-transition detected: `--tau` moved after load.");
      console.log(JSON.stringify(result.details, null, 2));
      return;
    }

    if (result.reason === "snaps") {
      const count =
        result.report.kind === "snaps" ? result.report.snaps.length : 0;
      console.log(`🚫 Transition-time snaps detected (${count})`);
      console.log(JSON.stringify(result.details, null, 2));
      return;
    }

    console.log(JSON.stringify(result.details, null, 2));
  },

  async scenario(ctx, options): Promise<void> {
    const { session } = ctx;

    const spec = MeasurementSpec.forSnapsDocsChrome();
    const plan = spec.toPlan();

    const probe = new SnapsProbe(plan);
    const probeResult = await probe.run(session, {
      snapsFocus: options.snapsFocus,
    });

    session.logRecorder?.record({
      type: "measure:snaps",
      plan,
      result: toSnapsLogResult(probeResult),
    });

    // Bounded endpoint snapshots for replay/debug.
    const snapshotProbe = new SnapshotProbe(plan);
    const snapshotProbeOptions = {
      includeCandidates: false,
      focusProbe: options.snapsFocus,
      freezeMotion: true,
    };
    const snapshotLogOptions = {
      targetSelector: null,
      includeCandidates: false,
      focusProbe: options.snapsFocus,
      freezeMotion: true,
    };

    const setThemeAndTau = async (mode: "light" | "dark"): Promise<void> => {
      const tau = mode === "dark" ? -1 : 1;
      await session.page.evaluate(
        ({ m, t }) => {
          const root = document.documentElement;
          root.setAttribute("data-theme", m);
          root.style.setProperty("--tau", String(t), "important");
        },
        { m: mode, t: tau },
      );
      await session.page.evaluate(
        () =>
          new Promise((resolve) =>
            requestAnimationFrame(() => requestAnimationFrame(resolve)),
          ),
      );
    };

    await setThemeAndTau("light");
    const snapLight = await snapshotProbe.run(session, snapshotProbeOptions);
    session.logRecorder?.record({
      type: "measure:snapshot",
      schemaVersion: 1,
      label: "endpoint:light",
      plan,
      options: snapshotLogOptions,
      result: toSnapshotLogRecord(snapLight),
    });

    await setThemeAndTau("dark");
    const snapDark = await snapshotProbe.run(session, snapshotProbeOptions);
    session.logRecorder?.record({
      type: "measure:snapshot",
      schemaVersion: 1,
      label: "endpoint:dark",
      plan,
      options: snapshotLogOptions,
      result: toSnapshotLogRecord(snapDark),
    });

    // Ensure run config is present in the log for replay consumers.
    if (session.logRecorder)
      session.logRecorder.log.runConfig = options.runConfig;
  },

  analyze(
    logValue: unknown,
    options: SnapsAnalyzeOptions,
  ): CheckAnalyzeResult<SnapsReport> {
    const log = asObservationLog(logValue);
    if (!log) {
      return {
        ok: false,
        reason: "snaps",
        details: { message: "Invalid ObservationLog JSON." },
        report: { kind: "missing" },
      };
    }

    return analyzeSnapsFromLog(log, options);
  },
};
