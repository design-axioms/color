#!/usr/bin/env node
import { existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { auditCommand } from "./commands/audit.ts";
import { buildCommand } from "./commands/build.ts";
import { exportCommand } from "./commands/export.ts";
import { DEFAULT_CONFIG } from "./default-config.ts";

const args = process.argv.slice(2);
const CWD = process.cwd();

const isMain = process.argv[1] === fileURLToPath(import.meta.url);

if (isMain) {
  const command = args[0];

  if (command === "init") {
    const targetPath = join(CWD, "color-config.json");
    if (existsSync(targetPath)) {
      console.error("Error: color-config.json already exists.");
      process.exit(1);
    }
    const configWithSchema = {
      $schema:
        "node_modules/@algebraic-systems/color-system/color-config.schema.json",
      ...DEFAULT_CONFIG,
    };
    writeFileSync(targetPath, JSON.stringify(configWithSchema, null, 2));
    console.log("Created color-config.json");

    if (!existsSync(join(CWD, "node_modules"))) {
      console.warn(
        "Note: node_modules not found in current directory. You may need to adjust the $schema path."
      );
    }

    console.log("Run `color-system build` to generate your theme.");
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
    // Legacy/Default behavior: color-system <config> <out>
    const config = args[0];
    const out = args[1];
    const newArgs: string[] = [];
    if (config) newArgs.push("--config", config);
    if (out) newArgs.push("--out", out);

    buildCommand(newArgs, CWD);
  } else {
    // Default: just run build with passed args (flags)
    // e.g. color-system --watch
    buildCommand(args, CWD);
  }
}
