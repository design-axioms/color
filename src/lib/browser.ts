/**
 * Updates the <meta name="theme-color"> tag to match the computed background color
 * of the document body.
 *
 * Call this function whenever the theme changes (e.g. after switching modes).
 */
export function updateThemeColor(): void {
  if (typeof document === "undefined") return;

  let meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("name", "theme-color");
    document.head.appendChild(meta);
  }

  // Force a style recomputation to ensure we get the latest color
  const color = getComputedStyle(document.body).backgroundColor;
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

  let link = document.querySelector('link[rel="icon"]');
  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", "icon");
    document.head.appendChild(link);
  }

  // We'll use the body's computed color (foreground) as the "brand" color for now
  const color = getComputedStyle(document.body).color;

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
   * The class to apply when the theme is 'light'.
   * If not provided, sets style="color-scheme: light".
   */
  lightClass?: string;
  /**
   * The class to apply when the theme is 'dark'.
   * If not provided, sets style="color-scheme: dark".
   */
  darkClass?: string;
  /**
   * A function to generate the favicon SVG based on the current theme color.
   * If provided, the favicon will be updated automatically.
   */
  faviconGenerator?: (color: string) => string;
}

export class ThemeManager {
  private root: HTMLElement | null;
  private lightClass?: string;
  private darkClass?: string;
  private faviconGenerator?: (color: string) => string;
  private _mode: ThemeMode = "system";
  private mediaQuery: MediaQueryList | null = null;
  private invertedSelectors: string[] = [];
  private observer: MutationObserver | null = null;

  constructor(options: ThemeManagerOptions = {}) {
    if (typeof document !== "undefined") {
      this.root = options.root ?? document.documentElement;
      this.lightClass = options.lightClass;
      this.darkClass = options.darkClass;
      this.faviconGenerator = options.faviconGenerator;
      this.mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      this.mediaQuery.addEventListener("change", this.handleSystemChange);

      // Initialize inverted surfaces logic
      // We use requestAnimationFrame to give CSS a chance to load if it's close
      requestAnimationFrame(() => {
        this.initInvertedSurfaces();
      });
    } else {
      // Fallback for SSR/testing
      this.root = null;
    }
  }

  private initInvertedSurfaces(): void {
    if (!this.root) return;

    const style = getComputedStyle(this.root);
    const invertedList = style
      .getPropertyValue("--axm-inverted-surfaces")
      .trim();

    if (invertedList) {
      // Remove quotes if they exist
      const cleanList = invertedList.replace(/^['"]|['"]$/g, "");
      this.invertedSelectors = cleanList
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      if (this.invertedSelectors.length > 0) {
        this.setupObserver();
        this.updateInvertedSurfaces();
      }
    }
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

    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class"],
    });
  }

  private matchesInverted(element: HTMLElement): boolean {
    return this.invertedSelectors.some((selector) => element.matches(selector));
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

  get mode(): ThemeMode {
    return this._mode;
  }

  get resolvedMode(): "light" | "dark" {
    if (this._mode === "system") {
      if (this.mediaQuery) {
        return this.mediaQuery.matches ? "dark" : "light";
      }
      return "light"; // Default fallback
    }
    return this._mode;
  }

  setMode(mode: ThemeMode): void {
    this._mode = mode;
    this.apply();
    this.sync();
  }

  private handleSystemChange = (): void => {
    if (this._mode === "system") {
      this.sync();
    }
  };

  private apply(): void {
    if (!this.root) return;

    // Remove existing classes/styles
    if (this.lightClass) this.root.classList.remove(this.lightClass);
    if (this.darkClass) this.root.classList.remove(this.darkClass);
    this.root.style.removeProperty("color-scheme");

    if (this._mode === "system") {
      // Do nothing, let browser default take over
    } else if (this._mode === "light") {
      if (this.lightClass) {
        this.root.classList.add(this.lightClass);
      } else {
        this.root.style.setProperty("color-scheme", "light");
      }
    } else {
      // dark
      if (this.darkClass) {
        this.root.classList.add(this.darkClass);
      } else {
        this.root.style.setProperty("color-scheme", "dark");
      }
    }

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

  dispose(): void {
    if (this.mediaQuery) {
      this.mediaQuery.removeEventListener("change", this.handleSystemChange);
    }
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}
