import { AxiomaticError } from "./errors.ts";

export type ThemeListener = (state: ThemeState) => void;

export interface ThemeState {
  hue: number;
  chroma: number;
  tau: number; // 1 (Light) or -1 (Dark)
}

const warnedThemeKeys = new Set<string>();

function warnThemeOnce(key: string, message: string): void {
  if (warnedThemeKeys.has(key)) return;
  warnedThemeKeys.add(key);

  console.warn(message);
}

function readCssVar(style: CSSStyleDeclaration, name: string): string | null {
  const raw = style.getPropertyValue(name);
  const trimmed = raw.trim();
  return trimmed.length === 0 ? null : trimmed;
}

function readCssVarNumber(
  style: CSSStyleDeclaration,
  name: string,
  fallback: number,
): number {
  const raw = readCssVar(style, name);

  if (raw === null) {
    warnThemeOnce(
      name,
      `AxiomaticTheme: missing CSS variable ${name}; using fallback ${fallback}.`,
    );
    return fallback;
  }

  const parsed = Number.parseFloat(raw);
  if (!Number.isFinite(parsed)) {
    throw new AxiomaticError(
      "THEME_INVALID_CSS_VAR",
      `AxiomaticTheme: invalid numeric CSS variable ${name}=${JSON.stringify(raw)}.`,
      { name, raw },
    );
  }

  return parsed;
}

/**
 * Singleton class for reading and writing theme state from CSS variables.
 *
 * @internal This class is an internal implementation detail and should not be
 * used directly by consumers. Use {@link ThemeManager} for runtime theme control.
 */
export class AxiomaticTheme {
  private static instance?: AxiomaticTheme;
  private listeners: Set<ThemeListener> = new Set();
  private observer: MutationObserver | null = null;
  private lastNotifiedState: ThemeState | null = null;

  private constructor() {
    if (typeof document !== "undefined") {
      this.observer = new MutationObserver(() => {
        this.handleMutation();
      });
      this.observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["style", "class", "data-theme"],
      });
    }
  }

  public static get(): AxiomaticTheme {
    if (!AxiomaticTheme.instance) {
      AxiomaticTheme.instance = new AxiomaticTheme();
    }
    return AxiomaticTheme.instance;
  }

  private handleMutation(): void {
    const current = this.getState();
    if (!this.isEqual(current, this.lastNotifiedState)) {
      this.notify();
    }
  }

  private isEqual(a: ThemeState, b: ThemeState | null): boolean {
    if (!b) return false;
    return a.hue === b.hue && a.chroma === b.chroma && a.tau === b.tau;
  }

  public getState(): ThemeState {
    if (typeof document === "undefined") {
      return { hue: 0, chroma: 0.008, tau: 1 };
    }
    const style = getComputedStyle(document.documentElement);
    const hue = readCssVarNumber(style, "--alpha-hue", 0);
    const chroma = readCssVarNumber(style, "--alpha-beta", 0.008);

    // Check --tau first, then fallback to data-theme
    const rawTau = readCssVar(style, "--tau");
    let tau = rawTau === null ? NaN : Number.parseFloat(rawTau);

    if (rawTau !== null && !Number.isFinite(tau)) {
      throw new AxiomaticError(
        "THEME_INVALID_CSS_VAR",
        `AxiomaticTheme: invalid numeric CSS variable --tau=${JSON.stringify(rawTau)}.`,
        { name: "--tau", raw: rawTau },
      );
    }

    const dataTheme = document.documentElement.getAttribute("data-theme");
    if (dataTheme) {
      const attrTau = dataTheme === "dark" ? -1 : 1;
      // Heuristic: If computed tau is binary (locked) but disagrees with the attribute,
      // trust the attribute. This allows external switchers (Starlight) to break
      // through Tuner overrides, while preserving non-binary overrides (e.g. Tau=0).
      if ((tau === 1 || tau === -1) && tau !== attrTau) {
        tau = attrTau;
      }
      if (isNaN(tau)) {
        tau = attrTau;
      }
    } else if (isNaN(tau)) {
      tau = 1; // Default
    }

    return { hue, chroma, tau };
  }

  public subscribe(listener: ThemeListener): () => void {
    this.listeners.add(listener);
    // Notify immediately with current state
    listener(this.getState());
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    const state = this.getState();
    this.lastNotifiedState = state;
    this.listeners.forEach((l) => {
      l(state);
    });
  }

  public set(updates: Partial<ThemeState>): void {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    const current = this.getState();
    const next = { ...current, ...updates };

    const isTauInlineLocked = (): boolean => {
      // Respect explicit audit/consumer locks such as `--tau: 0 !important`.
      // This prevents the theme manager from fighting tests or continuity audits.
      return root.style.getPropertyPriority("--tau") === "important";
    };

    const isBinaryTau = (tau: number): tau is 1 | -1 => {
      // During animations `--tau` is continuous. Only sync framework-facing
      // attributes/classes when tau is at a mode endpoint.
      const EPSILON = 1e-6;
      return Math.abs(tau - 1) < EPSILON || Math.abs(tau + 1) < EPSILON;
    };

    if (updates.hue !== undefined) {
      root.style.setProperty("--alpha-hue", next.hue.toString());
    }
    if (updates.chroma !== undefined) {
      root.style.setProperty("--alpha-beta", next.chroma.toString());
    }
    if (updates.tau !== undefined) {
      if (!isTauInlineLocked()) {
        root.style.setProperty("--tau", next.tau.toString());
      }

      if (isBinaryTau(next.tau)) {
        root.style.colorScheme = next.tau === 1 ? "light" : "dark";

        // Sync with common frameworks (only at endpoints)
        if (next.tau === 1) {
          root.classList.remove("dark");
          root.setAttribute("data-theme", "light");
        } else {
          root.classList.add("dark");
          root.setAttribute("data-theme", "dark");
        }
      }
    }

    // Notify immediately for responsiveness
    this.notify();
  }

  public toggle(): void {
    const current = this.getState();
    this.set({ tau: current.tau === 1 ? -1 : 1 });
  }
}
