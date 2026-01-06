/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it } from "vitest";
import { AxiomaticTheme } from "../theme.js";

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
