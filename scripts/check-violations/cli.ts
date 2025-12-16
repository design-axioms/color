export type CheckViolationsCliOptions = {
  url?: string;
  fromLogPath?: string;
  wantScreenshots: boolean;
  screenshotsDir: string;
  writeObservationLog: boolean;
  observationLogPath?: string;
  headed: boolean;
  headless: boolean;
  forceListbox: boolean;
  wantContinuity: boolean;
  wantSnaps: boolean;
  snapsTheme?: "light" | "dark";
  snapsFocus: boolean;
  wantInspector: boolean;
  inspectorScanMode: "forced" | "native" | "stable" | "both";
};

export function parseCheckViolationsArgs(
  argv: string[],
  defaults: Pick<CheckViolationsCliOptions, "screenshotsDir">,
): CheckViolationsCliOptions {
  const rawArgs = argv.slice();
  if (rawArgs[0] === "--") rawArgs.shift();

  let url: string | undefined;
  let fromLogPath: string | undefined;
  let wantScreenshots = false;
  let screenshotsDir = defaults.screenshotsDir;
  let writeObservationLog = false;
  let observationLogPath: string | undefined;
  let headed = false;
  let headless = false;
  let forceListbox = false;
  let wantContinuity = false;
  let wantSnaps = false;
  let snapsTheme: "light" | "dark" | undefined;
  let snapsFocus = false;
  let wantInspector = true;
  let inspectorScanMode: "forced" | "native" | "stable" | "both" = "forced";

  for (let i = 0; i < rawArgs.length; i++) {
    const arg = rawArgs[i];
    const next = rawArgs[i + 1];

    if (!arg) continue;

    if (arg === "--screenshot") {
      wantScreenshots = true;
      if (next && !next.startsWith("--")) {
        screenshotsDir = next;
        i++;
      }
      continue;
    }

    if (arg === "--screenshot-dir") {
      wantScreenshots = true;
      if (next && !next.startsWith("--")) {
        screenshotsDir = next;
        i++;
      }
      continue;
    }

    if (arg === "--log") {
      writeObservationLog = true;
      if (next && !next.startsWith("--")) {
        observationLogPath = next;
        i++;
      }
      continue;
    }

    if (arg === "--log-path") {
      writeObservationLog = true;
      if (next && !next.startsWith("--")) {
        observationLogPath = next;
        i++;
      }
      continue;
    }

    if (arg === "--from-log") {
      if (next && !next.startsWith("--")) {
        fromLogPath = next;
        i++;
      }
      continue;
    }

    if (arg === "--headed") {
      headed = true;
      continue;
    }

    if (arg === "--headless") {
      headless = true;
      headed = false;
      continue;
    }

    if (arg === "--force-listbox") {
      forceListbox = true;
      continue;
    }

    if (arg === "--continuity") {
      wantContinuity = true;
      continue;
    }

    if (arg === "--snaps") {
      wantSnaps = true;
      continue;
    }

    if (arg === "--snaps-focus") {
      wantSnaps = true;
      snapsFocus = true;
      continue;
    }

    if (arg === "--snaps-theme") {
      wantSnaps = true;
      if (next === "light" || next === "dark") {
        snapsTheme = next;
        i++;
      }
      continue;
    }

    if (arg === "--no-inspector") {
      wantInspector = false;
      continue;
    }

    if (arg === "--inspector-scan") {
      if (
        next === "forced" ||
        next === "native" ||
        next === "stable" ||
        next === "both"
      ) {
        inspectorScanMode = next;
        i++;
      }
      continue;
    }

    if (!arg.startsWith("--") && !url) {
      url = arg;
    }
  }

  return {
    url,
    fromLogPath,
    wantScreenshots,
    screenshotsDir,
    writeObservationLog,
    observationLogPath,
    headed,
    headless,
    forceListbox,
    wantContinuity,
    wantSnaps,
    snapsTheme,
    snapsFocus,
    wantInspector,
    inspectorScanMode,
  };
}
