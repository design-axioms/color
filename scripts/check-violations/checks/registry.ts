import type { CheckViolationsCliOptions } from "../cli.ts";
import { continuityCheck, snapsCheck } from "./index.ts";
import { eraseCheck, type ErasedCheckModule } from "./types.ts";
import type { CheckViolationsSession } from "../session.ts";
import type { RunConfig } from "../observation-log.ts";

export function resolveWantedChecks(
  options: Pick<CheckViolationsCliOptions, "wantSnaps" | "wantContinuity">,
): Array<
  ErasedCheckModule<
    CheckViolationsSession,
    CheckViolationsCliOptions,
    RunConfig
  >
> {
  const checks: Array<
    ErasedCheckModule<
      CheckViolationsSession,
      CheckViolationsCliOptions,
      RunConfig
    >
  > = [];
  if (options.wantSnaps) checks.push(eraseCheck(snapsCheck));
  if (options.wantContinuity) checks.push(eraseCheck(continuityCheck));
  return checks;
}
