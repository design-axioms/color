import { AxiomaticInspectorEngine, type Violation } from "./engine.ts";
import { STYLES } from "./styles.ts";
import { AxiomaticTheme } from "../theme.ts";
import type { DebugContext, ResolvedToken } from "./types.ts";
import { findWinningRule, formatSpecificity } from "./css-utils.ts";
import { converter, formatCss } from "culori";
import {
  renderAdvice,
  renderTokenList,
  updateAdviceWithAnalysis,
} from "./view.ts";

interface PopoverElement extends HTMLElement {
  showPopover(): void;
  hidePopover(): void;
}

function isPopoverElement(element: HTMLElement): element is PopoverElement {
  return "showPopover" in (element as unknown as Record<string, unknown>);
}

const BaseElement = (
  typeof HTMLElement !== "undefined"
    ? HTMLElement
    : class Base {
        _ = 0;
      }
) as typeof HTMLElement;

interface InspectorState {
  isEnabled: boolean;
  isPinned: boolean;
  isViolationMode: boolean;
  isContinuityMode: boolean;
  showInternals: boolean;
}

const toRgb = converter("rgb");

function safeElementLabel(element: HTMLElement): string {
  const id = element.id ? `#${element.id}` : "";
  const classes = element.className
    ? "." + element.className.trim().split(/\s+/).slice(0, 3).join(".")
    : "";
  return `<${element.tagName.toLowerCase()}>${id}${classes}`;
}

function resolveCssValueInContext(
  contextElement: HTMLElement,
  property: "color" | "background-color",
  value: string,
): string {
  const probe = document.createElement("div");
  probe.style.position = "absolute";
  probe.style.visibility = "hidden";
  probe.style.pointerEvents = "none";
  probe.style.width = "0";
  probe.style.height = "0";
  probe.style.overflow = "hidden";
  probe.style.setProperty(property, value);
  contextElement.appendChild(probe);
  const resolved =
    getComputedStyle(probe).getPropertyValue(property).trim() || "";
  probe.remove();
  return resolved;
}

function canonicalizeColor(
  raw: string,
  contextElement: HTMLElement,
  property: "color" | "background-color",
): string | null {
  if (!raw) return null;
  const direct = toRgb(raw);
  if (direct) return formatCss(direct);

  const resolved = resolveCssValueInContext(contextElement, property, raw);
  const viaResolved = resolved ? toRgb(resolved) : null;
  return viaResolved ? formatCss(viaResolved) : null;
}

export class AxiomaticDebugger extends BaseElement {
  private root!: ShadowRoot;
  private highlightLayer!: HTMLElement;
  private violationLayer!: HTMLElement;
  private sourceLayer!: HTMLElement;
  private infoCard!: HTMLElement;
  private toastEl: HTMLElement | null = null;
  private toggleBtn!: HTMLButtonElement;
  private violationToggle!: HTMLButtonElement;
  private continuityToggle!: HTMLButtonElement;
  private resetBtn!: HTMLButtonElement;
  private themeToggleMain!: HTMLButtonElement;
  private elementConsoleBtn!: HTMLButtonElement;
  private elementInternalsBtn!: HTMLButtonElement;
  private theme: AxiomaticTheme;
  private themeUnsubscribe: (() => void) | null = null;
  private themeAnimationRaf: number | null = null;
  private engine: AxiomaticInspectorEngine;
  private activeElement: HTMLElement | null = null;
  private isEnabled = false;
  private isPinned = false;
  private isViolationMode = false;
  private isContinuityMode = false;
  private showInternals = false;
  private rafId: number | null = null;
  private modifiedElements = new Map<
    HTMLElement,
    { className: string; style: string }
  >();
  private continuityViolations = new Map<HTMLElement, Violation>();

  private continuityAbort: AbortController | null = null;
  private toastTimeout: number | null = null;

  private showToast(
    message: string,
    kind: "info" | "success" | "warn" | "error" = "info",
    timeoutMs = 2200,
  ): void {
    if (!this.toastEl) return;

    this.toastEl.textContent = message;
    this.toastEl.setAttribute("data-kind", kind);
    this.toastEl.setAttribute("data-open", "true");

    if (this.toastTimeout) {
      window.clearTimeout(this.toastTimeout);
      this.toastTimeout = null;
    }

    this.toastTimeout = window.setTimeout(() => {
      this.toastEl?.setAttribute("data-open", "false");
      this.toastTimeout = null;
    }, timeoutMs);
  }

  private isVerbose(): boolean {
    try {
      return localStorage.getItem("axiomatic-inspector-verbose") === "true";
    } catch {
      return false;
    }
  }

  private dumpEmpiricalDiagnostics(): void {
    const element = this.activeElement;
    if (!element) {
      console.warn("[Axiomatic] No active element to diagnose.");
      return;
    }

    const result = this.engine.inspect(element);
    const context = result.context;

    const surfaceToken = result.tokens.find(
      (t) => t.intent === "Surface Color",
    );
    const bgToken = result.tokens.find((t) => t.intent === "Actual Background");
    const finalTextToken = result.tokens.find(
      (t) => t.intent === "Final Text Color",
    );
    const actualTextToken = result.tokens.find(
      (t) => t.intent === "Actual Text Color",
    );

    const bgMismatch =
      !!surfaceToken && !!bgToken && surfaceToken.value !== bgToken.value;
    const textMismatch =
      !!finalTextToken &&
      !!actualTextToken &&
      finalTextToken.value !== actualTextToken.value;

    const bgWinningRule = findWinningRule(element, "background-color");
    const textWinningRule = findWinningRule(element, "color");

    const bgExpectedRaw = surfaceToken?.value || "";
    const bgActualRaw = bgToken?.value || "";
    const textExpectedRaw = finalTextToken?.value || "";
    const textActualRaw = actualTextToken?.value || "";

    const bgExpectedCanon = surfaceToken
      ? canonicalizeColor(
          surfaceToken.value,
          context.element,
          "background-color",
        )
      : null;
    const bgActualCanon = bgToken
      ? canonicalizeColor(bgToken.value, context.element, "background-color")
      : null;

    const textExpectedCanon = finalTextToken
      ? canonicalizeColor(finalTextToken.value, context.element, "color")
      : null;
    const textActualCanon = actualTextToken
      ? canonicalizeColor(actualTextToken.value, context.element, "color")
      : null;

    const payload = {
      element: {
        label: safeElementLabel(element),
        id: element.id,
        classes: element.className,
      },
      context: {
        surface: context.surface,
        polarity: context.polarity,
        contextElement: safeElementLabel(context.element),
        contextId: context.element.id,
        contextClasses: context.element.className,
      },
      background: {
        mismatch: bgMismatch,
        expectedRaw: bgExpectedRaw,
        actualRaw: bgActualRaw,
        expectedCanonical: bgExpectedCanon,
        actualCanonical: bgActualCanon,
        canonicalEqual:
          bgExpectedCanon !== null &&
          bgActualCanon !== null &&
          bgExpectedCanon === bgActualCanon,
        winningRule: bgWinningRule
          ? {
              selector: bgWinningRule.selector,
              value: bgWinningRule.value,
              stylesheet: bgWinningRule.stylesheet,
              specificity: formatSpecificity(bgWinningRule.specificity),
              important: bgWinningRule.isImportant,
              layered: bgWinningRule.isLayered,
              scopeProximity: bgWinningRule.scopeProximity,
            }
          : null,
      },
      text: {
        mismatch: textMismatch,
        expectedRaw: textExpectedRaw,
        actualRaw: textActualRaw,
        expectedCanonical: textExpectedCanon,
        actualCanonical: textActualCanon,
        canonicalEqual:
          textExpectedCanon !== null &&
          textActualCanon !== null &&
          textExpectedCanon === textActualCanon,
        winningRule: textWinningRule
          ? {
              selector: textWinningRule.selector,
              value: textWinningRule.value,
              stylesheet: textWinningRule.stylesheet,
              specificity: formatSpecificity(textWinningRule.specificity),
              important: textWinningRule.isImportant,
              layered: textWinningRule.isLayered,
              scopeProximity: textWinningRule.scopeProximity,
            }
          : null,
      },
    };

    (globalThis as unknown as Record<string, unknown>)[
      "__AXIOMATIC_INSPECTOR_ELEMENT_DIAGNOSTICS__"
    ] = payload;

    console.groupCollapsed(
      `[Axiomatic] Empirical diagnostics: ${payload.element.label}`,
    );
    console.log(payload);
    console.log(
      "[Axiomatic] Copy/paste tip: JSON.stringify(globalThis.__AXIOMATIC_INSPECTOR_ELEMENT_DIAGNOSTICS__, null, 2)",
    );
    console.groupEnd();
  }

  private publishViolationReport(violations: Violation[]): Array<{
    Tag: string;
    ID: string;
    Classes: string;
    Reason: string;
    Property: "color" | "background-color" | "unknown";
    Expected: string | undefined;
    Actual: string | undefined;
    WinningSelector?: string;
    WinningValue?: string;
    WinningStylesheet?: string;
    WinningSpecificity?: string;
    WinningImportant?: boolean;
    WinningLayered?: boolean;
    WinningScopeProximity?: number;
    WinningVarRefs?: string[];
  }> {
    const extractVarRefs = (
      value: string | undefined,
    ): string[] | undefined => {
      if (!value) return undefined;
      const re = /var\(\s*(--[a-z0-9-]+)\s*\)/gi;
      const vars = new Set<string>();
      let m: RegExpExecArray | null;
      while ((m = re.exec(value)) !== null) {
        const varName = m[1];
        if (varName) vars.add(varName);
        if (m.index === re.lastIndex) re.lastIndex++;
      }
      return vars.size ? Array.from(vars).sort() : undefined;
    };

    const rows = violations.map((v) => {
      const element = v.element;
      const inspection = this.engine.inspect(element);
      const surfaceToken = inspection.tokens.find(
        (t) => t.intent === "Surface Color",
      );
      const bgToken = inspection.tokens.find(
        (t) => t.intent === "Actual Background",
      );
      const fgToken = inspection.tokens.find(
        (t) => t.intent === "Final Text Color",
      );
      const actualFgToken = inspection.tokens.find(
        (t) => t.intent === "Actual Text Color",
      );

      const surfaceMismatch =
        !!surfaceToken && !!bgToken && surfaceToken.value !== bgToken.value;
      const textMismatch =
        !!fgToken && !!actualFgToken && fgToken.value !== actualFgToken.value;

      const property: "color" | "background-color" | "unknown" = surfaceMismatch
        ? "background-color"
        : textMismatch
          ? "color"
          : "unknown";

      const winningRule =
        property === "unknown" ? null : findWinningRule(element, property);
      const winningVarRefs = extractVarRefs(winningRule?.value);

      return {
        Tag: v.tagName,
        ID: v.id,
        Classes: v.classes,
        Reason: v.reason,
        Property: property,
        Expected: v.surface,
        Actual: v.actual,
        WinningSelector: winningRule?.selector,
        WinningValue: winningRule?.value,
        WinningStylesheet: winningRule?.stylesheet ?? undefined,
        WinningSpecificity: winningRule
          ? formatSpecificity(winningRule.specificity)
          : undefined,
        WinningImportant: winningRule?.isImportant,
        WinningLayered: winningRule?.isLayered,
        WinningScopeProximity: winningRule?.scopeProximity,
        WinningVarRefs: winningVarRefs,
      };
    });

    (globalThis as unknown as Record<string, unknown>)[
      "__AXIOMATIC_INSPECTOR_VIOLATIONS__"
    ] = rows;

    return rows;
  }

  private publishContinuityReport(violations: Violation[]): Array<{
    Tag: string;
    ID: string;
    Classes: string;
    Reason: string;
  }> {
    const rows = violations.map((v) => ({
      Tag: v.tagName,
      ID: v.id,
      Classes: v.classes,
      Reason: v.reason,
    }));

    (globalThis as unknown as Record<string, unknown>)[
      "__AXIOMATIC_INSPECTOR_CONTINUITY__"
    ] = rows;

    return rows;
  }

  private logCopyPasteHint(kind: "violations" | "continuity"): void {
    const key =
      kind === "violations"
        ? "__AXIOMATIC_INSPECTOR_VIOLATIONS__"
        : "__AXIOMATIC_INSPECTOR_CONTINUITY__";

    console.log(
      `[Axiomatic] Copy/paste tip: run JSON.stringify(globalThis.${key}, null, 2) to dump the report as JSON.`,
    );
  }

  constructor() {
    super();
    this.root = this.attachShadow({ mode: "open" });
    this.theme = AxiomaticTheme.get();
    this.engine = new AxiomaticInspectorEngine();
  }

  connectedCallback(): void {
    this.render();
    this.setupToggle();
    this.themeUnsubscribe = this.theme.subscribe((state) => {
      // Keep the button semantically in sync with mode.
      const mode = state.tau >= 0 ? "light" : "dark";
      this.themeToggleMain.setAttribute("data-mode", mode);
      this.themeToggleMain.title =
        mode === "light"
          ? "Toggle to Dark (animates tau)"
          : "Toggle to Light (animates tau)";
    });
    this.loadState();
    this.updateResetButtonState();
  }

  disconnectedCallback(): void {
    this.disable();
    if (this.themeUnsubscribe) {
      this.themeUnsubscribe();
      this.themeUnsubscribe = null;
    }
    if (this.themeAnimationRaf) {
      cancelAnimationFrame(this.themeAnimationRaf);
      this.themeAnimationRaf = null;
    }
  }

  private saveState(): void {
    const state = {
      isEnabled: this.isEnabled,
      isPinned: this.isPinned,
      isViolationMode: this.isViolationMode,
      isContinuityMode: this.isContinuityMode,
      showInternals: this.showInternals,
    };
    localStorage.setItem("axiomatic-inspector-state", JSON.stringify(state));
  }

  private loadState(): void {
    const saved = localStorage.getItem("axiomatic-inspector-state");
    if (saved) {
      try {
        const state = JSON.parse(saved) as InspectorState;
        if (state.isEnabled) this.enable();
        if (state.isPinned) {
          this.isPinned = true;
          // We can't restore the pinned element easily without a selector,
          // but we can restore the mode.
        }
        if (state.isViolationMode) {
          this.isViolationMode = true;
          this.violationToggle.classList.add("active");
          if (state.isEnabled) {
            this.scanForViolations().catch(console.error);
          }
        }
        if (state.isContinuityMode) {
          this.isContinuityMode = true;
          this.continuityToggle.classList.add("active");
          // Never auto-run continuity on load: it flashes theme/tau.
        }
        if (state.showInternals) {
          this.showInternals = true;
          this.elementInternalsBtn.classList.add("active");
        }
      } catch (e) {
        console.warn("Failed to load inspector state", e);
      }
    }
  }

  private render(): void {
    this.root.innerHTML = `
      <style>${STYLES}</style>
      <div id="source-layer"></div>
      <div id="violation-layer"></div>
      <div id="highlight-layer"></div>
      <div id="toast" role="status" aria-live="polite" aria-atomic="true" data-open="false" data-kind="info"></div>
      <div id="info-card" popover="manual">
        <div class="card-header">
          <span class="badge badge-surface" id="surface-badge">Surface</span>
          <span class="badge" id="polarity-badge">Mode</span>
          <div class="card-actions">
            <button id="element-console-btn" class="inspector-btn card-action-btn" aria-label="Log Element Summary" title="Log selected element summary to console">
              Console
            </button>
            <button id="element-internals-btn" class="inspector-btn card-action-btn" aria-label="Toggle Internals" title="Show internal tokens">
              Internals
            </button>
          </div>
        </div>
        <div class="token-list" id="token-list"></div>
      </div>
      <div id="controls" aria-label="Axiomatic Inspector Controls">
        <div id="controls-secondary" aria-label="Axiomatic Inspector Secondary Controls">
          <button id="violation-toggle" aria-label="Toggle Violations" title="Show Axiom Violations (Shift+Click to Fix All)">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          </button>
          <button id="continuity-toggle" aria-label="Check Continuity" title="Run Continuity Audit (Flashes Theme)">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </button>
          <button id="reset-btn" aria-label="Reset Element" title="Revert Changes (Shift+Click to Reset All)">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
          </button>
          <button id="theme-toggle-main" aria-label="Toggle Theme" title="Toggle Light/Dark Mode">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"/><path d="M12 4v16a8 8 0 0 0 0-16z"/></svg>
          </button>
        </div>
        <button id="toggle-btn" aria-label="Toggle Inspector">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><circle cx="12" cy="12" r="3"/><path d="m16 16-1.9-1.9"/></svg>
        </button>
      </div>
    `;

    this.highlightLayer = this.root.getElementById(
      "highlight-layer",
    ) as unknown as HTMLElement;
    this.violationLayer = this.root.getElementById(
      "violation-layer",
    ) as unknown as HTMLElement;
    this.sourceLayer = this.root.getElementById(
      "source-layer",
    ) as unknown as HTMLElement;
    this.infoCard = this.root.getElementById(
      "info-card",
    ) as unknown as HTMLElement;
    this.toastEl = this.root.getElementById("toast");
    this.toggleBtn = this.root.getElementById(
      "toggle-btn",
    ) as unknown as HTMLButtonElement;
    this.violationToggle = this.root.getElementById(
      "violation-toggle",
    ) as unknown as HTMLButtonElement;
    this.continuityToggle = this.root.getElementById(
      "continuity-toggle",
    ) as unknown as HTMLButtonElement;
    this.resetBtn = this.root.getElementById(
      "reset-btn",
    ) as unknown as HTMLButtonElement;
    this.themeToggleMain = this.root.getElementById(
      "theme-toggle-main",
    ) as unknown as HTMLButtonElement;
    this.elementConsoleBtn = this.root.getElementById(
      "element-console-btn",
    ) as unknown as HTMLButtonElement;
    this.elementInternalsBtn = this.root.getElementById(
      "element-internals-btn",
    ) as unknown as HTMLButtonElement;
  }

  private animateTauTo(targetTau: 1 | -1): void {
    if (this.themeAnimationRaf) {
      cancelAnimationFrame(this.themeAnimationRaf);
      this.themeAnimationRaf = null;
    }

    const startTau = this.theme.getState().tau;
    const durationMs = 300;
    let startTime: number | null = null;

    const easeInOutQuad = (t: number): number =>
      t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

    const step = (now: number): void => {
      if (startTime === null) startTime = now;
      const elapsed = now - startTime;
      const t = Math.min(1, Math.max(0, elapsed / durationMs));
      const eased = easeInOutQuad(t);

      const nextTau = startTau + (targetTau - startTau) * eased;
      this.theme.set({ tau: nextTau });

      if (t < 1) {
        this.themeAnimationRaf = requestAnimationFrame(step);
      } else {
        // Snap to exact endpoint to ensure framework sync happens.
        this.theme.set({ tau: targetTau });
        this.themeAnimationRaf = null;
      }
    };

    this.themeAnimationRaf = requestAnimationFrame(step);
  }

  private toggleThemeAnimated(): void {
    const current = this.theme.getState();
    const target: 1 | -1 = current.tau >= 0 ? -1 : 1;
    this.animateTauTo(target);
  }

  private updateResetButtonState(): void {
    const count = this.modifiedElements.size;
    const hasAny = count > 0;

    this.resetBtn.disabled = !hasAny;
    this.resetBtn.classList.toggle("active", hasAny);
    this.resetBtn.classList.toggle(
      "visible",
      this.isEnabled && this.isViolationMode && hasAny,
    );
    this.resetBtn.title = hasAny
      ? `Revert ${count} overlay fix${count === 1 ? "" : "es"} (Shift+Click to reset all, Alt+Click diagnostics)`
      : "No overlay fixes to revert (Alt+Click diagnostics)";
  }

  private logElementSummary(element: HTMLElement): void {
    const inspection = this.engine.inspect(element);
    const continuity = this.continuityViolations.get(element);

    const surfaceToken = inspection.tokens.find(
      (t) => t.intent === "Surface Color",
    );
    const actualBg = inspection.tokens.find(
      (t) => t.intent === "Actual Background",
    );
    const finalText = inspection.tokens.find(
      (t) => t.intent === "Final Text Color",
    );
    const actualText = inspection.tokens.find(
      (t) => t.intent === "Actual Text Color",
    );

    const bgMismatch =
      !!surfaceToken && !!actualBg && surfaceToken.value !== actualBg.value;
    const textMismatch =
      !!finalText && !!actualText && finalText.value !== actualText.value;

    const mismatchProperty: "background-color" | "color" | null = bgMismatch
      ? "background-color"
      : textMismatch
        ? "color"
        : null;

    const winningRule = mismatchProperty
      ? findWinningRule(element, mismatchProperty)
      : null;

    const elementLabel = safeElementLabel(element);

    const payload: Record<string, unknown> = {
      element: {
        label: elementLabel,
        tag: element.tagName.toLowerCase(),
        id: element.id,
        classes: element.className,
      },
      context: inspection.context as unknown,
      violations: {
        axiomMismatch: inspection.hasMismatch,
        backgroundMismatch: bgMismatch,
        textMismatch: textMismatch,
        mismatchProperty,
        continuity: continuity
          ? { reason: continuity.reason, surface: continuity.surface }
          : null,
        winningRule: winningRule
          ? {
              selector: winningRule.selector,
              value: winningRule.value,
              stylesheet: winningRule.stylesheet,
              specificity: formatSpecificity(winningRule.specificity),
              important: winningRule.isImportant,
              layered: winningRule.isLayered,
              scopeProximity: winningRule.scopeProximity,
            }
          : null,
      },
      tokens: (inspection.tokens as unknown[]).map((t) => {
        const token = t as Record<string, unknown>;
        const tokenElement = token["element"];

        return {
          intent: token["intent"],
          name: token["name"],
          value: token["value"],
          sourceValue: token["sourceValue"],
          isPrivate: token["isPrivate"],
          isLocal: token["isLocal"],
          element:
            tokenElement instanceof HTMLElement
              ? safeElementLabel(tokenElement)
              : null,
        };
      }),
    };

    const globals = globalThis as unknown as {
      __AXIOMATIC_INSPECTOR_ACTIVE_ELEMENT__?: Record<string, unknown>;
    };
    globals.__AXIOMATIC_INSPECTOR_ACTIVE_ELEMENT__ = payload;

    console.groupCollapsed(`[Axiomatic] Element summary: ${elementLabel}`);
    console.log(payload);
    console.log(
      "[Axiomatic] Copy/paste tip: JSON.stringify(globalThis.__AXIOMATIC_INSPECTOR_ACTIVE_ELEMENT__, null, 2)",
    );
    console.groupEnd();
  }

  private setupToggle(): void {
    this.toggleBtn.addEventListener("click", () => {
      if (this.isEnabled) {
        this.disable();
      } else {
        this.enable();
      }
      this.saveState();
    });

    this.violationToggle.addEventListener("click", (e) => {
      if (e.altKey) {
        // Diagnostics mode: don't toggle, just dump the current scan.
        this.scanForViolations(true).catch(console.error);
        return;
      }
      if (e.shiftKey) {
        this.fixAllViolations();
        return;
      }

      this.isViolationMode = !this.isViolationMode;
      if (this.isContinuityMode) {
        this.isContinuityMode = false;
        this.continuityToggle.classList.remove("active");
        this.clearViolations();
      }

      if (this.isViolationMode) {
        this.violationToggle.classList.add("active");
        this.scanForViolations().catch(console.error);
      } else {
        this.violationToggle.classList.remove("active");
        this.clearViolations();
      }
      this.saveState();
    });

    this.continuityToggle.addEventListener("click", (e) => {
      if (e.altKey) {
        // Diagnostics mode: don't toggle, just run and dump.
        this.checkContinuity(true).catch(console.error);
        return;
      }
      this.isContinuityMode = !this.isContinuityMode;
      if (this.isViolationMode) {
        this.isViolationMode = false;
        this.violationToggle.classList.remove("active");
        this.clearViolations();
      }

      if (this.isContinuityMode) {
        this.continuityToggle.classList.add("active");
        this.checkContinuity().catch(console.error);
      } else {
        this.continuityToggle.classList.remove("active");
        this.clearViolations();
        this.continuityViolations.clear();
        if (this.activeElement) {
          this.inspect(this.activeElement);
        }
      }
      this.saveState();
    });

    this.resetBtn.addEventListener("click", (e) => {
      if (e.altKey) {
        this.dumpEmpiricalDiagnostics();
      } else if (e.shiftKey) {
        this.resetAll();
      } else if (this.activeElement) {
        this.handleReset(this.activeElement);
      }
    });

    this.themeToggleMain.addEventListener("click", () => {
      this.toggleThemeAnimated();
    });

    this.elementConsoleBtn.addEventListener("click", () => {
      if (!this.activeElement) return;
      this.logElementSummary(this.activeElement);
    });

    this.elementInternalsBtn.addEventListener("click", () => {
      this.showInternals = !this.showInternals;
      this.elementInternalsBtn.classList.toggle("active", this.showInternals);
      if (this.activeElement) {
        this.inspect(this.activeElement);
      }
      this.saveState();
    });
  }

  public enable(): void {
    if (this.isEnabled) return;
    this.isEnabled = true;
    this.toggleBtn.classList.add("active");
    this.violationToggle.classList.add("visible");
    this.continuityToggle.classList.add("visible");
    this.themeToggleMain.classList.add("visible");
    window.addEventListener("mousemove", this.handleMouseMove);
    window.addEventListener("keydown", this.handleKeyDown);
    window.addEventListener("resize", this.handleResize);
    window.addEventListener("scroll", this.handleResize, {
      capture: true,
      passive: true,
    });
    window.addEventListener("click", this.handleClick, { capture: true });

    if (this.isViolationMode) {
      this.scanForViolations().catch(console.error);
    }

    this.updateResetButtonState();

    this.loop();
  }

  public disable(): void {
    if (!this.isEnabled) return;
    this.isEnabled = false;
    this.isPinned = false;

    if (this.continuityAbort) {
      this.continuityAbort.abort();
      this.continuityAbort = null;
    }
    this.toggleBtn.classList.remove("active");
    this.violationToggle.classList.remove("visible");
    this.continuityToggle.classList.remove("visible");
    this.resetBtn.classList.remove("visible");
    this.themeToggleMain.classList.remove("visible");
    window.removeEventListener("mousemove", this.handleMouseMove);
    window.removeEventListener("keydown", this.handleKeyDown);
    window.removeEventListener("resize", this.handleResize);
    window.removeEventListener("scroll", this.handleResize, { capture: true });
    window.removeEventListener("click", this.handleClick, { capture: true });
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.clearHighlight();
    this.clearViolations();
    this.continuityViolations.clear();
    this.clearSourceHighlights();
  }

  private loop = (): void => {
    if (this.activeElement) {
      this.drawHighlight(this.activeElement);
      this.updateInfoCardPosition(this.activeElement);
    }
    this.rafId = requestAnimationFrame(this.loop);
  };

  private handleClick = (e: MouseEvent): void => {
    const target = e.target as HTMLElement;
    if (target === this || this.contains(target)) return;

    e.preventDefault();
    e.stopPropagation();

    this.isPinned = !this.isPinned;
    this.saveState();

    const boxes = this.highlightLayer.querySelectorAll(".highlight-box");
    boxes.forEach((box) => {
      if (this.isPinned) {
        box.classList.add("pinned");
      } else {
        box.classList.remove("pinned");
      }
    });
  };

  private handleMouseMove = (e: MouseEvent): void => {
    if (this.isPinned) return;
    const target = e.target as HTMLElement;
    if (target === this || this.contains(target)) return;

    if (target !== this.activeElement) {
      this.activeElement = target;
      this.inspect(target);
    }
  };

  private handleKeyDown = (e: KeyboardEvent): void => {
    if (e.ctrlKey && e.shiftKey && e.key === "X") {
      if (this.isEnabled) {
        this.disable();
      } else {
        this.enable();
      }
    }
  };

  private handleResize = (): void => {
    if (!this.isEnabled) return;
    if (this.activeElement) {
      this.inspect(this.activeElement);
    }
    if (this.isViolationMode) {
      this.scanForViolations().catch(console.error);
    }
    if (this.isContinuityMode) {
      this.clearViolations();
    }

    this.updateResetButtonState();
  };

  private inspect(element: HTMLElement): void {
    const result = this.engine.inspect(element);

    this.drawHighlight(element);
    this.updateInfoCardContent(result, element);
    this.updateInfoCardPosition(element);
  }

  private drawHighlight(element: HTMLElement): void {
    this.highlightLayer.innerHTML = "";
    const rects = element.getClientRects();

    let didSetAnchor = false;
    for (const rect of Array.from(rects)) {
      const box = document.createElement("div");
      box.className = "highlight-box";
      if (this.isPinned) box.classList.add("pinned");
      // Only set a single anchor source; multiple anchors with the same name
      // can yield surprising positioning in some implementations.
      if (!didSetAnchor) {
        box.style.setProperty("anchor-name", "--inspector-target");
        didSetAnchor = true;
      }
      box.style.top = `${rect.top}px`;
      box.style.left = `${rect.left}px`;
      box.style.width = `${rect.width}px`;
      box.style.height = `${rect.height}px`;
      this.highlightLayer.appendChild(box);
    }
  }

  private updateInfoCardContent(
    result: {
      context: DebugContext;
      tokens: ResolvedToken[];
      hasMismatch: boolean;
    },
    element: HTMLElement,
  ): void {
    const { context, tokens, hasMismatch } = result;

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const surfaceBadge = this.root.getElementById("surface-badge")!;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const polarityBadge = this.root.getElementById("polarity-badge")!;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const tokenList = this.root.getElementById("token-list")!;

    surfaceBadge.textContent = context.surface || "Unknown";
    polarityBadge.textContent = context.polarity === "dark" ? "Dark" : "Light";
    polarityBadge.className = `badge badge-${context.polarity || "light"}`;

    const uniqueSources = new Set<HTMLElement>();
    tokens.forEach((t) => {
      if (t.element) uniqueSources.add(t.element);
    });
    const sourceList = Array.from(uniqueSources);

    const adviceHtml = renderAdvice(
      result,
      element,
      this.continuityViolations.get(element)?.reason,
    );
    const tokensHtml = renderTokenList(
      tokens,
      this.showInternals,
      hasMismatch,
      sourceList,
    );

    tokenList.innerHTML = tokensHtml + adviceHtml;

    const adviceBox = tokenList.querySelector<HTMLElement>("#advice-box");
    if (adviceBox) {
      if (adviceBox.dataset.async === "true") {
        updateAdviceWithAnalysis(element, adviceBox).catch(console.error);
      }

      const copyFixBtn = adviceBox.querySelector("#copy-fix-btn");
      if (copyFixBtn) {
        copyFixBtn.addEventListener("click", () => {
          this.handleCopyFix(adviceBox);
        });
      }

      const applyFixBtn = adviceBox.querySelector("#apply-fix-btn");
      if (applyFixBtn) {
        applyFixBtn.addEventListener("click", () => {
          this.handleApplyFix(element, adviceBox);
        });
      }
    }

    this.drawSources(tokens);

    const rows = tokenList.querySelectorAll(".token-row");
    rows.forEach((row) => {
      row.addEventListener("mouseenter", () => {
        const index = parseInt(row.getAttribute("data-source-index") || "-1");
        if (index >= 0) {
          this.highlightSource(index);
        }
      });
      row.addEventListener("mouseleave", () => {
        this.clearSourceHighlight();
      });
    });

    const infoCard = this.infoCard;
    if (infoCard.matches(":popover-open")) {
      // Already open
    } else if (isPopoverElement(infoCard)) {
      infoCard.showPopover();
    } else {
      (infoCard as HTMLElement).style.display = "block";
    }
  }

  private drawSources(tokens: ResolvedToken[]): void {
    this.clearSourceHighlights();

    const uniqueSources = new Set<HTMLElement>();
    tokens.forEach((t) => {
      if (t.element) uniqueSources.add(t.element);
    });
    const sourceList = Array.from(uniqueSources);

    sourceList.forEach((element, index) => {
      const rects = element.getClientRects();
      const elementTokens = tokens.filter((t) => t.element === element);
      const isLocal = elementTokens.some((t) => t.isLocal);

      let borderColor = "";
      let labelColor = "";

      if (elementTokens.some((t) => t.intent === "Final Text Color")) {
        borderColor = "#00ff9d";
        labelColor = "#00ff9d";
      } else if (
        elementTokens.some(
          (t) =>
            t.intent === "Text Source" ||
            t.intent === "Surface Color" ||
            t.intent === "Context Hue" ||
            t.intent === "Context Chroma",
        )
      ) {
        borderColor = "#ffffff";
        labelColor = "#ffffff";
      } else if (isLocal) {
        borderColor = "#00ff9d";
        labelColor = "#00ff9d";
      } else {
        const colorVar = `var(--color-ancestor-${(index % 4) + 1})`;
        borderColor = colorVar;
        labelColor = colorVar;
      }

      const rectArray = Array.from(rects);
      for (let rectIndex = 0; rectIndex < rectArray.length; rectIndex++) {
        const rect = rectArray[rectIndex];
        if (!rect) continue;
        const box = document.createElement("div");
        box.className = "source-box";
        box.setAttribute("data-source-index", index.toString());

        box.style.top = `${rect.top}px`;
        box.style.left = `${rect.left}px`;
        box.style.width = `${rect.width}px`;
        box.style.height = `${rect.height}px`;
        box.style.borderColor = borderColor;

        if (rectIndex === 0) {
          const label = document.createElement("div");
          label.className = "source-label";
          label.style.color = labelColor;
          label.style.borderColor = labelColor;

          const tagName = element.tagName.toLowerCase();
          const idStr = element.id ? `#${element.id}` : "";
          label.textContent = `${tagName}${idStr}`;

          box.appendChild(label);
        }

        this.sourceLayer.appendChild(box);
      }
    });
  }

  private highlightSource(index: number): void {
    const boxes = this.sourceLayer.querySelectorAll(
      `.source-box[data-source-index="${index}"]`,
    );
    boxes.forEach((box) => {
      box.classList.add("active-source");
    });
  }

  private clearSourceHighlight(): void {
    const boxes = this.sourceLayer.querySelectorAll(
      ".source-box.active-source",
    );
    boxes.forEach((box) => {
      box.classList.remove("active-source");
    });
  }

  private clearSourceHighlights(): void {
    this.sourceLayer.innerHTML = "";
  }

  private updateInfoCardPosition(element: HTMLElement): void {
    // Always clear any anchor nudge before re-evaluating.
    this.infoCard.style.setProperty("--_inspector-nudge-x", "0px");
    this.infoCard.style.setProperty("--_inspector-nudge-y", "0px");

    // If anchor positioning is available, let CSS do the heavy lifting, but
    // still clamp to the viewport to avoid off-screen popovers.
    if (CSS.supports("position-area: bottom center")) {
      // Give the browser a chance to lay out the anchored position.
      const cardRect = this.infoCard.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const margin = 10;

      let dx = 0;
      let dy = 0;

      if (cardRect.left < margin) dx += margin - cardRect.left;
      if (cardRect.right > viewportWidth - margin)
        dx -= cardRect.right - (viewportWidth - margin);
      if (cardRect.top < margin) dy += margin - cardRect.top;
      if (cardRect.bottom > viewportHeight - margin)
        dy -= cardRect.bottom - (viewportHeight - margin);

      if (dx !== 0)
        this.infoCard.style.setProperty("--_inspector-nudge-x", `${dx}px`);
      if (dy !== 0)
        this.infoCard.style.setProperty("--_inspector-nudge-y", `${dy}px`);

      return;
    }

    const rect = element.getBoundingClientRect();
    const cardRect = this.infoCard.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    this.infoCard.style.margin = "0";

    let top = rect.bottom + 10;
    let left = rect.left;

    if (top + cardRect.height > viewportHeight) {
      top = rect.top - cardRect.height - 10;
    }

    if (left + cardRect.width > viewportWidth) {
      left = viewportWidth - cardRect.width - 10;
    }

    if (top < 0) top = 10;
    if (left < 0) left = 10;

    this.infoCard.style.top = `${top}px`;
    this.infoCard.style.left = `${left}px`;
  }

  private clearHighlight(): void {
    this.highlightLayer.innerHTML = "";
    const infoCard = this.infoCard;
    if (isPopoverElement(infoCard)) {
      infoCard.hidePopover();
    } else {
      (infoCard as HTMLElement).style.display = "none";
    }
    this.activeElement = null;
  }

  private async checkContinuity(logToConsole = false): Promise<void> {
    if (!this.isEnabled) return;

    if (this.continuityAbort) {
      this.continuityAbort.abort();
    }

    const abortController = new AbortController();
    this.continuityAbort = abortController;

    this.violationLayer.innerHTML = "";
    this.continuityViolations.clear();

    let violations: Violation[];
    try {
      violations = await this.engine.checkContinuity(this, {
        signal: abortController.signal,
      });
    } catch (e) {
      const err = e as { name?: string };
      if (err.name === "AbortError") return;
      throw e;
    }

    if (!this.toggleBtn.classList.contains("active")) return;

    if (violations.length > 0) {
      const report = this.publishContinuityReport(violations);

      if (logToConsole || this.isVerbose()) {
        console.groupCollapsed(
          `🚫 Continuity Violations Detected (${report.length})`,
        );
        console.table(report);
        this.logCopyPasteHint("continuity");
        console.groupEnd();
      }

      violations.forEach((v) => {
        this.drawViolation(v.element);
        this.continuityViolations.set(v.element, v);
      });

      if (this.activeElement) {
        this.inspect(this.activeElement);
      }
    } else {
      if (logToConsole || this.isVerbose()) {
        console.log("✅ No Continuity Violations found.");
      }
      this.showToast(
        "No continuity violations found. All elements interpolate smoothly.",
        "success",
      );
    }
  }

  private async waitForStableThemeState(options?: {
    timeoutMs?: number;
  }): Promise<void> {
    const timeoutMs = options?.timeoutMs ?? 900;
    const start = performance.now();

    const readTau = (): number | null => {
      const raw = getComputedStyle(document.documentElement)
        .getPropertyValue("--tau")
        .trim();
      const tau = Number.parseFloat(raw);
      return Number.isFinite(tau) ? tau : null;
    };

    const getExpectedMode = (): "light" | "dark" | null => {
      const resolved = document.documentElement.getAttribute(
        "data-axm-resolved-mode",
      );
      if (resolved === "light" || resolved === "dark") return resolved;
      const theme = document.documentElement.getAttribute("data-theme");
      if (theme === "light" || theme === "dark") return theme;
      return null;
    };

    const bodyLooksLikeMode = (mode: "light" | "dark"): boolean => {
      const cs = getComputedStyle(document.body);
      const color = cs.color;
      const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (!match) return false;
      const r = Number(match[1]);
      const g = Number(match[2]);
      const b = Number(match[3]);
      if (mode === "dark") return r > 200 && g > 200 && b > 200;
      return r < 80 && g < 80 && b < 80;
    };

    const epsilon = 1e-6;
    let lastTau: number | null = null;
    let stableFrames = 0;

    while (performance.now() - start < timeoutMs) {
      await new Promise((resolve) => requestAnimationFrame(resolve));

      const tau = readTau();
      if (tau === null) continue;

      const expectedMode = getExpectedMode();
      if (expectedMode) {
        const expectedTau = expectedMode === "dark" ? -1 : 1;
        const atEndpoint = Math.abs(tau - expectedTau) < epsilon;
        if (!atEndpoint) {
          stableFrames = 0;
          lastTau = tau;
          continue;
        }
        if (!bodyLooksLikeMode(expectedMode)) {
          stableFrames = 0;
          lastTau = tau;
          continue;
        }
      }

      if (lastTau !== null && Math.abs(tau - lastTau) < epsilon) {
        stableFrames++;
      } else {
        stableFrames = 0;
      }
      lastTau = tau;

      if (stableFrames >= 1) return;
    }
  }

  private async scanForViolations(logToConsole = false): Promise<void> {
    // Avoid transient false positives during tau/bridge transitions.
    // If we can't prove stability quickly, we still scan (best-effort).
    try {
      await this.waitForStableThemeState();
    } catch {
      // Ignore.
    }

    this.violationLayer.innerHTML = "";
    const axiomViolations = this.engine.scanForViolations(document, this);
    const chromeContractViolations =
      this.engine.scanForStarlightChromeContractViolations({
        ignoreContainer: this,
      });

    const allViolations = [...axiomViolations, ...chromeContractViolations];
    const violations = allViolations.filter(
      (v) => !this.isElementInColorMotion(v.element),
    );

    // Always publish the report so automation can reliably assert “0 violations”.
    const report = this.publishViolationReport(violations);

    if (violations.length > 0) {
      if (logToConsole || this.isVerbose()) {
        console.groupCollapsed(
          `🚫 Axiomatic Violations Detected (${report.length})`,
        );
        console.table(report);
        this.logCopyPasteHint("violations");
        console.groupEnd();
      }

      violations.forEach((v) => {
        this.drawViolation(v.element);
      });
    } else {
      if (logToConsole || this.isVerbose()) {
        console.log("✅ No Axiomatic Violations found.");
      }
    }
  }

  private isElementInColorMotion(element: Element): boolean {
    const maybeAnimatable = element as unknown as {
      getAnimations?: (options?: GetAnimationsOptions) => Animation[];
    };
    if (typeof maybeAnimatable.getAnimations !== "function") return false;

    const animations = maybeAnimatable.getAnimations({ subtree: false });
    for (const animation of animations) {
      if (animation.playState !== "running") continue;

      const effect = animation.effect;
      if (!effect || !(effect instanceof KeyframeEffect)) continue;

      for (const keyframe of effect.getKeyframes()) {
        const kf = keyframe as Record<string, unknown>;
        for (const prop of Object.keys(kf)) {
          if (
            prop === "color" ||
            prop === "backgroundColor" ||
            prop === "background-color"
          ) {
            return true;
          }

          // Custom properties that directly influence computed/painted colors.
          if (
            prop === "--tau" ||
            prop.startsWith("--axm-bridge-") ||
            prop.startsWith("--_axm-computed-")
          ) {
            return true;
          }
        }
      }
    }

    return false;
  }

  private drawViolation(element: HTMLElement): void {
    const rects = element.getClientRects();

    for (const rect of Array.from(rects)) {
      const box = document.createElement("div");
      box.className = "violation-box";
      box.style.top = `${rect.top}px`;
      box.style.left = `${rect.left}px`;
      box.style.width = `${rect.width}px`;
      box.style.height = `${rect.height}px`;
      this.violationLayer.appendChild(box);
    }
  }

  private clearViolations(): void {
    this.violationLayer.innerHTML = "";
  }

  private fixAllViolations(): void {
    const violations = this.engine.scanForViolations(document, this);
    if (violations.length === 0) {
      this.showToast("No violations to fix.", "info");
      return;
    }

    let fixedCount = 0;
    violations.forEach((v) => {
      const surface = v.surface || "surface-default";

      if (!this.modifiedElements.has(v.element)) {
        this.modifiedElements.set(v.element, {
          className: v.element.className,
          style: v.element.style.cssText,
        });
      }

      v.element.classList.add(surface);
      if (v.element.style.backgroundColor) {
        v.element.style.removeProperty("background-color");
      }

      v.element.style.setProperty(
        "background-color",
        "var(--_axm-computed-surface)",
        "important",
      );

      fixedCount++;
    });

    console.log(`[Axiomatic] ⚡ Batch fixed ${fixedCount} elements.`);
    this.scanForViolations().catch(console.error);
    this.updateResetButtonState();
    this.showToast(`Batch fixed ${fixedCount} element(s).`, "success");
  }

  private resetAll(): void {
    if (this.modifiedElements.size === 0) return;

    const count = this.modifiedElements.size;

    this.modifiedElements.forEach((state, element) => {
      element.className = state.className;
      element.style.cssText = state.style;
    });

    this.modifiedElements.clear();
    console.log("[Axiomatic] ↩️ Reset all changes.");
    this.showToast(`Reset ${count} element(s).`, "success");

    if (this.activeElement) {
      this.inspect(this.activeElement);
    }
    this.updateResetButtonState();
  }

  private handleCopyFix(adviceBox: HTMLElement): void {
    const surface = adviceBox.dataset.surface || "surface-default";
    const ruleSelector = adviceBox.dataset.ruleSelector;
    const ruleFile = adviceBox.dataset.ruleFile;
    const isInline = adviceBox.dataset.isInline === "true";
    const bgUtilities = adviceBox.dataset.bgUtilities
      ? adviceBox.dataset.bgUtilities.split(",")
      : [];

    let text = "";

    if (isInline) {
      text = `1. Remove inline \`style\` attribute (specifically background-color).\n2. Add class \`${surface}\` to the element.`;
    } else if (ruleSelector && ruleFile) {
      text = `1. In \`${ruleFile}\`, find the rule \`${ruleSelector}\`:\n   - Remove \`background-color\` property.\n2. Add class \`${surface}\` to the element.`;
    } else if (bgUtilities.length > 0) {
      const utils = bgUtilities.map((c) => `\`${c}\``).join(", ");
      text = `1. Remove conflicting utility classes: ${utils}.\n2. Add class \`${surface}\` to the element.`;
    } else {
      // Fallback
      text = `1. Remove any conflicting background styles.\n2. Add class \`${surface}\` to the element.`;
    }

    navigator.clipboard
      .writeText(text)
      .then(() => {
        const btn = adviceBox.querySelector(
          "#copy-fix-btn",
        ) as HTMLButtonElement;
        const originalText = btn.textContent;
        btn.textContent = "Copied!";
        setTimeout(() => {
          btn.textContent = originalText;
        }, 2000);
      })
      .catch(console.error);
  }

  private handleApplyFix(element: HTMLElement, adviceBox: HTMLElement): void {
    const surface = adviceBox.dataset.surface || "surface-default";
    const ruleSelector = adviceBox.dataset.ruleSelector;
    const isInline = adviceBox.dataset.isInline === "true";
    const bgUtilities = adviceBox.dataset.bgUtilities
      ? adviceBox.dataset.bgUtilities.split(",")
      : [];

    // 0. Save State (if not already saved)
    if (!this.modifiedElements.has(element)) {
      this.modifiedElements.set(element, {
        className: element.className,
        style: element.style.cssText,
      });
    }

    // 1. Add Surface Class
    element.classList.add(surface);

    // 2. Remove Utility Classes
    if (bgUtilities.length > 0) {
      element.classList.remove(...bgUtilities);
    }

    // 3. Remove Inline Style
    if (isInline) {
      element.style.removeProperty("background-color");
    }

    // 4. Override CSS Rule if necessary
    if (ruleSelector && !isInline && bgUtilities.length === 0) {
      // Force the axiomatic surface variable to win
      element.style.setProperty(
        "background-color",
        "var(--_axm-computed-surface)",
        "important",
      );
    }

    // Log to console
    const tag = element.tagName.toLowerCase();
    const id = element.id ? `#${element.id}` : "";
    console.group(`[Axiomatic] 🔧 Fixed <${tag}${id}>`);
    console.log(`Added: .${surface}`);
    if (bgUtilities.length)
      console.log(`Removed Utilities: ${bgUtilities.join(", ")}`);
    if (isInline) console.log(`Removed Inline Style: background-color`);
    if (ruleSelector) console.log(`Overrode Rule: ${ruleSelector}`);
    console.groupEnd();

    // Feedback
    const btn = adviceBox.querySelector("#apply-fix-btn") as HTMLButtonElement;
    btn.textContent = "Applied!";
    btn.disabled = true;

    // Re-inspect to show the green state
    setTimeout(() => {
      this.inspect(element);
      this.updateResetButtonState();
    }, 100);
  }

  private handleReset(element: HTMLElement): void {
    const originalState = this.modifiedElements.get(element);
    if (!originalState) return;

    element.className = originalState.className;
    element.style.cssText = originalState.style;

    this.modifiedElements.delete(element);

    const tag = element.tagName.toLowerCase();
    const id = element.id ? `#${element.id}` : "";
    console.log(`[Axiomatic] ↩️ Reset <${tag}${id}> to original state.`);

    this.inspect(element);
    this.updateResetButtonState();
  }
}

if (
  typeof customElements !== "undefined" &&
  !customElements.get("axiomatic-debugger")
) {
  customElements.define("axiomatic-debugger", AxiomaticDebugger);
}
