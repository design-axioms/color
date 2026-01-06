/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AxiomaticTheme } from "../theme.js";
import { ThemeManager } from "../browser.js";

// Mock matchMedia for jsdom (which doesn't implement it)
function setupMatchMediaMock(prefersDark = false) {
  const listeners: Array<(e: { matches: boolean }) => void> = [];
  const mockMediaQueryList = {
    matches: prefersDark,
    addEventListener: vi.fn((event: string, cb: () => void) => {
      if (event === "change") listeners.push(cb);
    }),
    removeEventListener: vi.fn(),
    // Utility to simulate system preference change in tests
    _simulateChange(matches: boolean) {
      mockMediaQueryList.matches = matches;
      listeners.forEach((l) => l({ matches }));
    },
  };
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn(() => mockMediaQueryList),
  });
  return mockMediaQueryList;
}

describe("AxiomaticTheme", () => {
  beforeEach(() => {
    // Reset DOM
    document.documentElement.style.cssText = "";
    document.documentElement.className = "";
    document.documentElement.removeAttribute("data-theme");
    document.documentElement.removeAttribute("data-axm-mode");
    document.documentElement.removeAttribute("data-axm-resolved-mode");
    document.documentElement.removeAttribute("data-axm-ready");

    // Avoid test noise from missing CSS variables
    document.documentElement.style.setProperty("--alpha-hue", "0");
    document.documentElement.style.setProperty("--alpha-beta", "0.008");
    // Reset Singleton (hacky but needed for testing singleton)
    (AxiomaticTheme as any).instance = undefined;
  });

  it("should read initial state from DOM", () => {
    document.documentElement.style.setProperty("--tau", "-1");
    const theme = AxiomaticTheme.get();
    expect(theme.getState().tau).toBe(-1);
  });

  it("should sync state to DOM", () => {
    const theme = AxiomaticTheme.get();
    theme.set({ tau: -1 });
    expect(document.documentElement.style.getPropertyValue("--tau")).toBe("-1");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("should detect external DOM changes (Drift Test)", async () => {
    const theme = AxiomaticTheme.get();

    // Simulate external change (e.g. Starlight toggle)
    document.documentElement.style.setProperty("--tau", "-1");
    document.documentElement.classList.add("dark");

    // Now it should detect it!
    expect(theme.getState().tau).toBe(-1);
  });
});

describe("ThemeManager invertedSelectors option", () => {
  beforeEach(() => {
    // Reset AxiomaticTheme singleton to ensure test isolation
    (AxiomaticTheme as any).instance = undefined;

    // Reset DOM
    document.documentElement.style.cssText = "";
    document.documentElement.className = "";
    document.body.innerHTML = "";

    // Mock requestAnimationFrame to execute immediately for testing
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
      cb(0);
      return 0;
    });

    // Mock matchMedia for ThemeManager
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  it("should use provided invertedSelectors directly", () => {
    // Create test elements
    const invertedEl = document.createElement("div");
    invertedEl.className = "inverted-surface";
    document.body.appendChild(invertedEl);

    // Provide selectors directly - should not read CSS variable
    const manager = new ThemeManager({
      invertedSelectors: [".inverted-surface"],
    });

    // The inverted element should have opposite color-scheme
    expect(invertedEl.style.getPropertyValue("color-scheme")).toBe("dark");

    manager.dispose();
  });

  it("should accept readonly array (as const) for invertedSelectors", () => {
    const invertedEl = document.createElement("div");
    invertedEl.className = "card-inverted";
    document.body.appendChild(invertedEl);

    // Use `as const` tuple - should work with readonly string[]
    const selectors = [".card-inverted", ".header-inverted"] as const;
    const manager = new ThemeManager({
      invertedSelectors: selectors,
    });

    expect(invertedEl.style.getPropertyValue("color-scheme")).toBe("dark");

    manager.dispose();
  });

  it("should handle empty invertedSelectors array (falls back to CSS variable)", () => {
    // Set up CSS variable fallback
    document.documentElement.style.setProperty(
      "--axm-inverted-surfaces",
      ".css-inverted",
    );

    const invertedEl = document.createElement("div");
    invertedEl.className = "css-inverted";
    document.body.appendChild(invertedEl);

    // Empty array should fall back to CSS variable
    const manager = new ThemeManager({
      invertedSelectors: [],
    });

    // Should use CSS variable fallback
    expect(invertedEl.style.getPropertyValue("color-scheme")).toBe("dark");

    manager.dispose();
  });
});

describe("ThemeManager → AxiomaticTheme delegation", () => {
  beforeEach(() => {
    // Setup matchMedia mock before tests
    setupMatchMediaMock(false);

    // Reset DOM
    document.documentElement.style.cssText = "";
    document.documentElement.className = "";
    document.documentElement.removeAttribute("data-theme");
    document.documentElement.removeAttribute("data-axm-mode");
    document.documentElement.removeAttribute("data-axm-resolved-mode");
    document.documentElement.removeAttribute("data-axm-ready");

    // Avoid test noise from missing CSS variables
    document.documentElement.style.setProperty("--alpha-hue", "0");
    document.documentElement.style.setProperty("--alpha-beta", "0.008");
    // Reset Singleton (hacky but needed for testing singleton)
    (AxiomaticTheme as any).instance = undefined;
  });

  it("should delegate to AxiomaticTheme when setting light mode", () => {
    const manager = new ThemeManager();
    manager.setMode("light");

    // AxiomaticTheme should have set --tau to 1
    expect(document.documentElement.style.getPropertyValue("--tau")).toBe("1");
    // AxiomaticTheme should have set color-scheme
    expect(document.documentElement.style.colorScheme).toBe("light");
    // AxiomaticTheme should have removed .dark class
    expect(document.documentElement.classList.contains("dark")).toBe(false);
    // AxiomaticTheme should have set data-theme
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");

    manager.dispose();
  });

  it("should delegate to AxiomaticTheme when setting dark mode", () => {
    const manager = new ThemeManager();
    manager.setMode("dark");

    // AxiomaticTheme should have set --tau to -1
    expect(document.documentElement.style.getPropertyValue("--tau")).toBe("-1");
    // AxiomaticTheme should have set color-scheme
    expect(document.documentElement.style.colorScheme).toBe("dark");
    // AxiomaticTheme should have added .dark class
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    // AxiomaticTheme should have set data-theme
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");

    manager.dispose();
  });

  it("should set semantic state attributes", () => {
    const manager = new ThemeManager();
    manager.setMode("dark");

    expect(document.documentElement.getAttribute("data-axm-mode")).toBe("dark");
    expect(
      document.documentElement.getAttribute("data-axm-resolved-mode"),
    ).toBe("dark");

    manager.dispose();
  });

  it("should still apply deprecated lightClass/darkClass for backwards compat", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const manager = new ThemeManager({
      lightClass: "theme-light",
      darkClass: "theme-dark",
    });

    // Should have logged deprecation warnings
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("lightClass is deprecated"),
    );
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("darkClass is deprecated"),
    );

    manager.setMode("dark");
    expect(document.documentElement.classList.contains("theme-dark")).toBe(
      true,
    );
    expect(document.documentElement.classList.contains("theme-light")).toBe(
      false,
    );

    manager.setMode("light");
    expect(document.documentElement.classList.contains("theme-light")).toBe(
      true,
    );
    expect(document.documentElement.classList.contains("theme-dark")).toBe(
      false,
    );

    manager.dispose();
    warnSpy.mockRestore();
  });

  it("should keep AxiomaticTheme and ThemeManager in sync", () => {
    const manager = new ThemeManager();
    const theme = AxiomaticTheme.get();

    manager.setMode("dark");
    expect(theme.getState().tau).toBe(-1);

    manager.setMode("light");
    expect(theme.getState().tau).toBe(1);

    manager.dispose();
  });
});
