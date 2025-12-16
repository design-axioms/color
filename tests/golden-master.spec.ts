import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { format } from "prettier";
import { describe, expect, it } from "vitest";
import { toDTCG } from "../src/lib/exporters/dtcg.ts";
import { toTailwind } from "../src/lib/exporters/tailwind.ts";
import { toTypeScript } from "../src/lib/exporters/typescript.ts";
import { resolveConfig } from "../src/lib/resolve.ts";
import { generateTheme } from "../src/lib/runtime.ts";
import { solve } from "../src/lib/solver/index.ts";

const CWD = process.cwd();
const CONFIG_PATH = resolve(CWD, "color-config.json");
const GOLDEN_MASTERS_DIR = resolve(CWD, "tests/golden-masters");

describe("Golden Master Tests", () => {
  const rawConfig = JSON.parse(readFileSync(CONFIG_PATH, "utf8"));

  const config = resolveConfig(rawConfig);
  const theme = solve(config);

  it("should generate deterministic CSS", async () => {
    const css = generateTheme(config);
    const formatted = await format(css, { parser: "css" });
    await expect(formatted).toMatchFileSnapshot(
      resolve(GOLDEN_MASTERS_DIR, "theme.css"),
    );
  });

  it("should generate deterministic DTCG tokens", async () => {
    const tokens = toDTCG(theme, config);
    const json = JSON.stringify(tokens, null, 2);
    const formatted = await format(json, { parser: "json" });
    await expect(formatted).toMatchFileSnapshot(
      resolve(GOLDEN_MASTERS_DIR, "tokens.json"),
    );
  });

  it("should generate deterministic Tailwind preset", async () => {
    const preset = toTailwind(theme);
    const js = `module.exports = ${JSON.stringify(preset, null, 2)};`;
    const formatted = await format(js, { parser: "babel" });
    await expect(formatted).toMatchFileSnapshot(
      resolve(GOLDEN_MASTERS_DIR, "tailwind.preset.js"),
    );
  });

  it("should generate deterministic TypeScript definition", async () => {
    const ts = toTypeScript(theme, config.options);
    const formatted = await format(ts, { parser: "typescript" });
    await expect(formatted).toMatchFileSnapshot(
      resolve(GOLDEN_MASTERS_DIR, "theme.ts"),
    );
  });
});
