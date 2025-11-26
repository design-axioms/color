// src/lib/browser.ts
function updateThemeColor() {
  if (typeof document === "undefined") return;
  let meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("name", "theme-color");
    document.head.appendChild(meta);
  }
  const color = getComputedStyle(document.body).backgroundColor;
  if (color) {
    meta.setAttribute("content", color);
  }
}
function updateFavicon(getSvg) {
  if (typeof document === "undefined") return;
  let link = document.querySelector('link[rel="icon"]');
  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", "icon");
    document.head.appendChild(link);
  }
  const color = getComputedStyle(document.body).color;
  if (color) {
    const svg = getSvg(color);
    const dataUri = `data:image/svg+xml,${encodeURIComponent(svg)}`;
    link.setAttribute("href", dataUri);
  }
}
var ThemeManager = class {
  root;
  lightClass;
  darkClass;
  faviconGenerator;
  _mode = "system";
  mediaQuery = null;
  constructor(options = {}) {
    if (typeof document !== "undefined") {
      this.root = options.root ?? document.documentElement;
      this.lightClass = options.lightClass;
      this.darkClass = options.darkClass;
      this.faviconGenerator = options.faviconGenerator;
      this.mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      this.mediaQuery.addEventListener("change", this.handleSystemChange);
    } else {
      this.root = null;
    }
  }
  get mode() {
    return this._mode;
  }
  get resolvedMode() {
    if (this._mode === "system") {
      if (this.mediaQuery) {
        return this.mediaQuery.matches ? "dark" : "light";
      }
      return "light";
    }
    return this._mode;
  }
  setMode(mode) {
    this._mode = mode;
    this.apply();
    this.sync();
  }
  handleSystemChange = () => {
    if (this._mode === "system") {
      this.sync();
    }
  };
  apply() {
    if (!this.root) return;
    if (this.lightClass) this.root.classList.remove(this.lightClass);
    if (this.darkClass) this.root.classList.remove(this.darkClass);
    this.root.style.removeProperty("color-scheme");
    if (this._mode === "system") ; else if (this._mode === "light") {
      if (this.lightClass) {
        this.root.classList.add(this.lightClass);
      } else {
        this.root.style.setProperty("color-scheme", "light");
      }
    } else {
      if (this.darkClass) {
        this.root.classList.add(this.darkClass);
      } else {
        this.root.style.setProperty("color-scheme", "dark");
      }
    }
  }
  sync() {
    if (typeof requestAnimationFrame !== "undefined") {
      requestAnimationFrame(() => {
        updateThemeColor();
        if (this.faviconGenerator) {
          updateFavicon(this.faviconGenerator);
        }
      });
    }
  }
  dispose() {
    if (this.mediaQuery) {
      this.mediaQuery.removeEventListener("change", this.handleSystemChange);
    }
  }
};

export { ThemeManager, updateFavicon, updateThemeColor };
//# sourceMappingURL=chunk-VZHHTPIW.js.map
//# sourceMappingURL=chunk-VZHHTPIW.js.map