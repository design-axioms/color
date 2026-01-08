import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ThemeManager } from "../browser.ts";
import { AxiomaticTheme } from "../theme.ts";

describe("ThemeManager", () => {
  let mockRoot: any;
  let mockMatchMedia: any;
  let mockMediaQueryList: any;

  beforeEach(() => {
    // Reset AxiomaticTheme singleton
    (AxiomaticTheme as any).instance = undefined;

    // Mock DOM
    mockRoot = {
      classList: {
        add: vi.fn(),
        remove: vi.fn(),
        contains: vi.fn(() => false),
      },
      style: {
        setProperty: vi.fn(),
        removeProperty: vi.fn(),
        getPropertyPriority: vi.fn(() => ""),
        getPropertyValue: vi.fn(() => ""),
        colorScheme: "",
      },
      setAttribute: vi.fn(),
      removeAttribute: vi.fn(),
      getAttribute: vi.fn(() => null),
    };

    global.document = {
      documentElement: mockRoot,
      querySelector: vi.fn(),
      createElement: vi.fn(() => ({ setAttribute: vi.fn() })),
      head: { appendChild: vi.fn() },
      body: { style: {} },
    } as any;

    global.getComputedStyle = vi.fn(() => ({
      backgroundColor: "red",
      color: "blue",
      getPropertyValue: vi.fn((name: string) => {
        // Return values that AxiomaticTheme expects
        if (name === "--alpha-hue") return "0";
        if (name === "--alpha-beta") return "0.008";
        if (name === "--tau") return "";
        return "";
      }),
    })) as any;

    mockMediaQueryList = {
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };

    mockMatchMedia = vi.fn(() => mockMediaQueryList);
    global.window = {
      matchMedia: mockMatchMedia,
    } as any;

    global.requestAnimationFrame = (cb) => cb(0) as any;

    // Mock MutationObserver (used by AxiomaticTheme)
    // Need to use a class/constructor, not a function returning an object
    global.MutationObserver = class {
      observe = vi.fn();
      disconnect = vi.fn();
      takeRecords = vi.fn(() => []);
    } as any;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete (global as any).document;
    delete (global as any).window;
    delete (global as any).getComputedStyle;
    delete (global as any).requestAnimationFrame;
    delete (global as any).MutationObserver;
  });

  it("should initialize with system mode by default", () => {
    const manager = new ThemeManager({ invertedSelectors: [] });
    expect(manager.mode).toBe("system");
  });

  it("should set mode to light", () => {
    const manager = new ThemeManager({ invertedSelectors: [] });
    manager.setMode("light");
    expect(manager.mode).toBe("light");
    // AxiomaticTheme sets --tau
    expect(mockRoot.style.setProperty).toHaveBeenCalledWith("--tau", "1");
    // AxiomaticTheme sets colorScheme via property assignment
    expect(mockRoot.style.colorScheme).toBe("light");
    // ThemeManager sets semantic attributes
    expect(mockRoot.setAttribute).toHaveBeenCalledWith(
      "data-axm-mode",
      "light",
    );
    expect(mockRoot.setAttribute).toHaveBeenCalledWith(
      "data-axm-resolved-mode",
      "light",
    );
    expect(mockRoot.setAttribute).toHaveBeenCalledWith(
      "data-axm-ready",
      "true",
    );
  });

  it("should set mode to dark", () => {
    const manager = new ThemeManager({ invertedSelectors: [] });
    manager.setMode("dark");
    expect(manager.mode).toBe("dark");
    // AxiomaticTheme sets --tau
    expect(mockRoot.style.setProperty).toHaveBeenCalledWith("--tau", "-1");
    // AxiomaticTheme sets colorScheme via property assignment
    expect(mockRoot.style.colorScheme).toBe("dark");
    // ThemeManager sets semantic attributes
    expect(mockRoot.setAttribute).toHaveBeenCalledWith("data-axm-mode", "dark");
    expect(mockRoot.setAttribute).toHaveBeenCalledWith(
      "data-axm-resolved-mode",
      "dark",
    );
    expect(mockRoot.setAttribute).toHaveBeenCalledWith(
      "data-axm-ready",
      "true",
    );
  });

  it("should use custom classes if provided", () => {
    const manager = new ThemeManager({
      invertedSelectors: [],
      lightClass: "light-theme",
      darkClass: "dark-theme",
    });

    manager.setMode("light");
    // Custom class should be applied (backwards compat)
    expect(mockRoot.classList.add).toHaveBeenCalledWith("light-theme");
    // AxiomaticTheme still sets --tau and colorScheme (delegation happens)
    expect(mockRoot.style.setProperty).toHaveBeenCalledWith("--tau", "1");
    expect(mockRoot.style.colorScheme).toBe("light");

    manager.setMode("dark");
    // Custom class should be applied (backwards compat)
    expect(mockRoot.classList.add).toHaveBeenCalledWith("dark-theme");
    // AxiomaticTheme still sets --tau and colorScheme (delegation happens)
    expect(mockRoot.style.setProperty).toHaveBeenCalledWith("--tau", "-1");
    expect(mockRoot.style.colorScheme).toBe("dark");
  });

  it("should resolve system mode correctly", () => {
    const manager = new ThemeManager({ invertedSelectors: [] });

    // Mock system dark mode
    mockMediaQueryList.matches = true;
    expect(manager.resolvedMode).toBe("dark");

    // Mock system light mode
    mockMediaQueryList.matches = false;
    expect(manager.resolvedMode).toBe("light");
  });
});
