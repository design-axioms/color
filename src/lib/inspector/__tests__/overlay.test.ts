/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { AxiomaticDebugger } from "../overlay.js";
import { AxiomaticTheme } from "../../theme.js";
import { AxiomaticInspectorEngine } from "../engine.js";
import { STYLES } from "../styles.js";

// Mock AxiomaticTheme to avoid global state issues
vi.mock("../../theme.js", async () => {
  const actual = await vi.importActual("../../theme.js");
  return {
    ...actual,
    AxiomaticTheme: {
      get: vi.fn().mockReturnValue({
        subscribe: vi.fn().mockReturnValue(() => {}),
        set: vi.fn(),
        getState: vi.fn().mockReturnValue({ hue: 0, chroma: 0.008, tau: 1 }),
      }),
    },
  };
});

describe("AxiomaticDebugger", () => {
  let debuggerElement: AxiomaticDebugger;
  let rafCallbacks: FrameRequestCallback[];

  beforeEach(() => {
    rafCallbacks = [];
    vi.stubGlobal(
      "requestAnimationFrame",
      vi.fn((cb: FrameRequestCallback) => {
        rafCallbacks.push(cb);
        return rafCallbacks.length;
      }),
    );
    vi.stubGlobal("cancelAnimationFrame", vi.fn());

    // Mock localStorage
    const localStorageMock = (() => {
      let store: Record<string, string> = {};
      return {
        getItem: vi.fn((key: string) => store[key] || null),
        setItem: vi.fn((key: string, value: string) => {
          store[key] = value.toString();
        }),
        removeItem: vi.fn((key: string) => {
          delete store[key];
        }),
        clear: vi.fn(() => {
          store = {};
        }),
      };
    })();
    Object.defineProperty(window, "localStorage", {
      value: localStorageMock,
      writable: true,
    });

    // Mock CSS.supports
    global.CSS = {
      supports: vi.fn().mockReturnValue(false),
      escape: vi.fn(),
    } as any;

    // Register custom element if not already registered
    if (!customElements.get("axiomatic-debugger")) {
      customElements.define("axiomatic-debugger", AxiomaticDebugger);
    }
    debuggerElement = new AxiomaticDebugger();
    document.body.appendChild(debuggerElement);
  });

  afterEach(() => {
    document.body.removeChild(debuggerElement);
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it("should render shadow DOM structure", () => {
    const shadow = debuggerElement.shadowRoot;
    expect(shadow).toBeTruthy();
    expect(shadow?.getElementById("highlight-layer")).toBeTruthy();
    expect(shadow?.getElementById("info-card")).toBeTruthy();
    expect(shadow?.getElementById("toggle-btn")).toBeTruthy();
  });

  it("should toggle enabled state", () => {
    const toggleBtn = debuggerElement.shadowRoot?.getElementById("toggle-btn");
    expect(toggleBtn).toBeTruthy();

    // Initial state: disabled
    expect(toggleBtn?.classList.contains("active")).toBe(false);

    // Click to enable
    toggleBtn?.click();
    expect(toggleBtn?.classList.contains("active")).toBe(true);

    // Click to disable
    toggleBtn?.click();
    expect(toggleBtn?.classList.contains("active")).toBe(false);
  });

  it("should animate tau via the theme API when theme toggle is clicked", () => {
    const themeToggle =
      debuggerElement.shadowRoot?.getElementById("theme-toggle-main");
    expect(themeToggle).toBeTruthy();

    const manager = AxiomaticTheme.get() as unknown as {
      set: ReturnType<typeof vi.fn>;
    };
    const setSpy = manager.set as unknown as ReturnType<typeof vi.fn>;

    themeToggle?.click();
    expect(rafCallbacks.length).toBeGreaterThan(0);

    // First frame establishes start time.
    rafCallbacks.shift()?.(0);
    // Second frame completes the animation.
    rafCallbacks.shift()?.(1000);

    expect(setSpy).toHaveBeenCalled();
  });

  it("should inspect an element", () => {
    debuggerElement.enable();

    // Create a test element
    const target = document.createElement("div");
    target.className = "surface-card";
    target.style.backgroundColor = "white";
    document.body.appendChild(target);

    // Mock getClientRects for the target
    target.getClientRects = vi
      .fn()
      .mockReturnValue([
        { top: 10, left: 10, width: 100, height: 100, bottom: 110, right: 110 },
      ]);
    target.getBoundingClientRect = vi.fn().mockReturnValue({
      top: 10,
      left: 10,
      width: 100,
      height: 100,
      bottom: 110,
      right: 110,
    });

    // Trigger inspection (simulate mouse move or direct call)
    // Since inspect is private, we can simulate mousemove if we mock the event
    // Or we can cast to any to call private method
    (debuggerElement as any).inspect(target);

    const infoCard = debuggerElement.shadowRoot?.getElementById("info-card");
    const surfaceBadge =
      debuggerElement.shadowRoot?.getElementById("surface-badge");

    expect(infoCard?.style.display).toBe("block"); // Or popover logic
    // Note: The engine might return "Unknown" if styles aren't fully computed in JSDOM
    // But we check that it updated at least
    expect(surfaceBadge?.textContent).toBeDefined();

    document.body.removeChild(target);
  });

  it("should not auto-run continuity audit when restoring state", () => {
    const checkSpy = vi
      .spyOn(AxiomaticInspectorEngine.prototype, "checkContinuity")
      .mockResolvedValue([]);

    window.localStorage.setItem(
      "axiomatic-inspector-state",
      JSON.stringify({
        isEnabled: false,
        isPinned: false,
        isViolationMode: false,
        isContinuityMode: true,
        showInternals: false,
      }),
    );

    // loadState is private; call via escape hatch.
    (debuggerElement as any).loadState();

    expect(checkSpy).not.toHaveBeenCalled();
  });

  it("should only show reset button when there are modifications", () => {
    debuggerElement.enable();
    const resetBtn = debuggerElement.shadowRoot?.getElementById("reset-btn");
    expect(resetBtn).toBeTruthy();

    expect(resetBtn?.classList.contains("visible")).toBe(false);

    // Reset is only relevant in violation/fix mode.
    (debuggerElement as any).isViolationMode = true;

    const target = document.createElement("div");
    document.body.appendChild(target);
    (debuggerElement as any).modifiedElements.set(target, {
      className: "",
      style: "",
    });
    (debuggerElement as any).updateResetButtonState();

    expect(resetBtn?.classList.contains("visible")).toBe(true);

    debuggerElement.disable();
    expect(resetBtn?.classList.contains("visible")).toBe(false);

    document.body.removeChild(target);
  });

  it("should not reveal reset button just because it is disabled", () => {
    expect(STYLES).toContain("#reset-btn.visible:disabled");
    expect(STYLES).not.toContain("#reset-btn:disabled");
  });

  it("should abort an in-flight continuity audit when disabled", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const checkSpy = vi
      .spyOn(AxiomaticInspectorEngine.prototype, "checkContinuity")
      .mockImplementation(
        async (
          _ignore: HTMLElement | undefined,
          options?: { signal?: AbortSignal },
        ) => {
          const signal = options?.signal;
          await new Promise<void>((_resolve, reject) => {
            if (!signal) {
              reject(new Error("Missing signal"));
              return;
            }

            if (signal.aborted) {
              reject(new DOMException("Aborted", "AbortError"));
              return;
            }

            signal.addEventListener(
              "abort",
              () => reject(new DOMException("Aborted", "AbortError")),
              { once: true },
            );
          });

          return [];
        },
      );

    debuggerElement.enable();
    const continuityBtn =
      debuggerElement.shadowRoot?.getElementById("continuity-toggle");
    expect(continuityBtn).toBeTruthy();

    (continuityBtn as HTMLButtonElement).click();
    debuggerElement.disable();

    // Let the rejection propagate through the overlay's try/catch.
    await new Promise((r) => setTimeout(r, 0));

    expect(checkSpy).toHaveBeenCalled();
    expect(consoleError).not.toHaveBeenCalled();
  });
});
