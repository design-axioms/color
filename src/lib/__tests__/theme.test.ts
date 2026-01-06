/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AxiomaticTheme } from "../theme.js";
import { ThemeManager } from "../browser.js";

describe("AxiomaticTheme", () => {
  beforeEach(() => {
    // Reset DOM
    document.documentElement.style.cssText = "";
    document.documentElement.className = "";
    document.documentElement.removeAttribute("data-theme");

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
