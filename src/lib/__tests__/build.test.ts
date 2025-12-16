import { execSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("End-to-End Build", () => {
  it("runs pnpm solve and generates CSS file", () => {
    // Ensure we are in the project root
    const projectRoot = path.resolve(__dirname, "../../..");
    const tmpDir = fs.mkdtempSync(
      path.join(os.tmpdir(), "axiomatic-build-test-"),
    );
    const cssPath = path.join(tmpDir, "theme.css");

    // Run the solve command
    // We use 'node scripts/generate-tokens.ts' directly to avoid pnpm overhead in test
    // but simulating the 'pnpm solve' script behavior
    try {
      execSync(`node src/cli/index.ts color-config.json "${cssPath}"`, {
        cwd: projectRoot,
        stdio: "pipe", // Capture output so we don't spam test logs
      });
    } catch (error) {
      console.error(
        "Build failed:",
        (error as any).stdout?.toString(),
        (error as any).stderr?.toString(),
      );
      throw error;
    }

    // Assert file exists
    expect(fs.existsSync(cssPath)).toBe(true);

    // Assert file has content
    const content = fs.readFileSync(cssPath, "utf-8");
    expect(content.length).toBeGreaterThan(0);
    // expect(content).toContain("/* AUTO-GENERATED");
    expect(content).toContain("--axm-surface-token");

    fs.rmSync(tmpDir, { recursive: true, force: true });
  });
});
