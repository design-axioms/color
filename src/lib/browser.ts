/**
 * Updates the <meta name="theme-color"> tag to match the computed background color
 * of the document body.
 *
 * Call this function whenever the theme changes (e.g. after switching modes).
 */
import { requireDocumentBody, requireDocumentHead } from "./dom.ts";
import { AxiomaticTheme } from "./theme.ts";

/**
 * Sets the theme-color meta tag to the body's current background color.
 */
export function updateThemeColor(): void {
  if (typeof document === "undefined") return;

  const head = requireDocumentHead("updateThemeColor");
  const body = requireDocumentBody("updateThemeColor");

  let meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) {
    // P1-21: Auto-create meta theme-color tag if missing
    meta = document.createElement("meta");
    meta.setAttribute("name", "theme-color");
    head.appendChild(meta);
  }

  // Force a style recomputation to ensure we get the latest color
  const color = getComputedStyle(body).backgroundColor;
  if (color) {
    meta.setAttribute("content", color);
  }
}

/**
 * Updates the favicon to match the current theme color.
 *
 * @param getSvg A function that returns an SVG string. It receives the current brand color as an argument.
 */
export function updateFavicon(getSvg: (color: string) => string): void {
  if (typeof document === "undefined") return;

  const head = requireDocumentHead("updateFavicon");
  const body = requireDocumentBody("updateFavicon");

  let link = document.querySelector('link[rel="icon"]');
  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", "icon");
    head.appendChild(link);
  }

  // We'll use the body's computed color (foreground) as the "brand" color for now
  const color = getComputedStyle(body).color;

  if (color) {
    const svg = getSvg(color);
    const dataUri = `data:image/svg+xml,${encodeURIComponent(svg)}`;
    link.setAttribute("href", dataUri);
  }
}

export type ThemeMode = "light" | "dark" | "system";

export interface ThemeManagerOptions {
  /**
   * The element to apply the theme to. Defaults to document.documentElement.
   */
  root?: HTMLElement;
  /**
   * A function to generate the favicon SVG based on the current theme color.
   * If provided, the favicon will be updated automatically.
   */
  faviconGenerator?: (color: string) => string;
  /**
   * Selectors for surfaces with inverted polarity.
   * Import from generated theme file:
   * ```ts
   * import { invertedSelectors } from './theme.generated';
   * new ThemeManager({ invertedSelectors });
   * ```
   *
   * Generate with: `axiomatic build --emit-ts`
   */
  invertedSelectors: readonly string[];
  /**
   * An optional AxiomaticTheme instance to use for theme state management.
   * If not provided, uses the shared singleton via `AxiomaticTheme.get()`.
   *
   * Useful for testing or when you need isolated theme instances.
   */
  theme?: AxiomaticTheme;
}

/**
 * Manages the theme (light/dark/system) for the application.
 * Handles system preference changes, manual overrides, and inverted surfaces.
 */
export class ThemeManager {
  private root: HTMLElement | null;
  private faviconGenerator?: (color: string) => string;
  private theme: AxiomaticTheme;
  private _mode: ThemeMode = "system";
  private mediaQuery: MediaQueryList | null = null;
  private invertedSelectors: readonly string[];
  private observer: MutationObserver | null = null;
  private hasMarkedReady = false;

  /**
   * Creates a new ThemeManager instance.
   * @param options Configuration options for the manager.
   */
  constructor(options: ThemeManagerOptions) {
    // Store inverted selectors (required)
    this.invertedSelectors = options.invertedSelectors;
    // Use injected theme or fall back to singleton
    this.theme = options.theme ?? AxiomaticTheme.get();

    if (typeof document !== "undefined") {
      this.root = options.root ?? document.documentElement;
      this.faviconGenerator = options.faviconGenerator;

      this.mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      this.mediaQuery.addEventListener("change", this.handleSystemChange);

      // Initialize inverted surfaces
      this.initInvertedSurfaces();
    } else {
      // Fallback for SSR/testing
      this.root = null;
    }
  }

  private syncSemanticState(): void {
    if (!this.root) return;
    this.root.setAttribute("data-axm-mode", this._mode);
    this.root.setAttribute("data-axm-resolved-mode", this.resolvedMode);

    // Gate `--tau` transitions until after the initial semantic state is present.
    // This prevents a boot-time animate-in when CSS loads with a non-default tau.
    if (!this.hasMarkedReady) {
      this.hasMarkedReady = true;
      if (typeof requestAnimationFrame !== "undefined") {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            this.root?.setAttribute("data-axm-ready", "true");
          });
        });
      } else {
        this.root.setAttribute("data-axm-ready", "true");
      }
    }
  }

  private initInvertedSurfaces(): void {
    if (!this.root) return;
    if (this.invertedSelectors.length === 0) return;

    this.setupObserver();
    this.updateInvertedSurfaces();
  }

  private setupObserver(): void {
    if (typeof MutationObserver === "undefined") return;

    this.observer = new MutationObserver((mutations) => {
      const elementsToUpdate = new Set<HTMLElement>();
      const selector = this.invertedSelectors.join(",");

      for (const mutation of mutations) {
        if (mutation.type === "childList") {
          for (const node of mutation.addedNodes) {
            if (node instanceof HTMLElement) {
              if (node.matches(selector)) {
                elementsToUpdate.add(node);
              }
              const descendants = node.querySelectorAll(selector);
              descendants.forEach((d) =>
                elementsToUpdate.add(d as HTMLElement),
              );
            }
          }
        } else if (
          mutation.type === "attributes" &&
          mutation.attributeName === "class"
        ) {
          if (
            mutation.target instanceof HTMLElement &&
            mutation.target.matches(selector)
          ) {
            elementsToUpdate.add(mutation.target);
          }
        }
      }

      if (elementsToUpdate.size > 0) {
        const targetScheme = this.resolvedMode === "light" ? "dark" : "light";
        elementsToUpdate.forEach((el) => {
          el.style.setProperty("color-scheme", targetScheme);
        });
      }
    });

    const body = requireDocumentBody("ThemeManager.setupObserver");

    this.observer.observe(body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class"],
    });
  }

  private updateInvertedSurfaces(): void {
    if (this.invertedSelectors.length === 0) return;

    const selector = this.invertedSelectors.join(",");
    const elements = document.querySelectorAll(selector);
    // Inverted means opposite of the resolved mode
    const targetScheme = this.resolvedMode === "light" ? "dark" : "light";

    elements.forEach((el) => {
      if (el instanceof HTMLElement) {
        el.style.setProperty("color-scheme", targetScheme);
      }
    });
  }

  /**
   * Gets the current theme mode setting.
   * @returns The current mode ('light', 'dark', or 'system').
   */
  get mode(): ThemeMode {
    return this._mode;
  }

  /**
   * Gets the resolved theme mode (actual appearance).
   * If mode is 'system', returns the system preference.
   * @returns The resolved mode ('light' or 'dark').
   */
  get resolvedMode(): "light" | "dark" {
    if (this._mode === "system") {
      if (this.mediaQuery) {
        return this.mediaQuery.matches ? "dark" : "light";
      }
      return "light"; // Default fallback
    }
    return this._mode;
  }

  /**
   * Sets the theme mode.
   * @param mode The new mode ('light', 'dark', or 'system').
   */
  setMode(mode: ThemeMode): void {
    this.applyMode(mode);
  }

  private applyMode(mode: ThemeMode): void {
    this._mode = mode;
    this.apply();
    this.sync();
  }

  private handleSystemChange = (): void => {
    if (this._mode === "system") {
      // System preference changed, delegate to AxiomaticTheme
      const tau = this.resolvedMode === "light" ? 1 : -1;
      this.theme.set({ tau });
      this.syncSemanticState();
      this.updateInvertedSurfaces();
      this.sync();
    }
  };

  private apply(): void {
    if (!this.root) return;

    // Delegate CSS variable writes to AxiomaticTheme
    // tau = 1 for light, -1 for dark
    const tau = this.resolvedMode === "light" ? 1 : -1;
    this.theme.set({ tau });

    // Keep semantic state consistent even if consumers never call setMode again.
    this.syncSemanticState();

    this.updateInvertedSurfaces();
  }

  private sync(): void {
    // Use requestAnimationFrame to ensure styles have been applied and computed
    if (typeof requestAnimationFrame !== "undefined") {
      requestAnimationFrame(() => {
        updateThemeColor();
        if (this.faviconGenerator) {
          updateFavicon(this.faviconGenerator);
        }
      });
    }
  }

  /**
   * Cleans up event listeners and observers.
   */
  dispose(): void {
    if (this.mediaQuery) {
      this.mediaQuery.removeEventListener("change", this.handleSystemChange);
    }
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}
