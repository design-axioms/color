import { AxiomaticTheme, type ThemeState } from "../theme.ts";

export interface TunerOptions {
  root: HTMLElement;
  /**
   * An optional AxiomaticTheme instance to use for theme state management.
   * If not provided, uses the shared singleton via `AxiomaticTheme.get()`.
   */
  theme?: AxiomaticTheme;
}

export class AxiomaticTuner {
  private root: HTMLElement;
  private overrideStyle: HTMLStyleElement | null = null;
  private manager: AxiomaticTheme;
  private isDirty = false;

  constructor(options: TunerOptions) {
    this.root = options.root;
    this.manager = options.theme ?? AxiomaticTheme.get();
  }

  private unsubscribe: (() => void) | null = null;

  public init(): void {
    if (this.unsubscribe) return;
    this.unsubscribe = this.manager.subscribe((state) => {
      if (this.isDirty) {
        this.applyOverrides(state);
      }
    });
  }

  public dispose(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
  }

  private applyOverrides(state: ThemeState): void {
    if (!this.overrideStyle) {
      this.overrideStyle = document.createElement("style");
      this.overrideStyle.id = "axiomatic-tuner-overrides";
      document.head.appendChild(this.overrideStyle);
    }

    // Force override on all surfaces to ensure the tuner works
    // even if theme.css has specific rules.
    this.overrideStyle.textContent = `
      :root, body, [class*="surface-"] {
        --alpha-hue: ${state.hue} !important;
        --alpha-beta: ${state.chroma} !important;
        --tau: ${state.tau} !important;
        color-scheme: ${state.tau === 1 ? "light" : "dark"} !important;
      }
    `;

    // Also update the root element for good measure (ThemeManager does this too, but the tuner is aggressive)
    this.root.style.setProperty("--alpha-hue", state.hue.toString());
    this.root.style.setProperty("--alpha-beta", state.chroma.toString());
    this.root.style.setProperty("--tau", state.tau.toString());
    this.root.setAttribute("data-theme", state.tau === 1 ? "light" : "dark");
  }

  public setHue(value: number): void {
    this.isDirty = true;
    this.manager.set({ hue: value });
  }

  public setChroma(value: number): void {
    this.isDirty = true;
    this.manager.set({ chroma: value });
  }

  public toggleTheme(): void {
    this.isDirty = true;
    this.manager.toggle();
  }

  public exportConfig(): string {
    const state = this.manager.getState();
    const hue = state.hue;
    const chroma = state.chroma;

    // This is a simplified export. In a real scenario, we'd map this back to the full config schema.
    const config = {
      anchors: {
        keyColors: {
          brand: `oklch(0.6 ${chroma} ${hue})`,
        },
      },
      // ... other defaults
    };

    return JSON.stringify(config, null, 2);
  }
}
