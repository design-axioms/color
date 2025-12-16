/**
 * Entry point for `pnpm check:violations`.
 *
 * This file stays tiny on purpose: it delegates to the refactored runner.
 */

import { runCheckViolations } from "./check-violations/run.ts";

// Allow piping output (e.g. `| head`) without crashing on EPIPE.
process.stdout.on("error", (err: any) => {
  if (err?.code === "EPIPE") process.exit(0);
});

runCheckViolations(process.argv.slice(2)).catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
