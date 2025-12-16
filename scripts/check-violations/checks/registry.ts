import type { CheckViolationsCliOptions } from "../cli.ts";
import { continuityCheck, snapsCheck } from "./index.ts";
import type { ErasedCheckModule } from "./types.ts";
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
  if (options.wantSnaps) checks.push(snapsCheck);
  if (options.wantContinuity) checks.push(continuityCheck);
  return checks;
}
