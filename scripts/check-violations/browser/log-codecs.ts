import type { SnapsProbeResult, TimelineFrame } from "./probes.ts";
import type { SnapshotRecord } from "./snapshot.ts";

export type SnapsLogFrame = {
  t: number;
  tau: number;
  bySelector: Record<
    string,
    {
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
    }
  >;
};

export type SnapsLogResult = Omit<SnapsProbeResult, "frames"> & {
  frames: SnapsLogFrame[];
};

export type SnapshotLogElementPaint = {
  colorRgba: string;
  bgRgba: string;
  borderTopRgba: string;
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

export type SnapshotLogRecord = Omit<SnapshotRecord, "bySelector"> & {
  bySelector: Record<string, SnapshotLogElementPaint>;
};

export function toSnapsLogFrame(frame: TimelineFrame): SnapsLogFrame {
  return {
    t: frame.t,
    tau: frame.tau,
    bySelector: Object.fromEntries(
      Object.entries(frame.bySelector).map(([selector, v]) => [
        selector,
        {
          colorRgba: v.colorRgba,
          bgRgba: v.bgRgba,
          borderRgba: v.borderRgba,
          borderLeftRgba: v.borderLeftRgba,
          borderRightRgba: v.borderRightRgba,
          borderBottomRgba: v.borderBottomRgba,
          outlineRgba: v.outlineRgba,
          borderLeftWidth: v.borderLeftWidth,
          borderRightWidth: v.borderRightWidth,
          borderBottomWidth: v.borderBottomWidth,
          outlineWidth: v.outlineWidth,
          outlineStyle: v.outlineStyle,
          outlineOffset: v.outlineOffset,
          boxShadow: v.boxShadow,
        },
      ]),
    ),
  };
}

export function toSnapsLogResult(result: SnapsProbeResult): SnapsLogResult {
  return {
    transitionInfo: result.transitionInfo,
    initialTheme: result.initialTheme,
    enterTransitionDetected: result.enterTransitionDetected,
    enterSamples: result.enterSamples,
    variablesBefore: result.variablesBefore,
    variablesAfterImmediate: result.variablesAfterImmediate,
    frames: result.frames.map(toSnapsLogFrame),
  };
}

export function toSnapshotLogRecord(record: SnapshotRecord): SnapshotLogRecord {
  return {
    t: record.t,
    tau: record.tau,
    theme: record.theme,
    watchedVars: record.watchedVars,
    bySelector: Object.fromEntries(
      Object.entries(record.bySelector).map(([selector, v]) => [
        selector,
        {
          colorRgba: v.colorRgba,
          bgRgba: v.bgRgba,
          borderTopRgba: v.borderTopRgba,
          borderLeftRgba: v.borderLeftRgba,
          borderRightRgba: v.borderRightRgba,
          borderBottomRgba: v.borderBottomRgba,
          outlineRgba: v.outlineRgba,
          borderLeftWidth: v.borderLeftWidth,
          borderRightWidth: v.borderRightWidth,
          borderBottomWidth: v.borderBottomWidth,
          outlineWidth: v.outlineWidth,
          outlineStyle: v.outlineStyle,
          outlineOffset: v.outlineOffset,
          boxShadow: v.boxShadow,
        },
      ]),
    ),
  };
}
