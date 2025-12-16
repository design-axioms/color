import { describe, it, expect } from "vitest";
import { getEffectiveStyleSheets } from "../../src/lib/inspector/sheets.js";

describe("getEffectiveStyleSheets", () => {
  it("should return document stylesheets for element in document", () => {
    // Mock globals
    const mockSheet = { href: "sheet1.css" };

    // Setup global Document and ShadowRoot if missing (Node env)
    if (typeof global.Document === "undefined") {
      global.Document = class {} as any;
    }
    if (typeof global.ShadowRoot === "undefined") {
      global.ShadowRoot = class {} as any;
    }
    if (typeof global.document === "undefined") {
      global.document = { styleSheets: [] } as any;
    }

    const mockDoc = new global.Document();
    // @ts-ignore
    mockDoc.styleSheets = [mockSheet];

    const el = {
      getRootNode: () => mockDoc,
    } as any;

    const sheets = getEffectiveStyleSheets(el);
    expect(sheets).toContain(mockSheet);
  });

  it("should return adopted stylesheets for element in shadow root", () => {
    const mockSheet = { href: "adopted.css" };

    if (typeof global.ShadowRoot === "undefined") {
      global.ShadowRoot = class {} as any;
    }

    const shadowRoot = new global.ShadowRoot();
    // @ts-ignore
    shadowRoot.styleSheets = [];
    // @ts-ignore
    shadowRoot.adoptedStyleSheets = [mockSheet];

    const el = {
      getRootNode: () => shadowRoot,
    } as any;

    const sheets = getEffectiveStyleSheets(el);
    expect(sheets).toContain(mockSheet);
  });
});
