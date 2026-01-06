import fs from "node:fs";
import net from "node:net";
import path from "node:path";
import { parseCheckViolationsArgs } from "./cli.ts";
import type { CheckViolationsCliOptions } from "./cli.ts";
import {
  ObservationLogRecorder,
  type ObservationLog,
  type RunConfig,
} from "./observation-log.ts";
import { CheckViolationsSession } from "./session.ts";
import { resolveWantedChecks } from "./checks/registry.ts";

// Allow piping output (e.g. `| head`) without crashing on EPIPE.
function hasCode(value: unknown): value is { code?: string } {
  return !!value && typeof value === "object" && "code" in value;
}

function installEpipeHandler(): void {
  process.stdout.on("error", (err: unknown) => {
    if (hasCode(err) && err.code === "EPIPE") {
      process.exit(0);
    }
  });
}

type InspectorViolationRow = {
  Tag: string;
  ID: string;
  Classes: string;
  Reason: string;
  Property: "color" | "background-color" | "unknown";
  Expected?: string;
  Actual?: string;
  WinningSelector?: string;
  WinningValue?: string;
  WinningStylesheet?: string;
  WinningSpecificity?: string;
  WinningImportant?: boolean;
  WinningLayered?: boolean;
  WinningScopeProximity?: number;
  WinningVarRefs?: string[];
};

type ThemeSelectDebug = {
  mode: "light" | "dark";
  scanMode: InspectorScanMode;
  documentElement: {
    dataTheme?: string;
    dataAxmMode?: string;
    dataAxmResolvedMode?: string;
    dataAxmReady?: string;
    computedTau?: string;
  };
  foundSelect: boolean;
  foundOption: boolean;
  select: {
    colorScheme?: string;
    color?: string;
    backgroundColor?: string;
    borderTopColor?: string;
  };
  option: {
    colorScheme?: string;
    color?: string;
    backgroundColor?: string;
  };
  matchedRules: Array<{
    source: "adopted" | "document";
    styleSheetHint: string;
    selector: string;
    important: boolean;
    property: string;
    value: string;
  }>;
};

type CheckViolationsOptions = CheckViolationsCliOptions;

type InspectorScanMode = "forced" | "native" | "stable";

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object";
}

async function canConnect(
  host: string,
  port: number,
  timeoutMs: number,
): Promise<boolean> {
  return await new Promise((resolve) => {
    const socket = net.connect({ host, port });

    const done = (ok: boolean): void => {
      socket.removeAllListeners();
      socket.destroy();
      resolve(ok);
    };

    socket.setTimeout(timeoutMs);
    socket.once("connect", () => done(true));
    socket.once("timeout", () => done(false));
    socket.once("error", () => done(false));
  });
}

async function resolveUrl(url: string | undefined): Promise<string> {
  let resolvedUrl = url || "https://color-system.localhost/";
  if (resolvedUrl.startsWith("/")) {
    resolvedUrl = `https://color-system.localhost${resolvedUrl}`;
  }

  try {
    const parsed = new URL(resolvedUrl);
    if (
      parsed.protocol === "https:" &&
      parsed.hostname.endsWith(".localhost")
    ) {
      const port = parsed.port ? Number(parsed.port) : 443;
      const ok = Number.isFinite(port)
        ? await canConnect(parsed.hostname, port, 750)
        : true;
      if (!ok) {
        parsed.protocol = "http:";
        parsed.port = "";
        console.log(
          `Note: ${resolvedUrl} is not reachable (port ${port}). Falling back to ${parsed.toString()}`,
        );
        return parsed.toString();
      }
    }
  } catch {
    // If URL parsing fails, keep the original value and let Playwright report it.
  }

  return resolvedUrl;
}

function resolveObservationLogPath(options: {
  writeObservationLog: boolean;
  observationLogPath?: string;
  wantScreenshots: boolean;
  screenshotsDir: string;
}): string | undefined {
  const {
    writeObservationLog,
    observationLogPath,
    wantScreenshots,
    screenshotsDir,
  } = options;

  if (!writeObservationLog) return undefined;

  const resolved =
    observationLogPath ||
    (wantScreenshots
      ? path.join(screenshotsDir, "observation-log.json")
      : path.join(
          process.cwd(),
          "tmp",
          "check-violations",
          "observation-log.json",
        ));

  fs.mkdirSync(path.dirname(resolved), { recursive: true });
  return resolved;
}

function createRunConfig(
  options: CheckViolationsOptions,
  resolvedUrl: string,
): RunConfig {
  const {
    url: _url,
    fromLogPath: _fromLogPath,
    writeObservationLog: _writeObservationLog,
    observationLogPath: _observationLogPath,
    headless: _headless,
    ...runConfig
  } = options;

  return { ...runConfig, url: resolvedUrl };
}

function collectRuntimeErrors(log: ObservationLog): {
  consoleErrors: Array<{ text: string }>;
  pageErrors: Array<{ message: string; stack?: string }>;
} {
  const consoleErrors: Array<{ text: string }> = [];
  const pageErrors: Array<{ message: string; stack?: string }> = [];

  for (const e of log.events) {
    if (e.type === "page:console" && e.level === "error") {
      consoleErrors.push({ text: e.text });
    }
    if (e.type === "page:pageerror") {
      pageErrors.push({ message: e.message, stack: e.stack });
    }
  }

  return { consoleErrors, pageErrors };
}

function printRuntimeErrorSummary(
  resolvedUrl: string,
  errors: ReturnType<typeof collectRuntimeErrors>,
): void {
  const unique = (values: string[]): string[] => {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const v of values) {
      const key = v.trim();
      if (!key) continue;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(key);
    }
    return out;
  };

  const consoleUnique = unique(errors.consoleErrors.map((e) => e.text));
  const pageUnique = unique(errors.pageErrors.map((e) => e.message));
  const total = consoleUnique.length + pageUnique.length;
  if (total === 0) return;

  console.log("\n🚫 Page runtime errors detected.");
  console.log(`URL: ${resolvedUrl}`);
  console.log(
    "This run fails to prevent silently passing broken hydration/runtime.",
  );

  const max = 5;

  if (pageUnique.length > 0) {
    console.log("\nPage errors (uncaught exceptions):");
    for (const msg of pageUnique.slice(0, max)) {
      console.log(`- ${msg}`);
    }
    if (pageUnique.length > max) {
      console.log(`- (+${pageUnique.length - max} more)`);
    }
  }

  if (consoleUnique.length > 0) {
    console.log("\nConsole errors:");
    for (const msg of consoleUnique.slice(0, max)) {
      console.log(`- ${msg}`);
    }
    if (consoleUnique.length > max) {
      console.log(`- (+${consoleUnique.length - max} more)`);
    }
  }

  console.log(
    "\nTriage: re-run with `pnpm check:violations -- --headed <url>` and inspect the browser console for the first error above.",
  );
}

function makeFlushObservationLog(
  logRecorder: ObservationLogRecorder,
  resolvedObservationLogPath: string | undefined,
): () => void {
  return (): void => {
    if (!resolvedObservationLogPath) return;
    fs.writeFileSync(
      resolvedObservationLogPath,
      JSON.stringify(logRecorder.log, null, 2) + "\n",
      "utf8",
    );
    console.log(`Wrote ObservationLog: ${resolvedObservationLogPath}`);
  };
}

function maybePrintScreenshotNotes(options: {
  wantScreenshots: boolean;
  screenshotsDir: string;
  forceListbox: boolean;
  headed: boolean;
}): void {
  const { wantScreenshots, screenshotsDir, forceListbox, headed } = options;
  if (!wantScreenshots) return;

  fs.mkdirSync(screenshotsDir, { recursive: true });

  console.log(`Screenshot mode enabled. Output dir: ${screenshotsDir}`);
  if (forceListbox) {
    console.log(
      "Note: --force-listbox temporarily sets select[size] so options render inline (deterministic + screenshot-able).",
    );
    console.log(
      "This is not the same as the native OS dropdown popup; it proves computed styles + in-DOM rendering, not the OS UI chrome.",
    );
  } else if (!headed) {
    console.log(
      "Note: capturing the native select dropdown popup is unreliable in headless Chromium.",
    );
    console.log(
      "If you need deterministic evidence of option rendering, re-run with --force-listbox.",
    );
  }
}

async function waitForDebuggerReady(
  page: CheckViolationsSession["page"],
): Promise<void> {
  await page.waitForFunction(
    () => {
      const el = document.querySelector(
        "axiomatic-debugger",
      ) as HTMLElement | null;
      return (
        !!el &&
        !!customElements.get("axiomatic-debugger") &&
        !!(el as unknown as { shadowRoot: ShadowRoot | null }).shadowRoot
      );
    },
    undefined,
    { timeout: 30_000 },
  );
}

async function waitForStarlightSurfaceClasses(
  page: CheckViolationsSession["page"],
): Promise<void> {
  // The Starlight docs site applies Axiomatic surface classes via a script
  // during startup. If we start probing before that mutation lands, the late
  // class application will look like a paint "snap" (with tau stable).
  await page.waitForFunction(
    () => {
      const pageEl = document.querySelector(".page.sl-flex");
      const headerEl = document.querySelector(".page > .header");
      return (
        !!pageEl &&
        pageEl.classList.contains("surface-page") &&
        !!headerEl &&
        headerEl.classList.contains("surface-page")
      );
    },
    undefined,
    { timeout: 30_000 },
  );
}

async function applyInspectorScanSetup(
  page: CheckViolationsSession["page"],
  options: { mode: "light" | "dark"; scanMode: InspectorScanMode },
): Promise<void> {
  const { mode, scanMode } = options;

  // Always start from a clean slate so multiple scan modes don't contaminate
  // each other (e.g. forced mode sets an inline `--tau` override).
  await page.evaluate(() => {
    const id = "axiomatic-check-violations-no-motion";
    document.getElementById(id)?.remove();
    document.documentElement.style.removeProperty("--tau");
  });

  const shouldDisableMotion = scanMode === "forced" || scanMode === "stable";
  const shouldForceTau = scanMode === "forced";

  if (shouldDisableMotion) {
    await page.evaluate(() => {
      const id = "axiomatic-check-violations-no-motion";
      let style = document.getElementById(id) as HTMLStyleElement | null;
      if (!style) {
        style = document.createElement("style");
        style.id = id;
        document.head.appendChild(style);
      }
      style.textContent = `
        * { transition: none !important; animation: none !important; }
        html, html[data-theme], :root, :root[data-theme] {
          transition: none !important;
          animation: none !important;
        }
      `;
    });
  }

  await page.evaluate((m) => {
    document.documentElement.setAttribute("data-theme", m);
  }, mode);

  const targetTau = mode === "dark" ? -1 : 1;
  if (shouldForceTau) {
    await page.evaluate((tau) => {
      document.documentElement.style.setProperty(
        "--tau",
        String(tau),
        "important",
      );
    }, targetTau);

    try {
      await page.waitForFunction(
        (expected) => {
          const tauRaw = getComputedStyle(document.documentElement)
            .getPropertyValue("--tau")
            .trim();
          const tau = Number.parseFloat(tauRaw);
          return Number.isFinite(tau) && Math.abs(tau - expected) < 1e-6;
        },
        targetTau,
        { timeout: 2_000 },
      );
    } catch {
      await page.waitForTimeout(250);
    }
  }

  if (shouldDisableMotion || shouldForceTau) {
    try {
      await page.waitForFunction(
        (m) => {
          const cs = getComputedStyle(document.body);
          const color = cs.color;
          const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
          if (!match) return false;
          const r = Number(match[1]);
          const g = Number(match[2]);
          const b = Number(match[3]);
          if (m === "dark") return r > 200 && g > 200 && b > 200;
          return r < 80 && g < 80 && b < 80;
        },
        mode,
        { timeout: 2_000 },
      );
    } catch {
      await page.waitForTimeout(300);
    }
  } else {
    await page.waitForTimeout(250);
  }

  await page.evaluate(async () => {
    await new Promise((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(resolve)),
    );
  });
}

async function maybeCaptureThemeSelectScreenshots(
  page: CheckViolationsSession["page"],
  options: {
    wantScreenshots: boolean;
    screenshotsDir: string;
    mode: "light" | "dark";
    forceListbox: boolean;
  },
): Promise<void> {
  const { wantScreenshots, screenshotsDir, mode, forceListbox } = options;
  if (!wantScreenshots) return;

  // Best effort: try to open the native select dropdown.
  // In headless Chromium, the OS-native popup may not be capturable.
  // We therefore also support a deterministic fallback (`--force-listbox`) that
  // renders options inline by temporarily setting `size`, which *is* screenshot-able.
  const opened = await page.evaluate((listbox) => {
    const select = document.querySelector(
      "starlight-theme-select select",
    ) as HTMLSelectElement | null;
    if (!select) return { found: false, usedListbox: false };

    if (listbox) {
      select.setAttribute("size", "8");
      return { found: true, usedListbox: true };
    }

    try {
      select.focus();
      select.click();
    } catch {
      // Ignore.
    }
    return { found: true, usedListbox: false };
  }, forceListbox);

  await page.waitForTimeout(150);

  const safeMode = mode;
  const hint = opened.usedListbox ? "listbox" : "click";
  const base = `theme-select-${safeMode}-${hint}`;
  const pagePath = path.join(screenshotsDir, `${base}.png`);
  const selectPath = path.join(screenshotsDir, `${base}.select.png`);

  await page.screenshot({ path: pagePath, fullPage: false });
  const locator = page.locator("starlight-theme-select");
  if ((await locator.count()) > 0) {
    await locator.screenshot({ path: selectPath });
  }
  console.log(`Wrote screenshots: ${pagePath}`);
}

function collectInspectorViolationsAndThemeSelect(
  scanMode: InspectorScanMode,
): {
  violations: InspectorViolationRow[];
  themeSelect: ThemeSelectDebug;
} {
  const rawMode = document.documentElement.getAttribute("data-theme");
  const currentMode: "light" | "dark" = rawMode === "dark" ? "dark" : "light";
  const el = document.querySelector("axiomatic-debugger") as HTMLElement | null;
  const emptyThemeSelect: ThemeSelectDebug = {
    mode: currentMode,
    scanMode,
    documentElement: {
      dataTheme:
        document.documentElement.getAttribute("data-theme") || undefined,
      dataAxmMode:
        document.documentElement.getAttribute("data-axm-mode") || undefined,
      dataAxmResolvedMode:
        document.documentElement.getAttribute("data-axm-resolved-mode") ||
        undefined,
      dataAxmReady:
        document.documentElement.getAttribute("data-axm-ready") || undefined,
      computedTau:
        getComputedStyle(document.documentElement)
          .getPropertyValue("--tau")
          .trim() || undefined,
    },
    foundSelect: false,
    foundOption: false,
    select: {},
    option: {},
    matchedRules: [],
  };

  if (!el) return { violations: [], themeSelect: emptyThemeSelect };
  const root = (el as unknown as { shadowRoot: ShadowRoot | null }).shadowRoot;
  if (!root) return { violations: [], themeSelect: emptyThemeSelect };

  (root.getElementById("toggle-btn") as HTMLButtonElement | null)?.click();

  const btn = root.getElementById(
    "violation-toggle",
  ) as HTMLButtonElement | null;
  if (!btn) return { violations: [], themeSelect: emptyThemeSelect };

  btn.dispatchEvent(
    new MouseEvent("click", {
      bubbles: true,
      cancelable: true,
      altKey: true,
    }),
  );

  const rows = (globalThis as unknown as Record<string, unknown>)[
    "__AXIOMATIC_INSPECTOR_VIOLATIONS__"
  ];

  const violations = Array.isArray(rows)
    ? (rows as InspectorViolationRow[])
    : [];

  const themeSelect: ThemeSelectDebug = {
    ...emptyThemeSelect,
  };

  const select = document.querySelector(
    "starlight-theme-select select",
  ) as HTMLSelectElement | null;
  const option = document.querySelector(
    "starlight-theme-select option",
  ) as HTMLOptionElement | null;

  const toHint = (sheet: CSSStyleSheet): string => {
    const anySheet = sheet as unknown as { href?: string };
    if (typeof anySheet.href === "string" && anySheet.href.length > 0) {
      return anySheet.href;
    }
    return "(constructed)";
  };

  const collectRules = (
    source: "adopted" | "document",
    sheets: readonly CSSStyleSheet[],
    element: Element,
    properties: string[],
  ): void => {
    for (const sheet of sheets) {
      let rules: CSSRuleList;
      try {
        rules = sheet.cssRules;
      } catch {
        continue;
      }

      for (const rule of Array.from(rules)) {
        if (rule.type !== CSSRule.STYLE_RULE) continue;
        const styleRule = rule as CSSStyleRule;
        const selector = styleRule.selectorText;

        let matches = false;
        try {
          matches = element.matches(selector);
        } catch {
          matches = false;
        }
        if (!matches) continue;

        for (const prop of properties) {
          const value = styleRule.style.getPropertyValue(prop);
          if (!value) continue;
          const priority = styleRule.style.getPropertyPriority(prop);
          themeSelect.matchedRules.push({
            source,
            styleSheetHint: toHint(sheet),
            selector,
            important: priority === "important",
            property: prop,
            value: value.trim(),
          });
        }
      }
    }
  };

  if (select) {
    themeSelect.foundSelect = true;
    const cs = getComputedStyle(select);
    themeSelect.select.colorScheme = cs.colorScheme;
    themeSelect.select.color = cs.color;
    themeSelect.select.backgroundColor = cs.backgroundColor;
    themeSelect.select.borderTopColor = cs.borderTopColor;

    const adopted = (
      document as unknown as { adoptedStyleSheets?: CSSStyleSheet[] }
    ).adoptedStyleSheets;
    if (Array.isArray(adopted)) {
      collectRules("adopted", adopted, select, [
        "color",
        "background-color",
        "color-scheme",
      ]);
    }

    collectRules(
      "document",
      Array.from(document.styleSheets) as unknown as CSSStyleSheet[],
      select,
      ["color", "background-color", "color-scheme"],
    );
  }

  if (option) {
    themeSelect.foundOption = true;
    const cs = getComputedStyle(option);
    themeSelect.option.colorScheme = cs.colorScheme;
    themeSelect.option.color = cs.color;
    themeSelect.option.backgroundColor = cs.backgroundColor;

    const adopted = (
      document as unknown as { adoptedStyleSheets?: CSSStyleSheet[] }
    ).adoptedStyleSheets;
    if (Array.isArray(adopted)) {
      collectRules("adopted", adopted, option, [
        "color",
        "background-color",
        "color-scheme",
      ]);
    }

    collectRules(
      "document",
      Array.from(document.styleSheets) as unknown as CSSStyleSheet[],
      option,
      ["color", "background-color", "color-scheme"],
    );
  }

  if (themeSelect.matchedRules.length > 200) {
    themeSelect.matchedRules = themeSelect.matchedRules.slice(0, 200);
  }

  return { violations, themeSelect };
}

async function runForMode(
  page: CheckViolationsSession["page"],
  options: {
    mode: "light" | "dark";
    scanMode: InspectorScanMode;
    wantScreenshots: boolean;
    screenshotsDir: string;
    forceListbox: boolean;
  },
): Promise<{
  violations: InspectorViolationRow[];
  themeSelect: ThemeSelectDebug;
}> {
  const { mode, scanMode, wantScreenshots, screenshotsDir, forceListbox } =
    options;

  await applyInspectorScanSetup(page, { mode, scanMode });
  await maybeCaptureThemeSelectScreenshots(page, {
    wantScreenshots,
    screenshotsDir,
    mode,
    forceListbox,
  });

  return page.evaluate(collectInspectorViolationsAndThemeSelect, scanMode);
}

async function runInspectorForModes(
  page: CheckViolationsSession["page"],
  options: Pick<
    CheckViolationsOptions,
    "wantScreenshots" | "screenshotsDir" | "forceListbox" | "inspectorScanMode"
  >,
): Promise<{ totalViolations: number }> {
  let totalViolations = 0;

  const scanModes: InspectorScanMode[] =
    options.inspectorScanMode === "both"
      ? ["native", "stable", "forced"]
      : [options.inspectorScanMode];

  for (const mode of ["light", "dark"] as const) {
    for (const scanMode of scanModes) {
      console.log(
        `\n--- ${mode.toUpperCase()} MODE (inspector scan: ${scanMode}) ---`,
      );

      const { violations, themeSelect } = await runForMode(page, {
        mode,
        scanMode,
        wantScreenshots: options.wantScreenshots,
        screenshotsDir: options.screenshotsDir,
        forceListbox: options.forceListbox,
      });

      totalViolations += violations.length;

      console.log("Theme Select Diagnostics:");
      console.log(JSON.stringify(themeSelect, null, 2));
      console.log("Theme State:");
      console.log(JSON.stringify(themeSelect.documentElement, null, 2));

      if (violations.length === 0) {
        console.log("✅ No violations found.");
      } else {
        console.log(`🚫 Found ${violations.length} violations:`);
        const maxRows = 30;
        if (violations.length > maxRows) {
          console.log(
            `Showing first ${maxRows} rows (of ${violations.length}).`,
          );
          console.table(violations.slice(0, maxRows));
        } else {
          console.table(violations);
        }
      }
    }
  }

  return { totalViolations };
}

export async function runCheckViolations(argv: string[]): Promise<void> {
  installEpipeHandler();

  const options = parseCheckViolationsArgs(argv, {
    screenshotsDir: path.join(process.cwd(), "tmp", "check-violations"),
  });

  const wantedChecks = resolveWantedChecks(options);
  if (wantedChecks.length === 0) {
    if (!options.wantInspector) {
      console.error("No checks selected. Use --snaps and/or --continuity.");
      process.exitCode = 1;
      return;
    }

    if (options.fromLogPath) {
      console.error(
        "Inspector-only mode requires a live browser page; it cannot run from an ObservationLog.",
      );
      process.exitCode = 1;
      return;
    }
  }

  if (options.fromLogPath) {
    const raw = fs.readFileSync(options.fromLogPath, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    if (!isRecord(parsed) || !Array.isArray(parsed["events"])) {
      console.error("Invalid ObservationLog JSON.");
      process.exitCode = 1;
      return;
    }

    const log = parsed as ObservationLog;
    if (!isRecord(log.runConfig)) {
      console.error("ObservationLog is missing runConfig.");
      process.exitCode = 1;
      return;
    }

    for (const check of wantedChecks) {
      const runConfig = log.runConfig;
      const result = check.executeAnalysis(log, options, runConfig);
      if (!result.ok) {
        process.exitCode = 1;
        return;
      }
    }
    return;
  }

  const resolvedUrl = await resolveUrl(options.url);
  const resolvedObservationLogPath = resolveObservationLogPath(options);
  const runConfig = createRunConfig(options, resolvedUrl);
  const logRecorder = new ObservationLogRecorder(runConfig);
  const flushObservationLog = makeFlushObservationLog(
    logRecorder,
    resolvedObservationLogPath,
  );

  maybePrintScreenshotNotes(options);

  const sessionOptions = {
    headed: options.headed,
    ignoreHTTPSErrors: true,
    snapsTheme: options.wantSnaps ? options.snapsTheme : undefined,
    logRecorder,
  };

  const session = await CheckViolationsSession.launch({ ...sessionOptions });
  const { page } = session;

  console.log(`Checking violations for: ${resolvedUrl}`);

  const connected = await session.gotoWithRetries(resolvedUrl, {
    maxRetries: 5,
    timeoutMs: 30_000,
    waitUntil: "domcontentloaded",
    retryDelayMs: 2000,
    logRecorder,
  });

  if (!connected) {
    console.error("Failed to connect to server.");
    logRecorder.record({
      type: "run:error",
      message: "Failed to connect to server.",
    });
    await session.close();

    flushObservationLog();
    process.exitCode = 1;
    return;
  }

  if (options.writeObservationLog && resolvedObservationLogPath) {
    logRecorder.record({
      type: "run:note",
      message: `ObservationLog enabled: ${resolvedObservationLogPath}`,
    });
  }

  await waitForDebuggerReady(page);
  await waitForStarlightSurfaceClasses(page);

  for (const check of wantedChecks) {
    await check.executeScenario({ session }, options, runConfig);

    const result = check.executeAnalysis(logRecorder.log, options, runConfig);
    if (!result.ok) {
      flushObservationLog();
      await session.close();
      process.exitCode = 1;
      return;
    }
  }

  if (options.wantInspector) {
    const { totalViolations } = await runInspectorForModes(page, options);
    if (totalViolations > 0) {
      process.exitCode = 1;
    }
  }

  // Guardrail: fail on runtime errors to avoid green runs with broken pages.
  const runtimeErrors = collectRuntimeErrors(logRecorder.log);
  if (
    runtimeErrors.consoleErrors.length > 0 ||
    runtimeErrors.pageErrors.length > 0
  ) {
    printRuntimeErrorSummary(resolvedUrl, runtimeErrors);
    process.exitCode = 1;
  }

  flushObservationLog();
  await session.close();
}
