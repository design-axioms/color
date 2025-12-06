import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

const SITE_PUBLIC_DIR = path.join(__dirname, "../site/public");

describe("LLM Context Generation", () => {
  it("should generate llms.txt", () => {
    const filePath = path.join(SITE_PUBLIC_DIR, "llms.txt");
    expect(fs.existsSync(filePath)).toBe(true);

    const content = fs.readFileSync(filePath, "utf-8");
    expect(content).toContain("# Axiomatic Color - AI Context");
    expect(content).toContain("## Axioms (The Constitution)");
    expect(content).toContain("## Thinking in Surfaces");
    expect(content).toContain("## CSS Utilities Reference");
    expect(content).toContain(".text-strong");
  });

  it("should generate llms-full.txt", () => {
    const filePath = path.join(SITE_PUBLIC_DIR, "llms-full.txt");
    expect(fs.existsSync(filePath)).toBe(true);

    const content = fs.readFileSync(filePath, "utf-8");
    expect(content).toContain("# Axiomatic Color - Full Documentation");
    expect(content).toContain("## Axioms");
    // Should contain content from other files too
    expect(content).toContain("## Configuration Schema");
  });
});
