import { describe, it, expect } from "vitest";
import { evaluateScope } from "../../src/lib/inspector/scope.js";

// Mock CSSScopeRule
class MockCSSScopeRule {
  start: string | null;
  end: string | null;
  cssRules: any[] = [];
  type = 0; // CSSRule.STYLE_RULE etc.

  constructor(start: string | null, end: string | null) {
    this.start = start;
    this.end = end;
  }
}

// Mock HTMLElement
class MockElement {
  tagName: string;
  parentElement: MockElement | null = null;
  classList = new Set<string>();
  id = "";

  constructor(tagName: string) {
    this.tagName = tagName.toUpperCase();
  }

  closest(selector: string): MockElement | null {
    // Simple selector matching for test
    if (this.matches(selector)) return this;
    return this.parentElement?.closest(selector) ?? null;
  }

  matches(selector: string): boolean {
    if (selector.startsWith(".")) return this.classList.has(selector.slice(1));
    if (selector.startsWith("#")) return this.id === selector.slice(1);
    return this.tagName === selector.toUpperCase();
  }

  contains(other: MockElement | null): boolean {
    let cur = other;
    while (cur) {
      if (cur === this) return true;
      cur = cur.parentElement;
    }
    return false;
  }
}

describe("evaluateScope", () => {
  it("should be active if element is inside scope root", () => {
    const root = new MockElement("div");
    root.classList.add("scope-root");

    const child = new MockElement("span");
    child.parentElement = root;

    const rule = new MockCSSScopeRule(".scope-root", null) as any;
    const result = evaluateScope(rule, child as any, Infinity);

    expect(result.isActive).toBe(true);
    expect(result.proximity).toBe(1);
  });

  it("should be inactive if element is outside scope root", () => {
    const root = new MockElement("div");
    root.classList.add("scope-root");

    const other = new MockElement("span"); // Not a child of root

    const rule = new MockCSSScopeRule(".scope-root", null) as any;
    const result = evaluateScope(rule, other as any, Infinity);

    expect(result.isActive).toBe(false);
  });

  it("should be inactive if element is inside limit (donut scope)", () => {
    const root = new MockElement("div");
    root.classList.add("scope-root");

    const limit = new MockElement("div");
    limit.classList.add("limit");
    limit.parentElement = root;

    const child = new MockElement("span");
    child.parentElement = limit;

    const rule = new MockCSSScopeRule(".scope-root", ".limit") as any;
    const result = evaluateScope(rule, child as any, Infinity);

    expect(result.isActive).toBe(false);
  });

  it("should calculate proximity correctly", () => {
    const root = new MockElement("div");
    root.classList.add("scope-root");

    const mid = new MockElement("div");
    mid.parentElement = root;

    const child = new MockElement("span");
    child.parentElement = mid;

    const rule = new MockCSSScopeRule(".scope-root", null) as any;
    const result = evaluateScope(rule, child as any, Infinity);

    expect(result.isActive).toBe(true);
    expect(result.proximity).toBe(2); // child -> mid -> root
  });
});
