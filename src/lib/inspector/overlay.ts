import { resolveTokens } from "./resolver.ts";
import type { DebugContext, ResolvedToken } from "./types.ts";
import { findContextRoot } from "./walker.ts";

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
  }

  #highlight-layer {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  .highlight-box {
    position: absolute;
    border: 2px solid #ff00ff;
    background-color: rgba(255, 0, 255, 0.1);
    pointer-events: none;
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
    max-width: 300px;
    pointer-events: auto;
    display: none;
    backdrop-filter: blur(8px);
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
    display: flex;
    justify-content: space-between;
    gap: 12px;
  }

  .token-name { color: #888; }
  .token-value { font-family: monospace; color: #00ff9d; }
`;

export class AxiomaticDebugger extends HTMLElement {
  private root: ShadowRoot;
  private highlightLayer!: HTMLElement;
  private infoCard!: HTMLElement;
  private activeElement: HTMLElement | null = null;
  private isEnabled = false;

  constructor() {
    super();
    this.root = this.attachShadow({ mode: "open" });
  }

  connectedCallback(): void {
    this.render();
    this.enable();
  }

  disconnectedCallback(): void {
    this.disable();
  }

  private render(): void {
    this.root.innerHTML = `
      <style>${STYLES}</style>
      <div id="highlight-layer"></div>
      <div id="info-card">
        <div class="card-header">
          <span class="badge badge-surface" id="surface-badge">Surface</span>
          <span class="badge" id="polarity-badge">Mode</span>
        </div>
        <div class="token-list" id="token-list"></div>
      </div>
    `;

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.highlightLayer = this.root.getElementById("highlight-layer")!;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.infoCard = this.root.getElementById("info-card")!;
  }

  public enable(): void {
    if (this.isEnabled) return;
    this.isEnabled = true;
    window.addEventListener("mousemove", this.handleMouseMove);
    window.addEventListener("keydown", this.handleKeyDown);
  }

  public disable(): void {
    if (!this.isEnabled) return;
    this.isEnabled = false;
    window.removeEventListener("mousemove", this.handleMouseMove);
    window.removeEventListener("keydown", this.handleKeyDown);
    this.clearHighlight();
  }

  private handleMouseMove = (e: MouseEvent): void => {
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

    this.drawHighlight(element);
    this.updateInfoCard(element, context, tokens);
  }

  private drawHighlight(element: HTMLElement): void {
    this.highlightLayer.innerHTML = "";
    const rects = element.getClientRects();

    for (const rect of Array.from(rects)) {
      const box = document.createElement("div");
      box.className = "highlight-box";
      box.style.top = `${rect.top}px`;
      box.style.left = `${rect.left}px`;
      box.style.width = `${rect.width}px`;
      box.style.height = `${rect.height}px`;
      this.highlightLayer.appendChild(box);
    }
  }

  private updateInfoCard(
    element: HTMLElement,
    context: DebugContext,
    tokens: ResolvedToken[],
  ): void {
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

    // Update Tokens
    tokenList.innerHTML = tokens
      .map(
        (t) => `
      <div class="token-row">
        <span class="token-name">${t.intent}</span>
        <span class="token-value" title="${t.value}">${t.sourceValue}</span>
      </div>
    `,
      )
      .join("");

    // Position Card
    // Simple positioning for now (bottom-right of cursor or element)
    // Ideally use CSS Anchor Positioning if available, or floating-ui logic
    const rect = element.getBoundingClientRect();
    this.infoCard.style.display = "block";

    // Basic collision detection could go here
    const cardTop = rect.bottom + 10;
    const cardLeft = rect.left;

    this.infoCard.style.top = `${cardTop}px`;
    this.infoCard.style.left = `${cardLeft}px`;
  }

  private clearHighlight(): void {
    this.highlightLayer.innerHTML = "";
    this.infoCard.style.display = "none";
    this.activeElement = null;
  }
}

// Auto-register if in browser
if (
  typeof customElements !== "undefined" &&
  !customElements.get("axiomatic-debugger")
) {
  customElements.define("axiomatic-debugger", AxiomaticDebugger);
}
