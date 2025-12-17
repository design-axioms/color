import type { ThemeMode } from "@axiomatic-design/color/browser";
import {
  getResolvedThemeMode,
  getThemeMode,
  initThemeBridge,
  setThemeMode,
  subscribeTheme,
} from "../theme-bridge";

export class ThemeState {
  mode = $state<ThemeMode>("system");
  resolvedMode = $state<"light" | "dark">("light");

  private unsubscribe: (() => void) | null = null;

  constructor() {
    if (typeof document === "undefined") return;

    initThemeBridge();
    this.syncFromDom();

    this.unsubscribe = subscribeTheme(() => {
      this.syncFromDom();
    });
  }

  private syncFromDom(): void {
    this.mode = getThemeMode();
    this.resolvedMode = getResolvedThemeMode();
  }

  get isDark(): boolean {
    return this.resolvedMode === "dark";
  }

  get isLight(): boolean {
    return this.resolvedMode === "light";
  }

  setMode(mode: ThemeMode): void {
    setThemeMode(mode);
  }

  toggle(): void {
    if (this.mode === "dark") {
      this.setMode("light");
    } else if (this.mode === "light") {
      this.setMode("dark");
    } else {
      // From system, toggle to the opposite of the current resolved mode.
      this.setMode(this.resolvedMode === "dark" ? "light" : "dark");
    }
  }

  dispose(): void {
    this.unsubscribe?.();
    this.unsubscribe = null;
  }
}

export const themeState = new ThemeState();
