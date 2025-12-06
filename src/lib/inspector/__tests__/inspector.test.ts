// @vitest-environment happy-dom
import { beforeEach, describe, expect, it } from "vitest";
import { resolveTokens } from "../resolver.ts";
import { findContextRoot } from "../walker.ts";

describe("Inspector", () => {
  let container: HTMLElement;

  beforeEach(() => {
    document.body.innerHTML = "";
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  describe("findContextRoot", () => {
    it("should find the nearest surface", () => {
      container.innerHTML = `
        <div class="surface-card" id="card">
          <div class="content">
            <span id="text">Hello</span>
          </div>
        </div>
      `;

      const text = document.getElementById("text")!;
      const context = findContextRoot(text);

      expect(context.surface).toBe("card");
      expect(context.element.id).toBe("card");
    });

    it("should fallback to page/body if no surface found", () => {
      container.innerHTML = `
        <div class="content">
          <span id="text">Hello</span>
        </div>
      `;

      const text = document.getElementById("text")!;
      const context = findContextRoot(text);

      expect(context.surface).toBe("page");
      expect(context.element).toBe(document.body);
    });

    it("should detect polarity from color-scheme", () => {
      container.innerHTML = `
        <div class="surface-card" id="card" style="color-scheme: dark">
          <span id="text">Hello</span>
        </div>
      `;

      const text = document.getElementById("text")!;
      const context = findContextRoot(text);

      expect(context.polarity).toBe("dark");
    });
  });

  describe("resolveTokens", () => {
    it("should resolve text lightness source", () => {
      // We mock the CSS variables inline because happy-dom/jsdom does not fully support
      // the CSS cascade (especially @property and light-dark()) from injected stylesheets.
      // This unit test verifies the *logic* of the inspector (reading the computed values),
      // assuming the browser has correctly applied the CSS.
      container.innerHTML = `
        <div class="surface-card" id="card" style="--axm-text-subtle-token: oklch(0.6 0 0)">
          <span id="text" class="text-subtle" style="--_axm-text-lightness-source: oklch(0.6 0 0)">Hello</span>
        </div>
      `;

      const text = document.getElementById("text")!;
      const context = findContextRoot(text);
      const tokens = resolveTokens(text, context);

      const lightnessToken = tokens.find(
        (t) => t.sourceVar === "--_axm-text-lightness-source",
      );
      expect(lightnessToken).toBeDefined();
      expect(lightnessToken?.sourceValue).toBe("text-subtle");
    });
  });
});
