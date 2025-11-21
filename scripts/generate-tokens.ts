import { readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import {
  generateTokensCss,
  solve,
  type SolverConfig,
} from "./solver-engine.ts";

const ROOT = resolve(import.meta.dirname, "..");
const CONFIG_PATH = join(ROOT, "scripts/surface-lightness.config.json");
const BASE_CSS_PATH = join(ROOT, "css/generated-tokens.css");

if (import.meta.main) {
  console.log("Reading config from:", CONFIG_PATH);
  const config = JSON.parse(readFileSync(CONFIG_PATH, "utf8")) as SolverConfig;

  console.log("Solving surfaces...");
  const { backgrounds } = solve(config);

  console.log("Generating CSS...");
  const css = generateTokensCss(
    config.groups,
    backgrounds,
    config.hueShift,
    config.borderTargets
  );

  console.log("Writing CSS to:", BASE_CSS_PATH);
  writeFileSync(BASE_CSS_PATH, css);
  console.log("Done!");
}
