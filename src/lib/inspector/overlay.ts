import { resolveTokens } from "./resolver.ts";
import type { DebugContext, ResolvedToken } from "./types.ts";
import { findContextRoot } from "./walker.ts";

/* eslint-disable @axiomatic-design/no-raw-tokens */

interface PopoverElement extends HTMLElement {
  showPopover(): void;
  hidePopover(): void;
}

function isPopoverElement(element: HTMLElement): element is PopoverElement {
  return "showPopover" in (element as unknown as Record<string, unknown>);
}

const STYLES = `
  :host {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 99999;
    font-family: system-ui, -apple-system, sans-serif;
    
    --color-local: #00ff9d;
    --color-ancestor-1: #00ccff;
    --color-ancestor-2: #ffcc00;
    --color-ancestor-3: #ff66cc;
    --color-ancestor-4: #cc66ff;
  }

  #highlight-layer, #violation-layer, #source-layer {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  .highlight-box {
    position: absolute;
    border: 2px solid #ff00ff;
    background-color: rgba(255, 0, 255, 0.05);
    pointer-events: none;
    box-sizing: border-box;
    anchor-name: --inspector-target;
    z-index: 10;
  }

  .source-box {
    position: absolute;
    border: 2px dashed;
    pointer-events: none;
    box-sizing: border-box;
    z-index: 5;
    opacity: 0.4;
    transition: opacity 0.2s, border-width 0.2s;
  }

  .source-box.active-source {
    opacity: 1;
    border-width: 3px;
    z-index: 20;
    background-color: rgba(255, 255, 255, 0.05);
  }
  
  .source-label {
    position: absolute;
    top: -20px;
    left: 0;
    background: #1a1a1a;
    color: #fff;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 10px;
    display: flex;
    gap: 4px;
    white-space: nowrap;
    border: 1px solid currentColor;
    z-index: 21;
  }

  .violation-box {
    position: absolute;
    border: 2px dashed #ff4444;
    background-color: rgba(255, 68, 68, 0.2);
    pointer-events: none;
    box-sizing: border-box;
  }

  #info-card {
    position: fixed;
    background: #1a1a1a;
    color: #fff;
    padding: 12px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    border: 1px solid #333;
    font-size: 12px;
    line-height: 1.4;
    max-width: 420px;
    pointer-events: auto;
    display: none;
    backdrop-filter: blur(8px);
    
    /* Anchor Positioning */
    position-anchor: --inspector-target;
    position-area: bottom span-right;
    position-try-fallbacks: flip-block, flip-inline;
    margin: 0;
    
    /* Reset popover defaults */
    inset: auto;
  }

  #info-card:popover-open {
    display: block;
  }

  /* Fallback for browsers without anchor positioning */
  @supports not (position-area: bottom center) {
    #info-card {
      /* JS positioning will override this */
    }
  }

  .card-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
    padding-bottom: 8px;
    border-bottom: 1px solid #333;
  }

  .badge {
    padding: 2px 6px;
    border-radius: 4px;
    font-weight: 600;
    font-size: 10px;
    text-transform: uppercase;
  }

  .badge-surface { background: #333; color: #fff; }
  .badge-light { background: #fff; color: #000; }
  .badge-dark { background: #000; color: #fff; border: 1px solid #333; }

  .token-list {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .token-row {
    display: grid;
    grid-template-columns: 12px auto auto 1fr;
    align-items: start;
    gap: 12px;
    padding: 6px 8px;
    border-radius: 4px;
    cursor: default;
    white-space: nowrap;
  }

  .token-row:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  .token-name { color: #888; }
  .token-name-row { display: flex; align-items: center; gap: 6px; }
  .status-icon-slot { display: inline-flex; align-items: center; justify-content: center; width: 14px; height: 14px; }
  .token-info { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
  .token-subtitle { font-size: 9px; opacity: 0.5; font-weight: normal; font-family: system-ui, sans-serif; margin-left: 20px; }
  .token-value-group { display: flex; align-items: center; gap: 6px; justify-self: end; margin-top: 0; }
  .token-value { font-family: monospace; color: #00ff9d; }
  .token-value.type-specified { color: #ffffff; font-weight: 700; text-shadow: 0 0 8px rgba(255, 255, 255, 0.2); }
  .token-value.type-derived { color: #888888; }
  .token-value.type-source { color: #ffcc00; }
  .token-value.warning { color: #ff4444; font-weight: bold; }
  .token-swatch {
    width: 12px;
    height: 12px;
    border-radius: 2px;
    border: 1px solid #333;
    display: inline-block;
  }
  
  .token-hue-swatch {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    border: 1px solid #333;
    display: inline-block;
  }
  
  .token-chroma-bar {
    width: 20px;
    height: 6px;
    background: #333;
    border-radius: 2px;
    overflow: hidden;
    display: inline-block;
  }
  
  .token-chroma-fill {
    height: 100%;
    background: #00ff9d;
  }

  .token-empty { color: #666; font-style: italic; text-align: center; padding: 8px 0; }

  .token-source-icon {
    font-size: 10px;
    width: 16px;
    text-align: center;
    cursor: help;
    opacity: 0.7;
  }
  
  .token-source-pill {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    border: 1px solid currentColor;
    margin-top: 5px;
  }
  
  .token-source-label {
    font-size: 10px;
    opacity: 0.6;
    font-family: monospace;
    text-align: left;
    margin-top: 1px;
  }
  
  /* Source indicators */
  .source-local { color: #00ff9d; --source-color: #00ff9d; }
  .source-ancestor-1 { color: #00ccff; --source-color: #00ccff; }
  .source-ancestor-2 { color: #ffcc00; --source-color: #ffcc00; }
  .source-ancestor-3 { color: #ff66cc; --source-color: #ff66cc; }
  .source-ancestor-4 { color: #cc66ff; --source-color: #cc66ff; }
  
  .token-name.source-local, .token-name.source-ancestor-1, 
  .token-name.source-ancestor-2, .token-name.source-ancestor-3, 
  .token-name.source-ancestor-4 {
    color: var(--source-color);
    opacity: 0.9;
  }
  
  .token-source-pill.source-local, .token-source-pill.source-ancestor-1,
  .token-source-pill.source-ancestor-2, .token-source-pill.source-ancestor-3,
  .token-source-pill.source-ancestor-4 {
    background-color: var(--source-color);
    box-shadow: 0 0 4px var(--source-color);
  }

  .advice-box {
    margin-top: 12px;
    padding: 8px;
    background: rgba(255, 68, 68, 0.1);
    border: 1px solid #ff4444;
    border-radius: 4px;
    color: #ffaaaa;
    font-size: 11px;
  }
  .advice-title { font-weight: bold; margin-bottom: 4px; display: block; color: #ff4444; }

  #toggle-btn {
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: #1a1a1a;
    border: 1px solid #333;
    color: #fff;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    transition: all 0.2s ease;
    z-index: 100000;
    pointer-events: auto;
  }

  #toggle-btn:hover {
    background: #333;
    transform: scale(1.05);
  }

  #toggle-btn.active {
    background: #00ff9d;
    color: #000;
    border-color: #00ff9d;
  }

  #violation-toggle {
    position: fixed;
    bottom: 80px;
    right: 28px;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: #1a1a1a;
    border: 1px solid #333;
    color: #888;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    z-index: 99999;
    pointer-events: auto;
    opacity: 0;
    transform: translateY(20px) scale(0.8);
    pointer-events: none;
  }

  #violation-toggle.visible {
    opacity: 1;
    transform: translateY(0) scale(1);
    pointer-events: auto;
  }

  #violation-toggle.active {
    background: #ff4444;
    color: #fff;
    border-color: #ff4444;
  }

  #internals-toggle {
    position: fixed;
    bottom: 80px;
    right: 70px;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: #1a1a1a;
    border: 1px solid #333;
    color: #888;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    z-index: 99999;
    pointer-events: auto;
    opacity: 0;
    transform: translateY(20px) scale(0.8);
    pointer-events: none;
  }

  #internals-toggle.visible {
    opacity: 1;
    transform: translateY(0) scale(1);
    pointer-events: auto;
  }

  #internals-toggle.active {
    background: #00ccff;
    color: #fff;
    border-color: #00ccff;
  }

  .highlight-box.pinned {
    border-color: #00ff9d;
    background-color: rgba(0, 255, 157, 0.1);
  }
`;

export class AxiomaticDebugger extends HTMLElement {
  private root: ShadowRoot;
  private highlightLayer!: HTMLElement;
  private violationLayer!: HTMLElement;
  private sourceLayer!: HTMLElement;
  private infoCard!: HTMLElement;
  private toggleBtn!: HTMLButtonElement;
  private violationToggle!: HTMLButtonElement;
  private internalsToggle!: HTMLButtonElement;
  private activeElement: HTMLElement | null = null;
  private isEnabled = false;
  private isPinned = false;
  private isViolationMode = false;
  private showInternals = false;
  private rafId: number | null = null;

  constructor() {
    super();
    this.root = this.attachShadow({ mode: "open" });
  }

  connectedCallback(): void {
    this.render();
    this.setupToggle();
  }

  disconnectedCallback(): void {
    this.disable();
  }

  private render(): void {
    this.root.innerHTML = `
      <style>${STYLES}</style>
      <div id="source-layer"></div>
      <div id="violation-layer"></div>
      <div id="highlight-layer"></div>
      <div id="info-card" popover="manual">
        <div class="card-header">
          <span class="badge badge-surface" id="surface-badge">Surface</span>
          <span class="badge" id="polarity-badge">Mode</span>
        </div>
        <div class="token-list" id="token-list"></div>
      </div>
      <button id="internals-toggle" aria-label="Toggle Internals" title="Show Internal Plumbing">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
      </button>
      <button id="violation-toggle" aria-label="Toggle Violations" title="Show Axiom Violations">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
      </button>
      <button id="toggle-btn" aria-label="Toggle Inspector">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><circle cx="12" cy="12" r="3"/><path d="m16 16-1.9-1.9"/></svg>
      </button>
    `;

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.highlightLayer = this.root.getElementById("highlight-layer")!;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.violationLayer = this.root.getElementById("violation-layer")!;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.sourceLayer = this.root.getElementById("source-layer")!;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.infoCard = this.root.getElementById("info-card")!;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.toggleBtn = this.root.getElementById(
      "toggle-btn",
    )! as HTMLButtonElement;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.violationToggle = this.root.getElementById(
      "violation-toggle",
    )! as HTMLButtonElement;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.internalsToggle = this.root.getElementById(
      "internals-toggle",
    )! as HTMLButtonElement;
  }

  private setupToggle(): void {
    this.toggleBtn.addEventListener("click", () => {
      if (this.isEnabled) {
        this.disable();
      } else {
        this.enable();
      }
    });

    this.violationToggle.addEventListener("click", () => {
      this.isViolationMode = !this.isViolationMode;
      if (this.isViolationMode) {
        this.violationToggle.classList.add("active");
        this.scanForViolations();
      } else {
        this.violationToggle.classList.remove("active");
        this.clearViolations();
      }
    });

    this.internalsToggle.addEventListener("click", () => {
      this.showInternals = !this.showInternals;
      if (this.showInternals) {
        this.internalsToggle.classList.add("active");
      } else {
        this.internalsToggle.classList.remove("active");
      }
      // Refresh current view if active
      if (this.activeElement) {
        this.inspect(this.activeElement);
      }
    });
  }

  public enable(): void {
    if (this.isEnabled) return;
    this.isEnabled = true;
    this.toggleBtn.classList.add("active");
    this.violationToggle.classList.add("visible");
    this.internalsToggle.classList.add("visible");
    window.addEventListener("mousemove", this.handleMouseMove);
    window.addEventListener("keydown", this.handleKeyDown);
    window.addEventListener("click", this.handleClick, { capture: true });

    // Restore violation state if it was active
    if (this.isViolationMode) {
      this.scanForViolations();
    }

    this.loop();
  }

  public disable(): void {
    if (!this.isEnabled) return;
    this.isEnabled = false;
    this.isPinned = false;
    this.toggleBtn.classList.remove("active");
    this.violationToggle.classList.remove("visible");
    this.internalsToggle.classList.remove("visible");
    window.removeEventListener("mousemove", this.handleMouseMove);
    window.removeEventListener("keydown", this.handleKeyDown);
    window.removeEventListener("click", this.handleClick, { capture: true });
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.clearHighlight();
    this.clearViolations();
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

    // Ignore clicks on the debugger UI itself
    if (target === this || this.contains(target)) return;

    // Toggle pinned state
    e.preventDefault();
    e.stopPropagation();

    this.isPinned = !this.isPinned;

    // Update visual state of highlight box
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

    // Ignore self
    if (target === this || this.contains(target)) return;

    if (target !== this.activeElement) {
      this.activeElement = target;
      this.inspect(target);
    }
  };

  private handleKeyDown = (e: KeyboardEvent): void => {
    // Toggle with Ctrl+Shift+X
    if (e.ctrlKey && e.shiftKey && e.key === "X") {
      if (this.isEnabled) {
        this.disable();
      } else {
        this.enable();
      }
    }
  };

  private inspect(element: HTMLElement): void {
    const context = findContextRoot(element);
    const tokens = resolveTokens(element, context);

    // Draw highlight and position card immediately
    this.drawHighlight(element);
    this.updateInfoCardContent(context, tokens);
    this.updateInfoCardPosition(element);
  }

  private drawHighlight(element: HTMLElement): void {
    this.highlightLayer.innerHTML = "";
    const rects = element.getClientRects();

    for (const rect of Array.from(rects)) {
      const box = document.createElement("div");
      box.className = "highlight-box";
      if (this.isPinned) box.classList.add("pinned");
      box.style.top = `${rect.top}px`;
      box.style.left = `${rect.left}px`;
      box.style.width = `${rect.width}px`;
      box.style.height = `${rect.height}px`;
      this.highlightLayer.appendChild(box);
    }
  }

  private updateInfoCardContent(
    context: DebugContext,
    tokens: ResolvedToken[],
  ): void {
    let adviceHtml = "";
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const surfaceBadge = this.root.getElementById("surface-badge")!;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const polarityBadge = this.root.getElementById("polarity-badge")!;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const tokenList = this.root.getElementById("token-list")!;

    // Update Header
    surfaceBadge.textContent = context.surface || "Unknown";

    polarityBadge.textContent = context.polarity === "dark" ? "Dark" : "Light";
    polarityBadge.className = `badge badge-${context.polarity || "light"}`;

    // Filter tokens based on visibility settings
    const visibleTokens = tokens.filter(
      (t) => this.showInternals || !t.isPrivate,
    );

    // Reorder tokens: Final Text Color should be at the bottom
    const PRIORITY: Record<string, number> = {
      "Text Source": 1,
      "Surface Color": 2,
      "Context Hue": 3,
      "Context Chroma": 4,
      "Actual Background": 5,
      "Final Text Color": 6,
    };

    visibleTokens.sort((a, b) => {
      const pA = PRIORITY[a.intent] || 99;
      const pB = PRIORITY[b.intent] || 99;
      return pA - pB;
    });

    // Extract Context Hue for coloring
    const baseHueToken = tokens.find((t) => t.intent === "Context Hue");
    const baseHue = baseHueToken ? parseFloat(baseHueToken.value) : 0;

    // Update Tokens
    if (visibleTokens.length === 0) {
      tokenList.innerHTML = `<div class="token-empty">No axiomatic tokens found</div>`;
    } else {
      // Check for mismatch
      const surfaceToken = tokens.find((t) => t.intent === "Surface Color");
      const bgToken = tokens.find((t) => t.intent === "Actual Background");
      const hasMismatch =
        surfaceToken && bgToken && surfaceToken.value !== bgToken.value;

      // Identify unique source elements to assign colors
      const uniqueSources = new Set<HTMLElement>();
      visibleTokens.forEach((t) => {
        if (t.element) uniqueSources.add(t.element);
      });
      const sourceList = Array.from(uniqueSources);

      if (hasMismatch && this.activeElement) {
        const classList = Array.from(this.activeElement.classList);
        // Filter for background-related utilities specifically
        const bgUtilities = classList.filter((c) => c.startsWith("bg-"));
        // Filter out system classes to highlight custom ones
        const otherClasses = classList.filter(
          (c) =>
            !c.startsWith("bg-") &&
            !c.startsWith("text-") &&
            !c.startsWith("surface-") &&
            !c.startsWith("theme-"),
        );

        const hasInlineStyle = this.activeElement.style.backgroundColor !== "";

        let reason = "Tag selector or User Agent default style.";

        if (hasInlineStyle) {
          reason = "Inline `style` attribute detected.";
        } else if (bgUtilities.length > 0) {
          reason = `Utility classes detected: ${bgUtilities.join(", ")}.`;
        } else if (otherClasses.length > 0) {
          reason = `Custom CSS classes detected: ${otherClasses.join(", ")}. Check your stylesheets.`;
        } else if (this.activeElement.id) {
          reason = `ID selector detected: #${this.activeElement.id}. Check your stylesheets.`;
        }

        adviceHtml = `
          <div class="advice-box">
            <span class="advice-title">Axiom Violation</span>
            The background color does not match the Surface token.
            <br><br>
            <strong>Cause:</strong> ${reason}
            <br><br>
            <strong>Fix:</strong> Remove the override or wrap this element in a new Surface context.
          </div>
        `;
      }

      tokenList.innerHTML =
        visibleTokens
          .map((t) => {
            const isColor =
              t.value.startsWith("oklch") ||
              t.value.startsWith("#") ||
              t.value.startsWith("rgb");
            let swatch = isColor
              ? `<div class="token-swatch" style="background-color: ${t.value}"></div>`
              : "";

            // Special visualization for Context Hue and Context Chroma
            if (t.intent === "Context Hue") {
              const hue = parseFloat(t.value);
              if (!isNaN(hue)) {
                swatch = `<div class="token-hue-swatch" style="background-color: oklch(0.7 0.15 ${hue})"></div>`;
              }
            } else if (t.intent === "Context Chroma") {
              const chroma = parseFloat(t.value);
              if (!isNaN(chroma)) {
                // Max chroma is usually around 0.37, so we scale 0.4 to 100%
                const width = Math.min(100, (chroma / 0.4) * 100);
                swatch = `<div class="token-chroma-bar"><div class="token-chroma-fill" style="width: ${width}%"></div></div>`;
              }
            }

            const isWarning = hasMismatch && t.intent === "Actual Background";

            // Determine icon and tooltip based on token type
            let statusIcon = "";
            let statusTooltip = "";
            let subtitle = "";
            let roleColor = ""; // Semantic color for the role
            let isResult = false;

            const inputIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>`; // Input/Plus icon

            if (t.intent === "Final Text Color") {
              statusIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12h20"/><path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-6"/><path d="M12 12v6"/></svg>`; // Result/Equals icon metaphor
              subtitle = "Result";
              roleColor = "#00ff9d"; // Green (Result)
              isResult = true;
            } else if (t.intent === "Text Source") {
              statusIcon = inputIcon;
              subtitle = "Input: Lightness";
              roleColor = "#ffffff"; // High Contrast White
            } else if (t.intent === "Surface Color") {
              statusIcon = inputIcon;
              subtitle = "Input: Context";
              roleColor = "#ffffff"; // High Contrast White
            } else if (t.intent === "Context Hue") {
              statusIcon = inputIcon;
              subtitle = "Input: Context Hue";
              roleColor = "#ffffff"; // High Contrast White
            } else if (t.intent === "Context Chroma") {
              statusIcon = inputIcon;
              subtitle = "Input: Context Chroma";
              roleColor = "#ffffff"; // High Contrast White
            } else if (t.isPrivate && !t.responsibleClass && !t.isInline) {
              statusIcon = "🔒";
              statusTooltip = "Private Token";
            } else if (t.isDefault) {
              statusIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="opacity: 0.7;"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg>`;
              statusTooltip = "System Default";
            }

            // Determine value type for coloring
            let valueType = "";
            let valueStyle = "";

            if (t.intent === "Text Source") {
              valueType = "type-specified";
            } else if (t.intent === "Final Text Color") {
              // Result should be green (roleColor)
              valueStyle = `color: ${roleColor}; font-weight: bold;`;
            } else if (t.intent === "Surface Color") {
              valueType = "type-derived";
            } else if (t.intent === "Context Hue") {
              if (!isNaN(baseHue)) {
                // Use a visible chroma to show the hue clearly
                valueStyle = `color: oklch(0.8 0.14 ${baseHue}); font-weight: bold;`;
              } else {
                valueType = "type-source";
              }
            } else if (t.intent === "Context Chroma") {
              const chroma = parseFloat(t.value);
              if (!isNaN(baseHue) && !isNaN(chroma)) {
                // Use the actual chroma
                valueStyle = `color: oklch(0.8 ${chroma} ${baseHue}); font-weight: bold;`;
              } else {
                valueType = "type-source";
              }
            }

            const valueClass = isWarning
              ? "token-value warning"
              : `token-value ${valueType}`;
            const warningIcon = isWarning
              ? `<span title="Mismatch with Surface Color">⚠️</span>`
              : "";

            const statusIndicator = `<span class="status-icon-slot" title="${statusTooltip}" style="${roleColor ? `color: ${roleColor}; opacity: 1;` : ""}">${statusIcon}</span>`;
            const subtitleHtml = subtitle
              ? `<span class="token-subtitle">${subtitle}</span>`
              : "";

            // Source visualization
            let sourceClass = "";
            let sourcePill = "";
            let sourceTitle = "";
            let sourceIndex: number = -1;
            let responsibleClassLabel = "";

            if (t.isDefault) {
              sourceClass = "source-system";
              sourceTitle = "System Default";
              // If roleColor is set, use it. Otherwise default to system style.
              const pillStyle = roleColor
                ? `background-color: ${roleColor}; box-shadow: 0 0 4px ${roleColor}; border: none;`
                : `border: 1px solid #666; background: #333; opacity: 0.8;`;

              sourcePill = `<span class="token-source-pill" style="${pillStyle}" title="${sourceTitle}"></span>`;
              responsibleClassLabel = `<span class="token-source-label" style="color: #aaa;">${sourceTitle}</span>`;

              if (t.element) {
                sourceIndex = sourceList.indexOf(t.element);
              }
            } else if (t.element) {
              sourceIndex = sourceList.indexOf(t.element);
              // If it's local, use green. If it's remote, cycle through colors.
              if (t.isLocal) {
                sourceClass = "source-local";
                sourceTitle = "Local Element";
                // If roleColor is set, override the local green
                const pillClass = roleColor ? "" : `source-local`;
                const pillStyle = roleColor
                  ? `background-color: ${roleColor}; box-shadow: 0 0 4px ${roleColor};`
                  : "";
                sourcePill = `<span class="token-source-pill ${pillClass}" style="${pillStyle}" title="${sourceTitle}"></span>`;
              } else {
                sourceClass = `source-ancestor-${(sourceIndex % 4) + 1}`;

                const tagName = t.element.tagName.toLowerCase();
                const idStr = t.element.id ? `#${t.element.id}` : "";
                sourceTitle = `Inherited from ${tagName}${idStr}`;

                // If roleColor is set, override the ancestor color
                const pillClass = roleColor ? "" : sourceClass;
                const pillStyle = roleColor
                  ? `background-color: ${roleColor}; box-shadow: 0 0 4px ${roleColor};`
                  : "";

                sourcePill = `<span class="token-source-pill ${pillClass}" style="${pillStyle}" title="${sourceTitle}"></span>`;
              }

              if (t.responsibleClass) {
                responsibleClassLabel = `<span class="token-source-label" style="color: ${roleColor || "var(--source-color)"}">${t.responsibleClass}</span>`;
              } else if (t.isInline) {
                responsibleClassLabel = `<span class="token-source-label" style="color: ${roleColor || "var(--source-color)"}; font-style: italic;">inline style</span>`;
              } else {
                // Fallback: Show the tag name if no specific class is responsible
                const tagName = t.element.tagName.toLowerCase();
                const idStr = t.element.id ? `#${t.element.id}` : "";
                responsibleClassLabel = `<span class="token-source-label" style="color: ${roleColor || "var(--source-color)"}; opacity: 0.6;">${tagName}${idStr}</span>`;
              }
            }

            // Override the name color if roleColor is present
            const nameStyle = roleColor
              ? `color: ${roleColor}; opacity: 1; font-weight: ${isResult ? "bold" : "normal"};`
              : "";

            // Special styling for the Result row
            const rowStyle = isResult
              ? `
              margin-top: 8px; 
              padding-top: 8px; 
              border-top: 1px solid #333; 
              background: rgba(0, 255, 157, 0.05);
            `
              : "";

            // Hide responsible class for Result to avoid redundancy
            if (isResult) {
              responsibleClassLabel = "";
            }

            // Deduplicate Text Source label if it matches the value
            if (
              t.intent === "Text Source" &&
              responsibleClassLabel.includes(t.sourceValue)
            ) {
              // If it's a default, keep the "(default)" part but maybe dim it?
              // Actually, if we just hide it, it looks cleaner.
              // But we want to know if it's default.
              if (t.isDefault) {
                responsibleClassLabel = `<span class="token-source-label" style="color: #666; font-style: italic;">(default)</span>`;
              } else {
                responsibleClassLabel = "";
              }
            }

            return `
        <div class="token-row" data-source-index="${sourceIndex}" style="${rowStyle}">
            ${sourcePill}
            <div class="token-info">
              <div class="token-name-row">
                ${statusIndicator}
                <span class="token-name ${roleColor ? "" : sourceClass}" style="${nameStyle}">${t.intent}</span>
              </div>
              ${subtitleHtml}
            </div>
            ${responsibleClassLabel}
          <div class="token-value-group">
            ${warningIcon}
            ${swatch}
            <span class="${valueClass}" style="${valueStyle}" title="${t.value}">${t.sourceValue}</span>
          </div>
        </div>
      `;
          })
          .join("") + adviceHtml;

      // Draw source highlights on the page
      this.drawSources(visibleTokens);

      // Add hover listeners to token rows
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
    }

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
      // Skip if it's the active element (already highlighted by the main box)
      // UNLESS we want to show that it is also a source.
      // Let's show it but maybe with a different style?
      // For now, let's show all sources to be explicit.

      const rects = element.getClientRects();
      const elementTokens = tokens.filter((t) => t.element === element);
      const isLocal = elementTokens.some((t) => t.isLocal);

      let borderColor = "";
      let labelColor = "";

      // Check for semantic roles first to match the token list
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
        // Add index for hover targeting
        box.setAttribute("data-source-index", index.toString());

        box.style.top = `${rect.top}px`;
        box.style.left = `${rect.left}px`;
        box.style.width = `${rect.width}px`;
        box.style.height = `${rect.height}px`;
        box.style.borderColor = borderColor;

        // Only add label to the first rect of the element
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
    // TODO(cleanup): Remove this JS fallback in January 2026.
    // CSS Anchor Positioning (`position-area`) is targeted for Baseline 2025.
    // Once widely supported, this manual positioning logic is redundant.

    // If anchor positioning is supported, we don't need manual positioning
    if (CSS.supports("position-area: bottom center")) return;

    const rect = element.getBoundingClientRect();
    const cardRect = this.infoCard.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Reset margin to avoid double spacing with manual positioning
    this.infoCard.style.margin = "0";

    // Default: Bottom-Left aligned
    let top = rect.bottom + 10;
    let left = rect.left;

    // Vertical Flip: If it goes off bottom, put it above
    if (top + cardRect.height > viewportHeight) {
      top = rect.top - cardRect.height - 10;
    }

    // Horizontal Shift: If it goes off right, align to right edge
    if (left + cardRect.width > viewportWidth) {
      left = viewportWidth - cardRect.width - 10;
    }

    // Safety clamp
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

  private scanForViolations(): void {
    this.violationLayer.innerHTML = "";
    const allElements = document.body.querySelectorAll("*");

    for (const element of Array.from(allElements)) {
      if (element instanceof HTMLElement) {
        // Skip hidden elements
        if (element.offsetParent === null) continue;

        // Skip the debugger itself
        if (element.tagName === "AXIOMATIC-DEBUGGER") continue;
        if (this.contains(element)) continue;

        const context = findContextRoot(element);
        const tokens = resolveTokens(element, context);

        const surfaceToken = tokens.find((t) => t.intent === "Surface Color");
        const bgToken = tokens.find((t) => t.intent === "Actual Background");

        const hasSurfaceMismatch =
          surfaceToken && bgToken && surfaceToken.value !== bgToken.value;
        const hasUnconnectedPrivateToken = tokens.some(
          (t) => t.isLocal && t.isPrivate && !t.responsibleClass && !t.isInline,
        );

        if (hasSurfaceMismatch || hasUnconnectedPrivateToken) {
          this.drawViolation(element);
        }
      }
    }
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
}

// Auto-register if in browser
if (
  typeof customElements !== "undefined" &&
  !customElements.get("axiomatic-debugger")
) {
  customElements.define("axiomatic-debugger", AxiomaticDebugger);
}
