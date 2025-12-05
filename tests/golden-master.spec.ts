/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { generateTheme } from "../src/lib/runtime";
import { solve } from "../src/lib/solver";
import { toDTCG } from "../src/lib/exporters/dtcg";
import { toTailwind } from "../src/lib/exporters/tailwind";
import { toTypeScript } from "../src/lib/exporters/typescript";
import type { SolverConfig } from "../src/lib/types";

const CWD = process.cwd();
const CONFIG_PATH = resolve(CWD, "color-config.json");
const GOLDEN_MASTERS_DIR = resolve(CWD, "tests/golden-masters");

describe("Golden Master Tests", () => {
  const config = JSON.parse(readFileSync(CONFIG_PATH, "utf8")) as SolverConfig;
  const theme = solve(config);

  it("should generate deterministic CSS", async () => {
    const css = generateTheme(config);
    await expect(css).toMatchFileSnapshot(
      resolve(GOLDEN_MASTERS_DIR, "theme.css"),
    );
  });

  it("should generate deterministic DTCG tokens", async () => {
    const tokens = toDTCG(theme);
    const json = JSON.stringify(tokens, null, 2);
    await expect(json).toMatchFileSnapshot(
      resolve(GOLDEN_MASTERS_DIR, "tokens.json"),
    );
  });

  it("should generate deterministic Tailwind preset", async () => {
    const preset = toTailwind(theme);
    const js = `module.exports = ${JSON.stringify(preset, null, 2)};`;
    await expect(js).toMatchFileSnapshot(
      resolve(GOLDEN_MASTERS_DIR, "tailwind.preset.js"),
    );
  });

  it("should generate deterministic TypeScript definition", async () => {
    const ts = toTypeScript(theme, config.options);
    await expect(ts).toMatchFileSnapshot(
      resolve(GOLDEN_MASTERS_DIR, "theme.ts"),
    );
  });
});
