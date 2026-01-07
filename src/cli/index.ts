#!/usr/bin/env node
import { existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { auditCommand } from "./commands/audit.ts";
import { buildCommand } from "./commands/build.ts";
import { exportCommand } from "./commands/export.ts";
import { importCommand } from "./commands/import.ts";
import { DEFAULT_CONFIG } from "./default-config.ts";

const args = process.argv.slice(2);
const CWD = process.cwd();

const command = args[0];

if (args.includes("--help") || args.includes("-h")) {
  console.log(`
Axiomatic Color CLI

Usage:
  axiomatic init              Create a new color-config.json
  axiomatic build [flags]     Generate CSS from config
  axiomatic import <file>     Import config from DTCG tokens
  axiomatic export [flags]    Export tokens to other formats
  axiomatic audit             Audit the generated theme

Flags:
  --config <path>   Path to config file (default: color-config.json)
  --out <path>      Path to output file (default: theme.css)
  --watch           Watch for changes
  --emit-ts         Emit TypeScript metadata file alongside CSS
`);
  process.exit(0);
}

if (command === "init") {
  const targetPath = join(CWD, "color-config.json");
  if (existsSync(targetPath)) {
    console.error("Error: color-config.json already exists.");
    process.exit(1);
  }
  const configWithSchema = {
    $schema: "node_modules/@axiomatic-design/color/color-config.schema.json",
    ...DEFAULT_CONFIG,
  };
  writeFileSync(targetPath, JSON.stringify(configWithSchema, null, 2));
  console.log("Created color-config.json");

  if (!existsSync(join(CWD, "node_modules"))) {
    console.warn(
      "Note: node_modules not found in current directory. You may need to adjust the $schema path.",
    );
  }

  console.log("Run `axiomatic build` to generate your theme.");
  process.exit(0);
} else if (command === "import") {
  const file = args[1];
  if (!file || file.startsWith("-")) {
    console.error("Error: Please provide an input file.");
    console.error("Usage: axiomatic import <file> [--out <file>] [--dry-run]");
    process.exit(1);
  }

  const dryRun = args.includes("--dry-run");
  const outIndex = args.indexOf("--out");
  const out = outIndex !== -1 ? args[outIndex + 1] : undefined;

  importCommand(file, { out, dryRun });
  process.exit(0);
} else if (command === "export") {
  exportCommand(args.slice(1), CWD);
  process.exit(0);
} else if (command === "audit") {
  auditCommand(args.slice(1), CWD);
  process.exit(0);
} else if (command === "build") {
  buildCommand(args.slice(1), CWD);
} else if (command && !command.startsWith("-")) {
  // Legacy/Default behavior: axiomatic <config> <out>
  const config = args[0];
  const out = args[1];
  const newArgs: string[] = [];
  if (config) newArgs.push("--config", config);
  if (out) newArgs.push("--out", out);
  // Pass through any remaining flags (e.g., --emit-ts, --watch)
  newArgs.push(...args.slice(2));

  buildCommand(newArgs, CWD);
} else {
  // Default: just run build with passed args (flags)
  // e.g. axiomatic --watch
  buildCommand(args, CWD);
}
