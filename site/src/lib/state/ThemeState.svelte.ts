export class ThemeState {
  mode = $state<"light" | "dark">("light");

  constructor() {
    // Initialize from DOM if available
    if (typeof document !== "undefined") {
      this.updateFromDom();

      // Observe changes (e.g. from Starlight's theme picker)
      const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          if (
            mutation.type === "attributes" &&
            mutation.attributeName === "data-theme"
          ) {
            this.updateFromDom();
          }
        }
      });

      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["data-theme"],
      });
    }
  }

  private updateFromDom(): void {
    const theme = document.documentElement.getAttribute("data-theme");
    if (theme === "dark") {
      this.mode = "dark";
    } else {
      this.mode = "light";
    }
  }

  get isDark(): boolean {
    return this.mode === "dark";
  }

  get isLight(): boolean {
    return this.mode === "light";
  }

  setMode(mode: "light" | "dark"): void {
    if (typeof document !== "undefined") {
      // We set the attribute, which triggers the observer, which updates our state.
      // This ensures we stay in sync with Starlight if it also writes to this attribute.
      document.documentElement.setAttribute("data-theme", mode);
    }
  }

  toggle(): void {
    this.setMode(this.mode === "light" ? "dark" : "light");
  }
}

export const themeState = new ThemeState();
