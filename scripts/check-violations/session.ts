import {
  chromium,
  type Browser,
  type BrowserContext,
  type Page,
} from "playwright";

import type { ObservationLogRecorder } from "./observation-log.ts";

export type CheckViolationsSessionOptions = {
  headed: boolean;
  ignoreHTTPSErrors?: boolean;
  snapsTheme?: "light" | "dark";
  logRecorder?: ObservationLogRecorder;
};

export class CheckViolationsSession {
  readonly browser: Browser;
  readonly context: BrowserContext;
  readonly page: Page;
  readonly logRecorder?: ObservationLogRecorder;

  private constructor(
    browser: Browser,
    context: BrowserContext,
    page: Page,
    logRecorder?: ObservationLogRecorder,
  ) {
    this.browser = browser;
    this.context = context;
    this.page = page;
    this.logRecorder = logRecorder;
  }

  static async launch(
    options: CheckViolationsSessionOptions,
  ): Promise<CheckViolationsSession> {
    const browser = await chromium.launch({ headless: !options.headed });
    const context = await browser.newContext({
      ignoreHTTPSErrors: options.ignoreHTTPSErrors ?? true,
    });

    if (options.snapsTheme) {
      // Force an initial theme attribute before any site scripts run.
      // Useful for reproducing/fixing "transition on enter".
      await context.addInitScript((theme: "light" | "dark") => {
        document.documentElement.setAttribute("data-theme", theme);
      }, options.snapsTheme);
    }

    const page = await context.newPage();

    // Never allow modal dialogs to block automation.
    page.on("dialog", async (dialog) => {
      try {
        const kind = dialog.type();
        const message = dialog.message();
        console.log(`PAGE DIALOG (${kind}): ${message}`);
        options.logRecorder?.record({ type: "page:dialog", kind, message });
        if (kind === "beforeunload") {
          await dialog.accept();
        } else {
          await dialog.dismiss();
        }
      } catch {
        // Ignore dialog handler failures; best-effort.
      }
    });

    page.on("console", (msg) => {
      const level = ((): "log" | "debug" | "info" | "warning" | "error" => {
        const t = msg.type();
        // Playwright console types: log, debug, info, warning, error, dir, dirxml, table, trace, clear, startGroup, startGroupCollapsed, endGroup, assert, profile, profileEnd, count, timeEnd
        if (t === "warning") return "warning";
        if (t === "error") return "error";
        if (t === "info") return "info";
        if (t === "debug") return "debug";
        return "log";
      })();

      console.log("PAGE LOG:", msg.text());
      options.logRecorder?.record({
        type: "page:console",
        text: msg.text(),
        level,
      });
    });

    page.on("pageerror", (err) => {
      const message = err?.message ? String(err.message) : String(err);
      const stack = (err as any)?.stack
        ? String((err as any).stack)
        : undefined;
      console.log("PAGE ERROR:", message);
      options.logRecorder?.record({ type: "page:pageerror", message, stack });
    });

    return new CheckViolationsSession(
      browser,
      context,
      page,
      options.logRecorder,
    );
  }

  async gotoWithRetries(
    url: string,
    options: {
      maxRetries?: number;
      timeoutMs?: number;
      waitUntil?: "domcontentloaded" | "load" | "networkidle";
      retryDelayMs?: number;
      logRecorder?: ObservationLogRecorder;
    } = {},
  ): Promise<boolean> {
    const maxRetries = options.maxRetries ?? 5;
    const timeoutMs = options.timeoutMs ?? 30_000;
    const waitUntil = options.waitUntil ?? "domcontentloaded";
    const retryDelayMs = options.retryDelayMs ?? 2000;

    for (let i = 0; i < maxRetries; i++) {
      try {
        await this.page.goto(url, { timeout: timeoutMs, waitUntil });
        options.logRecorder?.record({
          type: "nav:goto",
          url,
          attempt: i + 1,
          ok: true,
        });
        return true;
      } catch {
        console.log(`Connection attempt ${i + 1} failed. Retrying...`);
        options.logRecorder?.record({
          type: "nav:goto",
          url,
          attempt: i + 1,
          ok: false,
        });
        await new Promise((r) => setTimeout(r, retryDelayMs));
      }
    }

    return false;
  }

  async evaluate<T, A>(fn: (arg: A) => T | Promise<T>, arg: A): Promise<T> {
    return this.page.evaluate(fn as any, arg as any) as Promise<T>;
  }

  async close(): Promise<void> {
    await this.browser.close();
  }
}
