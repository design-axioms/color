import type {
  SnapshotLogRecord,
  SnapsLogResult,
} from "./browser/log-codecs.ts";

export type ObservationLogVersion = 1;

export type RunConfig = {
  url: string;
  headed: boolean;
  wantScreenshots: boolean;
  screenshotsDir: string;
  wantContinuity: boolean;
  wantSnaps: boolean;
  snapsTheme?: "light" | "dark";
  snapsFocus: boolean;
  forceListbox: boolean;
};

export type ObservationEventBase = {
  timeMs: number;
};

export type ObservationEventInput =
  | {
      type: "run:start";
      startedAtIso: string;
      nodeVersion: string;
    }
  | {
      type: "run:note";
      message: string;
    }
  | {
      type: "run:error";
      message: string;
      stack?: string;
    }
  | {
      type: "nav:goto";
      url: string;
      attempt: number;
      ok: boolean;
    }
  | {
      type: "page:dialog";
      kind: string;
      message: string;
    }
  | {
      type: "page:console";
      text: string;
      level: "log" | "debug" | "info" | "warning" | "error";
    }
  | {
      type: "page:pageerror";
      message: string;
      stack?: string;
    }
  | {
      type: "measure:snaps";
      plan: {
        primarySelectors: string[];
        elementCap: number;
        visibleSampleAlphaCutoff: number;
        includeFocusProbeSelector: boolean;
        properties: string[];
        watchVars: string[];
      };
      result: SnapsLogResult;
    }
  | {
      type: "measure:continuity";
      schemaVersion: 1;
      runConfig: RunConfig;
      result: {
        debug: unknown;
        violations: Array<{
          Tag: string;
          ID: string;
          Classes: string;
          Reason: string;
        }>;
      };
    }
  | {
      type: "measure:snapshot";
      schemaVersion: 1;
      label: string;
      plan: {
        primarySelectors: string[];
        elementCap: number;
        visibleSampleAlphaCutoff: number;
        includeFocusProbeSelector: boolean;
        properties: string[];
        watchVars: string[];
      };
      options: {
        targetSelector: string | null;
        includeCandidates: boolean;
        focusProbe: boolean;
        freezeMotion: boolean;
      };
      result: SnapshotLogRecord;
    };

export type ObservationEvent =
  | (ObservationEventBase & {
      type: "run:start";
      startedAtIso: string;
      nodeVersion: string;
    })
  | (ObservationEventBase & {
      type: "run:note";
      message: string;
    })
  | (ObservationEventBase & {
      type: "run:error";
      message: string;
      stack?: string;
    })
  | (ObservationEventBase & {
      type: "nav:goto";
      url: string;
      attempt: number;
      ok: boolean;
    })
  | (ObservationEventBase & {
      type: "page:dialog";
      kind: string;
      message: string;
    })
  | (ObservationEventBase & {
      type: "page:console";
      text: string;
      level: "log" | "debug" | "info" | "warning" | "error";
    })
  | (ObservationEventBase & {
      type: "page:pageerror";
      message: string;
      stack?: string;
    })
  | (ObservationEventBase & {
      type: "measure:snaps";
      plan: {
        primarySelectors: string[];
        elementCap: number;
        visibleSampleAlphaCutoff: number;
        includeFocusProbeSelector: boolean;
        properties: string[];
        watchVars: string[];
      };
      result: SnapsLogResult;
    })
  | (ObservationEventBase & {
      type: "measure:continuity";
      schemaVersion: 1;
      runConfig: RunConfig;
      result: {
        debug: unknown;
        violations: Array<{
          Tag: string;
          ID: string;
          Classes: string;
          Reason: string;
        }>;
      };
    })
  | (ObservationEventBase & {
      type: "measure:snapshot";
      schemaVersion: 1;
      label: string;
      plan: {
        primarySelectors: string[];
        elementCap: number;
        visibleSampleAlphaCutoff: number;
        includeFocusProbeSelector: boolean;
        properties: string[];
        watchVars: string[];
      };
      options: {
        targetSelector: string | null;
        includeCandidates: boolean;
        focusProbe: boolean;
        freezeMotion: boolean;
      };
      result: SnapshotLogRecord;
    });

export type ObservationLog = {
  version: ObservationLogVersion;
  runConfig: RunConfig;
  events: ObservationEvent[];
};

export class ObservationLogRecorder {
  readonly log: ObservationLog;

  private readonly startMs: number;

  constructor(runConfig: RunConfig) {
    this.startMs = Date.now();
    this.log = {
      version: 1,
      runConfig,
      events: [],
    };

    this.record({
      type: "run:start",
      startedAtIso: new Date(this.startMs).toISOString(),
      nodeVersion: process.version,
    });
  }

  nowMs(): number {
    return Date.now() - this.startMs;
  }

  record(event: ObservationEventInput): void {
    this.log.events.push({
      ...event,
      timeMs: this.nowMs(),
    } as ObservationEvent);
  }
}
